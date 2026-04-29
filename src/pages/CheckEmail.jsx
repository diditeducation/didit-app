import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { sendSignInLinkToEmail } from 'firebase/auth'
import DiditLogo from '../components/DiditLogo'

const getActionCodeSettings = (email) => ({
  url: `${window.location.origin}/auth/callback?email=${encodeURIComponent(email)}`,
  handleCodeInApp: true,
})

export default function CheckEmail() {
  const navigate = useNavigate()
  const [email] = useState(() => localStorage.getItem('didit_email') || '')
  const [resent, setResent] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleResend = async () => {
    if (cooldown > 0 || !email) return
    try {
      await sendSignInLinkToEmail(auth, email, getActionCodeSettings(email))
      setResent(true)
      setCooldown(60)
      setTimeout(() => setResent(false), 4000)
    } catch (err) {
      console.error(err)
    }
  }

  // Detect email provider for quick-open button
  const getProvider = () => {
    if (!email) return null
    const domain = email.split('@')[1]?.toLowerCase()
    if (domain?.includes('gmail')) return { name: 'Gmail', url: 'https://mail.google.com' }
    if (domain?.includes('outlook') || domain?.includes('hotmail') || domain?.includes('live')) return { name: 'Outlook', url: 'https://outlook.live.com' }
    if (domain?.includes('yahoo')) return { name: 'Yahoo Mail', url: 'https://mail.yahoo.com' }
    if (domain?.includes('icloud') || domain?.includes('me.com') || domain?.includes('mac.com')) return { name: 'iCloud Mail', url: 'https://www.icloud.com/mail' }
    return null
  }

  const provider = getProvider()

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FFFFFF',
      fontFamily: "'Nunito', sans-serif",
      textAlign: 'center',
      padding: '40px 24px',
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Logo */}
      <div style={{ marginBottom: '32px' }}>
        <DiditLogo height={40} onNavigate={() => navigate('/')} />
      </div>

      {/* Emoji */}
      <div style={{ fontSize: '3.5rem', marginBottom: '20px' }}>📬</div>

      {/* Heading */}
      <h1 style={{
        fontSize: '1.8rem',
        fontWeight: 900,
        color: '#2D2A26',
        marginBottom: '8px',
      }}>
        Check your inbox
      </h1>

      {/* Email display */}
      <p style={{
        fontSize: '0.95rem',
        color: '#9A8F82',
        lineHeight: 1.6,
        maxWidth: '360px',
        marginBottom: '4px',
      }}>
        We sent a sign-in link to
      </p>
      {email && (
        <p style={{
          fontSize: '1rem',
          fontWeight: 800,
          color: '#2D2A26',
          marginBottom: '20px',
        }}>
          {email}
        </p>
      )}
      <p style={{
        fontSize: '0.9rem',
        color: '#9A8F82',
        maxWidth: '320px',
        lineHeight: 1.5,
        marginBottom: '28px',
      }}>
        Tap the link in the email to start playing.
      </p>

      {/* Open email provider button */}
      {provider && (
        <a
          href={provider.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 36px',
            background: '#2D2A26',
            color: '#fff',
            borderRadius: '9999px',
            fontFamily: "'Nunito', sans-serif",
            fontSize: '0.95rem',
            fontWeight: 800,
            textDecoration: 'none',
            marginBottom: '16px',
            transition: 'all 0.2s',
          }}
        >
          Open {provider.name} →
        </a>
      )}

      {/* Divider */}
      <div style={{
        width: '100%',
        maxWidth: '300px',
        height: '1px',
        background: '#EDE5D8',
        margin: '20px 0',
      }} />

      {/* Help section */}
      <p style={{
        fontSize: '0.8rem',
        fontWeight: 700,
        color: '#2D2A26',
        marginBottom: '12px',
      }}>
        Didn't get it?
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: '#9A8F82' }}>
          Check your spam or junk folder
        </p>

        {/* Resend button */}
        <button
          onClick={handleResend}
          disabled={cooldown > 0}
          style={{
            background: 'transparent',
            border: '1.5px solid #EDE5D8',
            borderRadius: '9999px',
            padding: '10px 28px',
            fontFamily: "'Nunito', sans-serif",
            fontSize: '0.8rem',
            fontWeight: 700,
            color: cooldown > 0 ? '#9A8F82' : '#3A6CE5',
            cursor: cooldown > 0 ? 'default' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {resent ? '✓ Link sent!' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend link'}
        </button>

        {/* Try different email */}
        <button
          onClick={() => navigate('/signin')}
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: "'Nunito', sans-serif",
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#9A8F82',
            cursor: 'pointer',
            padding: '8px 16px',
            textDecoration: 'underline',
          }}
        >
          Try a different email
        </button>
      </div>
    </div>
  )
}
