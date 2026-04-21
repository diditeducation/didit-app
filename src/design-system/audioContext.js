/**
 * Shared AudioContext singleton for the entire Did·It app.
 *
 * Every game and design-system component imports from here instead of
 * creating its own AudioContext. This avoids hitting the browser limit
 * (~6 contexts) and ensures iOS/Safari autoplay-policy is handled in
 * one place.
 *
 * IMPORTANT: The first call to getAudioContext() should happen inside
 * a user-gesture handler (click / tap) so the context starts in the
 * "running" state on mobile browsers.
 */

let ctx = null;
let masterGain = null;
let analyserNode = null;

/**
 * Returns the singleton AudioContext, creating it lazily on first call.
 */
export function getAudioContext() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return ctx;
}

/**
 * Resumes a suspended AudioContext. Safe to call repeatedly.
 * Call this from user-gesture handlers (onClick, onTouchStart, onDrag).
 */
export function ensureAudioRunning() {
  const ac = getAudioContext();
  if (ac.state === 'suspended') ac.resume();
}

/**
 * Creates a masterGain → analyserNode → destination chain for waveform
 * visualisation (used by Little Pianist / Little DJ).
 * Idempotent — returns the same chain on subsequent calls.
 */
export function createAnalyserChain() {
  const ac = getAudioContext();
  if (!masterGain) {
    masterGain = ac.createGain();
    masterGain.gain.value = 0.5;
    analyserNode = ac.createAnalyser();
    analyserNode.fftSize = 256;
    masterGain.connect(analyserNode);
    analyserNode.connect(ac.destination);
  }
  return { masterGain, analyserNode };
}

/**
 * Returns the shared masterGain node, or null if createAnalyserChain()
 * has not been called yet.
 */
export function getMasterGain() {
  return masterGain;
}

/**
 * Returns the shared AnalyserNode, or null if createAnalyserChain()
 * has not been called yet.
 */
export function getAnalyserNode() {
  return analyserNode;
}
