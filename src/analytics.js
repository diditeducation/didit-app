// Firestore-based analytics — flat `events` collection
// Each document: { event, gameId?, level?, userId, userEmail, date, timestamp }
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

function getUser() {
  const user = auth.currentUser;
  return { userId: user?.uid ?? null, userEmail: user?.email ?? null };
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
