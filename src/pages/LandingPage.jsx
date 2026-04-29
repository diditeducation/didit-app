import { useNavigate } from 'react-router-dom';
import { fonts, colors, radii, shadows, easing } from '../design-system/tokens';

const GAMES = [
  {
    emoji: '💡',
    title: 'Little Engineer',
    tagline: 'Build, connect, solve',
    bg: colors.blueberryLight,
    accent: colors.blueberry,
    path: '/games/little-engineer',
  },
  {
    emoji: '🎧',
    title: 'Little DJ',
    tagline: 'Tap, slide, mix',
    bg: colors.coralLight,
    accent: colors.coral,
    path: '/games/little-dj',
  },
  {
    emoji: '🛍️',
    title: 'Little Shopper',
    tagline: 'Choosing, counting & paying',
    bg: colors.grassLight,
    accent: colors.grass,
    path: '/games/little-shopper',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  const pageStyle = {
    minHeight: '100vh',
    background: colors.night,
    color: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: fonts.body,
    padding: '0 24px',
    boxSizing: 'border-box',
  };

  const headerStyle = {
    marginTop: '64px',
    textAlign: 'center',
  };

  const titleStyle = {
    fontFamily: fonts.display,
    fontWeight: 900,
    fontSize: '4rem',
    userSelect: 'none',
  };

  const asteriskStyle = {
    color: colors.coral,
  };

  const subtitleStyle = {
    fontFamily: fonts.body,
    fontSize: '1.2rem',
    color: colors.muted,
    marginTop: '8px',
  };

  const gridStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '48px',
    width: '100%',
    maxWidth: '400px',
    paddingBottom: '48px',
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>
          Did<span style={asteriskStyle}>*</span>It
        </div>
        <div style={subtitleStyle}>Small games. Big ideas.</div>
        <span
          style={{
            display: 'inline-block',
            marginTop: 10,
            fontFamily: fonts.display,
            fontWeight: 900,
            fontSize: 9,
            letterSpacing: '0.18em',
            color: 'rgba(255,255,255,0.85)',
            background: 'rgba(255,255,255,0.14)',
            padding: '2px 8px',
            borderRadius: 999,
          }}
        >
          BETA
        </span>
      </div>

      <div style={gridStyle}>
        {GAMES.map((game) => (
          <button
            key={game.path}
            onClick={() => navigate(game.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px',
              borderRadius: radii.lg,
              background: game.bg,
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              boxShadow: 'none',
              transition: `transform 0.2s ${easing.bounce}`,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: game.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                flexShrink: 0,
              }}
            >
              {game.emoji}
            </div>
            <div>
              <div
                style={{
                  fontFamily: fonts.display,
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: colors.text,
                }}
              >
                {game.title}
              </div>
              <div
                style={{
                  fontFamily: fonts.body,
                  fontSize: '0.85rem',
                  color: colors.muted,
                  marginTop: '2px',
                }}
              >
                {game.tagline}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
