import { isGlobalMuted } from '../../design-system/useSoundManager';

let audioCtx;
let masterGain;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
};

function playTone({ freq, endFreq, dur, vol, type = 'sine', startTime }) {
  if (!audioCtx) return;
  if (isGlobalMuted()) return;
  const t = startTime !== undefined ? startTime : audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
  }
  gain.gain.setValueAtTime(0.001, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const sound = {
  tap: () => {
    if (!audioCtx) return;
    if (isGlobalMuted()) return;
    // Glass tap: short 800Hz sine (0.08s)
    playTone({ freq: 800, dur: 0.08, vol: 0.12 });
    // Gentle harmonic 1600Hz (0.05s), quiet
    playTone({ freq: 1600, dur: 0.05, vol: 0.06 });
  },

  plop: (delay = 0) => {
    if (!audioCtx) return;
    if (isGlobalMuted()) return;
    // Soft ball landing: 180Hz→120Hz, 0.15s, stagger delay
    const t = audioCtx.currentTime + delay;
    playTone({ freq: 180, endFreq: 120, dur: 0.15, vol: 0.18, startTime: t });
  },

  fill: () => {
    if (!audioCtx) return;
    if (isGlobalMuted()) return;
    // Warm resonant fill: 130Hz→90Hz, 0.5s, gain 0.2
    playTone({ freq: 130, endFreq: 90, dur: 0.5, vol: 0.2 });
  },

  chime: () => {
    if (!audioCtx) return;
    if (isGlobalMuted()) return;
    // Ascending [523,659,784,988]Hz, 0.1s apart, sine
    const freqs = [523, 659, 784, 988];
    freqs.forEach((freq, i) => {
      const t = audioCtx.currentTime + i * 0.1;
      playTone({ freq, dur: 0.25, vol: 0.18, startTime: t });
    });
  },
};
