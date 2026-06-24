import { createContext, useContext } from 'react';

// `onAdvance` (optional) — called when a trial game is completed in demo mode
// to auto-advance the sampler to the next trial game. Null outside demo mode.
export const DemoContext = createContext({ isDemo: false, onAdvance: null });
export const useDemo = () => useContext(DemoContext);
