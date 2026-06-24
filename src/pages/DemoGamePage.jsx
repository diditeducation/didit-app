import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DemoContext } from '../context/DemoContext';
import { TRIAL_GAME_IDS } from '../data/trialGames';

/**
 * Thin wrapper that marks a game as running in demo mode.
 * No auth required — just wraps the game with the DemoContext so
 * SuccessScreen can show the demo flow.
 *
 * `onAdvance` lets a completed trial game auto-jump to another random trial
 * game (a fresh /demo/* route) without the player doing anything.
 */
export default function DemoGamePage({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const currentId = pathname.replace(/^\/demo\//, '');

  const onAdvance = useCallback(() => {
    const others = TRIAL_GAME_IDS.filter((id) => id !== currentId);
    const next = others[Math.floor(Math.random() * others.length)] || currentId;
    navigate(`/demo/${next}`);
  }, [currentId, navigate]);

  return (
    <DemoContext.Provider value={{ isDemo: true, onAdvance }}>
      {children}
    </DemoContext.Provider>
  );
}
