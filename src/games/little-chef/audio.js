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
  tap: () => {
    if (isGlobalMuted()) return;
    playTone(600, 0.08, 'sine', 0.3);
  },
  correct: () => {
    if (isGlobalMuted()) return;
    playTone(523, 0.12, 'sine', 0.3);
    setTimeout(() => playTone(784, 0.12, 'sine', 0.3), 120);
  },
  wrong: () => {
    if (isGlobalMuted()) return;
    playTone(300, 0.15, 'sine', 0.25);
    setTimeout(() => playTone(200, 0.2, 'sine', 0.2), 100);
  },
  complete: () => {
    if (isGlobalMuted()) return;
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => playTone(f, 0.2, 'sine', 0.12), i * 100)
    );
  },
  sizzle: () => {
    if (isGlobalMuted()) return;
    if (!audioCtx) return;
    const bufferSize = audioCtx.sampleRate * 0.3;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3000;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
  },
  chop: () => {
    if (isGlobalMuted()) return;
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  },
};
