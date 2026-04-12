import { isGlobalMuted } from '../../design-system/useSoundManager';

let ctx = null;

export function initAudio() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
}

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export const sound = {
  // Short rising ping for each correct star tap
  tap() {
    if (isGlobalMuted()) return;
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(990, c.currentTime + 0.12);
    gain.gain.setValueAtTime(0.12, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.20);
  },

  // Gentle low tone for wrong tap — 220Hz, 0.3s
  wrong() {
    if (isGlobalMuted()) return;
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, c.currentTime);
    gain.gain.setValueAtTime(0.07, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + 0.32);
  },

  // Ascending cosmic chime — all stars connected
  chime() {
    if (isGlobalMuted()) return;
    const c = getCtx();
    const notes = [392, 523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      const t = c.currentTime + i * 0.08;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.13, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t);
      osc.stop(t + 0.42);
    });
  },
};
