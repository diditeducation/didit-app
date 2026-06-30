// Pure analytics aggregation — no React / Firebase, so it's unit-testable and
// reusable. Consumed by AnalyticsAdminPage; exercised by analyticsStats.test.mjs.
//
// `rows` is an array of already-filtered event objects (time window + env +
// exclude-internal applied by the caller). Each event looks like:
//   { event, page?, gameId?, buttonId?, via?, tier?, anonId, userId, ... }

// Your own + test accounts — excluded by default so internal activity doesn't
// skew the numbers. Keep in sync with the admin UID in firestore.rules and
// TEST_MEMBER_EMAILS in SubscriptionContext.
export const INTERNAL_EMAILS = ['did.it.education@gmail.com', 'lee.nigel.t@gmail.com'];
export const INTERNAL_UIDS = ['bTlG8YZn8INNvHYvONf8u8LqK033']; // did.it.education@gmail.com
export const isInternalRow = (e) =>
  INTERNAL_EMAILS.includes((e.userEmail || '').toLowerCase()) || INTERNAL_UIDS.includes(e.userId);

// Coerce any timestamp shape (Firestore Timestamp, Date, epoch ms, ISO string)
// to epoch ms, or null if absent/unparseable.
export function tsToMs(ts) {
  if (ts == null) return null;
  if (typeof ts === 'number') return ts;
  if (typeof ts === 'string') { const t = Date.parse(ts); return Number.isNaN(t) ? null : t; }
  if (typeof ts.toDate === 'function') return ts.toDate().getTime();
  if (ts instanceof Date) return ts.getTime();
  return null;
}

/**
 * Apply the dashboard's three filters in order: env (prod-only vs all),
 * time window (timestamp >= cutoff; a pending/null timestamp is kept as
 * "just now"), and exclude-internal (drop internal accounts AND their whole
 * session, matched by the anonId tied to the account).
 */
export function filterRows(events, { env = 'prod', cutoff = 0, excludeInternal = true } = {}) {
  let base = (events || []).filter((e) => (env === 'all' ? true : (e.env || 'prod') === 'prod'));
  base = base.filter((e) => { const m = tsToMs(e.timestamp); return m == null ? true : m >= cutoff; });
  if (!excludeInternal) return base;
  const internalAnon = new Set();
  for (const e of base) if (isInternalRow(e) && e.anonId) internalAnon.add(e.anonId);
  return base.filter((e) => !isInternalRow(e) && !(e.anonId && internalAnon.has(e.anonId)));
}

// Map<key, Set> → [[key, size], …] sorted by size desc.
export function setMapRows(m) {
  return [...m.entries()].map(([k, s]) => [k, s.size]).sort((a, b) => b[1] - a[1]);
}
export function addToSetMap(m, key, val) {
  if (!m.has(key)) m.set(key, new Set());
  m.get(key).add(val);
}

/**
 * @param rows  filtered event rows
 * @param opts.foundingAnonIds  Set of anonIds that CLAIMED the founding pass in
 *        window (free-access "conversion" under the promo-code model)
 * @param opts.foundingUserIds  Set of userIds that claimed in window
 * A "conversion" = a real purchase_success event OR a founding claim — so the
 * funnels light up whether access came from a payment or a free promo code.
 */
export function computeStats(rows, opts = {}) {
  const { foundingAnonIds = new Set(), foundingUserIds = new Set() } = opts;
  const personKey = (e) => e.userId || e.anonId || e.id;

  // ───── Funnel A: landing universe, keyed by anonId (anonId is on every
  // event, so it stitches a person across the login boundary). ─────
  const aUniverse = new Set();
  const aSrc = new Map();          // src → Set(anonId)
  const aPlayed = new Set();
  const aClicks = new Map();       // buttonId → Set(anonId)
  const aSigned = new Set();
  const aCheckout = new Set();
  const aCheckoutVia = new Map();  // via → Set(anonId)
  const aPurchased = new Set();

  for (const e of rows) {
    if (e.event === 'page_view' && (e.page === 'landing' || e.page === 'landing_v2') && e.anonId) {
      aUniverse.add(e.anonId);
      addToSetMap(aSrc, e.src || 'direct', e.anonId);
    }
  }
  for (const e of rows) {
    const a = e.anonId;
    if (!a || !aUniverse.has(a)) continue;
    if (e.userId) aSigned.add(a); // any identified event = they signed in
    switch (e.event) {
      case 'game_open': aPlayed.add(a); break;
      case 'landing_click':
        // "Other" interactions exclude the demo-play taps (counted as iia).
        if (e.buttonId && !e.buttonId.startsWith('demo_play') && e.buttonId !== 'demo_autoadvance') {
          addToSetMap(aClicks, e.buttonId, a);
        }
        break;
      case 'checkout_view':
        aCheckout.add(a);
        addToSetMap(aCheckoutVia, e.via || 'direct', a);
        break;
      case 'purchase_success': aPurchased.add(a); break;
      default: break;
    }
  }

  // ───── Funnel B: hub universe, keyed by userId (logged-in). ─────
  const bUniverse = new Set();
  const bPaid = new Set();
  const bFree = new Set();
  const bPaidGame = new Map();     // gameId → Set(userId)
  const bFreeGame = new Map();
  const bFreeCheckout = new Set();
  const bCheckoutVia = new Map();
  const bPurchased = new Set();

  for (const e of rows) {
    if (e.event === 'page_view' && e.page === 'hub' && e.userId) bUniverse.add(e.userId);
  }
  for (const e of rows) {
    const u = e.userId;
    if (!u || !bUniverse.has(u)) continue;
    switch (e.event) {
      case 'game_open': {
        const id = e.gameId || 'unknown';
        if (e.tier === 'paid') { bPaid.add(u); addToSetMap(bPaidGame, id, u); }
        else { bFree.add(u); addToSetMap(bFreeGame, id, u); }
        break;
      }
      case 'checkout_view':
        if (e.tier !== 'paid') { bFreeCheckout.add(u); addToSetMap(bCheckoutVia, e.via || 'direct', u); }
        break;
      case 'purchase_success': bPurchased.add(u); break;
      default: break;
    }
  }

  // Conversion = real purchase OR a founding claim (free access via promo code).
  const aConverted = new Set(aPurchased);
  for (const a of aUniverse) if (foundingAnonIds.has(a)) aConverted.add(a);
  const bConverted = new Set(bPurchased);
  for (const u of bUniverse) if (foundingUserIds.has(u)) bConverted.add(u);

  // ───── Section 2: active users (logged in AND played a game), payments
  // (real purchase_success events), and who entered the checkout/claim flow. ─────
  const activeUsers = new Set();
  const flowEntered = new Set(); // distinct people who reached checkout (any flow)
  let successfulPayments = 0;
  for (const e of rows) {
    if (e.event === 'game_open' && e.userId) activeUsers.add(e.userId);
    if (e.event === 'purchase_success') successfulPayments++;
    if (e.event === 'checkout_view') flowEntered.add(personKey(e));
  }

  return {
    funnelA: {
      universe: aUniverse.size,
      sources: setMapRows(aSrc),
      played: aPlayed.size,
      clicks: setMapRows(aClicks).slice(0, 5),
      signed: aSigned.size,
      checkout: aCheckout.size,
      checkoutVia: setMapRows(aCheckoutVia),
      converted: aConverted.size,
    },
    funnelB: {
      universe: bUniverse.size,
      paidPlayers: bPaid.size,
      paidGames: setMapRows(bPaidGame),
      freePlayers: bFree.size,
      freeGames: setMapRows(bFreeGame),
      freeCheckout: bFreeCheckout.size,
      checkoutVia: setMapRows(bCheckoutVia),
      converted: bConverted.size,
    },
    activeUsers: activeUsers.size,
    flowEntered: flowEntered.size,
    successfulPayments,
  };
}
