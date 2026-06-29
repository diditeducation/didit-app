import { useEffect, useMemo, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { fonts, colors } from '../design-system/tokens';
import { computeStats } from '../analyticsStats';

/**
 * Admin-only analytics dashboard at /admin/analytics.
 *
 * Three sections over a selectable time window (Day / Week / Month / All):
 *  1. Funnel & Interaction — two funnels:
 *       A) Landing universe (keyed by anonId): visited landing → did activities
 *          (played a demo / other top-5 clicks) → signed in → reached checkout
 *          (split by via) → purchased.
 *       B) Hub universe (logged-in, keyed by userId): visited hub → paying
 *          players (by game) / free players (by game) → free reached checkout
 *          (by via) → purchased.
 *  2. Users — active users, new sign-ups, new paying users (in-window).
 *  3. Others — recent raw events.
 * Plus CSV/JSON export of the in-window, filtered data.
 *
 * The email check is only a UI gate; the REAL boundary is firestore.rules
 * (`isAdmin()`). Keep this list and the rules' ADMIN_UIDS pointing at the same
 * people. (Mirror of FeedbackAdminPage.)
 */
const ADMIN_EMAILS = [
  'did.it.education@gmail.com',
];

const EVENTS_LIMIT = 5000; // most-recent N events; raise if you outgrow it

// Your own + test accounts — excluded by default so internal activity doesn't
// skew the numbers. Keep in sync with ADMIN UID in firestore.rules and
// TEST_MEMBER_EMAILS in SubscriptionContext.
const INTERNAL_EMAILS = ['did.it.education@gmail.com', 'lee.nigel.t@gmail.com'];
const INTERNAL_UIDS = ['bTlG8YZn8INNvHYvONf8u8LqK033']; // did.it.education@gmail.com
const isInternalRow = (e) =>
  INTERNAL_EMAILS.includes((e.userEmail || '').toLowerCase()) || INTERNAL_UIDS.includes(e.userId);

const DAY = 86400000;
const WINDOWS = { '24h': DAY, '7d': 7 * DAY, '30d': 30 * DAY, all: Infinity };
const TIMEFRAMES = [['24h', 'Day'], ['7d', 'Week'], ['30d', 'Month'], ['all', 'All']];

// ── helpers ────────────────────────────────────────────────────────────────
function tsToDate(ts) {
  if (!ts) return null;
  return ts.toDate ? ts.toDate() : new Date(ts);
}
function tsMs(ts) {
  const d = tsToDate(ts);
  return d ? d.getTime() : null;
}
function fmt(ts) {
  const d = tsToDate(ts);
  return d ? d.toLocaleString() : '—';
}
function fmtDay(ts) {
  const d = tsToDate(ts);
  return d ? d.toISOString().slice(0, 10) : '—';
}
function pct(n, d) {
  if (!d) return '0%';
  return `${Math.round((n / d) * 100)}%`;
}
function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function download(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
const EVENT_COLS = [
  'timestamp', 'date', 'event', 'tier', 'src', 'via', 'gameId', 'page',
  'buttonId', 'category', 'method', 'isNewUser', 'isReturn', 'level',
  'anonId', 'userId', 'userEmail', 'env',
];
function eventsToCSV(rows) {
  const lines = [EVENT_COLS.join(',')];
  for (const r of rows) {
    lines.push(EVENT_COLS.map((c) => csvEscape(c === 'timestamp' ? (tsToDate(r.timestamp)?.toISOString() ?? '') : r[c])).join(','));
  }
  return lines.join('\n');
}
const USER_COLS = ['email', 'uid', 'createdAt', 'convertedAt', 'paid', 'paidVia', 'firstTouchSrc', 'lastSignInMethod', 'lastSeenAt', 'anonId'];
function usersToCSV(rows) {
  const lines = [USER_COLS.join(',')];
  for (const r of rows) {
    lines.push(USER_COLS.map((c) => {
      if (c === 'createdAt' || c === 'convertedAt' || c === 'lastSeenAt') return csvEscape(tsToDate(r[c])?.toISOString() ?? '');
      return csvEscape(r[c]);
    }).join(','));
  }
  return lines.join('\n');
}
function stripTs(e) {
  return { ...e, timestamp: tsToDate(e.timestamp)?.toISOString() ?? null };
}

// ── main ─────────────────────────────────────────────────────────────────
export default function AnalyticsAdminPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState(null);
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [env, setEnv] = useState('prod');             // 'prod' | 'all'
  const [excludeInternal, setExcludeInternal] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');   // '24h' | '7d' | '30d' | 'all'

  const isAdmin = !!user && ADMIN_EMAILS.includes((user.email || '').toLowerCase());

  useEffect(() => {
    if (!isAdmin) return;
    const unsubE = onSnapshot(
      query(collection(db, 'events'), orderBy('timestamp', 'desc'), limit(EVENTS_LIMIT)),
      (snap) => setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => setError(err.message || 'Failed to load events'),
    );
    const unsubU = onSnapshot(
      collection(db, 'users'),
      (snap) => setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      () => setUsers([]),
    );
    return () => { unsubE(); unsubU(); };
  }, [isAdmin]);

  // Time window. Date.now() is fine here (browser, not a workflow sandbox).
  const cutoff = useMemo(() => {
    const w = WINDOWS[timeframe];
    return w === Infinity ? 0 : Date.now() - w;
  }, [timeframe]);

  const inWindow = useMemo(() => (ts) => {
    const m = tsMs(ts);
    return m == null ? true : m >= cutoff; // pending serverTimestamp → keep
  }, [cutoff]);

  const rows = useMemo(() => {
    let base = (events || []).filter((e) => (env === 'all' ? true : (e.env || 'prod') === 'prod'));
    base = base.filter((e) => inWindow(e.timestamp));
    if (!excludeInternal) return base;
    const internalAnon = new Set();
    for (const e of base) if (isInternalRow(e) && e.anonId) internalAnon.add(e.anonId);
    return base.filter((e) => !isInternalRow(e) && !(e.anonId && internalAnon.has(e.anonId)));
  }, [events, env, excludeInternal, inWindow]);

  const stats = useMemo(() => computeStats(rows), [rows]);

  const usersShown = useMemo(() => {
    if (!users) return [];
    return excludeInternal
      ? users.filter((u) => !INTERNAL_EMAILS.includes((u.email || '').toLowerCase()) && !INTERNAL_UIDS.includes(u.uid))
      : users;
  }, [users, excludeInternal]);

  const userCounts = useMemo(() => ({
    newSignups: usersShown.filter((u) => { const m = tsMs(u.createdAt); return m != null && m >= cutoff; }).length,
    newPaying: usersShown.filter((u) => { const m = tsMs(u.convertedAt); return m != null && m >= cutoff; }).length,
  }), [usersShown, cutoff]);

  if (user === undefined) return <Frame><Centered text="Checking sign-in…" /></Frame>;
  if (!user) return <Frame><Centered text="Sign in to view analytics." cta={{ label: 'Go to sign in', href: '/signin' }} /></Frame>;
  if (!isAdmin) return <Frame><Centered title="Not authorised" text={`Admin-only. Signed in as ${user.email || 'unknown'}.`} /></Frame>;
  if (error) return <Frame><Centered title="Couldn't load analytics" text={error} /></Frame>;
  if (events === null || users === null) return <Frame><Centered text="Loading…" /></Frame>;

  const A = stats.funnelA;
  const B = stats.funnelB;
  const windowLabel = TIMEFRAMES.find(([k]) => k === timeframe)?.[1] || timeframe;

  return (
    <Frame>
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <h1 style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 24, color: colors.text, margin: 0 }}>Analytics</h1>
          <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 2 }}>
            {windowLabel} · {rows.length.toLocaleString()} events{events.length >= EVENTS_LIMIT ? ` (load capped at ${EVENTS_LIMIT})` : ''} · live
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Btn onClick={() => download(`didit-events-${fmtDay(new Date())}.csv`, eventsToCSV(rows), 'text/csv;charset=utf-8;')}>Events CSV</Btn>
          <Btn onClick={() => download(`didit-events-${fmtDay(new Date())}.json`, JSON.stringify(rows.map(stripTs), null, 2), 'application/json')}>Events JSON</Btn>
          <Btn onClick={() => download(`didit-users-${fmtDay(new Date())}.csv`, usersToCSV(usersShown), 'text/csv;charset=utf-8;')}>Users CSV</Btn>
        </div>
      </header>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {TIMEFRAMES.map(([k, label]) => (
            <button key={k} onClick={() => setTimeframe(k)} style={tfBtn(timeframe === k)}>{label}</button>
          ))}
        </div>
        <label style={chipLabel}>
          <input type="checkbox" checked={excludeInternal} onChange={(e) => setExcludeInternal(e.target.checked)} style={{ cursor: 'pointer' }} />
          Exclude admin/test
        </label>
        <select value={env} onChange={(e) => setEnv(e.target.value)} style={selectStyle}>
          <option value="prod">Prod only</option>
          <option value="all">All envs (incl. local/dev)</option>
        </select>
      </div>

      {/* ═══ Section 1 — Funnel & Interaction ═══ */}
      <SectionHead n="1" title="Funnel & Interaction" />

      <Section title="Funnel A — Landing visitors" sub="Universe: everyone who viewed the landing page in this window. Each bar = share of those visitors.">
        {A.universe === 0 ? <Empty text="No landing visits in this window." /> : (
          <>
            <FunnelBar label="Visited landing" count={A.universe} total={A.universe} />
            <Breakdown head={['Top source', 'Visitors']} rows={A.sources} />

            <StepLabel>Did activities</StepLabel>
            <FunnelBar label="Played a demo game" count={A.played} total={A.universe} />
            <SubLabel>Other landing interactions — top 5</SubLabel>
            <Breakdown head={['Button / item', 'People']} rows={A.clicks} empty="No other interactions." />

            <StepLabel>Conversion</StepLabel>
            <FunnelBar label="Signed in" count={A.signed} total={A.universe} />
            <FunnelBar label="Reached checkout" count={A.checkout} total={A.universe} />
            <Breakdown head={['Checkout source (via)', 'People']} rows={A.checkoutVia} empty="No checkouts." />
            <FunnelBar label="Purchased" count={A.purchased} total={A.universe} />
          </>
        )}
      </Section>

      <Section title="Funnel B — Logged-in, visited games hub" sub="Universe: signed-in users who opened the games hub in this window.">
        {B.universe === 0 ? <Empty text="No hub visits in this window." /> : (
          <>
            <FunnelBar label="Visited games hub" count={B.universe} total={B.universe} />

            <FunnelBar label="Paying users who played a game" count={B.paidPlayers} total={B.universe} />
            <Breakdown head={['Game', 'Paying players']} rows={B.paidGames} empty="No paid plays." />

            <FunnelBar label="Free users who played a game" count={B.freePlayers} total={B.universe} />
            <Breakdown head={['Game', 'Free players']} rows={B.freeGames} empty="No free plays." />

            <StepLabel>Free-user conversion</StepLabel>
            <FunnelBar label="Free users who reached checkout" count={B.freeCheckout} total={B.universe} />
            <Breakdown head={['Checkout source (via)', 'People']} rows={B.checkoutVia} empty="No checkouts." />
            <FunnelBar label="Purchased" count={B.purchased} total={B.universe} />
          </>
        )}
      </Section>

      {/* ═══ Section 2 — Users ═══ */}
      <SectionHead n="2" title="Users" />
      <div style={cardRow}>
        <Stat label="Active users" value={stats.activeUsers} hint="logged in + played a game" />
        <Stat label="New sign-ups" value={userCounts.newSignups} hint="accounts created in window" />
        <Stat label="New paying users" value={userCounts.newPaying} hint="converted to paid in window" />
      </div>

      {/* ═══ Section 3 — Others ═══ */}
      <SectionHead n="3" title="Others" />
      <Section title="Recent events" sub="Latest 100 in this window. Full set is in the CSV/JSON export above.">
        <Table
          head={['When', 'Event', 'Tier', 'Game/Detail', 'Src', 'Who']}
          mono
          rows={rows.slice(0, 100).map((e) => [
            fmt(e.timestamp),
            e.event,
            e.tier || '—',
            e.gameId || e.page || e.buttonId || e.via || e.category || e.method || '—',
            e.src || '—',
            e.userEmail || (e.anonId ? e.anonId.slice(0, 8) : '—'),
          ])} />
      </Section>
    </Frame>
  );
}

// ── presentational ───────────────────────────────────────────────────────
const selectStyle = {
  fontFamily: fonts.display, fontWeight: 700, fontSize: 13, color: colors.text,
  background: '#FFFFFF', border: `1px solid ${colors.border}`, borderRadius: 9999, padding: '9px 14px', cursor: 'pointer',
};
const chipLabel = {
  display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: fonts.display, fontWeight: 700,
  fontSize: 13, color: colors.text, background: '#FFFFFF', border: `1px solid ${colors.border}`,
  borderRadius: 9999, padding: '9px 14px', cursor: 'pointer',
};
const tfBtn = (active) => ({
  fontFamily: fonts.display, fontWeight: 800, fontSize: 13,
  color: active ? '#FFFFFF' : colors.text,
  background: active ? colors.blueberryDark : '#FFFFFF',
  border: `1px solid ${active ? colors.blueberryDark : colors.border}`,
  borderRadius: 9999, padding: '9px 16px', cursor: 'pointer',
});
const cardRow = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 };

function Btn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: colors.blueberryDark, color: '#FFFFFF', border: 'none', borderRadius: 9999,
      padding: '9px 16px', fontFamily: fonts.display, fontWeight: 800, fontSize: 13, cursor: 'pointer',
    }}>{children}</button>
  );
}

function SectionHead({ n, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 12px' }}>
      <span style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 13, color: '#FFFFFF', background: colors.text, borderRadius: 9999, width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>
      <h2 style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 19, color: colors.text, margin: 0 }}>{title}</h2>
      <div style={{ flex: 1, height: 1, background: colors.border }} />
    </div>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div style={{ background: '#FFFFFF', border: `1px solid ${colors.border}`, borderRadius: 14, padding: '14px 16px' }}>
      <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted, fontWeight: 700 }}>{label}</div>
      <div style={{ fontFamily: fonts.display, fontSize: 28, fontWeight: 900, color: colors.text, lineHeight: 1.1, margin: '2px 0' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {hint && <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.muted }}>{hint}</div>}
    </div>
  );
}

function Section({ title, sub, children }) {
  return (
    <section style={{ marginBottom: 22 }}>
      <h3 style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 15, color: colors.text, margin: '0 0 2px' }}>{title}</h3>
      {sub && <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginBottom: 10 }}>{sub}</div>}
      <div style={{ background: '#FFFFFF', border: `1px solid ${colors.border}`, borderRadius: 14, padding: '12px 14px' }}>
        {children}
      </div>
    </section>
  );
}

function StepLabel({ children }) {
  return <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 12, color: colors.text, margin: '12px 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</div>;
}
function SubLabel({ children }) {
  return <div style={{ fontFamily: fonts.body, fontWeight: 800, fontSize: 11, color: colors.muted, margin: '6px 0 2px 2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{children}</div>;
}

function FunnelBar({ label, count, total }) {
  const share = total ? Math.min(100, (count / total) * 100) : 0;
  const w = count > 0 ? Math.max(2, Math.round(share)) : 0;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: fonts.body, fontSize: 13, marginBottom: 3 }}>
        <span style={{ fontWeight: 700, color: colors.text }}>{label}</span>
        <span style={{ color: colors.muted }}>{count.toLocaleString()}<span style={{ marginLeft: 8, fontWeight: 700, color: colors.grassMid }}>{total ? `${Math.round(share)}%` : '—'}</span></span>
      </div>
      <div style={{ height: 10, background: '#F0EBE3', borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{ width: `${w}%`, height: '100%', background: colors.blueberryDark, borderRadius: 9999 }} />
      </div>
    </div>
  );
}

// Indented mini-table for a step's breakdown.
function Breakdown({ head, rows, empty }) {
  return (
    <div style={{ margin: '2px 0 14px 14px', borderLeft: `2px solid ${colors.border}`, paddingLeft: 12 }}>
      {rows.length === 0 ? <Empty text={empty || 'No data.'} /> : <Table head={head} rows={rows} />}
    </div>
  );
}

function Table({ head, rows, mono }) {
  if (!rows.length) return <Empty text="No data." />;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : fonts.body, fontSize: 12.5 }}>
        <thead>
          <tr>{head.map((h) => <th key={h} style={{ textAlign: 'left', color: colors.muted, fontWeight: 800, padding: '6px 10px', borderBottom: `1px solid ${colors.border}`, whiteSpace: 'nowrap' }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j} style={{ padding: '6px 10px', borderBottom: `1px solid #F2EDE6`, color: colors.text, whiteSpace: 'nowrap' }}>{typeof c === 'number' ? c.toLocaleString() : c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Empty({ text }) {
  return <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.muted, padding: '6px 2px' }}>{text}</div>;
}

function Frame({ children }) {
  return (
    <div style={{ minHeight: '100dvh', background: '#FFFBF5', padding: '24px 20px 80px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>{children}</div>
    </div>
  );
}

function Centered({ title, text, cta }) {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: fonts.body, color: colors.text }}>
      {title && <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 18, marginBottom: 6 }}>{title}</div>}
      <div style={{ color: colors.muted, fontSize: 14 }}>{text}</div>
      {cta && <a href={cta.href} style={{ display: 'inline-block', marginTop: 16, background: colors.blueberryDark, color: '#FFFFFF', textDecoration: 'none', borderRadius: 9999, padding: '10px 20px', fontFamily: fonts.display, fontWeight: 800, fontSize: 13 }}>{cta.label}</a>}
    </div>
  );
}
