import { isGlobalMuted } from '../../design-system/useSoundManager';
import { getAudioContext, ensureAudioRunning } from '../../design-system/audioContext';

export const initAudio = () => ensureAudioRunning();

const playTone = (freq, duration, type = 'sine', volume = 0.15) => {
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
  tap: () => {
    if (isGlobalMuted()) return;
    playTone(600, 0.08, 'sine', 0.3);
  },

  coin: () => {
    if (isGlobalMuted()) return;
    const ac = getAudioContext();
    const t = ac.currentTime;

    const osc1 = ac.createOscillator();
    const g1 = ac.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(4000, t);
    osc1.frequency.exponentialRampToValueAtTime(2000, t + 0.015);
    g1.gain.setValueAtTime(0.3, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
    osc1.connect(g1);
    g1.connect(ac.destination);
    osc1.start(t);
    osc1.stop(t + 0.015);

    const osc2 = ac.createOscillator();
    const g2 = ac.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(3200, t + 0.01);
    osc2.frequency.exponentialRampToValueAtTime(1800, t + 0.31);
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.setValueAtTime(0.15, t + 0.01);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.31);
    osc2.connect(g2);
    g2.connect(ac.destination);
    osc2.start(t);
    osc2.stop(t + 0.31);

    const osc3 = ac.createOscillator();
    const g3 = ac.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(6400, t + 0.01);
    osc3.frequency.exponentialRampToValueAtTime(3600, t + 0.21);
    g3.gain.setValueAtTime(0.0001, t);
    g3.gain.setValueAtTime(0.06, t + 0.01);
    g3.gain.exponentialRampToValueAtTime(0.001, t + 0.21);
    osc3.connect(g3);
    g3.connect(ac.destination);
    osc3.start(t);
    osc3.stop(t + 0.21);
  },

  correct: () => {
    if (isGlobalMuted()) return;
    playTone(523, 0.12, 'sine', 0.3);
    setTimeout(() => playTone(784, 0.12, 'sine', 0.3), 120);
  },

  complete: () => {
    if (isGlobalMuted()) return;
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => playTone(f, 0.2, 'sine', 0.12), i * 100)
    );
  },

  drop: () => {
    if (isGlobalMuted()) return;
    const ac = getAudioContext();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 0.1);
    gain.gain.setValueAtTime(0.5, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + 0.1);
  },

  kaching: () => {
    if (isGlobalMuted()) return;
    const ac = getAudioContext();
    const t = ac.currentTime;

    const osc1 = ac.createOscillator();
    const g1 = ac.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2637, t);
    g1.gain.setValueAtTime(0.4, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc1.connect(g1);
    g1.connect(ac.destination);
    osc1.start(t);
    osc1.stop(t + 0.6);

    const osc2 = ac.createOscillator();
    const g2 = ac.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(5274, t);
    g2.gain.setValueAtTime(0.2, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc2.connect(g2);
    g2.connect(ac.destination);
    osc2.start(t);
    osc2.stop(t + 0.4);

    const osc3 = ac.createOscillator();
    const g3 = ac.createGain();
    osc3.type = 'square';
    osc3.frequency.setValueAtTime(280, t + 0.05);
    osc3.frequency.exponentialRampToValueAtTime(120, t + 0.13);
    g3.gain.setValueAtTime(0.0001, t);
    g3.gain.setValueAtTime(0.25, t + 0.05);
    g3.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    osc3.connect(g3);
    g3.connect(ac.destination);
    osc3.start(t);
    osc3.stop(t + 0.13);

    const osc4 = ac.createOscillator();
    const g4 = ac.createGain();
    osc4.type = 'sawtooth';
    osc4.frequency.setValueAtTime(140, t + 0.1);
    osc4.frequency.exponentialRampToValueAtTime(60, t + 0.22);
    g4.gain.setValueAtTime(0.0001, t);
    g4.gain.setValueAtTime(0.15, t + 0.1);
    g4.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc4.connect(g4);
    g4.connect(ac.destination);
    osc4.start(t);
    osc4.stop(t + 0.22);
  },
};
