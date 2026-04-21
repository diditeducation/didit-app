import { isGlobalMuted } from '../../design-system/useSoundManager';
import { getAudioContext, ensureAudioRunning, createAnalyserChain, getAnalyserNode, getMasterGain } from '../../design-system/audioContext';

export const initAudio = () => {
  ensureAudioRunning();
  createAnalyserChain();
};

export const analyser = {
  getNode: () => getAnalyserNode(),
};

const playTone = (freq, dur = 0.1, type = 'sine', vol = 0.3) => {
  if (isGlobalMuted()) return;
  const ac = getAudioContext();
  const mg = getMasterGain();
  if (!mg) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
  osc.connect(gain);
  gain.connect(mg);
  osc.start();
  osc.stop(ac.currentTime + dur + 0.01);
};

export const sound = {
  heartbeat: () => {
    if (isGlobalMuted()) return;
    const ac = getAudioContext();
    const mg = getMasterGain();
    if (!mg) return;
    const o1 = ac.createOscillator();
    const g1 = ac.createGain();
    o1.frequency.setValueAtTime(80, ac.currentTime);
    o1.frequency.exponentialRampToValueAtTime(30, ac.currentTime + 0.12);
    g1.gain.setValueAtTime(1.0, ac.currentTime);
    g1.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);
    o1.connect(g1);
    g1.connect(mg);
    o1.start();
    o1.stop(ac.currentTime + 0.2);
    const o2 = ac.createOscillator();
    const g2 = ac.createGain();
    o2.frequency.setValueAtTime(60, ac.currentTime + 0.15);
    o2.frequency.exponentialRampToValueAtTime(25, ac.currentTime + 0.27);
    g2.gain.setValueAtTime(0.0001, ac.currentTime);
    g2.gain.setValueAtTime(0.8, ac.currentTime + 0.15);
    g2.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.35);
    o2.connect(g2);
    g2.connect(mg);
    o2.start();
    o2.stop(ac.currentTime + 0.35);
  },

  kick: () => {
    if (isGlobalMuted()) return;
    const ac = getAudioContext();
    const mg = getMasterGain();
    if (!mg) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.frequency.setValueAtTime(150, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ac.currentTime + 0.15);
    gain.gain.setValueAtTime(0.8, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(mg);
    osc.start();
    osc.stop(ac.currentTime + 0.2);
  },

  hihat: () => {
    if (isGlobalMuted()) return;
    const ac = getAudioContext();
    const mg = getMasterGain();
    if (!mg) return;
    const n = ac.sampleRate * 0.05;
    const buf = ac.createBuffer(1, n, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * 0.3;
    const src = ac.createBufferSource();
    const gain = ac.createGain();
    const filter = ac.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    src.buffer = buf;
    gain.gain.setValueAtTime(0.3, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.05);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(mg);
    src.start();
  },

  snare: () => {
    if (isGlobalMuted()) return;
    const ac = getAudioContext();
    const mg = getMasterGain();
    if (!mg) return;
    const n = ac.sampleRate * 0.1;
    const buf = ac.createBuffer(1, n, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const noiseSrc = ac.createBufferSource();
    const noiseGain = ac.createGain();
    noiseSrc.buffer = buf;
    noiseGain.gain.setValueAtTime(0.4, ac.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.1);
    noiseSrc.connect(noiseGain);
    noiseGain.connect(mg);
    noiseSrc.start();
    const osc = ac.createOscillator();
    const oscGain = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 200;
    oscGain.gain.setValueAtTime(0.4, ac.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);
    osc.connect(oscGain);
    oscGain.connect(mg);
    osc.start();
    osc.stop(ac.currentTime + 0.1);
  },

  bass: (note = 0) => {
    if (isGlobalMuted()) return;
    const ac = getAudioContext();
    const mg = getMasterGain();
    if (!mg) return;
    const freq = 110 * Math.pow(2, note / 12);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const filter = ac.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    gain.gain.setValueAtTime(0.3, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(mg);
    osc.start();
    osc.stop(ac.currentTime + 0.35);
  },

  melodyNote: (freq) => {
    if (isGlobalMuted()) return;
    const ac = getAudioContext();
    const mg = getMasterGain();
    if (!mg) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.25, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.42);
    osc.connect(gain);
    gain.connect(mg);
    osc.start();
    osc.stop(ac.currentTime + 0.45);
  },

  melody: () => {
    if (isGlobalMuted()) return;
    const tw = [-9,-9,-2,-2, 0,0,-2,null, -4,-4,-5,-5, -7,-7,-9,null];
    if (!sound._twStep) sound._twStep = 0;
    const note = tw[sound._twStep % tw.length];
    sound._twStep++;
    if (note !== null) playTone(440 * Math.pow(2, note / 12), 0.28, 'triangle', 0.18);
  },

  solfege: (freq) => {
    if (isGlobalMuted()) return;
    const ac = getAudioContext();
    const mg = getMasterGain();
    if (!mg) return;
    const play = () => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.35, ac.currentTime);
      gain.gain.setValueAtTime(0.3, ac.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.85);
      osc.connect(gain);
      gain.connect(mg);
      osc.start();
      osc.stop(ac.currentTime + 0.9);
    };
    if (ac.state === 'running') {
      play();
    } else {
      ac.resume().then(play);
    }
  },

  piano: () => {
    if (isGlobalMuted()) return;
    const ac = getAudioContext();
    const mg = getMasterGain();
    if (!mg) return;
    const baseFreq = 261.63;
    [1, 2, 3].forEach((h, i) => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = baseFreq * h;
      const vol = [0.28, 0.1, 0.04][i];
      g.gain.setValueAtTime(vol, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 1.4);
      osc.connect(g); g.connect(mg);
      osc.start(); osc.stop(ac.currentTime + 1.5);
    });
  },

  guitar: () => {
    if (isGlobalMuted()) return;
    const ac = getAudioContext();
    const mg = getMasterGain();
    if (!mg) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const filter = ac.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.value = 196;
    filter.type = 'bandpass';
    filter.frequency.value = 600;
    filter.Q.value = 1.5;
    gain.gain.setValueAtTime(0.35, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.9);
    osc.connect(filter); filter.connect(gain); gain.connect(mg);
    osc.start(); osc.stop(ac.currentTime + 1.0);
  },

  trumpet: () => {
    if (isGlobalMuted()) return;
    const ac = getAudioContext();
    const mg = getMasterGain();
    if (!mg) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'square';
    osc.frequency.value = 466;
    gain.gain.setValueAtTime(0.001, ac.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ac.currentTime + 0.05);
    gain.gain.setValueAtTime(0.15, ac.currentTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.55);
    osc.connect(gain); gain.connect(mg);
    osc.start(); osc.stop(ac.currentTime + 0.6);
  },

  pitchTone: (freq) => {
    if (isGlobalMuted()) return;
    const ac = getAudioContext();
    const mg = getMasterGain();
    if (!mg) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    gain.gain.setValueAtTime(0.4, ac.currentTime);
    gain.gain.setValueAtTime(0.4, ac.currentTime + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(mg);
    osc.start();
    osc.stop(ac.currentTime + 0.55);
  },

  bubbles: () => {
    if (isGlobalMuted()) return;
    const ac = getAudioContext();
    const mg = getMasterGain();
    if (!mg) return;
    [0, 0.06, 0.13].forEach((delay, i) => {
      const freq = 900 - i * 120;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ac.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, ac.currentTime + delay + 0.08);
      gain.gain.setValueAtTime(0, ac.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.25, ac.currentTime + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + 0.1);
      osc.connect(gain);
      gain.connect(mg);
      osc.start(ac.currentTime + delay);
      osc.stop(ac.currentTime + delay + 0.12);
    });
  },

  cowbell: () => {
    if (isGlobalMuted()) return;
    const ac = getAudioContext();
    const mg = getMasterGain();
    if (!mg) return;
    [[562, 0.22], [845, 0.14]].forEach(([freq, vol]) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const filter = ac.createBiquadFilter();
      osc.type = 'square';
      osc.frequency.value = freq;
      filter.type = 'bandpass';
      filter.frequency.value = 700;
      filter.Q.value = 0.8;
      gain.gain.setValueAtTime(vol, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(mg);
      osc.start();
      osc.stop(ac.currentTime + 0.35);
    });
  },

  boing: () => {
    if (isGlobalMuted()) return;
    const ac = getAudioContext();
    const mg = getMasterGain();
    if (!mg) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 0.4);
    gain.gain.setValueAtTime(0.5, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(mg);
    osc.start();
    osc.stop(ac.currentTime + 0.5);
  },

  chime: () => {
    if (isGlobalMuted()) return;
    const ac = getAudioContext();
    const mg = getMasterGain();
    if (!mg) return;
    [[1046.50, 0.28, 0.75], [1318.51, 0.12, 0.50], [1567.98, 0.07, 0.35]].forEach(([freq, vol, dur]) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
      osc.connect(gain);
      gain.connect(mg);
      osc.start();
      osc.stop(ac.currentTime + dur + 0.05);
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
    if (isGlobalMuted()) return;
    const ac = getAudioContext();
    const mg = getMasterGain();
    if (!mg) return;
    const play = () => {
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const t = ac.currentTime + i * 0.1;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.connect(gain);
        gain.connect(mg);
        osc.start(t);
        osc.stop(t + 0.45);
      });
    };
    if (ac.state === 'running') {
      play();
    } else {
      ac.resume().then(play);
    }
  },
};
