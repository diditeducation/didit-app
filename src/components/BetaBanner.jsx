import { useEffect, useRef, useState } from 'react';
import { fonts } from '../design-system/tokens';
import QuickFeedbackModal from './QuickFeedbackModal';

/**
 * Top-of-app beta strip. Renders on every page (hub, game, marketing).
 *
 * Tapping the strip (or the inline "Tell us" link) opens the shared
 * FeedbackModal — same form the in-game feedback link uses, so every
 * submission lands in the same Firestore `feedback` collection.
 *
 * On mount the strip sets `--app-banner-h` on <html> equal to its
 * rendered height; on dismiss / unmount it sets the variable back to
 * 0px. Any full-viewport layout (GameShell, GameHomeLayout, Hub,
 * AboutPage) uses `calc(100dvh - var(--app-banner-h, 0px))` so its
 * inner area doesn't get pushed off-screen by the banner.
 */
export default function BetaBanner() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof sessionStorage === 'undefined') return false;
    return sessionStorage.getItem('didit:beta-dismissed') === '1';
  });
  const [feedbackOpen, setFeedbackOpen] = useState(false);
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

  const dismiss = (e) => {
    e.stopPropagation();
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
    cursor: 'pointer',
  };
  const dismissBtn = {
    background: 'transparent',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    fontSize: 16,
    lineHeight: 1,
    color: '#5C3D08',
    opacity: 0.7,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  };

  return (
    <>
      <div
        ref={ref}
        style={wrapStyle}
        role="button"
        tabIndex={0}
        aria-label="Did·It is in beta — tap to send feedback"
        onClick={() => setFeedbackOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setFeedbackOpen(true);
        }}
      >
        <span style={{ fontWeight: 800, letterSpacing: '0.04em' }}>Did·It is in test mode</span>
        <span style={{ opacity: 0.85 }}>
          —{' '}
          <span
            style={{
              color: '#1F4FBF',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              fontWeight: 800,
            }}
          >
            report a bug
          </span>{' '}
          if something&apos;s off
        </span>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          style={dismissBtn}
        >
          ×
        </button>
      </div>

      <QuickFeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        source="beta-banner"
      />
    </>
  );
}
