// Firestore-based analytics — flat `events` collection
// Each document:
//   { event, gameId?, level?, ...payload,
//     userId, userEmail,   // who (null when logged-out)
//     anonId,              // stable per-browser id — links a logged-out visit
//                          //   to the same person after they sign in
//     src,                 // first-touch source (utm_source / referrer / 'direct')
//     env, date, timestamp }
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

function getUser() {
  const user = auth.currentUser;
  return { userId: user?.uid ?? null, userEmail: user?.email ?? null };
}

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

/** Checkout page viewed. */
export function trackCheckoutView() {
  return write({ event: 'checkout_view' });
}

/** Checkout started (Stripe redirect or dev-simulate). */
export function trackCheckoutStart() {
  return write({ event: 'checkout_start' });
}

/** Subscription became active — the conversion. Fire once per activation. */
export function trackPurchase() {
  return write({ event: 'purchase_success' });
}

/** Subscription cancelled / lapsed. */
export function trackSubscriptionCanceled() {
  return write({ event: 'subscription_canceled' });
}
