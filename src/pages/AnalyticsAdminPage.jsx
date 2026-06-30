import { useEffect, useMemo, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { fonts, colors } from '../design-system/tokens';
import { computeStats, filterRows, tsToMs, INTERNAL_EMAILS, INTERNAL_UIDS } from '../analyticsStats';

/**
 * Admin-only analytics dashboard at /admin/analytics.
 *
 * Three sections over a selectable time window (Day / Week / Month / All / From):
 *  1. Users — active users, new sign-ups, new paying users, payments (in-window).
 *  2. Funnel & Interaction — two funnels:
 *       A) Landing universe (keyed by anonId): visited landing → did activities
 *          (played a demo / other top-5 clicks) → signed in → reached checkout
 *          (split by via) → purchased.
 *       B) Hub universe (logged-in, keyed by userId): visited hub → paying
 *          players (by game) / free players (by game) → free reached checkout
 *          (by via) → purchased.
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

// INTERNAL_EMAILS / INTERNAL_UIDS / isInternalRow / filterRows live in
// ../analyticsStats (pure + unit-tested). Keep that list in sync with the admin
// UID in firestore.rules and TEST_MEMBER_EMAILS in SubscriptionContext.

const DAY = 86400000;
const WINDOWS = { '24h': DAY, '7d': 7 * DAY, '30d': 30 * DAY, all: Infinity };
const TIMEFRAMES = [['24h', 'Day'], ['7d', 'Week'], ['30d', 'Month'], ['all', 'All']];

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
const USER_COLS = ['email', 'uid', 'founding', 'foundingCode', 'foundingClaimedAt', 'marketingOptIn', 'marketingOptInAt', 'createdAt', 'convertedAt', 'paid', 'paidVia', 'firstTouchSrc', 'lastSignInMethod', 'lastSeenAt', 'anonId'];
const USER_TS_COLS = new Set(['createdAt', 'convertedAt', 'lastSeenAt', 'marketingOptInAt', 'foundingClaimedAt']);
function usersToCSV(rows) {
  const lines = [USER_COLS.join(',')];
  for (const r of rows) {
    lines.push(USER_COLS.map((c) => {
      if (USER_TS_COLS.has(c)) return csvEscape(tsToDate(r[c])?.toISOString() ?? '');
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
  const [fromDate, setFromDate] = useState('');       // 'YYYY-MM-DD'; overrides timeframe when set

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

  // Time window cutoff. An explicit "From" date (YYYY-MM-DD, local start of day)
  // wins; otherwise the Day/Week/Month/All toggle. Date.now() is fine here
  // (browser, not a workflow sandbox).
  const cutoff = useMemo(() => {
    if (fromDate) {
      const ms = new Date(`${fromDate}T00:00:00`).getTime();
      if (!Number.isNaN(ms)) return ms;
    }
    const w = WINDOWS[timeframe];
    return w === Infinity ? 0 : Date.now() - w;
  }, [timeframe, fromDate]);

  const rows = useMemo(
    () => filterRows(events, { env, cutoff, excludeInternal }),
    [events, env, cutoff, excludeInternal],
  );

  const usersShown = useMemo(() => {
    if (!users) return [];
    return excludeInternal
      ? users.filter((u) => !INTERNAL_EMAILS.includes((u.email || '').toLowerCase()) && !INTERNAL_UIDS.includes(u.uid))
      : users;
  }, [users, excludeInternal]);

  // Founding-pass model (no real payments): a "conversion" = a user who claimed
  // their free promo code. The durable truth is users/{uid}.founding +
  // foundingClaimedAt. Feed the in-window claimers into the funnels so the
  // conversion step reflects claims, not payments.
  const foundingSets = useMemo(() => {
    const foundingAnonIds = new Set();
    const foundingUserIds = new Set();
    for (const u of usersShown) {
      const m = tsToMs(u.foundingClaimedAt);
      if (u.founding && m != null && m >= cutoff) {
        if (u.uid) foundingUserIds.add(u.uid);
        if (u.anonId) foundingAnonIds.add(u.anonId);
      }
    }
    return { foundingAnonIds, foundingUserIds };
  }, [usersShown, cutoff]);

  const stats = useMemo(() => computeStats(rows, foundingSets), [rows, foundingSets]);

  const userCounts = useMemo(() => ({
    newSignups: usersShown.filter((u) => { const m = tsToMs(u.createdAt); return m != null && m >= cutoff; }).length,
    newFounding: usersShown.filter((u) => { const m = tsToMs(u.foundingClaimedAt); return u.founding && m != null && m >= cutoff; }).length,
    totalFounding: usersShown.filter((u) => u.founding).length,
    newOptIns: usersShown.filter((u) => { const m = tsToMs(u.marketingOptInAt); return m != null && m >= cutoff; }).length,
    totalOptIns: usersShown.filter((u) => u.marketingOptIn).length,
  }), [usersShown, cutoff]);

  if (user === undefined) return <Frame><Centered text="Checking sign-in…" /></Frame>;
  if (!user) return <Frame><Centered text="Sign in to view analytics." cta={{ label: 'Go to sign in', href: '/signin' }} /></Frame>;
  if (!isAdmin) return <Frame><Centered title="Not authorised" text={`Admin-only. Signed in as ${user.email || 'unknown'}.`} /></Frame>;
  if (error) return <Frame><Centered title="Couldn't load analytics" text={error} /></Frame>;
  if (events === null || users === null) return <Frame><Centered text="Loading…" /></Frame>;

  const A = stats.funnelA;
  const B = stats.funnelB;
  const windowLabel = fromDate ? `From ${fromDate}` : (TIMEFRAMES.find(([k]) => k === timeframe)?.[1] || timeframe);

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
            <button key={k} onClick={() => { setTimeframe(k); setFromDate(''); }} style={tfBtn(!fromDate && timeframe === k)}>{label}</button>
          ))}
        </div>
        <label style={{ ...chipLabel, gap: 8 }}>
          From
          <input
            type="date"
            value={fromDate}
            max={fmtDay(new Date())}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 13, color: colors.text, border: 'none', background: 'transparent', cursor: 'pointer' }}
          />
          {fromDate && (
            <span role="button" onClick={(e) => { e.preventDefault(); setFromDate(''); }} title="Clear from date"
              style={{ cursor: 'pointer', color: colors.muted, fontWeight: 800, paddingLeft: 2 }}>✕</span>
          )}
        </label>
        <label style={chipLabel}>
          <input type="checkbox" checked={excludeInternal} onChange={(e) => setExcludeInternal(e.target.checked)} style={{ cursor: 'pointer' }} />
          Exclude admin/test
        </label>
        <select value={env} onChange={(e) => setEnv(e.target.value)} style={selectStyle}>
          <option value="prod">Prod only</option>
          <option value="all">All envs (incl. local/dev)</option>
        </select>
      </div>

      <Definitions />

      {/* ═══ Section 1 — Users ═══ */}
      <SectionHead n="1" title="Users" />
      <div style={cardRow}>
        <Stat label="Active users" value={stats.activeUsers} hint="logged in + played a game" />
        <Stat label="New sign-ups" value={userCounts.newSignups} hint="accounts created in window" />
        <Stat label="Founding members" value={userCounts.newFounding} hint={`claimed free access in window · ${userCounts.totalFounding.toLocaleString()} total`} />
        <Stat label="Entered checkout flow" value={stats.flowEntered} hint="reached the claim/checkout page" />
        <Stat label="Marketing opt-ins" value={userCounts.newOptIns} hint={`new in window · ${userCounts.totalOptIns.toLocaleString()} total`} />
        {stats.successfulPayments > 0 && (
          <Stat label="Real payments" value={stats.successfulPayments} hint="Stripe purchase events in window" />
        )}
      </div>

      {/* ═══ Section 2 — Funnel & Interaction ═══ */}
      <SectionHead n="2" title="Funnel & Interaction" />

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
            <FunnelBar label="Claimed pass" count={A.converted} total={A.universe} />
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
            <FunnelBar label="Claimed pass" count={B.converted} total={B.universe} />
          </>
        )}
      </Section>

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

// Collapsible glossary so the numbers stay legible but every term/metric is
// one click away from a precise definition.
function Def({ term, children }) {
  return (
    <div style={{ marginBottom: 7, fontFamily: fonts.body, fontSize: 12.5, lineHeight: 1.45 }}>
      <span style={{ fontWeight: 800, color: colors.text }}>{term}</span>
      <span style={{ color: colors.muted }}> — {children}</span>
    </div>
  );
}
function DefGroup({ title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 12, color: colors.text, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>
      {children}
    </div>
  );
}
function Definitions() {
  return (
    <details style={{ background: '#FFFFFF', border: `1px solid ${colors.border}`, borderRadius: 14, padding: '0 16px', marginBottom: 24 }}>
      <summary style={{ cursor: 'pointer', padding: '13px 0', fontFamily: fonts.display, fontWeight: 800, fontSize: 14, color: colors.text, listStyle: 'revert' }}>
        ⓘ Definitions — how to read this dashboard
      </summary>
      <div style={{ padding: '4px 0 14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4px 28px' }}>
        <DefGroup title="Key terms">
          <Def term="Visitor (anonId)">one browser. A stable id stored in the browser that follows a person across sign-in. Incognito / cleared storage / bots create new ones.</Def>
          <Def term="User (userId)">a signed-in account.</Def>
          <Def term="Tier">paying state at the instant an action happened — anon (logged out), free (signed in, not paid), paid.</Def>
          <Def term="Source (src)">first-touch — where they first arrived from (a /go/&lt;name&gt; link, utm_source, referrer site, or “direct”). Kept for life; first touch wins.</Def>
          <Def term="Placement (via)">which flow led them into checkout — landing, demo_success, hub_grid, or game_locked.</Def>
          <Def term="Universe">the denominator of a funnel — who is counted. Funnel A = landing viewers; Funnel B = signed-in hub visitors. Each bar is a share of its universe.</Def>
        </DefGroup>

        <DefGroup title="Filters">
          <Def term="Day / Week / Month / All">only events in that recent range (24h / 7d / 30d / everything loaded).</Def>
          <Def term="From date">only events on/after the chosen date; overrides the Day/Week/Month buttons while set.</Def>
          <Def term="Prod only / All envs">hide localhost & dev test data (default: Prod only).</Def>
          <Def term="Exclude admin/test">drop your own + test accounts, including their whole pre-login session (matched by anonId).</Def>
        </DefGroup>

        <DefGroup title="Users (Section 1)">
          <Def term="Active users">distinct signed-in accounts that opened a game in the window (played, even if not completed).</Def>
          <Def term="New sign-ups">accounts whose profile was first created in the window.</Def>
          <Def term="Founding members">accounts that claimed their free promo code in the window (the current “conversion” — access is free, no payment). Total in the hint.</Def>
          <Def term="Entered checkout flow">distinct people who reached the claim/checkout page in the window (whether or not they finished).</Def>
          <Def term="Marketing opt-ins">accounts that ticked the email opt-in (new in window; total in the hint).</Def>
          <Def term="Real payments">only shown if any Stripe purchases exist — count of real payment events (the model is free promo codes for now, so normally hidden).</Def>
        </DefGroup>

        <DefGroup title="Funnel A — Landing visitors">
          <Def term="Visited landing">viewed the landing page (split by top source).</Def>
          <Def term="Played a demo game">opened any game.</Def>
          <Def term="Other landing interactions">top 5 non-demo button/item taps.</Def>
          <Def term="Signed in">went on to create/enter an account.</Def>
          <Def term="Reached checkout / Claimed pass">opened checkout (split by via) / claimed the free founding pass (or, if ever live, paid). Conversion = a founding claim OR a real purchase.</Def>
        </DefGroup>

        <DefGroup title="Funnel B — Hub visitors">
          <Def term="Visited games hub">signed-in users who opened the hub (the universe).</Def>
          <Def term="Paying / Free users played">users who opened a game while paid / free, split by game.</Def>
          <Def term="Free reached checkout / Claimed pass">free users who opened checkout (split by via) / claimed the free pass.</Def>
        </DefGroup>

        <DefGroup title="Reading the funnels">
          <Def term="% = share of universe">each bar is its own share of the funnel’s universe — NOT a step-to-step drop-off.</Def>
          <Def term="Not strictly nested">demo plays are anonymous and happen before sign-in, so a later bar can exceed an earlier one.</Def>
        </DefGroup>
      </div>
    </details>
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
