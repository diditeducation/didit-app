import { getAudioContext } from '../../design-system/audioContext';

function play(type, freq, duration, gain = 0.18, detune = 0) {
  try {
    const ac = getAudioContext();
    const osc = ac.createOscillator();
    const g   = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value    = detune;
    g.gain.setValueAtTime(0, ac.currentTime);
    g.gain.linearRampToValueAtTime(gain, ac.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch (_) { /* fail silently */ }
}

export const sound = {
  step() {
    play('sine', 520, 0.09, 0.14);
    play('sine', 780, 0.06, 0.06);
  },

  bump() {
    play('square', 140, 0.12, 0.10);
  },

  win() {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      setTimeout(() => play('sine', freq, 0.3, 0.16), i * 80);
    });
  },
};
