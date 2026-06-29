import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, googleProvider } from '../firebase'
import { signInWithPopup, signInWithRedirect, getRedirectResult, sendSignInLinkToEmail, getAdditionalUserInfo } from 'firebase/auth'
import { colors, fonts, radii } from '../design-system/tokens'
import DiditLogo from '../components/DiditLogo'
import { trackSignInView, trackSignInMethod, trackMagicLinkSent, trackSignInSuccess, recordSignIn, setMarketingOptIn } from '../analytics'

const MARKETING_KEY = 'didit_marketing_optin'

// Pool of left-panel quotes — one is picked at random each visit. All are
// about early childhood, play, and learning. `author`/`role` are optional;
// `caption` is the brand fallback line when there's no person to attribute.
const SIGNIN_QUOTES = [
  { text: 'Between ages 2 and 5, play is how the brain learns fastest.' },
  { text: 'Play is the fundamental "work" of childhood.' },
  { text: 'Almost all creativity involves purposeful play.' },
  { text: "We can't teach kids the jobs of year 2045, but we can teach them to stay curious." },
]

const getActionCodeSettings = (email) => ({
  url: `${window.location.origin}/auth/callback?email=${encodeURIComponent(email)}`,
  handleCodeInApp: true,
})

export default function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [marketing, setMarketing] = useState(false)
  // Pick one quote per mount so each visit can show a different one.
  const [quote] = useState(() => SIGNIN_QUOTES[Math.floor(Math.random() * SIGNIN_QUOTES.length)])

  // Funnel: sign-in page viewed.
  useEffect(() => { trackSignInView() }, [])

  /* On mobile, Firebase falls back from popup → redirect.
     Pick up the result when we land back on this page. */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    getRedirectResult(auth)
      .then(result => {
        if (result?.user) {
          trackSignInSuccess('google', getAdditionalUserInfo(result)?.isNewUser)
          recordSignIn('google')
          if (localStorage.getItem(MARKETING_KEY) === '1') setMarketingOptIn(true)
          localStorage.removeItem(MARKETING_KEY)
          navigate('/hub')
        } else setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleGoogle = async () => {
    setLoading(true)
    setError(null)
    trackSignInMethod('google')
    localStorage.setItem(MARKETING_KEY, marketing ? '1' : '0') // survives redirect fallback
    try {
      const result = await signInWithPopup(auth, googleProvider)
      trackSignInSuccess('google', getAdditionalUserInfo(result)?.isNewUser)
      recordSignIn('google')
      if (marketing) setMarketingOptIn(true)
      localStorage.removeItem(MARKETING_KEY)
      navigate('/hub')
    } catch (err) {
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user' ||
          err.code === 'auth/cancelled-popup-request') {
        await signInWithRedirect(auth, googleProvider)
      } else {
        setError(err.message)
        setLoading(false)
      }
    }
  }

  const handleEmailLink = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    trackSignInMethod('email')
    try {
      await sendSignInLinkToEmail(auth, email, getActionCodeSettings(email))
      trackMagicLinkSent()
      localStorage.setItem('didit_email', email)
      localStorage.setItem(MARKETING_KEY, marketing ? '1' : '0') // applied in AuthCallback after sign-in
      navigate('/check-email')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

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
  }

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
        .si-card{display:grid;grid-template-columns:1.05fr 1fr;width:100%;max-width:860px;background:${colors.surface};border:1px solid ${colors.border};border-radius:${radii.lg};overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,0.08)}
        .si-left{background:#FAF6DC;padding:40px 34px}
        .si-right{padding:40px 34px}
        .si-field:focus{border-color:${colors.blueberryDark}}
        @media(max-width:760px){.si-card{grid-template-columns:1fr;max-width:440px}.si-left{padding:30px 26px}.si-right{padding:30px 26px}}
      `}</style>

      <div className="si-card">
        {/* Left — welcome / reassurance */}
        <div className="si-left">
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: 22 }} onClick={() => navigate('/')}>
            <DiditLogo height={28} hideBeta />
          </div>

          <h1 style={{ fontSize: '1.7rem', fontWeight: 900, color: colors.text, margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.12 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '0.92rem', fontWeight: 600, color: colors.muted, lineHeight: 1.45, margin: 0 }}>
            Sign in to view all games.
          </p>

          {/* Early-development quote — reassurance on why play matters.
              One of SIGNIN_QUOTES, picked at random per visit. */}
          <figure style={{ margin: '30px 0 0', position: 'relative' }}>
            <span aria-hidden="true" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 700, fontSize: 52, lineHeight: 0.4, display: 'block', height: 24, color: colors.sunMid, opacity: 0.7 }}>
              &ldquo;
            </span>
            <blockquote style={{ margin: 0 }}>
              <p style={{ fontSize: '1.05rem', fontWeight: 800, color: colors.text, lineHeight: 1.4, letterSpacing: '-0.01em', margin: '0 0 14px' }}>
                {quote.text}
              </p>
            </blockquote>
            {quote.author ? (
              <figcaption style={{ lineHeight: 1.3 }}>
                <span style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: colors.text }}>{quote.author}</span>
                {quote.role && <span style={{ fontSize: '0.76rem', fontWeight: 600, color: colors.muted }}>{quote.role}</span>}
              </figcaption>
            ) : quote.caption ? (
              <figcaption style={{ fontSize: '0.74rem', fontWeight: 800, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {quote.caption}
              </figcaption>
            ) : null}
          </figure>
        </div>

        {/* Right — sign-in form */}
        <div className="si-right">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: colors.text, margin: '0 0 18px', letterSpacing: '-0.01em' }}>
            Sign in
          </h2>

          {error && (
            <div style={{ background: colors.coralLight, color: colors.coralDark, padding: '10px 14px', borderRadius: radii.sm, marginBottom: 16, fontSize: '0.82rem', fontWeight: 700 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleGoogle}
            disabled={loading}
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
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
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

          <form onSubmit={handleEmailLink}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: colors.text, marginBottom: 6 }}>Email</label>
            <input
              className="si-field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              style={{ ...fieldStyle, marginBottom: 14 }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px 0',
                fontFamily: fonts.display,
                fontWeight: 900,
                fontSize: '1.02rem',
                color: '#1A1A1A',
                background: colors.lime,
                border: 'none',
                borderRadius: radii.pill,
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              Send magic link →
            </button>
          </form>

          <p style={{ fontSize: '0.78rem', color: colors.muted, textAlign: 'center', margin: '12px 0 0', lineHeight: 1.4 }}>
            We&apos;ll email you a secure link to sign in &mdash; no password needed.
          </p>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginTop: 18, cursor: 'pointer', fontSize: '0.78rem', color: colors.muted, lineHeight: 1.45 }}>
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, cursor: 'pointer', accentColor: colors.blueberryDark }}
            />
            <span>Send me occasional updates about new games and founding-member perks. No spam — unsubscribe anytime.</span>
          </label>

          <p style={{ textAlign: 'center', marginTop: 18, fontSize: '0.8rem', color: colors.muted }}>
            <span onClick={() => navigate('/')} style={{ cursor: 'pointer', fontWeight: 800, color: colors.blueberryDark }}>← Back to home</span>
          </p>
        </div>
      </div>
    </div>
  )
}
