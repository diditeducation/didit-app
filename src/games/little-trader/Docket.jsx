import { forwardRef } from 'react';
import { fonts } from '../../design-system/tokens';
import Card from './Card';
import { DOCKET_CAP } from './cards';
import { CARD_SIZES, DOCKET_HEIGHT } from './styles';

/**
 * Wooden tan bar holding up to 5 cards. Layout: a horizontal row of slot
 * tiles. The parent passes refs so the drag layer in NewCardArea can
 * hit-test the docket bounds and individual cards (for swap targeting).
 */
const Docket = forwardRef(function Docket(
  {
    cards,
    swapMode = false,        // dashed amber outlines on existing cards
    pulseSlotIdx = null,     // briefly highlight a slot (after a successful keep)
    setSlotRef,              // (idx, el) => void — registers slot DOM nodes for hit-testing
    onTapCard = () => {},    // tap-to-hear when no drag is active
  },
  ref,
) {
  const slotW = CARD_SIZES.docket.w;
  const slotH = CARD_SIZES.docket.h;

  const filled = cards.length;
  const slots = Array.from({ length: DOCKET_CAP }, (_, i) => i);

  return (
    <div
      ref={ref}
      style={{
        flexShrink: 0,
        width: '100%',
        background: 'linear-gradient(180deg, var(--trader-docket) 0%, #B07A52 100%)',
        borderTop: '3px solid var(--trader-docket-edge)',
        boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.18), 0 -6px 18px rgba(0,0,0,0.15)',
        padding: '10px 12px 16px',
        boxSizing: 'border-box',
        minHeight: DOCKET_HEIGHT,
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
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px 6px',
          gap: 8,
          color: '#FFFBF0',
        }}
      >
        <span
          style={{
            fontFamily: fonts.display,
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: '0.04em',
            textTransform: 'lowercase',
            color: '#FFF7E1',
            opacity: 0.95,
          }}
        >
          your docket
        </span>
        <span
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: 12,
            color: 'rgba(255,247,225,0.85)',
          }}
        >
          {filled} {filled === 1 ? 'card' : 'cards'}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          overflowX: 'auto',
          overflowY: 'visible',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          padding: '4px 4px',
        }}
      >
        {slots.map((i) => {
          const card = cards[i];
          const animate = pulseSlotIdx === i ? 'traderSlotPulse 0.28s ease-out' : 'none';
          if (!card) {
            return <EmptySlot key={i} w={slotW} h={slotH} />;
          }
          return (
            <div
              key={card.id + ':' + i}
              ref={(el) => { if (setSlotRef) setSlotRef(i, el); }}
              data-docket-slot={i}
              style={{
                animation: animate,
                cursor: 'pointer',
              }}
              onClick={() => onTapCard(card, i)}
            >
              <Card
                card={card}
                size="docket"
                highlight={swapMode}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

function EmptySlot({ w, h }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: w,
        height: h,
        borderRadius: 12,
        border: '2px dashed rgba(255,255,255,0.45)',
        background: 'rgba(255,255,255,0.10)',
        flexShrink: 0,
      }}
    />
  );
}

export default Docket;
