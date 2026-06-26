import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { canPlay } from '../data/trialGames';
import { PAYWALL_ENFORCED } from '../config';

/**
 * Route guard for game routes: auth gate (like ProtectedRoute) PLUS the
 * subscription paywall when PAYWALL_ENFORCED is on.
 *
 * - Not signed in → /signin.
 * - Signed in but the game is locked for them (non-member + non-trial game) →
 *   /checkout?from=<gameId>. Trial games and members pass through.
 * - When PAYWALL_ENFORCED is off, behaves exactly like ProtectedRoute.
 *
 * The gameId is derived from the URL (/games/<id>[/play]) so this works for
 * every game route without each one passing its id.
 */
export default function GameRoute({ children }) {
  const { user } = useAuth();
  const { isMember, loading } = useSubscription();
  const { pathname } = useLocation();

  if (user === undefined) return null;               // auth still resolving
  if (user === null) return <Navigate to="/signin" replace />;

  if (PAYWALL_ENFORCED) {
    const gameId = pathname.match(/^\/games\/([^/]+)/)?.[1];
    if (gameId) {
      if (loading) return null;                       // wait for sub state
      if (!canPlay(gameId, isMember)) {
        return <Navigate to={`/checkout?from=${gameId}`} replace />;
      }
    }
  }

  return children;
}
