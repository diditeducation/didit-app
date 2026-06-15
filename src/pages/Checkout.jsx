import { useNavigate, useSearchParams } from 'react-router-dom';
import { colors, fonts } from '../design-system/tokens';
import { useSubscription } from '../context/SubscriptionContext';
import DiditLogo from '../components/DiditLogo';

// PHASE 1 STUB.
// The real embedded Stripe checkout (email + Payment Element) lands in Phase 3,
// once the Stripe account + Cloud Function exist. For now this page proves the
// gating loop: a locked game redirects here, and the dev "unlock" button flips
// you to a member and drops you into the hub with everything open.
export default function Checkout() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const from = params.get('from');
  const { devEnabled, setDevMember } = useSubscription();

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
      }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 24,
          padding: '40px 32px',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <DiditLogo height={44} onNavigate={() => navigate('/')} />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: colors.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Unlock all 13 games
        </h1>
        <p style={{ color: colors.muted, fontSize: '0.95rem', margin: '0 0 4px' }}>
          $15<span style={{ fontSize: '0.8rem' }}>/month</span> · cancel anytime · zero ads
        </p>
        {from && (
          <p style={{ color: colors.muted, fontSize: '0.8rem', margin: '0 0 24px' }}>
            You were trying to play <strong style={{ color: colors.text }}>{from}</strong>.
          </p>
        )}

        <div
          style={{
            background: colors.bg,
            border: `1px dashed ${colors.border}`,
            borderRadius: 16,
            padding: '18px 16px',
            margin: '20px 0',
            fontSize: '0.85rem',
            color: colors.muted,
            lineHeight: 1.5,
          }}
        >
          🛠️ The real one-page checkout (email + card) lands in <strong>Phase 3</strong>,
          after the Stripe account is connected.
        </div>

        {devEnabled && (
          <button
            onClick={() => { setDevMember(true); navigate('/hub'); }}
            style={{
              width: '100%',
              padding: '14px',
              background: colors.grassMid,
              color: '#fff',
              border: 'none',
              borderRadius: 9999,
              fontFamily: fonts.display,
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            DEV: Simulate successful payment →
          </button>
        )}

        <p
          onClick={() => navigate('/')}
          style={{ marginTop: 20, fontSize: '0.8rem', color: colors.muted, cursor: 'pointer', textDecoration: 'underline' }}
        >
          ← Back to home
        </p>
      </div>
    </div>
  );
}
