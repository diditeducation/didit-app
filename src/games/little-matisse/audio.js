import { isGlobalMuted } from '../../design-system/useSoundManager';
import { getAudioContext, ensureAudioRunning } from '../../design-system/audioContext';

export function initAudio() {
  ensureAudioRunning();
}

// Rising pitch per placement (4 placements total)
const POP_FREQS = [440, 523, 587, 660];

export const sound = {
  pop(placementIndex) {
    if (isGlobalMuted()) return;
    const c = getAudioContext();
    const base = POP_FREQS[Math.min(placementIndex, POP_FREQS.length - 1)];
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(base, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(base * 1.5, c.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.22);
  },

  chime() {
    if (isGlobalMuted()) return;
    const c = getAudioContext();
    // C major arpeggio: C5 E5 G5 C6 E6
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      const t = c.currentTime + i * 0.09;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t);
      osc.stop(t + 0.62);
    });
  },
};
