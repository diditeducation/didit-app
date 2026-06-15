import { Navigate, useLocation } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';
import { canPlay } from '../data/trialGames';

// Wraps a game route. Auth is handled OUTSIDE this (by ProtectedRoute);
// this layer only decides whether the signed-in user is allowed to play
// THIS game based on subscription status.
//
// It derives the game id from the URL (/games/<id>/...) so a single
// component can guard every game route without per-game wiring.
export default function GameGate({ children }) {
  const { pathname } = useLocation();
  const { isMember, loading } = useSubscription();

  const match = pathname.match(/\/games\/([^/]+)/);
  const gameId = match ? match[1] : null;

  // Don't flash the game before we know the user's status.
  if (loading) return null;

  if (canPlay(gameId, isMember)) return children;

  // Locked → send to checkout, remembering which game they wanted.
  return <Navigate to={`/checkout?from=${gameId ?? ''}`} replace />;
}
