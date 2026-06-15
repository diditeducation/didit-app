import { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext(null);

// Statuses Stripe considers "paying / entitled".
const ACTIVE_STATUSES = ['active', 'trialing'];

// Dev-only override so we can watch the paid/locked UI work BEFORE Stripe
// is wired up. Toggled by <DevSubscriptionToggle>. Ignored entirely in prod.
const DEV_KEY = 'didit_dev_member';
const devEnabled = import.meta.env.DEV;

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();

  // The real subscription doc from Firestore (written by the Stripe
  // extension's webhook). `undefined` = still loading, `null` = none.
  const [sub, setSub] = useState(undefined);

  // Dev override state (persisted so it survives reloads).
  const [devMember, setDevMemberState] = useState(
    () => devEnabled && localStorage.getItem(DEV_KEY) === '1'
  );
  const setDevMember = (on) => {
    if (!devEnabled) return;
    if (on) localStorage.setItem(DEV_KEY, '1');
    else localStorage.removeItem(DEV_KEY);
    setDevMemberState(!!on);
  };

  // Subscribe to the user's Stripe subscription docs in Firestore.
  // Collection: customers/{uid}/subscriptions (firestore-stripe-payments schema).
  // Until the extension is installed this collection is simply empty → not a member.
  useEffect(() => {
    if (user === undefined) return;          // auth still resolving
    // Clear subscription immediately on logout (external-state sync).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!user) { setSub(null); return; }     // logged out

    const ref = collection(db, 'customers', user.uid, 'subscriptions');
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const active = snap.docs
          .map((d) => d.data())
          .find((s) => ACTIVE_STATUSES.includes(s.status));
        setSub(active || null);
      },
      () => setSub(null) // collection missing / rules deny → treat as none
    );
    return unsub;
  }, [user]);

  const realMember = !!sub;
  const isMember = devMember || realMember;
  const loading = user === undefined || sub === undefined;

  const value = {
    isMember,
    loading,
    status: devMember ? 'dev' : (sub?.status ?? 'none'),
    // current_period_end is a unix seconds value on the Stripe doc.
    currentPeriodEnd: sub?.current_period_end
      ? new Date(sub.current_period_end * 1000)
      : null,
    // dev helpers (no-ops in prod)
    devMember,
    setDevMember,
    devEnabled,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
