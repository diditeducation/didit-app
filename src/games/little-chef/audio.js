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
    const ac = getAudioContext();
    const bufferSize = ac.sampleRate * 0.3;
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
    const noise = ac.createBufferSource();
    noise.buffer = buffer;
    const filter = ac.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3000;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.15, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);
    noise.start();
  },
  chop: () => {
    if (isGlobalMuted()) return;
    const ac = getAudioContext();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ac.currentTime + 0.05);
    gain.gain.setValueAtTime(0.4, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + 0.05);
  },
};
