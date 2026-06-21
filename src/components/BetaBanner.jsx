import { useEffect, useRef, useState } from 'react';
import { fonts } from '../design-system/tokens';
import QuickFeedbackModal from './QuickFeedbackModal';
import { trackLandingClick } from '../analytics';
import { SHOW_BETA } from '../config';

/**
 * Top-of-app beta strip. Renders on every page (hub, game, marketing,
 * admin) for the entire trial period. Gated by the global `SHOW_BETA`
 * flag (src/config.js) — the same master switch as the logo's BETA pill,
 * so leaving beta removes both in one move.
 *
 * Tapping the strip opens QuickFeedbackModal; submissions land in the
 * shared Firestore `feedback` collection.
 *
 * On mount the strip sets `--app-banner-h` on <html> equal to its
 * rendered height; full-viewport layouts subtract that value via
 * `calc(100dvh - var(--app-banner-h, 0px))` so the bottom of the page
 * isn't pushed off-screen.
 */
export default function BetaBanner() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem('didit:beta-dismissed') === '1'; } catch { return false; }
  });
  const ref = useRef(null);

  const dismiss = (e) => {
    e.stopPropagation();
    try { sessionStorage.setItem('didit:beta-dismissed', '1'); } catch { /* noop */ }
    setDismissed(true);
  };

  // Keep the CSS variable in sync with the actual rendered height.
  // When dismissed the banner is gone so height drops to 0.
  useEffect(() => {
    const root = document.documentElement;
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

  // Gated by the same master switch as the logo's BETA pill (src/config.js):
  // flip SHOW_BETA to false to remove the test-mode strip everywhere too.
  if (dismissed || !SHOW_BETA) return null;

  return (
    <>
      <div
        ref={ref}
        style={wrapStyle}
        role="button"
        tabIndex={0}
        aria-label="Did·It is in beta — tap to send feedback"
        onClick={() => { setFeedbackOpen(true); trackLandingClick('report-a-bug'); }}
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

        {/* Dismiss X */}
        <button
          aria-label="Dismiss banner"
          onClick={dismiss}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 4px',
            color: '#5C3D08',
            opacity: 0.55,
            fontSize: 16,
            lineHeight: 1,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >✕</button>
      </div>

      <QuickFeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        source="beta-banner"
      />
    </>
  );
}
