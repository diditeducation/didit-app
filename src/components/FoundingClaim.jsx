import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { colors, fonts, radii } from '../design-system/tokens';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { foundingCode, claimFoundingPass } from '../founding';
import { trackCheckoutStart } from '../analytics';
import Price from './Price';

/**
 * Founding-pass checkout panel (pre-Stripe). Looks like a real checkout, but
 * instead of a card it issues the signed-in user a unique promo code (popup)
 * which they "apply" to unlock the $29 library for free. Rendered by Checkout
 * when FOUNDING_PASS is on. Reachable from every conversion node (hub + landing)
 * since they all route to /checkout.
 */
export default function FoundingClaim({ via = 'direct' }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMember } = useSubscription();
  const signedIn = !!user && !user.isAnonymous;
  const code = signedIn ? foundingCode(user.uid) : '';

  const [promo, setPromo] = useState('');
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [consent, setConsent] = useState(false);

  // Popup is derived (no effect): shown to a signed-in non-member until dismissed.
  const showPopup = signedIn && !isMember && !dismissed;

  // Already a member → nothing to claim, send them in.
  useEffect(() => { if (isMember) navigate('/hub', { replace: true }); }, [isMember, navigate]);

  const apply = useCallback(async (value) => {
    if (busy) return;
    if (!consent) { setNotice('Please tick the box to agree and continue.'); setDismissed(true); return; }
    if ((value || '').trim().toUpperCase() !== code) {
      setNotice("That code doesn't look right — use the founding code we gave you.");
      return;
    }
    setBusy(true);
    setNotice('');
    try {
      trackCheckoutStart(via);
      await claimFoundingPass(user.uid);
      navigate('/hub', { replace: true }); // isMember will already be flipping true
    } catch {
      setBusy(false);
      setNotice('Could not unlock — please try again.');
    }
  }, [busy, consent, code, via, user, navigate]);

  const copyCode = () => {
    setPromo(code);
    setDismissed(true);
    try { navigator.clipboard?.writeText(code); } catch { /* ignore */ }
  };

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (['auth/popup-blocked', 'auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(err.code)) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        setNotice(err.message);
      }
    }
  };

  // ── Not signed in: account is the price of entry ──
  if (!signedIn) {
    return (
      <>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: colors.text, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
          Claim your founding pass
        </h2>
        <p style={{ fontSize: '0.88rem', fontWeight: 600, color: colors.muted, lineHeight: 1.5, margin: '0 0 18px' }}>
          Create your free account and we&apos;ll unlock the full library for you — founding members get in before card payments open.
        </p>
        <button
          onClick={signIn}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '14px 0', fontFamily: fonts.display, fontWeight: 800, fontSize: '0.95rem',
            color: colors.text, background: colors.surface, border: `1px solid ${colors.border}`,
            borderRadius: radii.sm, cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 16.3 4.5 9.7 8.8 6.3 14.7z" /><path fill="#4CAF50" d="M24 43.5c5.4 0 10.3-2 14-5.3l-6.5-5.5c-2 1.5-4.6 2.3-7.5 2.3-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.1 16.2 43.5 24 43.5z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.5 5.5c-.5.4 7-5.1 7-15.1 0-1.2-.1-2.3-.4-3.5z" /></svg>
          Continue with Google
        </button>
        <p style={{ textAlign: 'center', marginTop: 14, fontSize: '0.8rem', color: colors.muted }}>
          Prefer email?{' '}
          <span onClick={() => navigate('/signin')} style={{ color: colors.blueberryDark, fontWeight: 800, cursor: 'pointer' }}>Sign in another way</span>
        </p>
        {notice && <p style={{ marginTop: 12, fontSize: '0.82rem', fontWeight: 700, color: colors.coralDark, textAlign: 'center' }}>{notice}</p>}
      </>
    );
  }

  // ── Signed in: real-looking checkout, promo code instead of a card ──
  return (
    <>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: colors.text, margin: '0 0 16px', letterSpacing: '-0.01em' }}>
        Complete your order
      </h2>

      {/* Order summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 14px', background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: radii.sm, marginBottom: 16 }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: colors.text }}>Founding Membership Pass</span>
        <Price suffix style={{ fontSize: '0.95rem', fontWeight: 800, color: colors.text }} />
      </div>

      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: colors.text, marginBottom: 6 }}>Promo code</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={promo}
          onChange={(e) => { setPromo(e.target.value); if (notice) setNotice(''); }}
          placeholder="Enter your founding code"
          style={{
            flex: 1, boxSizing: 'border-box', padding: '14px 14px', fontFamily: fonts.display,
            fontSize: '0.95rem', letterSpacing: '0.04em', color: colors.text, background: colors.surface,
            border: `1px solid ${colors.border}`, borderRadius: radii.sm, outline: 'none',
          }}
        />
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, margin: '0 0 14px', cursor: 'pointer', fontSize: '0.76rem', color: colors.text, lineHeight: 1.5 }}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => { setConsent(e.target.checked); if (e.target.checked) setNotice(''); }}
          style={{ marginTop: 2, width: 17, height: 17, flexShrink: 0, cursor: 'pointer', accentColor: colors.blueberryDark }}
        />
        <span>
          I'm 18 or older and I agree to the{' '}
          <a href="/terms" style={{ color: colors.blueberryDark, fontWeight: 700 }}>Terms</a>{' '}and{' '}
          <a href="/privacy" style={{ color: colors.blueberryDark, fontWeight: 700 }}>Privacy Policy</a>. Unlock my games now — I understand I can't change my mind once they're unlocked.
        </span>
      </label>

      <button
        onClick={() => apply(promo)}
        disabled={busy || !consent}
        style={{
          width: '100%', padding: '16px 0', fontFamily: fonts.display, fontWeight: 900, fontSize: '1.02rem',
          color: '#1A1A1A', background: colors.lime, border: 'none', borderRadius: radii.pill,
          cursor: busy ? 'wait' : (!consent ? 'not-allowed' : 'pointer'), opacity: busy || !consent ? 0.55 : 1, transition: 'opacity .15s ease',
        }}
      >
        {busy ? 'Unlocking…' : 'Apply & unlock'}
      </button>

      {notice && <p style={{ margin: '12px 0 0', fontSize: '0.82rem', fontWeight: 700, color: colors.coralDark, textAlign: 'center' }}>{notice}</p>}

      {/* Founding-code popup */}
      {showPopup && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setDismissed(true)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: colors.surface, borderRadius: radii.lg, padding: '28px 26px', maxWidth: 360, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: colors.text, margin: '0 0 6px' }}>You&apos;re a founding family</h3>
            <p style={{ fontSize: '0.86rem', fontWeight: 600, color: colors.muted, lineHeight: 1.5, margin: '0 0 16px' }}>
              Here&apos;s your code — worth the full <Price /> pass, on us. Apply it to unlock everything.
            </p>
            <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: '1.3rem', letterSpacing: '0.08em', color: colors.blueberryDark, background: colors.bg, border: `2px dashed ${colors.border}`, borderRadius: radii.sm, padding: '12px 0', marginBottom: 16 }}>
              {code}
            </div>
            <button
              onClick={copyCode}
              style={{ width: '100%', padding: '14px 0', fontFamily: fonts.display, fontWeight: 900, fontSize: '1rem', color: '#1A1A1A', background: colors.lime, border: 'none', borderRadius: radii.pill, cursor: 'pointer' }}
            >
              Copy my code →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
