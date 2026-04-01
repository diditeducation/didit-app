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
    const freq = 110 * Math.pow(2, note / 12);
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

  // Short triangle note for the Mix sequencer (0.45s, no async resume needed —
  // context is already running by the time the sequencer fires)
  melodyNote: (freq) => {
    if (!audioCtx) return;
    if (isGlobalMuted()) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.42);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.45);
  },

  melody: () => {
    if (isGlobalMuted()) return;
    // Twinkle Twinkle Little Star in semitones from A4=440
    // C C G G | A A G(rest) | F F E E | D D C(rest)
    // semitones: C4=-9, D4=-7, E4=-5, F4=-4, G4=-2, A4=0
    const tw = [-9,-9,-2,-2, 0,0,-2,null, -4,-4,-5,-5, -7,-7,-9,null];
    if (!sound._twStep) sound._twStep = 0;
    const note = tw[sound._twStep % tw.length];
    sound._twStep++;
    if (note !== null) playTone(440 * Math.pow(2, note / 12), 0.28, 'triangle', 0.18);
  },

  solfege: (freq) => {
    if (!audioCtx) return;
    if (isGlobalMuted()) return;
    const play = () => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.85);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.9);
    };
    if (audioCtx.state === 'running') {
      play();
    } else {
      audioCtx.resume().then(play);
    }
  },

  piano: () => {
    if (!audioCtx) return;
    if (isGlobalMuted()) return;
    const baseFreq = 261.63;
    [1, 2, 3].forEach((h, i) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = baseFreq * h;
      const vol = [0.28, 0.1, 0.04][i];
      g.gain.setValueAtTime(vol, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.4);
      osc.connect(g); g.connect(masterGain);
      osc.start(); osc.stop(audioCtx.currentTime + 1.5);
    });
  },

  guitar: () => {
    if (!audioCtx) return;
    if (isGlobalMuted()) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.value = 196;
    filter.type = 'bandpass';
    filter.frequency.value = 600;
    filter.Q.value = 1.5;
    gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.9);
    osc.connect(filter); filter.connect(gain); gain.connect(masterGain);
    osc.start(); osc.stop(audioCtx.currentTime + 1.0);
  },

  trumpet: () => {
    if (!audioCtx) return;
    if (isGlobalMuted()) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = 466;
    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.55);
    osc.connect(gain); gain.connect(masterGain);
    osc.start(); osc.stop(audioCtx.currentTime + 0.6);
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

  bubbles: () => {
    if (!audioCtx) return;
    if (isGlobalMuted()) return;
    // Quick sequence of short sine pops — watery bubble cluster
    [0, 0.06, 0.13].forEach((delay, i) => {
      const freq = 900 - i * 120;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, audioCtx.currentTime + delay + 0.08);
      gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + 0.1);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(audioCtx.currentTime + delay);
      osc.stop(audioCtx.currentTime + delay + 0.12);
    });
  },

  cowbell: () => {
    if (!audioCtx) return;
    if (isGlobalMuted()) return;
    // Two detuned square waves → metallic cowbell character
    [[562, 0.22], [845, 0.14]].forEach(([freq, vol]) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();
      osc.type = 'square';
      osc.frequency.value = freq;
      filter.type = 'bandpass';
      filter.frequency.value = 700;
      filter.Q.value = 0.8;
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    });
  },

  boing: () => {
    if (!audioCtx) return;
    if (isGlobalMuted()) return;
    // Sine wave that bends sharply down — classic cartoon boing
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  },

  chime: () => {
    if (!audioCtx) return;
    if (isGlobalMuted()) return;
    // Bell-like tone: sine fundamental + partials, long decay
    [[1046.50, 0.28, 0.75], [1318.51, 0.12, 0.50], [1567.98, 0.07, 0.35]].forEach(([freq, vol, dur]) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      osc.stop(audioCtx.currentTime + dur + 0.05);
    });
  },

  celebrate: () => {
    if (isGlobalMuted()) return;
    [0, 4, 7, 12].forEach((note, i) => {
      setTimeout(() => {
        playTone(440 * Math.pow(2, note / 12), 0.3, 'triangle', 0.2);
      }, i * 120);
    });
  },

  levelComplete: () => {
    if (!audioCtx) return;
    if (isGlobalMuted()) return;
    const play = () => {
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const t = audioCtx.currentTime + i * 0.1;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.45);
      });
    };
    if (audioCtx.state === 'running') {
      play();
    } else {
      audioCtx.resume().then(play);
    }
  },
};
