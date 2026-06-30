import { createContext, useContext, useEffect, useState } from 'react';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { FOUNDING_GRANDFATHER_BEFORE } from '../config';
import { trackPurchase, setAnalyticsTier, markConverted } from '../analytics';

const GRANDFATHER_TS = Date.parse(FOUNDING_GRANDFATHER_BEFORE);

const SubscriptionContext = createContext(null);

// ── Test bypass ──────────────────────────────────────────────────────────
// Accounts treated as members WITHOUT a real Stripe purchase, so you can test
// the paid experience (and flip to the locked state) on the LIVE site, before
// or after the paywall is switched on. Security note: listing an email here
// does NOT grant access to anyone — they'd have to actually sign in to that
// account. To keep emails out of the repo, set VITE_TEST_MEMBER_EMAILS
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

  // Whether the user has a successful one-time purchase (the Membership Pass),
  // written to Firestore by the Stripe extension's webhook.
  // `undefined` = still loading, `false` = none, `true` = paid (lifetime).
  const [hasPaid, setHasPaid] = useState(undefined);

  // Raw override value persisted across reloads ('1' | '0' | null).
  const [overrideRaw, setOverrideRaw] = useState(() => localStorage.getItem(DEV_KEY));

  // Founding-pass flag from the user's own profile doc (users/{uid}.founding),
  // set when they claim their code. Grants access without a real payment.
  const [founding, setFounding] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!user) { setFounding(false); return; }
    const unsub = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => setFounding(snap.data()?.founding === true),
      () => setFounding(false),
    );
    return unsub;
  }, [user]);

  // Grandfather: accounts created before the cutoff keep access without claiming,
  // so turning the paywall on doesn't lock out existing users.
  const grandfathered =
    !!user?.metadata?.creationTime &&
    Date.parse(user.metadata.creationTime) < GRANDFATHER_TS;

  // Subscribe to the user's one-time payment docs in Firestore.
  // Collection: customers/{uid}/payments (firestore-stripe-payments schema).
  // A one-time purchase is permanent — there is no expiry and nothing to cancel.
  // Until the extension is installed this collection is simply empty → not paid.
  useEffect(() => {
    if (user === undefined) return;          // auth still resolving
    // Clear immediately on logout (external-state sync).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!user) { setHasPaid(false); return; } // logged out

    const ref = collection(db, 'customers', user.uid, 'payments');
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const paid = snap.docs
          .map((d) => d.data())
          .some((p) => p.status === 'succeeded');
        setHasPaid(paid);

        // Conversion funnel: log purchase once per account, the first time a
        // succeeded payment is seen.
        if (paid) {
          try {
            const key = `didit:purchased:${user.uid}`;
            if (!localStorage.getItem(key)) { localStorage.setItem(key, '1'); trackPurchase(); markConverted(); }
          } catch { /* storage blocked */ }
        }
      },
      () => setHasPaid(false) // collection missing / rules deny → treat as none
    );
    return unsub;
  }, [user]);

  // Keep analytics' tier tag in sync so every event records whether it was
  // done by an anonymous visitor, a free signed-in user, or a real payer.
  // Uses real payment state (hasPaid), so dev/test overrides don't pollute
  // "paid" play data. 'paid' means a genuine Membership Pass purchase.
  useEffect(() => {
    if (user === undefined) return;            // auth resolving
    if (!user) { setAnalyticsTier('anon'); return; }
    if (hasPaid === undefined) return;         // payments still loading
    setAnalyticsTier(hasPaid ? 'paid' : 'free');
  }, [user, hasPaid]);

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

  const realMember = hasPaid === true;
  const isMember = realMember || devMember || founding || grandfathered;
  const loading = user === undefined || hasPaid === undefined;

  const value = {
    isMember,
    loading,
    status: devMember ? (isTester ? 'test' : 'dev')
      : realMember ? 'paid'
      : (founding || grandfathered) ? 'founding'
      : 'none',
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
