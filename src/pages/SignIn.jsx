import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, googleProvider } from '../firebase'
import { signInWithPopup, signInWithRedirect, sendSignInLinkToEmail } from 'firebase/auth'

const getActionCodeSettings = (email) => ({
  url: `${window.location.origin}/auth/callback?email=${encodeURIComponent(email)}`,
  handleCodeInApp: true,
})

const floatCSS = `
@keyframes siFloat{0%,100%{transform:translate(0,0) scale(1)}25%{transform:translate(12px,-18px) scale(1.08)}50%{transform:translate(-8px,-30px) scale(0.95)}75%{transform:translate(16px,-12px) scale(1.04)}}
.si-dot{position:absolute;border-radius:50%;pointer-events:none;animation:siFloat 12s ease-in-out infinite}
`

export default function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showEmail, setShowEmail] = useState(false)

  const handleGoogle = async () => {
    setLoading(true)
    try {
      const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider)
      } else {
        await signInWithPopup(auth, googleProvider)
        navigate('/hub')
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleEmailLink = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await sendSignInLinkToEmail(auth, email, getActionCodeSettings(email))
      localStorage.setItem('didit_email', email)
      navigate('/check-email')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FFFFFF',
      fontFamily: "'Nunito', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{floatCSS}</style>

      {/* Floating dots */}
      <div className="si-dot" style={{ width: 16, height: 16, background: '#3A6CE5', top: '12%', left: '8%', opacity: 0.4, animationDelay: '0s', animationDuration: '14s' }} />
      <div className="si-dot" style={{ width: 12, height: 12, background: '#CF4A4A', top: '20%', right: '12%', opacity: 0.35, animationDelay: '2s', animationDuration: '16s' }} />
      <div className="si-dot" style={{ width: 14, height: 14, background: '#4CC830', bottom: '25%', left: '6%', opacity: 0.4, animationDelay: '4s', animationDuration: '13s' }} />
      <div className="si-dot" style={{ width: 10, height: 10, background: '#E8B840', bottom: '18%', right: '10%', opacity: 0.45, animationDelay: '1s', animationDuration: '11s' }} />
      <div className="si-dot" style={{ width: 8, height: 8, background: '#9BB5E8', top: '55%', left: '15%', opacity: 0.35, animationDelay: '3s', animationDuration: '18s' }} />
      <div className="si-dot" style={{ width: 12, height: 12, background: '#E8AAAA', top: '40%', right: '5%', opacity: 0.3, animationDelay: '5s', animationDuration: '15s' }} />

      {/* Card */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '420px',
        padding: '48px 40px',
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid #EDE5D8',
        margin: '20px',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <img
          src="/logo.png"
          alt="did it!"
          style={{ height: '48px', width: 'auto', marginBottom: '24px', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        />

        <h1 style={{
          fontSize: '1.6rem',
          fontWeight: 900,
          color: '#2D2A26',
          marginBottom: '8px',
          letterSpacing: '-0.02em',
        }}>
          Let's get started
        </h1>
        <p style={{
          color: '#9A8F82',
          marginBottom: '32px',
          fontSize: '0.9rem',
          lineHeight: 1.6,
        }}>
          Sign in to play the games
        </p>

        {error && (
          <div style={{
            background: '#F2C4BE',
            color: '#C23C3C',
            padding: '10px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        {/* Google button */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: '#2D2A26',
            color: 'white',
            border: 'none',
            borderRadius: '9999px',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
            fontSize: '1rem',
            cursor: loading ? 'wait' : 'pointer',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s',
          }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Email toggle link */}
        {!showEmail && (
          <p
            onClick={() => setShowEmail(true)}
            style={{
              color: '#9A8F82',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.color = '#2D2A26'}
            onMouseLeave={(e) => e.target.style.color = '#9A8F82'}
          >
            or use email instead →
          </p>
        )}

        {/* Email form - slides open */}
        {showEmail && (
          <div style={{ marginTop: '4px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              marginBottom: '16px',
            }}>
              <div style={{ flex: 1, height: '1px', background: '#EDE5D8' }} />
              <span style={{ color: '#9A8F82', fontSize: '0.7rem', fontWeight: 600 }}>email</span>
              <div style={{ flex: 1, height: '1px', background: '#EDE5D8' }} />
            </div>
            <form
              onSubmit={handleEmailLink}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoFocus
                style={{
                  padding: '12px 18px',
                  borderRadius: '9999px',
                  border: '2px solid #EDE5D8',
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: '#FFFFFF',
                  transition: 'border-color 0.2s',
                  color: '#2D2A26',
                }}
                onFocus={(e) => e.target.style.borderColor = '#3A6CE5'}
                onBlur={(e) => e.target.style.borderColor = '#EDE5D8'}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: 'transparent',
                  color: '#2D2A26',
                  border: '2px solid #EDE5D8',
                  borderRadius: '9999px',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s',
                }}>
                Send magic link →
              </button>
            </form>
          </div>
        )}

        {/* Back link */}
        <p style={{
          marginTop: '28px',
          fontSize: '0.8rem',
          color: '#9A8F82',
        }}>
          <span
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
          >
            ← Back to home
          </span>
        </p>

      </div>
    </div>
  )
}
