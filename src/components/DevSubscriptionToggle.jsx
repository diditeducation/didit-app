import { useSubscription } from '../context/SubscriptionContext';

// Floating dev-only control to flip between "member" and "trial" so we can
// watch games lock/unlock without Stripe. Renders nothing in production.
export default function DevSubscriptionToggle() {
  const { devEnabled, devMember, setDevMember, isMember, status } = useSubscription();
  if (!devEnabled) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: 12,
        bottom: 12,
        zIndex: 9999,
        background: '#2D2A26',
        color: '#fff',
        borderRadius: 14,
        padding: '10px 12px',
        fontFamily: "'Nunito', sans-serif",
        fontSize: 12,
        boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        userSelect: 'none',
      }}
    >
      <span style={{ opacity: 0.7 }}>
        DEV · {isMember ? '🔓 member' : '🔒 trial'}
        <span style={{ opacity: 0.5 }}> ({status})</span>
      </span>
      <button
        onClick={() => setDevMember(!devMember)}
        style={{
          background: devMember ? '#CF4A4A' : '#4CC830',
          color: '#fff',
          border: 'none',
          borderRadius: 9999,
          padding: '6px 12px',
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 800,
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        {devMember ? 'Simulate cancel' : 'Simulate payment'}
      </button>
    </div>
  );
}
