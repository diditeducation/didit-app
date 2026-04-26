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
  isFull,                  // docket is full (5 cards) — affects swap UX hint
  onResolve,               // (result) => void — see below for shape
  onSkip,                  // () => void — for the skip button
  hitTest,                 // (clientX, clientY) → { zone, slotIndex } — provided by Game.jsx
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
  };

  const endDrag = (e) => {
    if (!drag) return;
    try { cardRef.current?.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
    const result = hitTest ? hitTest(e.clientX, e.clientY) : { zone: 'outside' };
    setDrag(null);
    onResolve?.(result);
  };

  const cancelDrag = () => {
    if (!drag) return;
    setDrag(null);
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
        justifyContent: 'center',
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

      {/* "new!" badge */}
      <div
        style={{
          background: 'var(--game-accent)',
          color: '#FFFFFF',
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: 13,
          padding: '6px 14px',
          borderRadius: 9999,
          boxShadow: '0 3px 10px rgba(207,74,74,0.35)',
          animation: 'traderBadgeBob 1.6s ease-in-out infinite',
          letterSpacing: '0.06em',
          opacity: card ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        new!
      </div>

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
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          willChange: 'transform',
          zIndex: isDragging ? 50 : 5,
          animation: showFlip ? 'traderCardFlipIn 0.5s ease-out' : 'none',
          transformStyle: 'preserve-3d',
          perspective: 800,
        }}
      >
        {card && <Card card={card} size="new" />}
      </div>

      {/* Hint row: arrow + "drag down to keep" */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          marginTop: 8,
          color: 'var(--game-text-muted)',
          fontFamily: fonts.display,
          fontWeight: 600,
          fontSize: 12,
          textTransform: 'lowercase',
          opacity: isDragging ? 0 : 0.85,
          transition: 'opacity 0.2s ease',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontSize: 22,
            lineHeight: 1,
            animation: 'traderArrowBob 1.4s ease-in-out infinite',
          }}
        >
          ↓
        </span>
        <span>{isFull ? 'drop on a card to swap' : 'drag down to keep'}</span>
      </div>

      {/* Skip button — pinned to the right edge */}
      <button
        type="button"
        onClick={onSkip}
        disabled={!card}
        style={{
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          background: '#FFFFFF',
          color: 'var(--game-text)',
          border: '2px solid rgba(0,0,0,0.08)',
          borderRadius: 9999,
          padding: '12px 18px',
          minHeight: 48,
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: 14,
          cursor: card ? 'pointer' : 'default',
          opacity: card ? 1 : 0.4,
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          letterSpacing: '0.04em',
        }}
      >
        skip <span>→</span>
      </button>
    </div>
  );
}
