export default function CheckEmail() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FFFBF5',
      fontFamily: 'Nunito, sans-serif',
      textAlign: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '24px' }}>
        📬
      </div>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 900,
        color: '#2D2A26',
        marginBottom: '12px',
      }}>
        Check your email!
      </h1>
      <p style={{
        fontSize: '1rem',
        color: '#9A8F82',
        maxWidth: '340px',
        lineHeight: 1.6,
      }}>
        We sent a magic link to your email.
        Click it to get access to Did*It.
      </p>
      <p style={{
        fontSize: '0.85rem',
        color: '#9A8F82',
        marginTop: '24px',
      }}>
        You can close this tab.
      </p>
    </div>
  )
}
