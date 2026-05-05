import { isGlobalMuted } from '../../design-system/useSoundManager';
import { getAudioContext, ensureAudioRunning } from '../../design-system/audioContext';

export function initAudio() {
  ensureAudioRunning();
}

// Pentatonic scale: C4, D4, E4, G4, A4
const PENTATONIC = [261, 294, 330, 392, 440];
let noteIndex = 0;

export const sound = {
  tap() {
    if (isGlobalMuted()) return;
    const c = getAudioContext();
    const freq = PENTATONIC[noteIndex % PENTATONIC.length];
    noteIndex++;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(0.14, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.22);
  },

  wrong() {
    if (isGlobalMuted()) return;
    const c = getAudioContext();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, c.currentTime);
    gain.gain.setValueAtTime(0.07, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.32);
  },

  chime() {
    if (isGlobalMuted()) return;
    const c = getAudioContext();
    // Rising C4-E4-G4-C5 arpeggio
    const notes = [261, 330, 392, 523];
    notes.forEach((freq, i) => {
      const t = c.currentTime + i * 0.1;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t);
      osc.stop(t + 0.52);
    });
    // Reset pentatonic cycle for next constellation
    noteIndex = 0;
  },
};
