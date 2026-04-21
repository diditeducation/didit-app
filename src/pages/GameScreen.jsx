import { useParams, useNavigate } from 'react-router-dom';
import { GAMES } from '../data/games';
import { colors, fonts, radii } from '../design-system/tokens';

export default function GameScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const game = GAMES.find(g => g.id === id);

  if (!game) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#F7F4EF',
        fontFamily: fonts.display,
        padding: 24,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🔍</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: colors.text, marginBottom: 8 }}>
            Game not found
          </div>
          <div style={{ fontSize: 14, color: colors.muted, marginBottom: 24 }}>
            This game doesn't exist yet.
          </div>
          <button
            onClick={() => navigate('/hub')}
            style={{
              padding: '12px 24px',
              borderRadius: radii.pill,
              border: 'none',
              background: colors.text,
              color: 'white',
              fontFamily: fonts.display,
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            ← Back to hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: game.gradient,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: fonts.display,
      padding: 24,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 88, lineHeight: 1, marginBottom: 20 }}>
        {game.emoji}
      </div>
      <div style={{
        fontSize: 30,
        fontWeight: 900,
        color: 'white',
        marginBottom: 10,
        letterSpacing: '-0.02em',
      }}>
        {game.title}
      </div>
      <div style={{
        fontSize: 15,
        color: 'rgba(255,255,255,0.82)',
        lineHeight: 1.5,
        maxWidth: 280,
        marginBottom: 36,
        fontWeight: 500,
      }}>
        {game.hook}
      </div>
      <button
        onClick={() => navigate('/hub')}
        style={{
          padding: '13px 28px',
          borderRadius: radii.pill,
          border: 'none',
          background: 'white',
          color: game.colorDark,
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: 15,
          cursor: 'pointer',
        }}
      >
        ← Back
      </button>
    </div>
  );
}
