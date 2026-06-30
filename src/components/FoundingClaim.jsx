import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signInWithRedirect, sendSignInLinkToEmail, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { colors, fonts, radii } from '../design-system/tokens';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { foundingCode, claimFoundingPass } from '../founding';
import { trackCheckoutStart, trackSignInMethod, trackMagicLinkSent } from '../analytics';
import Price from './Price';

/**
 * Founding-pass checkout panel (pre-Stripe). A believable two-step paid
 * checkout: Step 1 creates the account (Google or email), Step 2 is a
 * real-looking payment screen (disabled card fields + terms + promo + Pay).
 *
 * The "founding pass is free" twist is HIDDEN until the payment flow: clicking
 * Pay intercepts and reveals the user's unique promo code (worth the full pass,
 * free). Until then the page reads like a normal $29 checkout.
 *
 * No real card data is ever collected — the card inputs are disabled placeholders.
 */
const actionCodeSettings = (email) => ({
  url: `${window.location.origin}/auth/callback?email=${encodeURIComponent(email)}`,
  handleCodeInApp: true,
});

function Stepper({ step }) {
  const Dot = ({ n, label }) => {
    const done = step > n;
    const on = step >= n;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: fonts.display, fontWeight: 900, fontSize: '0.74rem',
          background: on ? colors.blueberryDark : colors.border,
          color: on ? '#fff' : colors.muted,
        }}>{done ? '✓' : n}</span>
        <span style={{ fontFamily: fonts.display, fontSize: '0.8rem', fontWeight: 800, color: on ? colors.text : colors.muted }}>{label}</span>
      </div>
    );
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <Dot n={1} label="Account" />
      <div style={{ flex: 1, height: 2, borderRadius: 2, background: step > 1 ? colors.blueberryDark : colors.border }} />
      <Dot n={2} label="Payment" />
    </div>
  );
}

export default function FoundingClaim({ via = 'direct' }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMember } = useSubscription();
  const signedIn = !!user && !user.isAnonymous;
  const code = signedIn ? foundingCode(user.uid) : '';

  const [promo, setPromo] = useState('');
  const [consent, setConsent] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  // Signed-out email magic-link.
  const [email, setEmail] = useState('');
  const [emailBusy, setEmailBusy] = useState(false);

  // Already a member → nothing to claim, send them in.
  useEffect(() => { if (isMember) navigate('/hub', { replace: true }); }, [isMember, navigate]);

  const apply = useCallback(async (value) => {
    if (busy) return;
    if ((value || '').trim().toUpperCase() !== code) {
      setNotice("That code doesn't look right — tap “Copy & apply”.");
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
  }, [busy, code, via, user, navigate]);

  // The "Pay" action. Instead of charging a card: if the code is already in the
  // box, apply it; otherwise reveal it (the popup is the payment-flow twist).
  const onPay = () => {
    if (busy) return;
    if (!consent) { setNotice('Please tick the box to agree and continue.'); return; }
    setNotice('');
    if (promo.trim().toUpperCase() === code) { apply(code); return; }
    setShowPopup(true);
  };

  const copyAndApply = () => {
    setPromo(code);
    setShowPopup(false);
    try { navigator.clipboard?.writeText(code); } catch { /* ignore */ }
    apply(code);
  };

  const signInGoogle = async () => {
    trackSignInMethod('google');
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

  const sendEmailLink = async (e) => {
    e.preventDefault();
    if (!email || emailBusy) return;
    setEmailBusy(true);
    setNotice('');
    trackSignInMethod('email');
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings(email));
      trackMagicLinkSent();
      localStorage.setItem('didit_email', email);
      navigate('/check-email');
    } catch (err) {
      setEmailBusy(false);
      setNotice(err.message);
    }
  };

  const fieldStyle = {
    width: '100%', boxSizing: 'border-box', padding: '14px 14px', fontFamily: fonts.display,
    fontSize: '0.95rem', color: colors.text, background: colors.surface,
    border: `1px solid ${colors.border}`, borderRadius: radii.sm, outline: 'none',
  };

  // ── Step 1 — Account (Google or email). No free/founding/coupon hints. ──
  if (!signedIn) {
    return (
      <>
        <Stepper step={1} />
        <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: colors.text, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
          Create your account
        </h2>
        <p style={{ fontSize: '0.88rem', fontWeight: 600, color: colors.muted, lineHeight: 1.5, margin: '0 0 18px' }}>
          Step 1 of 2 — create your account to continue to payment.
        </p>

        <button
          onClick={signInGoogle}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
          <div style={{ flex: 1, height: 1, background: colors.border }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: colors.muted }}>or use email</span>
          <div style={{ flex: 1, height: 1, background: colors.border }} />
        </div>

        <form onSubmit={sendEmailLink}>
          <input
            className="co-field"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
            style={{ ...fieldStyle, marginBottom: 12 }}
          />
          <button
            type="submit"
            disabled={emailBusy}
            style={{
              width: '100%', padding: '13px 0', fontFamily: fonts.display, fontWeight: 800, fontSize: '0.92rem',
              color: colors.text, background: colors.surface, border: `1px solid ${colors.border}`,
              borderRadius: radii.sm, cursor: emailBusy ? 'wait' : 'pointer', opacity: emailBusy ? 0.7 : 1,
            }}
          >
            {emailBusy ? 'Sending…' : 'Email me a sign-in link'}
          </button>
        </form>
        <p style={{ fontSize: '0.74rem', color: colors.muted, textAlign: 'center', margin: '10px 0 0', lineHeight: 1.4 }}>
          We&apos;ll email you a secure link — no password needed.
        </p>

        {notice && <p style={{ marginTop: 12, fontSize: '0.82rem', fontWeight: 700, color: colors.coralDark, textAlign: 'center' }}>{notice}</p>}
      </>
    );
  }

  // ── Step 2 — Payment (real-looking; the free twist is revealed on Pay) ──
  return (
    <>
      <Stepper step={2} />
      <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: colors.text, margin: '0 0 14px', letterSpacing: '-0.01em' }}>
        Payment
      </h2>

      {/* Signed-in chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: radii.sm, marginBottom: 14 }}>
        {user.photoURL
          ? <img src={user.photoURL} alt="" style={{ width: 30, height: 30, borderRadius: '50%' }} />
          : <span style={{ width: 30, height: 30, borderRadius: '50%', background: colors.blueberryDark, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem' }}>{(user.email || user.displayName || '?').trim()[0]?.toUpperCase()}</span>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: colors.muted }}>Signed in as</div>
          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email || user.displayName}</div>
        </div>
        <span onClick={() => signOut(auth)} style={{ fontSize: '0.76rem', fontWeight: 800, color: colors.blueberryDark, cursor: 'pointer', flexShrink: 0 }}>Not you?</span>
      </div>

      {/* Order summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 14px', background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: radii.sm, marginBottom: 16 }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: colors.text }}>Founding Membership Pass</span>
        <Price suffix style={{ fontSize: '0.95rem', fontWeight: 800, color: colors.text }} />
      </div>

      {/* Card details — disabled placeholders (no real card data is collected) */}
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: colors.text, marginBottom: 6 }}>Card details</label>
      <div style={{ border: `1px solid ${colors.border}`, borderRadius: radii.sm, overflow: 'hidden', marginBottom: 14 }}>
        <input className="co-field" disabled placeholder="1234 1234 1234 1234" style={{ ...fieldStyle, border: 'none', borderRadius: 0, borderBottom: `1px solid ${colors.border}` }} />
        <div style={{ display: 'flex' }}>
          <input className="co-field" disabled placeholder="MM / YY" style={{ ...fieldStyle, border: 'none', borderRadius: 0, borderRight: `1px solid ${colors.border}` }} />
          <input className="co-field" disabled placeholder="CVC" style={{ ...fieldStyle, border: 'none', borderRadius: 0 }} />
        </div>
      </div>

      {/* Promo code (neutral — doesn't hint that they get one free) */}
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: colors.text, marginBottom: 6 }}>Promo code</label>
      <input
        value={promo}
        onChange={(e) => { setPromo(e.target.value); if (notice) setNotice(''); }}
        placeholder="Promo code"
        style={{ ...fieldStyle, letterSpacing: '0.04em', marginBottom: 14 }}
      />

      {/* Terms */}
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 16, cursor: 'pointer', fontSize: '0.76rem', color: colors.text, lineHeight: 1.5 }}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => { setConsent(e.target.checked); if (e.target.checked) setNotice(''); }}
          style={{ marginTop: 2, width: 17, height: 17, flexShrink: 0, cursor: 'pointer', accentColor: colors.blueberryDark }}
        />
        <span>
          I&apos;m 18 or older and I agree to the{' '}
          <a href="/terms" style={{ color: colors.blueberryDark, fontWeight: 700 }}>Terms</a>{' '}and{' '}
          <a href="/privacy" style={{ color: colors.blueberryDark, fontWeight: 700 }}>Privacy Policy</a>. Unlock my games now — I understand I can&apos;t change my mind once they&apos;re unlocked.
        </span>
      </label>

      <button
        onClick={onPay}
        disabled={busy || !consent}
        style={{
          width: '100%', padding: '16px 0', fontFamily: fonts.display, fontWeight: 900, fontSize: '1.02rem',
          color: '#1A1A1A', background: colors.lime, border: 'none', borderRadius: radii.pill,
          cursor: busy ? 'wait' : (!consent ? 'not-allowed' : 'pointer'),
          opacity: busy || !consent ? 0.55 : 1, transition: 'opacity .15s ease',
        }}
      >
        {busy ? 'Processing…' : <>Pay · <Price /></>}
      </button>

      {notice && <p style={{ margin: '12px 0 0', fontSize: '0.82rem', fontWeight: 700, color: colors.coralDark, textAlign: 'center' }}>{notice}</p>}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, color: colors.muted }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>Secured checkout · One-time</span>
      </div>

      {/* Founding-code popup — the payment-flow twist (revealed on Pay) */}
      {showPopup && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowPopup(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: colors.surface, borderRadius: radii.lg, padding: '28px 26px', maxWidth: 360, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: colors.text, margin: '0 0 6px' }}>Wait — don&apos;t pay!</h3>
            <p style={{ fontSize: '0.86rem', fontWeight: 600, color: colors.muted, lineHeight: 1.5, margin: '0 0 16px' }}>
              You&apos;re a founding family. Here&apos;s your code — worth the full <Price /> pass, on us. Apply it to unlock everything, free.
            </p>
            <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: '1.3rem', letterSpacing: '0.08em', color: colors.blueberryDark, background: colors.bg, border: `2px dashed ${colors.border}`, borderRadius: radii.sm, padding: '12px 0', marginBottom: 16 }}>
              {code}
            </div>
            <button
              onClick={copyAndApply}
              style={{ width: '100%', padding: '14px 0', fontFamily: fonts.display, fontWeight: 900, fontSize: '1rem', color: '#1A1A1A', background: colors.lime, border: 'none', borderRadius: radii.pill, cursor: 'pointer' }}
            >
              Copy &amp; apply →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
