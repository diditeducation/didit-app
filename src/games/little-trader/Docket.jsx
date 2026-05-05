import { forwardRef } from 'react';
import { fonts } from '../../design-system/tokens';
import Card from './Card';
import { DOCKET_CAP } from './cards';
import { CARD_SIZES, DOCKET_HEIGHT } from './styles';

/**
 * Solid-colour panel holding up to 5 card slots. Refs are attached to
 * every slot wrapper (filled or empty) so the parent can both hit-test
 * during drag and animate the slot the pointer is currently over.
 *
 * Props:
 *   cards            — array of Card data, length 0..DOCKET_CAP
 *   bgColor          — panel background colour (theme tint)
 *   textColor        — header label colour (theme primary)
 *   swapMode         — true when the docket is full + a card is being dragged
 *   pulseSlotIdx     — slot index to briefly pulse after a successful keep/swap
 *   hoveredSlotIdx   — slot index currently under the dragged pointer (scales up)
 *   setSlotRef       — (idx, el) => void — registers slot DOM nodes for hit-testing
 *   onTapCard        — (card, idx) => void — tap-to-hear when no drag is active
 */
const Docket = forwardRef(function Docket(
  {
    cards,
    bgColor,
    textColor,
    swapMode = false,
    pulseSlotIdx = null,
    hoveredSlotIdx = null,
    setSlotRef,
    onTapCard = () => {},
  },
  ref,
) {
  const slotW = CARD_SIZES.docket.w;
  const slotH = CARD_SIZES.docket.h;
  const slots = Array.from({ length: DOCKET_CAP }, (_, i) => i);

  return (
    <div
      ref={ref}
      style={{
        flexShrink: 0,
        width: 'calc(100% - 24px)',
        margin: '0 12px 12px',
        background: bgColor || 'var(--trader-docket)',
        borderRadius: 24,
        padding: '12px 12px 16px',
        boxSizing: 'border-box',
        minHeight: DOCKET_HEIGHT,
        boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
        transition: 'background 0.4s ease',
      }}
    >
      <style>{`
        @keyframes traderSlotPulse {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.10); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 6px 10px',
          gap: 2,
        }}
      >
        <span
          style={{
            fontFamily: fonts.display,
            fontWeight: 800,
            fontSize: 24,
            letterSpacing: '0.01em',
            color: textColor || 'var(--trader-docket-text)',
            lineHeight: 1.1,
          }}
        >
          Your Cards
        </span>
        <span
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: 12,
            color: textColor || 'var(--trader-docket-text)',
            opacity: 0.7,
          }}
        >
          You can have up to 5
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '4px 4px',
        }}
      >
        {slots.map((i) => {
          const card = cards[i];
          const isHovered = hoveredSlotIdx === i;
          const pulseAnim = pulseSlotIdx === i ? 'traderSlotPulse 0.28s ease-out' : 'none';
          const transform = isHovered ? 'scale(1.10)' : 'scale(1)';
          return (
            <div
              key={card ? card.id + ':' + i : 'empty:' + i}
              ref={(el) => { if (setSlotRef) setSlotRef(i, el); }}
              data-docket-slot={i}
              onClick={card ? () => onTapCard(card, i) : undefined}
              style={{
                transform,
                transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                animation: pulseAnim,
                cursor: card ? 'pointer' : 'default',
              }}
            >
              {card ? (
                <Card card={card} size="docket" highlight={swapMode} />
              ) : (
                <EmptySlot w={slotW} h={slotH} active={isHovered} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

function EmptySlot({ w, h, active = false }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: w,
        height: h,
        borderRadius: 12,
        background: active ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)',
        flexShrink: 0,
        transition: 'background 0.18s ease',
      }}
    />
  );
}

export default Docket;
