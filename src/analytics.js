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

function write(payload) {
  return addDoc(collection(db, 'events'), {
    ...payload,
    ...getUser(),
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
