import { fonts } from '../../design-system/tokens';
import { CARD_SIZES, EMOJI_FONT_STACK } from './styles';

// Single neutral ring around every card — kid-friendly, no tier-specific
// colours. (Previously tier-coloured via TIER_BORDERS.)
const CARD_RING_COLOR = '#D8D2C4';

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

  // Consistent grey ring on every card regardless of tier.
  const ringShadow = `0 0 0 2px ${CARD_RING_COLOR}`;

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
    boxShadow: `${ringShadow}, 0 4px 12px rgba(0,0,0,0.08)`,
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

  return (
    <div style={outerStyle} onPointerDown={onPointerDown}>
      {/* (Dashed swap-mode outline removed — hover scale-up gives the feedback now.) */}
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

// (Previously: SparkleCorners — three amber dots on rare cards. Removed
// because they read as a defect rather than decoration. The tier ring
// around the card already signals rarity.)
