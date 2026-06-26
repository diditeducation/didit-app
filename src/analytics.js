// Firestore-based analytics — flat `events` collection
// Each document:
//   { event, gameId?, level?, ...payload,
//     userId, userEmail,   // who (null when logged-out)
//     tier,                // 'anon' | 'free' | 'paid' AT THE MOMENT of the event
//                          //   — split any event by free vs paying users
//     anonId,              // stable per-browser id — links a logged-out visit
//                          //   to the same person after they sign in
//     src,                 // first-touch source (utm_source / referrer / 'direct')
//     env, date, timestamp }
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

function getUser() {
  const user = auth.currentUser;
  return { userId: user?.uid ?? null, userEmail: user?.email ?? null };
}

// Membership tier AT THE MOMENT an event fires — 'anon' (logged-out),
// 'free' (signed-in, not paid), 'paid' (real Family Pass). Kept in sync by
// SubscriptionContext via setAnalyticsTier(). Lets every event be split by
// who did it (e.g. game plays by free vs paying users) without a join.
let _tier = 'anon';
export function setAnalyticsTier(tier) { _tier = tier || 'anon'; }

// Stable anonymous visitor id, created once and reused. Lets us follow one
// person's journey across the login boundary (landing → signed-in → paid).
// No personal data — just a random token.
function getAnonId() {
  try {
    let id = localStorage.getItem('didit:anon-id');
    if (!id) {
      id = (window.crypto?.randomUUID?.() || `a_${Date.now()}_${Math.random().toString(36).slice(2)}`);
      localStorage.setItem('didit:anon-id', id);
    }
    return id;
  } catch {
    return null; // storage blocked (private mode) — degrade gracefully
  }
}

// First-touch acquisition source, captured once on the first visit and kept.
// utm_source wins; else the external referrer's host; else 'direct'.
function getFirstTouchSource() {
  try {
    const KEY = 'didit:src';
    let s = localStorage.getItem(KEY);
    if (s === null) {
      const utm = new URLSearchParams(window.location.search).get('utm_source');
      let ref = '';
      if (document.referrer) {
        try { ref = new URL(document.referrer).hostname.replace(/^www\./, ''); } catch { /* bad url */ }
      }
      const self = window.location.hostname.replace(/^www\./, '');
      s = utm || (ref && ref !== self ? ref : '') || 'direct';
      localStorage.setItem(KEY, s);
    }
    return s;
  } catch {
    return 'direct';
  }
}

// Marketing-source landing routes (/go/:source, e.g. /go/instagram). Records
// the campaign source as the first-touch `src` so identical landing pages on
// different links are attributable. First touch wins (same as utm/referrer) —
// a returning visitor keeps their original source. Call during RENDER of the
// marketing route so it lands before the landing's page_view fires.
export function captureMarketingSource(source) {
  if (!source) return;
  try {
    if (localStorage.getItem('didit:src') === null) {
      localStorage.setItem('didit:src', String(source).slice(0, 40));
    }
  } catch { /* storage blocked */ }
}

function today() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function getEnv() {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return 'local';
  if (host.includes('staging') || host.includes('vercel') || host.includes('netlify')) return 'staging';
  return 'prod';
}

function write(payload) {
  return addDoc(collection(db, 'events'), {
    ...payload,
    ...getUser(),
    tier: _tier,         // 'anon' | 'free' | 'paid' at the moment of the event
    anonId: getAnonId(),
    src: getFirstTouchSource(),
    env: getEnv(),
    date: today(),
    timestamp: serverTimestamp(),
  }).catch(() => {}); // never crash the game
}

/** Called when a user opens a game (Game.jsx mounts) */
export function trackGameOpen(gameId) {
  return write({ event: 'game_open', gameId });
}

/** Called when a level is completed inside a levelled game */
export function trackLevelComplete(gameId, level) {
  return write({ event: 'level_complete', gameId, level });
}

/** Called when the success screen is shown (full game completion) */
export function trackGameComplete(gameId) {
  return write({ event: 'game_complete', gameId });
}

/** Called when the Share button is tapped (gameId may be null from hub) */
export function trackShareClick(gameId = null) {
  return write({ event: 'share_click', gameId });
}

/** Called when the landing/marketing page loads */
export function trackPageView(page) {
  return write({ event: 'page_view', page });
}

/** Called when any button on the landing page is clicked */
export function trackLandingClick(buttonId) {
  return write({ event: 'landing_click', buttonId });
}

/** Called when a button on the success screen is tapped */
export function trackSuccessClick(action, gameId = null) {
  return write({ event: 'success_click', action, gameId });
}

/**
 * Called on hub mount. Tracks the hub page view and, once per browser
 * session, fires a session_start event that records whether this is a
 * returning user (visited before on a different session).
 */
export function trackHubView() {
  write({ event: 'page_view', page: 'hub' });

  // Session dedup — only fire session_start once per tab/session
  try {
    if (!sessionStorage.getItem('didit:session-tracked')) {
      sessionStorage.setItem('didit:session-tracked', '1');
      const isReturn = !!localStorage.getItem('didit:has-visited');
      localStorage.setItem('didit:has-visited', '1');
      write({ event: 'session_start', isReturn });
    }
  } catch { /* storage blocked */ }
}

/**
 * Called when a game's HomePage mounts (via GameHomeLayout).
 * Lets us see browse-but-don't-play behaviour.
 */
export function trackGameHomeView(gameId) {
  return write({ event: 'game_home_view', gameId });
}

/**
 * Called when the user selects a filter category on the hub grid.
 * category is the label string e.g. 'Science & Tech'.
 */
export function trackFilterSelect(category) {
  return write({ event: 'filter_select', category });
}

/**
 * Called when a wish is successfully submitted from WishModal.
 */
export function trackWishSubmit() {
  return write({ event: 'wish_submit' });
}

// ── Conversion funnel (landing → paying) ───────────────────────────────────
// These instrument the previously-dark steps between "clicked unlock" and
// "paid". Every event already carries anonId + userId, so signing-in events
// stitch the anonymous landing journey to the paying account.

/** Sign-in page viewed. */
export function trackSignInView() {
  return write({ event: 'signin_view' });
}

/** A sign-in method was chosen. method: 'google' | 'email'. */
export function trackSignInMethod(method) {
  return write({ event: 'signin_method_click', method });
}

/** Magic-link email was sent (email method). */
export function trackMagicLinkSent() {
  return write({ event: 'magic_link_sent' });
}

/** Sign-in completed. method: 'google' | 'email'; isNewUser flags first-ever sign-in. */
export function trackSignInSuccess(method, isNewUser = false) {
  return write({ event: 'signin_success', method, isNewUser: !!isNewUser });
}

// Where the user entered checkout from — the conversion *placement*, distinct
// from `src` (first-touch acquisition). Persisted so it survives the Stripe
// redirect/reload and can be stamped onto purchase_success, which fires later
// from SubscriptionContext (after the user is back from Stripe).
//   'landing' | 'demo_success' | 'hub_grid' | 'game_locked' | 'direct'
const CHECKOUT_VIA_KEY = 'didit:checkout-via';
function setCheckoutVia(via) {
  try { localStorage.setItem(CHECKOUT_VIA_KEY, via || 'direct'); } catch { /* storage blocked */ }
}
function getCheckoutVia() {
  try { return localStorage.getItem(CHECKOUT_VIA_KEY) || 'direct'; } catch { return 'direct'; }
}

/** Checkout page viewed. `via` = which flow brought them here (also persisted). */
export function trackCheckoutView(via = 'direct') {
  setCheckoutVia(via);
  return write({ event: 'checkout_view', via });
}

/** Checkout started (Stripe redirect or dev-simulate). */
export function trackCheckoutStart(via) {
  return write({ event: 'checkout_start', via: via || getCheckoutVia() });
}

/**
 * Family Pass purchased — the conversion. Fire once per account.
 * Attributes the sale to the checkout placement (`via`) captured on entry,
 * so you can see whether a purchase came from the landing page vs an in-app
 * flow even though this fires from SubscriptionContext after the redirect.
 */
export function trackPurchase() {
  return write({ event: 'purchase_success', via: getCheckoutVia() });
}

// ── User profile database (users/{uid}) ────────────────────────────────────
// A per-account history doc, separate from the flat event log: one row per
// signed-in user with when they first appeared (became a free account) and
// when/whether they converted to paying. Lets you query "who are my users and
// where are they in the lifecycle" without scanning every event.
//   { uid, email, displayName, anonId, firstTouchSrc,
//     createdAt,        // first time we wrote the profile ≈ became a free user
//     lastSeenAt,       // refreshed on every upsert
//     lastSignInMethod, // 'google' | 'email'
//     convertedAt, paidVia, paid }   // set once payment is confirmed

/** Create/refresh the signed-in user's profile doc. `extra` is merged in. */
export function upsertUserProfile(extra = {}) {
  const user = auth.currentUser;
  if (!user) return Promise.resolve();
  const ref = doc(db, 'users', user.uid);
  const data = {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    anonId: getAnonId(),
    firstTouchSrc: getFirstTouchSource(),
    lastSeenAt: serverTimestamp(),
    ...extra,
  };
  // Stamp createdAt only on the first write per browser, so merges don't keep
  // resetting "when they first appeared".
  try {
    const k = `didit:profile-created:${user.uid}`;
    if (!localStorage.getItem(k)) { data.createdAt = serverTimestamp(); localStorage.setItem(k, '1'); }
  } catch { /* storage blocked — createdAt simply omitted */ }
  return setDoc(ref, data, { merge: true }).catch(() => {});
}

/** Record sign-in on the profile (method: 'google' | 'email'). */
export function recordSignIn(method) {
  return upsertUserProfile({ lastSignInMethod: method });
}

/** Mark the account as converted to paying, with the checkout placement. */
export function markConverted() {
  return upsertUserProfile({ convertedAt: serverTimestamp(), paidVia: getCheckoutVia(), paid: true });
}
