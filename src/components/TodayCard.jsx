import { fonts, radii } from '../design-system/tokens';
import { playWelcomeChime } from '../design-system/sharedSounds';
import { trackGameOpen } from '../analytics';
import { GAME_ILLUSTRATIONS as ILLUSTRATIONS } from './GameIllustrations';

const css = `
@keyframes todayBounce {
  0%, 100% { transform: translateY(0) scale(1); }
  30%       { transform: translateY(-6px) scale(1.04); }
  60%       { transform: translateY(-2px) scale(1.01); }
}
.today-play-btn {
  animation: todayBounce 2s ease-in-out infinite;
}
.today-play-btn:hover {
  animation: none;
  transform: scale(1.06);
  filter: brightness(1.06);
}
.today-arch-header {
  position: relative;
  height: 200px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}
.today-arch-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 160%;
  height: 72px;
  background: white;
  border-radius: 50% 50% 0 0;
}
.today-arch-circle {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: none;
}
.today-arch-circle svg {
  width: 100px;
  height: 100px;
  display: block;
}
`;

export default function TodayCard({ game, onPlay }) {
  const Illustration = ILLUSTRATIONS[game.illustrationKey];

  return (
    <div style={{ background: 'white', fontFamily: fonts.display }}>
      <style>{css}</style>

      {/* Arch header with background image */}
      <div
        className="today-arch-header"
        style={{
          backgroundColor: game.color,
          backgroundImage: game.bgImage ? `url('${game.bgImage}')` : undefined,
          backgroundSize: '240px',
          backgroundRepeat: 'repeat',
        }}
      >
        {/* "Today's Featured Game" badge top-left */}
        <div style={{
          position: 'absolute',
          top: 14,
          left: 16,
          zIndex: 3,
          fontSize: 11,
          fontWeight: 800,
          color: 'rgba(255,255,255,0.9)',
          letterSpacing: '0.06em',
          fontFamily: fonts.display,
          background: 'rgba(0,0,0,0.18)',
          padding: '4px 10px',
          borderRadius: radii.pill,
        }}>
          Today's Featured Game
        </div>

        <div className="today-arch-circle">
          {Illustration
            ? <Illustration />
            : <span style={{ fontSize: 64, lineHeight: 1 }}>{game.emoji}</span>
          }
        </div>
      </div>

      {/* Body */}
      <div style={{
        padding: '4px 20px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
      }}>
        {/* Title */}
        <div style={{
          fontSize: 28,
          fontWeight: 900,
          color: game.colorDark,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
        }}>
          {game.title}
        </div>

        {/* Domain tag pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 12px',
          borderRadius: radii.pill,
          background: game.colorLight,
          color: game.colorDark,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.02em',
        }}>
          {game.tag}
        </div>

        {/* Hook */}
        <div style={{
          fontSize: 13,
          color: '#555',
          lineHeight: 1.55,
          maxWidth: 300,
        }}>
          {game.hook}
        </div>

        {/* Play button — compact + bouncing */}
        <button
          className="today-play-btn"
          onClick={() => { playWelcomeChime(); trackGameOpen(game.id + '-featured'); onPlay(); }}
          style={{
            marginTop: 4,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '13px 36px',
            borderRadius: radii.pill,
            border: 'none',
            background: game.colorDark,
            color: 'white',
            fontFamily: fonts.display,
            fontWeight: 800,
            fontSize: 16,
            cursor: 'pointer',
            letterSpacing: '-0.01em',
            boxShadow: `0 4px 16px rgba(0,0,0,0.18)`,
            transition: 'transform 0.2s ease, filter 0.2s ease',
          }}
        >
          Play now →
        </button>
      </div>
    </div>
  );
}
