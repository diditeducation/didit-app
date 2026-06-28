import { useEffect, useMemo, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { fonts, colors } from '../design-system/tokens';

/**
 * Admin-only analytics dashboard at /admin/analytics.
 *
 * Reads the flat `events` log + the `users` profile collection and renders the
 * funnel, marketing-source breakdown, conversion-placement split, free-vs-paid
 * play counts, a user table, and the raw recent events — plus CSV/JSON export
 * of everything for offline analysis.
 *
 * The email check is only a UI gate; the REAL boundary is firestore.rules
 * (`isAdmin()`). Keep this list and the rules' ADMIN_UIDS pointing at the same
 * people. (Mirror of FeedbackAdminPage.)
 */
const ADMIN_EMAILS = [
  'did.it.education@gmail.com',
];

const EVENTS_LIMIT = 5000; // most-recent N events; raise if you outgrow it

// ── helpers ────────────────────────────────────────────────────────────────
function tsToDate(ts) {
  if (!ts) return null;
  return ts.toDate ? ts.toDate() : new Date(ts);
}
function fmt(ts) {
  const d = tsToDate(ts);
  return d ? d.toLocaleString() : '—';
}
function fmtDay(ts) {
  const d = tsToDate(ts);
  return d ? d.toISOString().slice(0, 10) : '—';
}
// Stable per-person key: prefer the signed-in uid, else the anon browser id.
function personKey(e) {
  return e.userId || e.anonId || e.id;
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

// ── main ─────────────────────────────────────────────────────────────────
export default function AnalyticsAdminPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState(null);
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);
  const [env, setEnv] = useState('prod'); // 'prod' | 'all'

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
      () => setUsers([]), // users may be empty before anyone signs in
    );
    return () => { unsubE(); unsubU(); };
  }, [isAdmin]);

  const rows = useMemo(
    () => (events || []).filter((e) => env === 'all' ? true : (e.env || 'prod') === 'prod'),
    [events, env],
  );

  const stats = useMemo(() => computeStats(rows), [rows]);

  if (user === undefined) return <Frame><Centered text="Checking sign-in…" /></Frame>;
  if (!user) return <Frame><Centered text="Sign in to view analytics." cta={{ label: 'Go to sign in', href: '/signin' }} /></Frame>;
  if (!isAdmin) return <Frame><Centered title="Not authorised" text={`Admin-only. Signed in as ${user.email || 'unknown'}.`} /></Frame>;
  if (error) return <Frame><Centered title="Couldn't load analytics" text={error} /></Frame>;
  if (events === null || users === null) return <Frame><Centered text="Loading…" /></Frame>;

  const prodUsers = users; // users aren't env-tagged; show all

  return (
    <Frame>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 24, color: colors.text, margin: 0 }}>Analytics</h1>
          <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 2 }}>
            {rows.length.toLocaleString()} events{events.length >= EVENTS_LIMIT ? ` (capped at ${EVENTS_LIMIT})` : ''} · {prodUsers.length} users · live
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select value={env} onChange={(e) => setEnv(e.target.value)} style={selectStyle}>
            <option value="prod">Prod only</option>
            <option value="all">All envs (incl. local/dev)</option>
          </select>
          <Btn onClick={() => download(`didit-events-${fmtDay(new Date())}.csv`, eventsToCSV(rows), 'text/csv;charset=utf-8;')}>Events CSV</Btn>
          <Btn onClick={() => download(`didit-events-${fmtDay(new Date())}.json`, JSON.stringify(rows.map(stripTs), null, 2), 'application/json')}>Events JSON</Btn>
          <Btn onClick={() => download(`didit-users-${fmtDay(new Date())}.csv`, usersToCSV(prodUsers), 'text/csv;charset=utf-8;')}>Users CSV</Btn>
        </div>
      </header>

      {/* Summary */}
      <div style={cardRow}>
        <Stat label="Unique visitors" value={stats.visitors} hint="distinct anonId" />
        <Stat label="Signed in" value={stats.signedIn} hint="distinct accounts" />
        <Stat label="Paying" value={stats.paying} hint={`${pct(stats.paying, stats.visitors)} of visitors`} />
        <Stat label="Game plays" value={stats.totalPlays} hint={`${stats.freePlays} free · ${stats.paidPlays} paid`} />
      </div>

      {/* Funnel */}
      <Section title="Funnel — landing → conversion → play" sub="Distinct people reaching each milestone, as % of unique visitors. These are NOT strictly nested (demo plays are anonymous, before sign-in), so each bar is its own share of visitors — not a step-to-step drop-off.">
        {stats.funnel.map((s) => (
          <FunnelBar key={s.label} label={s.label} count={s.count} total={stats.funnelDenom} />
        ))}
      </Section>

      {/* Marketing sources */}
      <Section title="Marketing sources" sub="First-touch src (utm / referrer / /go/:source links).">
        <Table head={['Source', 'Visitors', 'Signed in', 'Paid', 'Conv.']}
          rows={stats.sources.map((s) => [s.src, s.visitors, s.signedIn, s.paid, pct(s.paid, s.visitors)])} />
      </Section>

      {/* Conversion placement */}
      <Section title="Conversions by placement (via)" sub="Which flow the purchase came from.">
        {stats.viaRows.length === 0
          ? <Empty text="No purchases yet." />
          : <Table head={['Placement', 'Purchases']} rows={stats.viaRows.map((v) => [v.via, v.n])} />}
      </Section>

      {/* Plays by tier + top games */}
      <Section title="What gets played" sub="game_open grouped by player state, then by game.">
        <Table head={['Game', 'Total plays', 'Free', 'Paid']}
          rows={stats.topGames.map((g) => [g.gameId, g.total, g.free, g.paid])} />
      </Section>

      {/* Top clicks */}
      <Section title="Top button clicks" sub="landing_click intents across landing + hub.">
        <Table head={['Button', 'Clicks']} rows={stats.topClicks.map((c) => [c.id, c.n])} />
      </Section>

      {/* Users */}
      <Section title={`Users (${prodUsers.length})`} sub="Lifecycle: when each account first appeared and if/when they converted.">
        {prodUsers.length === 0
          ? <Empty text="No signed-in users yet." />
          : <Table head={['Email', 'First seen', 'Converted', 'Via', 'Source']}
              rows={[...prodUsers]
                .sort((a, b) => (tsToDate(b.createdAt)?.getTime() || 0) - (tsToDate(a.createdAt)?.getTime() || 0))
                .map((u) => [
                  u.email || u.uid,
                  fmtDay(u.createdAt),
                  u.convertedAt ? fmtDay(u.convertedAt) : '—',
                  u.paidVia || '—',
                  u.firstTouchSrc || '—',
                ])} />}
      </Section>

      {/* Raw events */}
      <Section title="Recent events (latest 100)" sub="Full log is in the CSV/JSON export above.">
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

function stripTs(e) {
  return { ...e, timestamp: tsToDate(e.timestamp)?.toISOString() ?? null };
}

// ── stats engine ───────────────────────────────────────────────────────────
function computeStats(rows) {
  const visitors = new Set();
  const signedIn = new Set();
  const paying = new Set();
  const landingSet = new Set();
  const checkoutSet = new Set();
  const playSet = new Set();
  const purchaseSet = new Set();

  const srcMap = new Map();   // src → {visitors:Set, signedIn:Set, paid:Set}
  const viaMap = new Map();   // via → count (purchases)
  const gameMap = new Map();  // gameId → {total, free, paid}
  const clickMap = new Map(); // buttonId → count

  const srcEntry = (s) => {
    const k = s || 'direct';
    if (!srcMap.has(k)) srcMap.set(k, { visitors: new Set(), signedIn: new Set(), paid: new Set() });
    return srcMap.get(k);
  };

  for (const e of rows) {
    const p = personKey(e);
    visitors.add(p);
    srcEntry(e.src).visitors.add(p);
    if (e.userId) { signedIn.add(e.userId); srcEntry(e.src).signedIn.add(e.userId); }
    if (e.tier === 'paid') paying.add(e.userId || p);

    switch (e.event) {
      case 'page_view':
        if (e.page === 'landing' || e.page === 'landing_v2') landingSet.add(p);
        break;
      case 'checkout_view': checkoutSet.add(p); break;
      case 'purchase_success': {
        purchaseSet.add(p);
        srcEntry(e.src).paid.add(e.userId || p);
        const v = e.via || 'direct';
        viaMap.set(v, (viaMap.get(v) || 0) + 1);
        break;
      }
      case 'game_open': {
        playSet.add(p);
        const id = e.gameId || 'unknown';
        if (!gameMap.has(id)) gameMap.set(id, { total: 0, free: 0, paid: 0 });
        const g = gameMap.get(id);
        g.total++;
        if (e.tier === 'paid') g.paid++; else g.free++;
        break;
      }
      case 'landing_click':
        if (e.buttonId) clickMap.set(e.buttonId, (clickMap.get(e.buttonId) || 0) + 1);
        break;
      default: break;
    }
  }

  const sources = [...srcMap.entries()]
    .map(([src, v]) => ({ src, visitors: v.visitors.size, signedIn: v.signedIn.size, paid: v.paid.size }))
    .sort((a, b) => b.visitors - a.visitors);

  const viaRows = [...viaMap.entries()].map(([via, n]) => ({ via, n })).sort((a, b) => b.n - a.n);

  const topGames = [...gameMap.entries()]
    .map(([gameId, g]) => ({ gameId, ...g }))
    .sort((a, b) => b.total - a.total);

  const topClicks = [...clickMap.entries()].map(([id, n]) => ({ id, n })).sort((a, b) => b.n - a.n).slice(0, 25);

  let freePlays = 0, paidPlays = 0;
  for (const g of topGames) { freePlays += g.free; paidPlays += g.paid; }

  return {
    visitors: visitors.size,
    signedIn: signedIn.size,
    paying: paying.size,
    totalPlays: freePlays + paidPlays,
    freePlays, paidPlays,
    // Milestones in journey order, each as a share of unique visitors. NOT a
    // strictly-nested funnel — demo plays are anonymous (before sign-in), so
    // "Played a game" can exceed "Signed in". `signedIn.size` = distinct
    // accounts (matches the summary card), more robust than counting
    // signin_success events that may scroll out of the event window.
    funnelDenom: visitors.size,
    funnel: [
      { label: 'Visited landing', count: landingSet.size },
      { label: 'Played a game', count: playSet.size },
      { label: 'Signed in', count: signedIn.size },
      { label: 'Reached checkout', count: checkoutSet.size },
      { label: 'Purchased', count: purchaseSet.size },
    ],
    sources, viaRows, topGames, topClicks,
  };
}

// ── presentational ───────────────────────────────────────────────────────
const selectStyle = {
  fontFamily: fonts.display, fontWeight: 700, fontSize: 13, color: colors.text,
  background: '#FFFFFF', border: `1px solid ${colors.border}`, borderRadius: 9999, padding: '9px 14px', cursor: 'pointer',
};
const cardRow = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 };

function Btn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: colors.blueberryDark, color: '#FFFFFF', border: 'none', borderRadius: 9999,
      padding: '9px 16px', fontFamily: fonts.display, fontWeight: 800, fontSize: 13, cursor: 'pointer',
    }}>{children}</button>
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
    <section style={{ marginBottom: 26 }}>
      <h2 style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 16, color: colors.text, margin: '0 0 2px' }}>{title}</h2>
      {sub && <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginBottom: 10 }}>{sub}</div>}
      <div style={{ background: '#FFFFFF', border: `1px solid ${colors.border}`, borderRadius: 14, padding: '12px 14px' }}>
        {children}
      </div>
    </section>
  );
}

function FunnelBar({ label, count, total }) {
  const share = total ? (count / total) * 100 : 0;
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
  return <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.muted, padding: '8px 2px' }}>{text}</div>;
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
