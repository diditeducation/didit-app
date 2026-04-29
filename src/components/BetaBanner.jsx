import { useEffect, useRef, useState } from 'react';
import { fonts, colors } from '../design-system/tokens';

/**
 * Top-of-app beta strip. Renders on every page (hub, game, marketing).
 *
 * On mount it sets `--app-banner-h` on <html> equal to its rendered
 * height; on dismiss / unmount it sets the variable back to 0px. Any
 * full-viewport layout (GameShell, GameHomeLayout, Hub, AboutPage)
 * uses `calc(100dvh - var(--app-banner-h, 0px))` so its inner area
 * doesn't get pushed off-screen by the banner.
 */
export default function BetaBanner() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof sessionStorage === 'undefined') return false;
    return sessionStorage.getItem('didit:beta-dismissed') === '1';
  });
  const [infoOpen, setInfoOpen] = useState(false);
  const ref = useRef(null);

  // Keep the CSS variable in sync with the actual rendered height.
  useEffect(() => {
    const root = document.documentElement;
    if (dismissed) {
      root.style.setProperty('--app-banner-h', '0px');
      return;
    }
    const update = () => {
      const h = ref.current?.offsetHeight || 0;
      root.style.setProperty('--app-banner-h', `${h}px`);
    };
    update();
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      root.style.setProperty('--app-banner-h', '0px');
    };
  }, [dismissed]);

  const dismiss = () => {
    try { sessionStorage.setItem('didit:beta-dismissed', '1'); } catch { /* noop */ }
    setDismissed(true);
  };

  if (dismissed) return null;

  const wrapStyle = {
    background: '#FFE9A8',
    color: '#5C3D08',
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 12,
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderBottom: '1px solid #E8B840',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    flexShrink: 0,
  };
  const iconBtn = {
    background: 'transparent',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    fontSize: 14,
    lineHeight: 1,
    color: '#5C3D08',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <>
      <div ref={ref} style={wrapStyle} role="status" aria-label="Beta notice">
        <span style={{ fontWeight: 800, letterSpacing: '0.04em' }}>🧪 Did·It is still cooking</span>
        <span style={{ opacity: 0.85 }}>— something off? Tell us!</span>
        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          aria-label="More about the beta"
          style={iconBtn}
        >
          ⓘ
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          style={{ ...iconBtn, marginLeft: 4, fontSize: 16, opacity: 0.7 }}
        >
          ×
        </button>
      </div>

      {infoOpen && (
        <div
          onClick={() => setInfoOpen(false)}
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
              You're using a pre-release build. Some games are still being
              polished, and you may hit rough edges or bugs. If something
              looks off — or breaks — please tap the feedback button on any
              game's home screen and tell us. Every bug report makes the app
              better.
            </div>
            <button
              type="button"
              onClick={() => setInfoOpen(false)}
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
