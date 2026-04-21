import { useState, useRef, useCallback } from 'react';
import { initAudio, sound } from './audio';

// Star size → visual radii
const SIZE_MAP = { lg: { dot: 10, glow: 18 }, md: { dot: 8, glow: 15 }, sm: { dot: 6, glow: 12 } };

// Deterministic pseudo-random background stars per level
function makeBgStars(seed) {
  const out = [];
  let s = (seed * 1664525 + 1013904223) & 0xffffffff;
  const next = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
  for (let i = 0; i < 48; i++) {
    out.push({
      x: next() * 100,
      y: next() * 100,
      size: 0.9 + next() * 1.5,
      delay: next() * 3.5,
      dur: 2.2 + next() * 1.8,
    });
  }
  return out;
}

export default function ConstellationCanvas({
  levelId,
  stars,
  sequence,
  animal,
  onMilestone,
}) {
  const bgStars = useRef(makeBgStars(levelId * 137 + 42));

  const [nextIdx, setNextIdx]   = useState(0);   // index into `sequence`
  const [lines, setLines]       = useState([]);   // [{from, to}] star indices
  const [wrongIdx, setWrongIdx] = useState(null); // star index briefly animating
  const [complete, setComplete] = useState(false);

  const wrongTimer = useRef(null);
  const milestoneTimer = useRef(null);

  // Set of star indices that have been activated (already correctly tapped)
  const activated = new Set(sequence.slice(0, nextIdx));

  const handleStarTap = useCallback((starIndex) => {
    if (complete) return;
    initAudio();

    const expected = sequence[nextIdx];

    if (starIndex === expected) {
      sound.tap();
      const newIdx = nextIdx + 1;
      setNextIdx(newIdx);

      if (nextIdx > 0) {
        setLines(prev => [...prev, { from: sequence[nextIdx - 1], to: starIndex }]);
      }

      if (newIdx === sequence.length) {
        setComplete(true);
        // fire milestone after brief animal-reveal pause
        clearTimeout(milestoneTimer.current);
        milestoneTimer.current = setTimeout(() => {
          onMilestone(50, 55);
        }, 700);
      }
    } else {
      // Wrong tap — gentle shake, no negative sound
      clearTimeout(wrongTimer.current);
      setWrongIdx(starIndex);
      wrongTimer.current = setTimeout(() => setWrongIdx(null), 550);
    }
  }, [nextIdx, sequence, complete, onMilestone]);

  const nextExpected = complete ? null : sequence[nextIdx];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 390,
        aspectRatio: '390 / 700',
        position: 'relative',
        borderRadius: 24,
        background: 'radial-gradient(ellipse at 50% 35%, #1c2040 0%, #0a0e1a 68%)',
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.65)',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <style>{`
        @keyframes bgTwinkle {
          0%, 100% { opacity: 0.18; }
          50%       { opacity: 0.75; }
        }
        @keyframes starPulse {
          0%, 100% { transform: translate(-50%,-50%) scale(1); }
          50%       { transform: translate(-50%,-50%) scale(1.28); }
        }
        @keyframes starShake {
          0%,100% { transform: translate(-50%,-50%) rotate(0deg); }
          20%     { transform: translate(-50%,-50%) rotate(-14deg); }
          45%     { transform: translate(-50%,-50%) rotate(14deg); }
          65%     { transform: translate(-50%,-50%) rotate(-9deg); }
          82%     { transform: translate(-50%,-50%) rotate(9deg); }
        }
        @keyframes lineIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes animalIn {
          0%   { transform: translate(-50%,-50%) scale(0.1); opacity: 0; }
          55%  { transform: translate(-50%,-50%) scale(1.18); opacity: 1; }
          75%  { transform: translate(-50%,-50%) scale(0.94); opacity: 1; }
          88%  { transform: translate(-50%,-50%) scale(1.05); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(1);    opacity: 1; }
        }
      `}</style>

      {/* Background field stars */}
      {bgStars.current.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: '#ffffff',
            pointerEvents: 'none',
            animation: `bgTwinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* SVG line overlay — coordinate system matches CSS % positions */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {lines.map((ln, i) => {
          const a = stars.find(s => s.index === ln.from);
          const b = stars.find(s => s.index === ln.to);
          return (
            <line
              key={i}
              x1={a.x} y1={a.y}
              x2={b.x} y2={b.y}
              stroke={complete ? 'rgba(255,224,128,0.75)' : 'rgba(160,196,255,0.55)'}
              strokeWidth="0.6"
              strokeLinecap="round"
              style={{
                animation: 'lineIn 0.35s ease-out forwards',
                transition: 'stroke 0.4s ease',
              }}
            />
          );
        })}
      </svg>

      {/* Constellation stars — 64px tap target, sized visual dot */}
      {stars.map((star) => {
        const isActivated = activated.has(star.index);
        const isNext      = nextExpected === star.index;
        const isWrong     = wrongIdx === star.index;

        const sizeInfo = SIZE_MAP[star.size] || SIZE_MAP.md;
        const dotSize = isNext ? sizeInfo.dot + 4 : isActivated ? sizeInfo.dot + 2 : sizeInfo.dot;
        const starColor = star.color || '#ffffff';

        const glowColor = isActivated || isNext
          ? `${starColor}bb`
          : 'rgba(130,160,220,0.35)';
        const dotBg = isActivated || isNext
          ? `radial-gradient(circle at 38% 35%, #ffffff, ${starColor})`
          : 'radial-gradient(circle at 38% 35%, #c0cce8, #7088c0)';

        return (
          <div
            key={star.index}
            onPointerDown={() => handleStarTap(star.index)}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              touchAction: 'manipulation',
              zIndex: isNext ? 3 : 2,
              animation: isWrong
                ? 'starShake 0.5s ease'
                : isNext && !complete
                ? 'starPulse 1.6s ease-in-out infinite'
                : 'none',
            }}
          >
            <div
              style={{
                width: dotSize,
                height: dotSize,
                borderRadius: '50%',
                background: dotBg,
                boxShadow: isNext
                  ? `0 0 14px 5px ${glowColor}`
                  : isActivated
                  ? `0 0 10px 3px ${glowColor}`
                  : `0 0 5px 1px ${glowColor}`,
                pointerEvents: 'none',
                transition: 'width 0.25s ease, height 0.25s ease, box-shadow 0.25s ease',
              }}
            />
          </div>
        );
      })}

      {/* Animal emoji reveal on completion */}
      {complete && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            fontSize: '5.5rem',
            lineHeight: 1,
            zIndex: 10,
            pointerEvents: 'none',
            animation: 'animalIn 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
        >
          {animal}
        </div>
      )}
    </div>
  );
}
