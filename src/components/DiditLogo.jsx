import { useNavigate } from 'react-router-dom';
import { fonts, colors } from '../design-system/tokens';
import { useAuth } from '../context/AuthContext';

/**
 * Did·It logo block — logo image + small "BETA" pill underneath.
 * Drop-in replacement for `<img src="/logo.png" />` anywhere in the app.
 *
 * Click behaviour:
 *   - Signed-in users always go to /hub. Whatever caller-supplied
 *     onNavigate exists is ignored — the rule "logged in → /hub" is
 *     centralised here so individual pages can't accidentally trap a
 *     user on the marketing/landing flow.
 *   - Signed-out users run the caller's `onNavigate` if provided
 *     (e.g. MarketingPage scrolls to top), otherwise fall through to
 *     /hub which redirects to /signin via the protected route.
 *
 * Two visual variants:
 *   tone = 'dark' (default) — for light backgrounds. BETA pill is muted
 *                              charcoal on a faint grey chip.
 *   tone = 'light'           — for dark backgrounds (LandingPage, About).
 *                              BETA pill flips to a soft white-on-translucent
 *                              chip so it stays legible.
 */
export default function DiditLogo({ height = 28, onNavigate, tone = 'dark' }) {
  const nav = useNavigate();
  const { user } = useAuth();
  const isSignedIn = !!user;
  const goHome = () => {
    if (isSignedIn) {
      nav('/hub');
      return;
    }
    if (onNavigate) onNavigate();
    else nav('/hub');
  };

  const isLight = tone === 'light';
  const pillStyle = {
    fontFamily: fonts.display,
    fontWeight: 900,
    fontSize: 8,
    letterSpacing: '0.16em',
    color: isLight ? 'rgba(255,255,255,0.85)' : colors.muted,
    background: isLight ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.05)',
    padding: '1px 5px 1px',
    borderRadius: 999,
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 0,
        lineHeight: 1,
      }}
    >
      <img
        src="/logo.png"
        alt="Did It!"
        onClick={goHome}
        style={{ height, objectFit: 'contain', cursor: 'pointer', display: 'block' }}
      />
      <span style={{ ...pillStyle, marginTop: 2 }}>BETA</span>
    </div>
  );
}
