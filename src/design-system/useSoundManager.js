import { useState, useEffect } from 'react';
import { setMasterMuted } from './audioContext';

const STORAGE_KEY = 'didit:muted';

function readPersistedMuted() {
  if (typeof localStorage === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function persist(val) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, val ? '1' : '0');
  } catch { /* noop */ }
}

let globalMuted = readPersistedMuted();
// Keep the shared AudioContext in sync at module-load time so any game
// that boots while muted starts out silent.
setMasterMuted(globalMuted);

const listeners = new Set();

export const setGlobalMuted = (val) => {
  const next = !!val;
  if (globalMuted === next) return;
  globalMuted = next;
  persist(next);
  // Master gate at the WebAudio layer — silences every game's audio
  // module by suspending the shared context. This is what makes the
  // "muted UI = no sound from any game" guarantee hold even for audio
  // files that don't read isGlobalMuted before each play.
  setMasterMuted(next);
  listeners.forEach((fn) => fn(next));
};

export const isGlobalMuted = () => globalMuted;

export const useSoundManager = () => {
  const [muted, setMuted] = useState(globalMuted);

  useEffect(() => {
    const handler = (val) => setMuted(val);
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  return {
    muted,
    toggleMute: () => setGlobalMuted(!globalMuted),
  };
};
