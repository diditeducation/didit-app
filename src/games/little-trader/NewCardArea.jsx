import { useRef, useState } from 'react';
import { fonts } from '../../design-system/tokens';
import Card from './Card';
import { CARD_SIZES } from './styles';

/**
 * The big top card + skip button.
 *
 * Drag is handled with pointer events:
 *   - Pointer down on the card → record offset, scale up
 *   - Pointer move → translate the card to follow the finger
 *   - Pointer up → call onResolve(zone, slotIndex|null) where:
 *       zone = 'docket' | 'docket-card' | 'outside'
 *       slotIndex = index of the docket card under the pointer (for swap)
 *
 * The parent (Game.jsx) decides what to do based on docket fullness.
 */
export default function NewCardArea({
  card,
  showFlip,                // true on the initial frame after a new round → triggers flip-in animation
  accentColor,             // theme accent — recolours the "New Card" label
  onResolve,               // (result) => void — see below for shape
  onSkip,                  // () => void — for the skip button
  hitTest,                 // (clientX, clientY) → { zone, slotIndex } — provided by Game.jsx
  onHoverChange,           // (hit) => void — fires on every pointer move during drag
}) {
  const cardRef = useRef(null);
  const [drag, setDrag] = useState(null); // { dx, dy } pointer offset from origin
  // (Parent remounts this component with key={card?.id} so drag state always
  // starts fresh per card — no effect needed.)

  const startDrag = (e) => {
    if (!card) return;
    e.preventDefault();
    const rect = cardRef.current?.getBoundingClientRect();
    const startCx = e.clientX;
    const startCy = e.clientY;
    setDrag({ dx: 0, dy: 0, startCx, startCy, startRect: rect });
    try { cardRef.current?.setPointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };

  const moveDrag = (e) => {
    if (!drag) return;
    setDrag({
      ...drag,
      dx: e.clientX - drag.startCx,
      dy: e.clientY - drag.startCy,
    });
    // Live hover feedback — let the parent know which slot the pointer
    // is currently over so it can scale that slot up.
    if (onHoverChange && hitTest) onHoverChange(hitTest(e.clientX, e.clientY));
  };

  const endDrag = (e) => {
    if (!drag) return;
    try { cardRef.current?.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
    const result = hitTest ? hitTest(e.clientX, e.clientY) : { zone: 'outside' };
    setDrag(null);
    if (onHoverChange) onHoverChange({ zone: 'outside' });
    onResolve?.(result);
  };

  const cancelDrag = () => {
    if (!drag) return;
    setDrag(null);
    if (onHoverChange) onHoverChange({ zone: 'outside' });
    onResolve?.({ zone: 'outside' });
  };

  const dims = CARD_SIZES.new;
  const isDragging = !!drag;
  const tx = drag?.dx ?? 0;
  const ty = drag?.dy ?? 0;

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // Anchor the new card toward the bottom of its area so it visually
        // sits close to the docket. Top whitespace under the progress bar
        // becomes the breathing room instead.
        justifyContent: 'flex-end',
        paddingBottom: 12,
        position: 'relative',
        gap: 10,
      }}
    >
      <style>{`
        @keyframes traderCardFlipIn {
          0%   { transform: rotateY(180deg) scale(0.9); opacity: 0; }
          60%  { transform: rotateY(0deg)   scale(1.04); opacity: 1; }
          100% { transform: rotateY(0deg)   scale(1);    opacity: 1; }
        }
        @keyframes traderBadgeBob {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50%      { transform: translateY(-4px) rotate(-3deg); }
        }
        @keyframes traderArrowBob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(4px); }
        }
      `}</style>

      {/* "New Card" section header — same size + treatment as the docket header */}
      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: 24,
          color: accentColor || 'var(--game-text)',
          letterSpacing: '0.01em',
          opacity: card ? 1 : 0,
          transition: 'opacity 0.2s ease, color 0.4s ease',
          textAlign: 'center',
          lineHeight: 1.1,
        }}
      >
        New Card
      </div>

      {/* Card + icon Next button on a single horizontal row, both centred
          vertically. A spacer on the left balances the button on the right
          so the card stays horizontally centred in the area. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
        }}
      >
        {/* Left spacer — same width as the Next button so the card stays centred */}
        <div style={{ width: 48, flexShrink: 0 }} aria-hidden="true" />

        {/* The big card */}
        <div
          ref={cardRef}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={cancelDrag}
          style={{
            width: dims.w,
            height: dims.h,
            touchAction: 'none',
            transform: `translate(${tx}px, ${ty}px) scale(${isDragging ? 1.05 : 1})`,
            // Dim while dragging so the slot underneath stays visible.
            opacity: isDragging ? 0.7 : 1,
            transition: isDragging
              ? 'opacity 0.15s ease'
              : 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease',
            willChange: 'transform, opacity',
            zIndex: isDragging ? 50 : 5,
            animation: showFlip ? 'traderCardFlipIn 0.5s ease-out' : 'none',
            transformStyle: 'preserve-3d',
            perspective: 800,
            flexShrink: 0,
          }}
        >
          {card && <Card card={card} size="new" />}
        </div>

        {/* Icon Next button — circular, centred to the card's vertical axis */}
        <button
          type="button"
          onClick={onSkip}
          disabled={!card}
          aria-label="Skip this card"
          style={{
            width: 48,
            height: 48,
            flexShrink: 0,
            background: '#FFFFFF',
            color: 'var(--game-text)',
            border: '2px solid rgba(0,0,0,0.08)',
            borderRadius: '50%',
            padding: 0,
            cursor: card ? 'pointer' : 'default',
            opacity: card ? 1 : 0.35,
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.2s ease, background 0.15s ease',
          }}
        >
          {/* Chevron-right icon — clean SVG so it scales with the button */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
