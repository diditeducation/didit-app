import { isGlobalMuted } from '../../design-system/useSoundManager';

let audioCtx;
let masterGain;
let analyserNode;

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.5;
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 256;
    masterGain.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
};

export const analyser = {
  getNode: () => analyserNode,
};

const playTone = (freq, dur = 0.1, type = 'sine', vol = 0.3) => {
  if (!audioCtx) return;
  if (isGlobalMuted()) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start();
  osc.stop(audioCtx.currentTime + dur + 0.01);
};

export const sound = {
  heartbeat: () => {
    if (!audioCtx) return;
    if (isGlobalMuted()) return;
    // First "lub"
    const o1 = audioCtx.createOscillator();
    const g1 = audioCtx.createGain();
    o1.frequency.setValueAtTime(80, audioCtx.currentTime);
    o1.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.12);
    g1.gain.setValueAtTime(1.0, audioCtx.currentTime);
    g1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    o1.connect(g1);
    g1.connect(masterGain);
    o1.start();
    o1.stop(audioCtx.currentTime + 0.2);
    // Second "dub"
    const o2 = audioCtx.createOscillator();
    const g2 = audioCtx.createGain();
    o2.frequency.setValueAtTime(60, audioCtx.currentTime + 0.15);
    o2.frequency.exponentialRampToValueAtTime(25, audioCtx.currentTime + 0.27);
    g2.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    g2.gain.setValueAtTime(0.8, audioCtx.currentTime + 0.15);
    g2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
    o2.connect(g2);
    g2.connect(masterGain);
    o2.start();
    o2.stop(audioCtx.currentTime + 0.35);
  },

  kick: () => {
    if (!audioCtx) return;
    if (isGlobalMuted()) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.8, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  },

  hihat: () => {
    if (!audioCtx) return;
    if (isGlobalMuted()) return;
    const n = audioCtx.sampleRate * 0.05;
    const buf = audioCtx.createBuffer(1, n, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * 0.3;
    const src = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    src.buffer = buf;
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    src.start();
  },

  snare: () => {
    if (!audioCtx) return;
    if (isGlobalMuted()) return;
    // Noise burst
    const n = audioCtx.sampleRate * 0.1;
    const buf = audioCtx.createBuffer(1, n, audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const noiseSrc = audioCtx.createBufferSource();
    const noiseGain = audioCtx.createGain();
    noiseSrc.buffer = buf;
    noiseGain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    noiseSrc.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSrc.start();
    // Tone body
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 200;
    oscGain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  },

  bass: (note = 0) => {
    if (!audioCtx) return;
    if (isGlobalMuted()) return;
    const freq = 55 * Math.pow(2, note / 12);
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  },

  melody: () => {
    if (isGlobalMuted()) return;
    // Happy Birthday in semitones from A4=440
    // "Hap-py Birth-day to you" x2, "Hap-py Birth-day dear [name]", "Hap-py Birth-day to you"
    const hb = [-9,-9,-7,-9,-4,-5, -9,-9,-7,-9,-2,-4, -9,-9,3,0,-4,-5,-7, 1,1,0,-4,-4];
    if (!sound._hbStep) sound._hbStep = 0;
    const note = hb[sound._hbStep % hb.length];
    sound._hbStep++;
    playTone(440 * Math.pow(2, note / 12), 0.28, 'triangle', 0.18);
  },

  pitchTone: (freq) => {
    if (!audioCtx) return;
    if (isGlobalMuted()) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.55);
  },

  celebrate: () => {
    if (isGlobalMuted()) return;
    [0, 4, 7, 12].forEach((note, i) => {
      setTimeout(() => {
        playTone(440 * Math.pow(2, note / 12), 0.3, 'triangle', 0.2);
      }, i * 120);
    });
  },
};
