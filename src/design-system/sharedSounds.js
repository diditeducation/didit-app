/**
 * Canonical app-wide sounds for Did·It.
 *
 * These are the sounds that should be consistent across every game:
 * - Welcome chime  → plays when "Let's play ▶" is tapped (GameHomeLayout)
 * - Success chime  → plays when SuccessScreen appears
 *
 * Game-specific sounds (coin clink, sizzle, piano notes…) stay in each
 * game's own audio.js.
 */

import { getAudioContext, ensureAudioRunning } from './audioContext';
import { isGlobalMuted } from './useSoundManager';

/**
 * Ascending C5 → E5 → G5 flourish.
 * Plays when the player taps "Let's play ▶" on any game welcome page.
 */
export function playWelcomeChime() {
  if (isGlobalMuted()) return;
  try {
    ensureAudioRunning();
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.09;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  } catch (e) { /* Web Audio not supported */ }
}

/**
 * Ascending C5 → E5 → G5 → C6 arpeggio.
 * Plays when the player completes a level and SuccessScreen appears.
 */
export function playSuccessChime() {
  if (isGlobalMuted()) return;
  try {
    ensureAudioRunning();
    const ctx = getAudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  } catch (e) { /* Web Audio not supported */ }
}
