import { DemoContext } from '../context/DemoContext';

/**
 * Thin wrapper that marks a game as running in demo mode.
 * No auth required — just wraps the game with the DemoContext so
 * SuccessScreen can show a "Sign up" CTA instead of the normal buttons.
 */
export default function DemoGamePage({ children }) {
  return (
    <DemoContext.Provider value={{ isDemo: true }}>
      {children}
    </DemoContext.Provider>
  );
}
