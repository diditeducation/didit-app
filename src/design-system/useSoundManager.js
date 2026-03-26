import { useState, useEffect } from 'react';

let globalMuted = false;
const listeners = new Set();

export const setGlobalMuted = (val) => {
  globalMuted = val;
  listeners.forEach((fn) => fn(val));
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
