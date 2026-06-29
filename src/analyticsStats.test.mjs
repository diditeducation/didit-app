// Run: node src/analyticsStats.test.mjs
// Hand-checks computeStats against a small synthetic event set with known answers.
import assert from 'node:assert/strict';
import { computeStats, filterRows } from './analyticsStats.js';

// ── Synthetic universe ──────────────────────────────────────────────────────
// Funnel A people (by anonId) — none of them visit the hub, to keep universes
// cleanly separated:
//   p1: lands (instagram) → plays demo (anon) → clicks nav_login → signs in (u1)
//        → checkout(landing) → purchases
//   p2: lands (instagram) → clicks unlock_main (no play, no signin)
//   p3: lands (direct)    → plays demo only
//   p4: lands (direct)    → demo_play tap only (must NOT count as "other click")
//   p5: NEVER lands — only opens a game via deep link (excluded from Funnel A)
//
// Funnel B people (by userId) — distinct accounts that DO visit the hub:
//   u2 (paid): hub, plays little-engineer
//   u3 (free): hub, plays little-engineer + little-dj, checkout(hub_grid)
//   u4 (free): hub, plays little-dj, checkout(hub_grid), purchases
//   u5 (paid): signed-in game_open but NEVER visited hub (excluded from Funnel B)
const rows = [
  // ── Funnel A ──
  { event: 'page_view', page: 'landing', anonId: 'p1', src: 'instagram' },
  { event: 'game_open', gameId: 'little-shopper', anonId: 'p1' },
  { event: 'landing_click', buttonId: 'nav_login', anonId: 'p1' },
  { event: 'signin_success', anonId: 'p1', userId: 'u1' },
  { event: 'checkout_view', via: 'landing', tier: 'free', anonId: 'p1', userId: 'u1' },
  { event: 'purchase_success', via: 'landing', anonId: 'p1', userId: 'u1' },

  { event: 'page_view', page: 'landing', anonId: 'p2', src: 'instagram' },
  { event: 'landing_click', buttonId: 'unlock_main', anonId: 'p2' },

  { event: 'page_view', page: 'landing', anonId: 'p3', src: 'direct' },
  { event: 'game_open', gameId: 'little-dj', anonId: 'p3' },

  { event: 'page_view', page: 'landing', anonId: 'p4', src: 'direct' },
  { event: 'landing_click', buttonId: 'demo_play_little-dj', anonId: 'p4' },

  // p5 never lands — only a game open (must not appear in Funnel A universe)
  { event: 'game_open', gameId: 'little-chef', anonId: 'p5' },

  // ── Funnel B ──
  { event: 'page_view', page: 'hub', anonId: 'a2', userId: 'u2' },
  { event: 'game_open', gameId: 'little-engineer', tier: 'paid', anonId: 'a2', userId: 'u2' },

  { event: 'page_view', page: 'hub', anonId: 'a3', userId: 'u3' },
  { event: 'game_open', gameId: 'little-engineer', tier: 'free', anonId: 'a3', userId: 'u3' },
  { event: 'game_open', gameId: 'little-dj', tier: 'free', anonId: 'a3', userId: 'u3' },
  { event: 'checkout_view', via: 'hub_grid', tier: 'free', anonId: 'a3', userId: 'u3' },

  { event: 'page_view', page: 'hub', anonId: 'a4', userId: 'u4' },
  { event: 'game_open', gameId: 'little-dj', tier: 'free', anonId: 'a4', userId: 'u4' },
  { event: 'checkout_view', via: 'hub_grid', tier: 'free', anonId: 'a4', userId: 'u4' },
  { event: 'purchase_success', via: 'hub_grid', tier: 'free', anonId: 'a4', userId: 'u4' },

  // u5: signed-in play but no hub view → excluded from Funnel B universe
  { event: 'game_open', gameId: 'little-chef', tier: 'paid', anonId: 'a5', userId: 'u5' },
];

const s = computeStats(rows);
const A = s.funnelA;
const B = s.funnelB;

// ── Funnel A assertions ──
assert.equal(A.universe, 4, 'A.universe = p1..p4 (p5 never landed)');
assert.deepEqual(A.sources, [['instagram', 2], ['direct', 2]], 'A.sources split');
assert.equal(A.played, 2, 'A.played = p1, p3 (p5 played but never landed)');
// "Other" clicks exclude demo_play_* → p4 excluded; nav_login + unlock_main remain
assert.deepEqual(
  A.clicks.map(([b]) => b).sort(),
  ['nav_login', 'unlock_main'],
  'A.clicks excludes demo_play taps',
);
assert.equal(A.signed, 1, 'A.signed = p1 only');
assert.equal(A.checkout, 1, 'A.checkout = p1');
assert.deepEqual(A.checkoutVia, [['landing', 1]], 'A.checkoutVia');
assert.equal(A.purchased, 1, 'A.purchased = p1');

// ── Funnel B assertions ──
assert.equal(B.universe, 3, 'B.universe = u2,u3,u4 (u5 never visited hub)');
assert.equal(B.paidPlayers, 1, 'B.paidPlayers = u2');
assert.deepEqual(B.paidGames, [['little-engineer', 1]], 'B.paidGames');
assert.equal(B.freePlayers, 2, 'B.freePlayers = u3,u4');
assert.deepEqual(
  B.freeGames.sort((x, y) => x[0].localeCompare(y[0])),
  [['little-dj', 2], ['little-engineer', 1]].sort((x, y) => x[0].localeCompare(y[0])),
  'B.freeGames (dj played by u3+u4, engineer by u3)',
);
assert.equal(B.freeCheckout, 2, 'B.freeCheckout = u3,u4');
assert.deepEqual(B.checkoutVia, [['hub_grid', 2]], 'B.checkoutVia');
assert.equal(B.purchased, 1, 'B.purchased = u4');

// ── Section 2 ──
assert.equal(s.activeUsers, 4, 'activeUsers = u2,u3,u4,u5 (any signed-in game_open)');

// ── filterRows: env filter ──────────────────────────────────────────────────
{
  const evts = [
    { event: 'x', env: 'prod', anonId: 'z1' },
    { event: 'x', env: 'local', anonId: 'z2' },
    { event: 'x', anonId: 'z3' }, // missing env → treated as prod
  ];
  assert.equal(filterRows(evts, { env: 'prod' }).length, 2, 'prod-only keeps prod + env-less');
  assert.equal(filterRows(evts, { env: 'all' }).length, 3, 'all envs keeps everything');
}

// ── filterRows: time window ─────────────────────────────────────────────────
{
  const now = 1_000_000_000_000;
  const evts = [
    { event: 'recent', env: 'prod', anonId: 'z1', timestamp: now - 1_000 },        // inside
    { event: 'old', env: 'prod', anonId: 'z2', timestamp: now - 10 * 86400000 },   // 10d ago
    { event: 'pending', env: 'prod', anonId: 'z3', timestamp: null },              // pending → kept
  ];
  const cutoff = now - 86400000; // last 24h
  const kept = filterRows(evts, { env: 'prod', cutoff }).map((e) => e.event).sort();
  assert.deepEqual(kept, ['pending', 'recent'], 'time window keeps in-window + pending, drops old');
  assert.equal(filterRows(evts, { env: 'prod', cutoff: 0 }).length, 3, 'cutoff 0 keeps all');
}

// ── filterRows: exclude internal (incl. whole session by anonId) ─────────────
{
  const evts = [
    // internal admin signs in on anonId iA — both rows are internal-session
    { event: 'page_view', env: 'prod', anonId: 'iA' },                              // pre-login (anon)
    { event: 'signin_success', env: 'prod', anonId: 'iA', userId: 'bTlG8YZn8INNvHYvONf8u8LqK033' },
    // internal test email
    { event: 'game_open', env: 'prod', anonId: 'iB', userEmail: 'LEE.NIGEL.T@gmail.com' },
    // a real external visitor
    { event: 'page_view', env: 'prod', anonId: 'ext1' },
  ];
  const kept = filterRows(evts, { excludeInternal: true });
  assert.deepEqual(kept.map((e) => e.anonId), ['ext1'], 'excludes internal rows + their whole anon session (case-insensitive email)');
  assert.equal(filterRows(evts, { excludeInternal: false }).length, 4, 'toggle off keeps internal');
}

console.log('✓ all analyticsStats assertions passed');
