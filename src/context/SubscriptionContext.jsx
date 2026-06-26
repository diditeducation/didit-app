import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { trackPurchase, trackSubscriptionCanceled } from '../analytics';

const SubscriptionContext = createContext(null);

// Statuses Stripe considers "paying / entitled".
const ACTIVE_STATUSES = ['active', 'trialing'];

// ── Test bypass ──────────────────────────────────────────────────────────
// Accounts treated as members WITHOUT a real Stripe subscription, so you can
// test the paid experience (and flip to the locked state) on the LIVE site,
// before or after the paywall is switched on. Security note: listing an email
// here does NOT grant access to anyone — they'd have to actually sign in to
// that account. To keep emails out of the repo, set VITE_TEST_MEMBER_EMAILS
// (comma-separated) in Vercel; it overrides this default list.
const TEST_MEMBER_EMAILS = (import.meta.env.VITE_TEST_MEMBER_EMAILS || 'lee.nigel.t@gmail.com')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// localStorage override written by <DevSubscriptionToggle>: '1' = member, '0' = locked.
const DEV_KEY = 'didit_dev_member';
const devEnabled = import.meta.env.DEV; // localhost always gets the toggle

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();

  // The real subscription doc from Firestore (written by the Stripe
  // extension's webhook). `undefined` = still loading, `null` = none.
  const [sub, setSub] = useState(undefined);

  // Raw override value persisted across reloads ('1' | '0' | null).
  const [overrideRaw, setOverrideRaw] = useState(() => localStorage.getItem(DEV_KEY));

  // Tracks active→none transitions per session so we can log churn once.
  const prevActiveRef = useRef(undefined);

  // Subscribe to the user's Stripe subscription docs in Firestore.
  // Collection: customers/{uid}/subscriptions (firestore-stripe-payments schema).
  // Until the extension is installed this collection is simply empty → not a member.
  useEffect(() => {
    if (user === undefined) return;          // auth still resolving
    // Clear subscription immediately on logout (external-state sync).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!user) { setSub(null); return; }     // logged out

    prevActiveRef.current = undefined;        // reset transition tracking per user
    const ref = collection(db, 'customers', user.uid, 'subscriptions');
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const active = snap.docs
          .map((d) => d.data())
          .find((s) => ACTIVE_STATUSES.includes(s.status));
        setSub(active || null);

        // Conversion funnel: log purchase once per account (first time a real
        // active subscription is seen) and churn on a live active→none flip.
        const isActive = !!active;
        if (isActive) {
          try {
            const key = `didit:purchased:${user.uid}`;
            if (!localStorage.getItem(key)) { localStorage.setItem(key, '1'); trackPurchase(); }
          } catch { /* storage blocked */ }
        }
        if (prevActiveRef.current === true && !isActive) trackSubscriptionCanceled();
        prevActiveRef.current = isActive;
      },
      () => setSub(null) // collection missing / rules deny → treat as none
    );
    return unsub;
  }, [user]);

  // Who is allowed to use the manual override (localhost dev, or an allowlisted
  // test account on any environment).
  const isTester = !!user?.email && TEST_MEMBER_EMAILS.includes(user.email.toLowerCase());
  const canOverride = devEnabled || isTester;

  // Effective override: an explicit toggle wins; otherwise test accounts default
  // to "member" (bypass on) and localhost dev defaults to "locked".
  const overrideMember = overrideRaw === '1' ? true : overrideRaw === '0' ? false : isTester;
  const devMember = canOverride && overrideMember;

  const setDevMember = (on) => {
    if (!canOverride) return;
    localStorage.setItem(DEV_KEY, on ? '1' : '0');
    setOverrideRaw(on ? '1' : '0');
  };

  const realMember = !!sub;
  const isMember = realMember || devMember;
  const loading = user === undefined || sub === undefined;

  const value = {
    isMember,
    loading,
    status: devMember ? (isTester ? 'test' : 'dev') : (sub?.status ?? 'none'),
    // current_period_end is a unix seconds value on the Stripe doc.
    currentPeriodEnd: sub?.current_period_end
      ? new Date(sub.current_period_end * 1000)
      : null,
    // override helpers (no-ops for normal users)
    devMember,
    setDevMember,
    devEnabled,
    canOverride,
    isTester,
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
