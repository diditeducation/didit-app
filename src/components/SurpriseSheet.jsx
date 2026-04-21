import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { colors, fonts, radii, easing } from '../design-system/tokens';

const GAP = 12;

export default function SurpriseSheet({ games, isOpen, onClose, onPlay }) {
  const [shuffled, setShuffled] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [cardW, setCardW] = useState(280);
  const sheetRef = useRef();

  useEffect(() => {
    if (isOpen) {
      setShuffled([...games].sort(() => Math.random() - 0.5));
      setActiveIdx(0);
    }
  }, [isOpen, games]);

  useLayoutEffect(() => {
    if (isOpen && sheetRef.current) {
      // Available inner width minus padding (16px each side)
      const innerW = sheetRef.current.offsetWidth - 32;
      setCardW(Math.round(innerW * 0.86));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const translateX = -(activeIdx * (cardW + GAP));
  const canPrev = activeIdx > 0;
  const canNext = activeIdx < shuffled.length - 1;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
      <style>{`
        @keyframes sheetSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.52)',
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 420,
          background: 'white',
          borderRadius: '24px 24px 0 0',
          paddingBottom: 36,
          animation: `sheetSlideUp 0.42s ${easing.spring} forwards`,
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 14, marginBottom: 4 }}>
          <div style={{
            width: 36,
            height: 4,
            borderRadius: 9999,
            background: colors.border,
          }} />
        </div>

        {/* Title */}
        <div style={{
          padding: '10px 20px 16px',
          fontSize: 20,
          fontWeight: 900,
          fontFamily: fonts.display,
          color: colors.text,
          letterSpacing: '-0.01em',
        }}>
          🎲 Your pick
        </div>

        {/* Carousel track */}
        <div style={{ overflow: 'hidden', padding: '0 16px' }}>
          <div
            style={{
              display: 'flex',
              gap: GAP,
              transform: `translateX(${translateX}px)`,
              transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              willChange: 'transform',
              touchAction: 'pan-y',
            }}
            onTouchStart={e => setTouchStartX(e.targetTouches[0].clientX)}
            onTouchEnd={e => {
              if (touchStartX === null) return;
              const diff = touchStartX - e.changedTouches[0].clientX;
              if (diff > 48 && canNext) setActiveIdx(i => i + 1);
              else if (diff < -48 && canPrev) setActiveIdx(i => i - 1);
              setTouchStartX(null);
            }}
          >
            {shuffled.map(game => (
              <div
                key={game.id}
                style={{
                  minWidth: cardW,
                  maxWidth: cardW,
                  flexShrink: 0,
                  borderRadius: 20,
                  background: game.gradient,
                  padding: '20px 20px 20px',
                }}
              >
                {/* Category pill */}
                <div style={{
                  display: 'inline-flex',
                  padding: '3px 10px',
                  borderRadius: 9999,
                  background: 'rgba(255,255,255,0.25)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'white',
                  fontFamily: fonts.display,
                  marginBottom: 14,
                  letterSpacing: '0.03em',
                }}>
                  {game.category}
                </div>

                {/* Emoji */}
                <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 12 }}>
                  {game.emoji}
                </div>

                {/* Title */}
                <div style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: 'white',
                  fontFamily: fonts.display,
                  marginBottom: 6,
                  letterSpacing: '-0.02em',
                }}>
                  {game.title}
                </div>

                {/* Hook */}
                <div style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.8)',
                  fontFamily: fonts.display,
                  lineHeight: 1.45,
                  marginBottom: 20,
                  fontWeight: 500,
                }}>
                  {game.hook}
                </div>

                {/* CTA */}
                <button
                  onClick={() => { onPlay(game.path); onClose(); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '13px',
                    borderRadius: radii.pill,
                    border: 'none',
                    background: 'white',
                    color: game.colorDark,
                    fontFamily: fonts.display,
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: 'pointer',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Play this one →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Nav: arrows + dots */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          marginTop: 18,
          padding: '0 16px',
        }}>
          <NavArrow
            dir="←"
            disabled={!canPrev}
            onClick={() => setActiveIdx(i => i - 1)}
          />

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {shuffled.map((_, i) => (
              <div
                key={i}
                onClick={() => setActiveIdx(i)}
                style={{
                  width: i === activeIdx ? 18 : 6,
                  height: 6,
                  borderRadius: 9999,
                  background: i === activeIdx ? colors.blueberryMid : colors.border,
                  transition: 'width 0.25s ease, background 0.25s ease',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>

          <NavArrow
            dir="→"
            disabled={!canNext}
            onClick={() => setActiveIdx(i => i + 1)}
          />
        </div>
      </div>
    </div>
  );
}

function NavArrow({ dir, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 38,
        height: 38,
        borderRadius: '50%',
        border: `2px solid ${colors.border}`,
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        fontSize: 16,
        fontFamily: fonts.display,
        fontWeight: 700,
        transition: 'opacity 0.2s ease',
        flexShrink: 0,
      }}
    >
      {dir}
    </button>
  );
}
