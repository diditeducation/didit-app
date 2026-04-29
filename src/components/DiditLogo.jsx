import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fonts, colors } from '../design-system/tokens';

/**
 * Did·It logo block — image + "BETA" badge + info icon. Drop-in
 * replacement for `<img src="/logo.png" />` anywhere in the app.
 *
 * Tap the logo to navigate to /hub. Tap the info icon to see the
 * beta-status note (same one BetaBanner shows).
 */
export default function DiditLogo({ height = 28, onNavigate }) {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const goHome = () => (onNavigate ? onNavigate() : nav('/hub'));

  return (
    <>
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0, lineHeight: 1 }}>
        <img
          src="/logo.png"
          alt="Did It!"
          onClick={goHome}
          style={{ height, objectFit: 'contain', cursor: 'pointer', display: 'block' }}
        />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
          <span
            style={{
              fontFamily: fonts.display,
              fontWeight: 900,
              fontSize: 8,
              letterSpacing: '0.16em',
              color: colors.muted,
              background: 'rgba(0,0,0,0.05)',
              padding: '1px 5px 1px',
              borderRadius: 999,
            }}
          >
            BETA
          </span>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="What is beta?"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              fontSize: 11,
              lineHeight: 1,
              color: colors.muted,
              cursor: 'pointer',
            }}
          >
            ⓘ
          </button>
        </div>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 1001, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF', borderRadius: 16, padding: '20px 22px',
              maxWidth: 360, width: '100%', boxSizing: 'border-box',
              fontFamily: fonts.display, color: colors.text,
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 6 }}>
              🧪 Did·It is in beta
            </div>
            <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.55, color: colors.muted, marginBottom: 14 }}>
              You&apos;re using a pre-release build. Some games are still
              being polished, and you may hit rough edges or bugs. If
              something looks off — or breaks — please tap the feedback
              button on any game&apos;s home screen and tell us.
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: colors.sunMid,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 9999,
                padding: '10px 24px',
                fontFamily: fonts.display,
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
