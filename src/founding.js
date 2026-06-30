import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Founding-pass model (pre-Stripe). Instead of taking a card, every signed-in
 * user is issued a unique promo code worth the $29 pass for free. They "apply"
 * it to complete the (real-looking) checkout. The code is unique per account so
 * a shared code can't leak; it's not a security boundary (this is a soft beta
 * gate), just a way to control access + seed a founding cohort with zero infra.
 */

/**
 * Deterministic, stable per-user code (DIDIT-XXXXXX) derived from the uid — same
 * code every time/device, unique per account, no storage needed to generate.
 */
export function foundingCode(uid) {
  let h = 0;
  for (let i = 0; i < uid.length; i++) h = (Math.imul(h, 31) + uid.charCodeAt(i)) >>> 0;
  return 'DIDIT-' + h.toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
}

/**
 * Grant the founding pass: write the flag to the user's own profile doc
 * (users/{uid} — rules allow a signed-in user to write their own). The
 * SubscriptionContext listens to this doc → isMember flips true. Returns the
 * code that was recorded.
 */
export async function claimFoundingPass(uid) {
  const code = foundingCode(uid);
  await setDoc(
    doc(db, 'users', uid),
    { founding: true, foundingCode: code, foundingClaimedAt: serverTimestamp() },
    { merge: true },
  );
  return code;
}
