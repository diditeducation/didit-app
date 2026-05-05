import { useEffect, useRef, useState } from 'react';
import { fonts } from '../design-system/tokens';
import QuickFeedbackModal from './QuickFeedbackModal';
import { trackLandingClick } from '../analytics';

/**
 * Top-of-app beta strip. Renders on every page (hub, game, marketing,
 * admin) for the entire trial period — there is no dismiss control,
 * intentionally, so every visitor sees the bug-report path.
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
  const ref = useRef(null);

  // Defensive cleanup: an earlier build of this component used
  // sessionStorage to remember a dismissal. If a tester hit dismiss
  // back then, the flag would still be set in their session and the
  // banner would stay hidden. Clear it on mount so the banner always
  // appears now that there's no dismiss control.
  useEffect(() => {
    try { sessionStorage.removeItem('didit:beta-dismissed'); } catch { /* noop */ }
  }, []);

  // Keep the CSS variable in sync with the actual rendered height.
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
  }, []);

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
      </div>

      <QuickFeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        source="beta-banner"
      />
    </>
  );
}
