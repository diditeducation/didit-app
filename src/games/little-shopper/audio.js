import { isGlobalMuted } from '../../design-system/useSoundManager';

let audioCtx;

export const initAudio = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
};

const playTone = (freq, duration, type = 'sine', volume = 0.15) => {
  if (!audioCtx) return;
  if (isGlobalMuted()) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

export const sound = {
  /* Short soft pop — sine, 600Hz, 0.08s */
  tap: () => {
    if (isGlobalMuted()) return;
    playTone(600, 0.08, 'sine', 0.3);
  },

  /* Metallic coin clink — impact click + ring + harmonic overtone */
  coin: () => {
    if (isGlobalMuted()) return;
    if (!audioCtx) return;
    const t = audioCtx.currentTime;

    /* 1. Initial impact click — triangle, 4000→2000Hz, 0.015s */
    const osc1 = audioCtx.createOscillator();
    const g1 = audioCtx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(4000, t);
    osc1.frequency.exponentialRampToValueAtTime(2000, t + 0.015);
    g1.gain.setValueAtTime(0.3, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
    osc1.connect(g1);
    g1.connect(audioCtx.destination);
    osc1.start(t);
    osc1.stop(t + 0.015);

    /* 2. Coin ring (main tone) — sine, 3200→1800Hz, 0.3s, starts at +0.01s */
    const osc2 = audioCtx.createOscillator();
    const g2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(3200, t + 0.01);
    osc2.frequency.exponentialRampToValueAtTime(1800, t + 0.31);
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.setValueAtTime(0.15, t + 0.01);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.31);
    osc2.connect(g2);
    g2.connect(audioCtx.destination);
    osc2.start(t);
    osc2.stop(t + 0.31);

    /* 3. Harmonic overtone — sine, 6400→3600Hz, 0.2s, starts at +0.01s */
    const osc3 = audioCtx.createOscillator();
    const g3 = audioCtx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(6400, t + 0.01);
    osc3.frequency.exponentialRampToValueAtTime(3600, t + 0.21);
    g3.gain.setValueAtTime(0.0001, t);
    g3.gain.setValueAtTime(0.06, t + 0.01);
    g3.gain.exponentialRampToValueAtTime(0.001, t + 0.21);
    osc3.connect(g3);
    g3.connect(audioCtx.destination);
    osc3.start(t);
    osc3.stop(t + 0.21);
  },

  /* Ascending two-note chime — sine, 523Hz then 784Hz */
  correct: () => {
    if (isGlobalMuted()) return;
    playTone(523, 0.12, 'sine', 0.3);
    setTimeout(() => playTone(784, 0.12, 'sine', 0.3), 120);
  },

  /* Ascending arpeggio — root, major 3rd, 5th, octave */
  complete: () => {
    if (isGlobalMuted()) return;
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => playTone(f, 0.2, 'sine', 0.12), i * 100)
    );
  },

  /* Soft thud — oscillator 200→80Hz, 0.1s */
  drop: () => {
    if (isGlobalMuted()) return;
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  },

  /* Cash register bell — E7 bell strike + harmonic + mechanism + till spring */
  kaching: () => {
    if (isGlobalMuted()) return;
    if (!audioCtx) return;
    const t = audioCtx.currentTime;

    /* 1. Sharp bell strike — sine, E7 (2637Hz), 0.6s */
    const osc1 = audioCtx.createOscillator();
    const g1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2637, t);
    g1.gain.setValueAtTime(0.4, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc1.connect(g1);
    g1.connect(audioCtx.destination);
    osc1.start(t);
    osc1.stop(t + 0.6);

    /* 2. Bell harmonic — sine, E8 (5274Hz), 0.4s */
    const osc2 = audioCtx.createOscillator();
    const g2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(5274, t);
    g2.gain.setValueAtTime(0.2, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc2.connect(g2);
    g2.connect(audioCtx.destination);
    osc2.start(t);
    osc2.stop(t + 0.4);

    /* 3. Register mechanism — square, 280→120Hz, 0.08s, starts at +0.05s */
    const osc3 = audioCtx.createOscillator();
    const g3 = audioCtx.createGain();
    osc3.type = 'square';
    osc3.frequency.setValueAtTime(280, t + 0.05);
    osc3.frequency.exponentialRampToValueAtTime(120, t + 0.13);
    g3.gain.setValueAtTime(0.0001, t);
    g3.gain.setValueAtTime(0.25, t + 0.05);
    g3.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    osc3.connect(g3);
    g3.connect(audioCtx.destination);
    osc3.start(t);
    osc3.stop(t + 0.13);

    /* 4. Till spring — sawtooth, 140→60Hz, 0.12s, starts at +0.1s */
    const osc4 = audioCtx.createOscillator();
    const g4 = audioCtx.createGain();
    osc4.type = 'sawtooth';
    osc4.frequency.setValueAtTime(140, t + 0.1);
    osc4.frequency.exponentialRampToValueAtTime(60, t + 0.22);
    g4.gain.setValueAtTime(0.0001, t);
    g4.gain.setValueAtTime(0.15, t + 0.1);
    g4.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc4.connect(g4);
    g4.connect(audioCtx.destination);
    osc4.start(t);
    osc4.stop(t + 0.22);
  },
};
