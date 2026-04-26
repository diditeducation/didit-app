import { fonts } from '../../design-system/tokens';
import { TIER_BORDERS } from './cards';
import { CARD_SIZES, EMOJI_FONT_STACK } from './styles';

/**
 * Single card component — renders at three sizes ('intro' | 'new' | 'docket').
 *
 * Anatomy:
 *   ┌────────────────────────────┐ outer (white, rounded, optional tier ring)
 *   │ ┌────────────────────────┐ │
 *   │ │   tinted emoji area    │ │
 *   │ │         🍎             │ │
 *   │ └────────────────────────┘ │
 *   │          apple             │
 *   └────────────────────────────┘
 *
 * Tier border: applied as nested box-shadows so we get a white gap then the
 * coloured ring (a common ribbon effect). Treasure tier additionally renders
 * three sparkle dots that gently pulse.
 */
export default function Card({
  card,
  size = 'docket',          // 'intro' | 'new' | 'docket'
  rotation = 0,
  scale = 1,
  highlight = false,        // dashed amber outline (swap target preview)
  ghost = false,            // semi-transparent placeholder (slot empty)
  onPointerDown,
  style: extraStyle,
}) {
  if (!card) return null;
  const dims = CARD_SIZES[size] || CARD_SIZES.docket;
  const tierColor = TIER_BORDERS[card.tier] || null;

  const ringShadow = tierColor
    ? `0 0 0 2px #fff, 0 0 0 4px ${tierColor}`
    : '0 0 0 1px rgba(0,0,0,0.05)';

  const dashedHighlight = highlight
    ? ', 0 0 0 6px rgba(232,184,64,0.0)'  // outer halo placeholder
    : '';

  const outerStyle = {
    width: dims.w,
    height: dims.h,
    background: '#FFFFFF',
    borderRadius: dims.radius,
    padding: dims.padding,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    boxShadow: `${ringShadow}${dashedHighlight}, 0 4px 12px rgba(0,0,0,0.08)`,
    transform: `rotate(${rotation}deg) scale(${scale})`,
    transformOrigin: 'center center',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    cursor: onPointerDown ? 'pointer' : 'default',
    touchAction: 'none',
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
    position: 'relative',
    opacity: ghost ? 0.0 : 1,
    ...extraStyle,
  };

  // Dashed amber outline (swap mode) drawn as an extra absolute layer so we
  // don't fight the tier ring shadows.
  const dashOverlay = highlight ? (
    <div
      style={{
        position: 'absolute',
        inset: -8,
        borderRadius: dims.radius + 6,
        border: '3px dashed #E8B840',
        pointerEvents: 'none',
      }}
    />
  ) : null;

  return (
    <div style={outerStyle} onPointerDown={onPointerDown}>
      {dashOverlay}
      <div
        style={{
          flex: 1,
          background: card.bg,
          borderRadius: dims.radius - 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <span
          style={{
            fontFamily: EMOJI_FONT_STACK,
            fontSize: dims.emoji,
            lineHeight: 1,
            display: 'inline-block',
            transform: 'translateY(-1px)',
          }}
        >
          {card.emoji}
        </span>
        {card.tier === 'treasure' && <SparkleCorners />}
      </div>
      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 600,
          fontSize: dims.label,
          color: 'var(--game-text)',
          textAlign: 'center',
          paddingTop: 6,
          letterSpacing: '0.01em',
          textTransform: 'lowercase',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {card.label}
      </div>
    </div>
  );
}

function SparkleCorners() {
  // Three small amber dots at the tinted-area corners, gently pulsing.
  const positions = [
    { top: 6,  left: 6 },
    { top: 6,  right: 6 },
    { bottom: 6, left: '50%', transform: 'translateX(-50%)' },
  ];
  return (
    <>
      <style>{`
        @keyframes traderSparkle {
          0%, 100% { opacity: 0.55; transform: scale(0.95); }
          50%      { opacity: 1;    transform: scale(1.15); }
        }
      `}</style>
      {positions.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#F2C246',
            boxShadow: '0 0 6px rgba(242,194,70,0.7)',
            animation: `traderSparkle 1.5s ease-in-out ${i * 0.3}s infinite`,
            ...p,
          }}
        />
      ))}
    </>
  );
}
