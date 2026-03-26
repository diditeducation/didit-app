import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase'
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      // Try URL param first, then localStorage, then prompt as last resort
      const urlParams = new URLSearchParams(window.location.search)
      let email = urlParams.get('email') || localStorage.getItem('didit_email')

      if (!email) {
        email = window.prompt('Please enter your email to confirm:')
      }

      signInWithEmailLink(auth, email, window.location.href)
        .then(() => {
          localStorage.removeItem('didit_email')
          navigate('/hub')
        })
        .catch((err) => {
          setError(err.message)
        })
    } else {
      navigate('/')
    }
  }, [])

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Nunito, sans-serif',
        flexDirection: 'column',
        gap: '16px',
        background: '#FFFBF5',
      }}>
        <div style={{ fontSize: '3rem' }}>😕</div>
        <p style={{ color: '#9A8F82' }}>{error}</p>
        <button
          onClick={() => navigate('/')}
          style={{
            background: '#2D2A26',
            color: 'white',
            border: 'none',
            borderRadius: '9999px',
            padding: '12px 32px',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 800,
            cursor: 'pointer',
          }}>
          Try again
        </button>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FFFBF5',
      fontFamily: 'Nunito, sans-serif',
      color: '#9A8F82',
    }}>
      Signing you in...
    </div>
  )
}
