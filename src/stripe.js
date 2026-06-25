import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { STRIPE_PRICE_ID } from './config';

/**
 * Start a Stripe Checkout session via the firestore-stripe-payments Firebase
 * extension.
 *
 * Flow: write a doc to customers/{uid}/checkout_sessions → the extension picks
 * it up, creates a Stripe Checkout Session, and writes back either `url` (we
 * redirect the browser to it) or `error`. After payment, Stripe's webhook (via
 * the extension) writes customers/{uid}/subscriptions/{id} with status
 * "active", which SubscriptionContext already listens to → isMember flips true.
 *
 * Requires: the extension installed + STRIPE_PRICE_ID (VITE_STRIPE_PRICE_ID) set.
 * `allow_promotion_codes` enables Stripe-native promo codes on the hosted page,
 * so a 100%-off coupon doubles as a paywall bypass with no custom code.
 *
 * Returns an unsubscribe function; calls onError(err) on failure. The caller is
 * responsible for any UI (spinner / timeout).
 */
export function startSubscriptionCheckout(uid, { onError } = {}) {
  let unsub = () => {};
  let cancelled = false;

  addDoc(collection(db, 'customers', uid, 'checkout_sessions'), {
    price: STRIPE_PRICE_ID,
    mode: 'subscription',
    allow_promotion_codes: true,
    success_url: `${window.location.origin}/hub`,
    cancel_url: `${window.location.origin}/checkout`,
  })
    .then((ref) => {
      if (cancelled) return;
      unsub = onSnapshot(ref, (snap) => {
        const data = snap.data();
        if (!data) return;
        if (data.error) {
          unsub();
          onError?.(data.error);
        } else if (data.url) {
          unsub();
          window.location.assign(data.url); // → Stripe Checkout
        }
      });
    })
    .catch((err) => {
      if (!cancelled) onError?.(err);
    });

  return () => {
    cancelled = true;
    unsub();
  };
}
