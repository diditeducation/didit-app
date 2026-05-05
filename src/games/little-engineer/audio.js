import { isGlobalMuted } from '../../design-system/useSoundManager';
import { getAudioContext, ensureAudioRunning } from '../../design-system/audioContext';

export const initAudio = () => ensureAudioRunning();

export const playTone = (freq, duration, type = 'sine', volume = 0.15) => {
  if (isGlobalMuted()) return;
  const ac = getAudioContext();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
};

export const sound = {
  tap: () => { if (isGlobalMuted()) return; playTone(440, 0.08, 'square', 0.05); },
  toggleOn: () => { if (isGlobalMuted()) return; playTone(880, 0.1, 'square', 0.06); },
  toggleOff: () => { if (isGlobalMuted()) return; playTone(330, 0.1, 'square', 0.06); },
  success: () => {
    if (isGlobalMuted()) return;
    playTone(523, 0.15);
    setTimeout(() => playTone(659, 0.15), 100);
    setTimeout(() => playTone(784, 0.25), 200);
  },
  celebrate: () => {
    if (isGlobalMuted()) return;
    [523, 587, 659, 784, 880, 1047].forEach((f, i) =>
      setTimeout(() => playTone(f, 0.2, 'sine', 0.12), i * 100)
    );
  },
  snap: () => {
    if (isGlobalMuted()) return;
    playTone(523, 0.08, 'square', 0.06);
    setTimeout(() => playTone(660, 0.08, 'square', 0.06), 50);
  },
  error: () => { if (isGlobalMuted()) return; playTone(220, 0.15, 'sine', 0.08); },
  alarm: () => {
    if (isGlobalMuted()) return;
    playTone(260, 0.3, 'sine', 0.07);
    setTimeout(() => playTone(220, 0.3, 'sine', 0.07), 300);
  },
  dim: () => { if (isGlobalMuted()) return; playTone(180, 0.4, 'sine', 0.06); },
  pop: () => {
    if (isGlobalMuted()) return;
    playTone(660, 0.1, 'sine', 0.08);
    setTimeout(() => playTone(880, 0.12, 'sine', 0.1), 80);
    setTimeout(() => playTone(1100, 0.1, 'sine', 0.08), 160);
  },
};
