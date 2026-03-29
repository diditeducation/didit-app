import { useState, useEffect, useRef, useMemo } from 'react';
import { initAudio, sound } from '../audio';

const C = {
  nightSky: '#0f1b2d',
  nightMid: '#162544',
  nightEdge: '#1e3460',
  warmGlow: '#ffd666',
  coralGlow: '#E8AAAA',
};

const KEYFRAMES_ID = 'didit-pitch-level-keyframes';
const keyframesCSS = `
@keyframes twinkle{0%,100%{opacity:0.2}50%{opacity:0.8}}
@keyframes animalBounce{0%{transform:scale(0.97) scaleY(0.94)}50%{transform:scale(1.02) scaleY(1.03)}100%{transform:scale(1) scaleY(1)}}
@keyframes emojiJump{0%{transform:translateY(0) scale(1)}40%{transform:translateY(-10px) scale(1.2)}100%{transform:translateY(0) scale(1)}}
@keyframes soundBar1{0%,100%{height:4px}50%{height:16px}}
@keyframes soundBar2{0%,100%{height:4px}50%{height:16px}}
@keyframes soundBar3{0%,100%{height:4px}50%{height:16px}}
`;

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = keyframesCSS;
  document.head.appendChild(style);
}

/* ── Starfield ── */
const Starfield = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 70,
        size: 1.5 + Math.random() * 1.5,
        delay: Math.random() * 3,
        dur: 2.5 + Math.random() * 2,
      })),
    []
  );
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: '#fff',
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          background: 'linear-gradient(to top, #0a1220, transparent)',
        }}
      />
    </div>
  );
};

/* ── Sound Bars indicator ── */
const SoundBars = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 16 }}>
    {[0.4, 0.6, 0.5].map((dur, i) => (
      <div
        key={i}
        style={{
          width: 3,
          height: 4,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.8)',
          animation: `soundBar${i + 1} ${dur}s ease-in-out infinite`,
        }}
      />
    ))}
  </div>
);

/* Ordered highest pitch → lowest pitch (top → bottom) */
const LADDER = [
  { emoji: '🐭', freq: 1400, size: 24, color: '#E8AAAA' },
  { emoji: '🐦', freq: 880,  size: 28, color: '#FF9F43' },
  { emoji: '🐱', freq: 520,  size: 32, color: '#F2DCA0' },
  { emoji: '🐕', freq: 320,  size: 36, color: '#BEE060' },
  { emoji: '🦁', freq: 160,  size: 42, color: '#9BB5E8' },
  { emoji: '🐘', freq: 80,   size: 48, color: '#9B59B6' },
];

export default function PitchLevel({ onMilestone }) {
  const [activeIdx, setActiveIdx] = useState(null);
  const [tappedSet, setTappedSet] = useState(new Set());
  const [pressedIdx, setPressedIdx] = useState(null);
  const [bounceIdx, setBounceIdx] = useState(null);
  const [jumpKeys, setJumpKeys] = useState({});
  const milestoneFired = useRef(false);

  useEffect(() => {
    injectKeyframes();
  }, []);

  const handleTap = (idx) => {
    initAudio();
    sound.pitchTone(LADDER[idx].freq);
    setActiveIdx(idx);

    /* Trigger emoji jump with unique key */
    setJumpKeys((prev) => ({ ...prev, [idx]: (prev[idx] || 0) + 1 }));

    /* Trigger bounce animation on release */
    setBounceIdx(idx);
    setTimeout(() => setBounceIdx(null), 250);

    setTimeout(() => setActiveIdx(null), 600);

    setTappedSet((prev) => {
      const next = new Set(prev);
      next.add(idx);
      if (next.size === 6 && !milestoneFired.current) {
        milestoneFired.current = true;
        onMilestone(50, 30);
      }
      return next;
    });
  };

  const isGlowing = activeIdx !== null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        flex: 1,
        width: '100%',
      }}
    >
      {/* Scene card */}
      <div
        style={{
          flex: 0.8,
          width: '80%',
          maxWidth: 340,
          minHeight: 200,
          borderRadius: 18,
          position: 'relative',
          overflow: 'hidden',
          background: isGlowing
            ? `radial-gradient(ellipse at 50% 35%, rgba(255,107,107,0.15), ${C.nightSky} 70%)`
            : C.nightSky,
          border: `3px solid #CF4A4A`,
          boxShadow: 'none',
          transition: 'all 0.6s ease',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        <Starfield />

        {/* Vertical ladder — highest pitch at top, lowest at bottom */}
        {LADDER.map((item, idx) => {
          const isActive = activeIdx === idx;
          const isPressed = pressedIdx === idx;
          const isBouncing = bounceIdx === idx;
          const isFirst = idx === 0;
          const isLast = idx === LADDER.length - 1;

          /* Row transform: pressed squish, bounce animation, or default */
          let rowTransform = 'scale(1) scaleY(1)';
          let rowAnimation = 'none';
          if (isPressed) {
            rowTransform = 'scale(0.97) scaleY(0.94)';
          } else if (isBouncing) {
            rowAnimation = 'animalBounce 0.25s ease-out';
          }

          /* Border radius: first/last get rounded corners */
          let borderRadius = '0';
          if (isFirst) borderRadius = '18px 18px 0 0';
          if (isLast) borderRadius = '0 0 18px 18px';

          return (
            <div
              key={idx}
              onPointerDown={() => {
                setPressedIdx(idx);
                handleTap(idx);
              }}
              onPointerUp={() => setPressedIdx(null)}
              onPointerLeave={() => setPressedIdx(null)}
              style={{
                flex: 1,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                borderRadius,
                borderBottom: isLast
                  ? 'none'
                  : '1px solid rgba(0,0,0,0.1)',
                background: item.color,
                opacity: 1,
                boxShadow: 'none',
                cursor: 'pointer',
                userSelect: 'none',
                position: 'relative',
                zIndex: 2,
                overflow: 'hidden',
                border: 'none',
                transition: isPressed
                  ? 'transform 0.08s ease-in, opacity 0.2s'
                  : 'opacity 0.2s',
                transform: rowTransform,
                animation: rowAnimation,
              }}
            >
              {/* Emoji with jump animation */}
              <span
                key={jumpKeys[idx] || 0}
                style={{
                  fontSize: item.size,
                  lineHeight: 1,
                  animation: isActive ? 'emojiJump 0.4s ease-out' : 'none',
                }}
              >
                {item.emoji}
              </span>

              {/* Sound bars — visible while tone is playing */}
              {isActive && <SoundBars />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
