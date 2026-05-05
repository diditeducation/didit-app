// Little Trader — procedural audio.
//
// Every sound ID listed in the game spec is synthesised with the shared
// Did·It AudioContext so we don't ship any binary audio assets.
// Reuses the same node-graph patterns as little-pianist's audio.js.

import { isGlobalMuted } from '../../design-system/useSoundManager';
import {
  getAudioContext,
  ensureAudioRunning,
  createAnalyserChain,
  getMasterGain,
} from '../../design-system/audioContext';

export function initAudio() {
  ensureAudioRunning();
  createAnalyserChain();
}

// ────────────────────────────────────────────────────────────────────
// Tiny helpers
// ────────────────────────────────────────────────────────────────────

function ctx() {
  const ac = getAudioContext();
  const mg = getMasterGain();
  return mg ? { ac, mg } : null;
}

function tone({
  freq = 440,
  type = 'sine',
  vol = 0.25,
  attack = 0.005,
  decay = 0.25,
  start = 0,
  glideTo,
  glideDur,
  filter,
} = {}) {
  if (isGlobalMuted()) return;
  const c = ctx();
  if (!c) return;
  const { ac, mg } = c;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  const t0 = ac.currentTime + start;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + (glideDur ?? decay));
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + attack);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + attack + decay);
  let last = osc;
  if (filter) {
    const f = ac.createBiquadFilter();
    f.type = filter.type || 'lowpass';
    f.frequency.value = filter.freq || 1000;
    if (filter.q != null) f.Q.value = filter.q;
    last.connect(f);
    last = f;
  }
  last.connect(gain);
  gain.connect(mg);
  osc.start(t0);
  osc.stop(t0 + attack + decay + 0.05);
}

function noise({ vol = 0.3, dur = 0.1, hp = null, lp = null, start = 0 } = {}) {
  if (isGlobalMuted()) return;
  const c = ctx();
  if (!c) return;
  const { ac, mg } = c;
  const len = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  let last = src;
  if (hp) {
    const f = ac.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = hp;
    last.connect(f);
    last = f;
  }
  if (lp) {
    const f = ac.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = lp;
    last.connect(f);
    last = f;
  }
  const gain = ac.createGain();
  const t0 = ac.currentTime + start;
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  last.connect(gain);
  gain.connect(mg);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

// ────────────────────────────────────────────────────────────────────
// Game SFX
// ────────────────────────────────────────────────────────────────────

export const sound = {
  // ── Game flow ───────────────────────────────────────────────
  cardFlip: () => {
    tone({ freq: 1400, glideTo: 600, glideDur: 0.12, decay: 0.12, vol: 0.15, type: 'triangle' });
    noise({ vol: 0.08, dur: 0.08, hp: 4000 });
  },
  cardThunk: () => {
    tone({ freq: 110, glideTo: 50, glideDur: 0.18, decay: 0.18, vol: 0.55, type: 'sine' });
    noise({ vol: 0.12, dur: 0.08, lp: 2000 });
  },
  cardWhoosh: () => {
    noise({ vol: 0.22, dur: 0.28, hp: 800, lp: 5000 });
  },
  cardPop: () => {
    tone({ freq: 800, glideTo: 1600, glideDur: 0.05, decay: 0.08, vol: 0.18, type: 'square' });
    noise({ vol: 0.08, dur: 0.05, hp: 3000 });
  },
  progressTick: () => {
    tone({ freq: 1318, decay: 0.18, vol: 0.18, type: 'sine' });
  },

  // ── Card-tap sounds (one per emoji family) ──────────────────
  munch: () => {
    noise({ vol: 0.32, dur: 0.12, hp: 200, lp: 3000 });
    tone({ freq: 220, decay: 0.1, vol: 0.18, type: 'square', start: 0.05 });
  },
  roar: () => {
    tone({ freq: 140, glideTo: 70, glideDur: 0.45, decay: 0.5, vol: 0.5, type: 'sawtooth',
           filter: { type: 'lowpass', freq: 600 } });
    noise({ vol: 0.18, dur: 0.45, lp: 800 });
  },
  trumpet: () => {
    tone({ freq: 233, decay: 0.12, vol: 0.32, type: 'square' });
    tone({ freq: 466, decay: 0.35, vol: 0.22, type: 'square', start: 0.1 });
  },
  monkey: () => {
    [0, 0.06, 0.12, 0.2].forEach((s) => {
      tone({ freq: 700 + Math.random() * 400, decay: 0.06, vol: 0.22, type: 'square', start: s });
    });
  },
  snap: () => {
    noise({ vol: 0.5, dur: 0.05, hp: 2000 });
    tone({ freq: 200, decay: 0.04, vol: 0.3, type: 'square' });
  },
  pop: () => {
    tone({ freq: 600, glideTo: 1400, glideDur: 0.06, decay: 0.1, vol: 0.3, type: 'sine' });
  },
  splash: () => {
    noise({ vol: 0.32, dur: 0.4, hp: 600, lp: 6000 });
  },

  vroom: () => {
    tone({ freq: 90, glideTo: 320, glideDur: 0.5, decay: 0.5, vol: 0.4, type: 'sawtooth',
           filter: { type: 'lowpass', freq: 1500, q: 4 } });
  },
  whoosh: () => {
    noise({ vol: 0.3, dur: 0.6, hp: 400, lp: 4000 });
  },
  horn: () => {
    tone({ freq: 110, decay: 0.6, vol: 0.4, type: 'sawtooth',
           filter: { type: 'lowpass', freq: 600 } });
    tone({ freq: 220, decay: 0.6, vol: 0.2, type: 'sawtooth' });
  },
  zoom: () => {
    tone({ freq: 800, glideTo: 200, glideDur: 0.18, decay: 0.18, vol: 0.28, type: 'sawtooth' });
  },
  choochoo: () => {
    [0, 0.18].forEach(s => {
      noise({ vol: 0.18, dur: 0.14, hp: 1200, lp: 4000, start: s });
      tone({ freq: 700, decay: 0.16, vol: 0.18, type: 'square', start: s });
    });
  },

  drum: () => {
    tone({ freq: 150, glideTo: 40, glideDur: 0.1, decay: 0.15, vol: 0.55, type: 'sine' });
    noise({ vol: 0.18, dur: 0.06, lp: 1000 });
  },
  guitar: () => {
    [196, 247, 294].forEach((f, i) => {
      tone({ freq: f, decay: 0.7, vol: 0.18, type: 'sawtooth',
             filter: { type: 'bandpass', freq: 700, q: 1.4 }, start: i * 0.02 });
    });
  },
  trumpetnote: () => {
    tone({ freq: 466, attack: 0.04, decay: 0.45, vol: 0.22, type: 'square' });
  },

  sparkle: () => {
    if (isGlobalMuted()) return;
    [1318, 1568, 2093, 2637].forEach((f, i) => {
      tone({ freq: f, decay: 0.3, vol: 0.16, type: 'sine', start: i * 0.05 });
    });
  },

  // ── Big finale ──────────────────────────────────────────────
  celebration: () => {
    if (isGlobalMuted()) return;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
    notes.forEach((f, i) => {
      tone({ freq: f, decay: 0.42, vol: 0.32, type: 'triangle', start: i * 0.1 });
    });
  },
};

// Card.sound → audio fn
export function playCardSound(soundId) {
  const fn = sound[soundId];
  if (typeof fn === 'function') fn();
}
