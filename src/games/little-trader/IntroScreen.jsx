import { fonts } from '../../design-system/tokens';
import Card from './Card';

/**
 * The opening "your cards" screen. Three starter cards in a slight fan,
 * a centred title, and a primary "tap to begin" CTA.
 *
 * `phase` is one of:
 *   'idle'        — full intro showing
 *   'transitioning' — title fades, cards swoop down (parent will hide screen
 *                    once the transition timer fires)
 */
export default function IntroScreen({ starters, onBegin, phase = 'idle' }) {
  const fading = phase === 'transitioning';

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        padding: '0 24px 40px',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        @keyframes traderTitleFade {
          0%   { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-12px); }
        }
        @keyframes traderCardEnter {
          0%   { opacity: 0; transform: translateY(-10px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes traderBtnFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-3px); }
        }
      `}</style>

      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: 'clamp(1.6rem, 5.5vw, 2.2rem)',
          color: 'var(--game-text)',
          letterSpacing: '0.01em',
          textAlign: 'center',
          animation: fading ? 'traderTitleFade 0.3s ease forwards' : 'none',
          opacity: fading ? 0 : 1,
        }}
      >
        your cards
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {starters.map((card, i) => (
          <div
            key={card.id}
            style={{
              animation: `traderCardEnter 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 80}ms backwards`,
            }}
          >
            <Card
              card={card}
              size="intro"
              rotation={[-4, 0, 4][i]}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onBegin}
        style={{
          marginTop: 12,
          background: 'var(--game-primary)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 9999,
          padding: '16px 40px',
          minHeight: 56,
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: '1.05rem',
          cursor: 'pointer',
          boxShadow: '0 6px 0 rgba(0,0,0,0.10), 0 8px 24px rgba(232,184,64,0.35)',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          opacity: fading ? 0 : 1,
          transition: 'opacity 0.25s ease',
          animation: fading ? 'none' : 'traderBtnFloat 2.4s ease-in-out infinite',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          letterSpacing: '0.02em',
        }}
      >
        tap to begin <span style={{ fontSize: '1.1rem' }}>→</span>
      </button>
    </div>
  );
}
