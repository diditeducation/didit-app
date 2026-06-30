import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { colors, fonts, radii } from '../design-system/tokens';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';
import DiditLogo from '../components/DiditLogo';
import Price from '../components/Price';
import { STRIPE_ENABLED, FOUNDING_PASS, PRICE_NOTE, PRICE_CTA } from '../config';
import { startCheckout } from '../stripe';
import FoundingClaim from '../components/FoundingClaim';
import { trackCheckoutView, trackCheckoutStart } from '../analytics';
import { GAMES } from '../data/games';

// Embedded one-page checkout (branded). The card fields below are a visual
// placeholder for the real Stripe Payment Element, which mounts here in
// Phase 3 once the Stripe account + keys exist. Until then, the dev build
// can simulate a successful payment to exercise the gating loop.
export default function Checkout() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const from = params.get('from');
  const via = params.get('via') || 'direct';
  const { devEnabled, setDevMember } = useSubscription();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const cancelRef = useRef(null);
  const timerRef = useRef(null);

  // Funnel: checkout page viewed. `via` records the flow that brought the user
  // here and is persisted so it survives the Stripe redirect and tags the
  // eventual purchase_success.
  useEffect(() => { trackCheckoutView(via); }, [via]);

  // Clean up any in-flight checkout listener / timeout on unmount.
  useEffect(() => () => { cancelRef.current?.(); clearTimeout(timerRef.current); }, []);

  const fromGame = from ? GAMES.find((g) => g.id === from) : null;
  // A "real" signed-in user (not the anonymous/undetermined states) skips the
  // account step and goes straight to payment.
  const signedIn = !!user && !user.isAnonymous;

  const activate = () => {
    if (busy) return;
    if (!consent) { setNotice('Please tick the box to agree and continue.'); return; }
    // Real Stripe (firestore-stripe-payments extension) once a price is configured.
    if (STRIPE_ENABLED) {
      if (!signedIn) {
        setNotice('Please sign in above first, then continue to secure checkout.');
        return;
      }
      setNotice('');
      setBusy(true);
      trackCheckoutStart(via);
      cancelRef.current = startCheckout(user.uid, {
        onError: (err) => {
          clearTimeout(timerRef.current);
          setBusy(false);
          setNotice(err?.message || 'Could not start checkout. Please try again.');
        },
      });
      // Safety net if the extension never answers (e.g. not installed yet).
      timerRef.current = setTimeout(() => {
        cancelRef.current?.();
        setBusy(false);
        setNotice('Checkout is taking longer than expected. Please try again.');
      }, 15000);
      return;
    }
    // Fallbacks until Stripe is switched on: dev simulate, else "coming soon".
    if (devEnabled) {
      trackCheckoutStart(via);
      setDevMember(true);
      navigate('/hub');
    } else {
      setNotice('Secure checkout is connecting — payments go live shortly.');
    }
  };

  const perks = [
    ['Everything in our library', 'All our games — finance, coding, music, science & more'],
    ['Pay once', 'One payment, no subscription, nothing to cancel'],
    ['A growing library', 'We may add new games over time'],
    ['Made for co-play', 'Designed for you and your child together'],
    ['Zero ads, ever', 'A calm, safe, distraction-free space'],
  ];

  const fieldStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '14px 14px',
    fontFamily: fonts.display,
    fontSize: '0.95rem',
    color: colors.text,
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.sm,
    outline: 'none',
  };

  const paymentBlock = (
    <>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: colors.text, marginBottom: 6 }}>Card details</label>
      <div style={{ border: `1px solid ${colors.border}`, borderRadius: radii.sm, overflow: 'hidden' }}>
        <input className="co-field" disabled placeholder="1234 1234 1234 1234" style={{ ...fieldStyle, border: 'none', borderRadius: 0, borderBottom: `1px solid ${colors.border}` }} />
        <div style={{ display: 'flex' }}>
          <input className="co-field" disabled placeholder="MM / YY" style={{ ...fieldStyle, border: 'none', borderRadius: 0, borderRight: `1px solid ${colors.border}` }} />
          <input className="co-field" disabled placeholder="CVC" style={{ ...fieldStyle, border: 'none', borderRadius: 0 }} />
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginTop: 18, cursor: 'pointer', fontSize: '0.76rem', color: colors.text, lineHeight: 1.5 }}>
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
        onClick={activate}
        disabled={busy || !consent}
        style={{
          width: '100%',
          marginTop: 14,
          padding: '16px 0',
          fontFamily: fonts.display,
          fontWeight: 900,
          fontSize: '1.02rem',
          color: '#1A1A1A',
          background: colors.lime,
          border: 'none',
          borderRadius: radii.pill,
          cursor: busy ? 'wait' : (!consent ? 'not-allowed' : 'pointer'),
          opacity: busy || !consent ? 0.55 : 1,
          transition: 'opacity .15s ease',
        }}
      >
        {busy ? 'Redirecting to secure checkout…' : <>{PRICE_CTA} · <Price /></>}
      </button>

      {notice && (
        <p style={{ margin: '12px 0 0', fontSize: '0.82rem', fontWeight: 700, color: colors.blueberryDark, textAlign: 'center' }}>
          {notice}
        </p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, color: colors.muted }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>Secured by Stripe · One-time payment</span>
      </div>

      {devEnabled && (
        <button
          onClick={() => { setDevMember(true); navigate('/hub'); }}
          style={{ width: '100%', marginTop: 14, padding: '10px', background: colors.grassMid, color: '#fff', border: 'none', borderRadius: radii.sm, fontFamily: fonts.display, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer' }}
        >
          DEV: Simulate successful payment →
        </button>
      )}
    </>
  );

  const Check = () => (
    <span
      style={{
        flexShrink: 0,
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: colors.grassMid,
        color: '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 1,
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    </span>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.bg,
        fontFamily: fonts.display,
        padding: 20,
        boxSizing: 'border-box',
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        .co-card{display:grid;grid-template-columns:1.05fr 1fr;width:100%;max-width:940px;background:${colors.surface};border:1px solid ${colors.border};border-radius:${radii.lg};overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,0.08)}
        .co-left{background:#FAF6DC;padding:36px 34px}
        .co-right{padding:36px 34px}
        .co-field:focus{border-color:${colors.blueberryDark}}
        @media(max-width:760px){.co-card{grid-template-columns:1fr;max-width:460px}.co-left{padding:28px 24px}.co-right{padding:28px 24px}}
      `}</style>

      <div className="co-card">
        {/* Left — value / what you get */}
        <div className="co-left">
          <div
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: 22 }}
            onClick={() => navigate('/')}
          >
            <DiditLogo height={28} hideBeta />
          </div>

          <h1 style={{ fontSize: '1.7rem', fontWeight: 900, color: colors.text, margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.12 }}>
            Widen your child&apos;s world
          </h1>
          <p style={{ fontSize: '0.92rem', fontWeight: 600, color: colors.muted, lineHeight: 1.45, margin: '0 0 16px' }}>
            Ages 2&ndash;5 is when their brain develops fastest. Watch them explore real-world concepts through play.
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
            <Price style={{ fontSize: '2.2rem', fontWeight: 900, color: colors.blueberryDark, letterSpacing: '-0.02em' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: colors.muted }}>one-time</span>
          </div>
          <p style={{ fontSize: '0.8rem', fontWeight: 800, color: colors.blueberryDark, margin: '0 0 4px' }}>{PRICE_NOTE}</p>
          {fromGame && (
            <p style={{ fontSize: '0.85rem', color: colors.muted, margin: '0 0 20px' }}>
              Pick up right where you left off with <strong style={{ color: colors.text }}>{fromGame.title}</strong>.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: fromGame ? 4 : 22 }}>
            {perks.map(([title, sub]) => (
              <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Check />
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: colors.text, lineHeight: 1.25 }}>{title}</div>
                  <div style={{ fontSize: '0.82rem', color: colors.muted, fontWeight: 600 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — payment form (adapts to auth state) */}
        <div className="co-right">
          {user === undefined ? (
            <div style={{ minHeight: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.muted, fontWeight: 700 }}>
              Loading…
            </div>
          ) : FOUNDING_PASS ? (
            <FoundingClaim via={via} />
          ) : signedIn ? (
            <>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: colors.text, margin: '0 0 16px', letterSpacing: '-0.01em' }}>
                Add your payment
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: radii.sm, marginBottom: 18 }}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" style={{ width: 34, height: 34, borderRadius: '50%' }} />
                ) : (
                  <span style={{ width: 34, height: 34, borderRadius: '50%', background: colors.blueberryDark, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.95rem' }}>
                    {(user.email || user.displayName || '?').trim()[0]?.toUpperCase()}
                  </span>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: colors.muted }}>Signed in as</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email || user.displayName}</div>
                </div>
                <span onClick={() => signOut(auth)} style={{ fontSize: '0.78rem', fontWeight: 800, color: colors.blueberryDark, cursor: 'pointer', flexShrink: 0 }}>Not you?</span>
              </div>

              {paymentBlock}
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: colors.text, margin: '0 0 18px', letterSpacing: '-0.01em' }}>
                Unlock full game access
              </h2>

              <button
                onClick={activate}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '13px 0',
                  fontFamily: fonts.display,
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: colors.text,
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radii.sm,
                  cursor: 'pointer',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 16.3 4.5 9.7 8.8 6.3 14.7z" /><path fill="#4CAF50" d="M24 43.5c5.4 0 10.3-2 14-5.3l-6.5-5.5c-2 1.5-4.6 2.3-7.5 2.3-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.1 16.2 43.5 24 43.5z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.5 5.5c-.5.4 7-5.1 7-15.1 0-1.2-.1-2.3-.4-3.5z" /></svg>
                Continue with Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
                <div style={{ flex: 1, height: 1, background: colors.border }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: colors.muted }}>or pay with card</span>
                <div style={{ flex: 1, height: 1, background: colors.border }} />
              </div>

              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: colors.text, marginBottom: 6 }}>Email</label>
              <input
                className="co-field"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                style={{ ...fieldStyle, marginBottom: 14 }}
              />

              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: colors.text, marginBottom: 6 }}>Create a password</label>
              <input
                className="co-field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                style={{ ...fieldStyle, marginBottom: 14 }}
              />

              {paymentBlock}

              <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.8rem', color: colors.muted }}>
                Already a member?{' '}
                <span onClick={() => navigate('/signin')} style={{ color: colors.blueberryDark, fontWeight: 800, cursor: 'pointer' }}>Sign in</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
