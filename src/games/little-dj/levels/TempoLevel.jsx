import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { initAudio, sound } from '../audio';

const C = {
  nightSky: '#0f1b2d',
  nightMid: '#162544',
  nightEdge: '#1e3460',
  warmGlow: '#ffd666',
  coralGlow: '#E8AAAA',
};

const KEYFRAMES_ID = 'didit-tempo-level-keyframes';
const keyframesCSS = `
@keyframes twinkle{0%,100%{opacity:0.2}50%{opacity:0.8}}
@keyframes beatBounce{0%{transform:translateY(0)}30%{transform:translateY(-8px)}60%{transform:translateY(0)}100%{transform:translateY(0)}}
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

function getEmoji(bpm) {
  if (bpm <= 60) return '🐌';
  if (bpm <= 90) return '🐢';
  if (bpm <= 130) return '🚶';
  if (bpm <= 180) return '🏃';
  return '🚀';
}

/* Should this emoji be flipped to face right? */
function shouldFlip(bpm) {
  if (bpm <= 60) return false;   // 🐌 already faces right
  if (bpm <= 90) return true;    // 🐢 flip
  if (bpm <= 130) return true;   // 🚶 flip
  if (bpm <= 180) return true;   // 🏃 flip
  return false;                  // 🚀 already faces right
}

function getLabel(bpm) {
  if (bpm <= 60) return 'Super slow';
  if (bpm <= 90) return 'Slow';
  if (bpm <= 130) return 'Medium';
  if (bpm <= 180) return 'Fast';
  return 'Super fast';
}

function getStepSize(bpm) {
  if (bpm <= 80) return 3;
  if (bpm <= 150) return 6;
  return 10;
}

export default function TempoLevel({ onMilestone }) {
  const [pct, setPct] = useState(0.1);
  const changesRef = useRef(0);
  const milestoneFired = useRef(false);

  const bpm = Math.round(30 + pct * 200);
  const emoji = getEmoji(bpm);
  const flip = shouldFlip(bpm);
  const label = getLabel(bpm);
  const interacted = changesRef.current > 0;

  /* Beat-synced state */
  const [charPos, setCharPos] = useState(0);
  const [beatKey, setBeatKey] = useState(0);
  const intervalRef = useRef(null);
  const posRef = useRef(0);
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  useEffect(() => {
    injectKeyframes();
  }, []);

  /* Beat interval — fires kick, advances emoji */
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const ms = 60000 / bpm;
    intervalRef.current = setInterval(() => {
      initAudio();
      sound.kick();

      /* Advance emoji position */
      const step = getStepSize(bpmRef.current);
      posRef.current += step;
      if (posRef.current > 100) posRef.current = 0;
      setCharPos(posRef.current);

      /* Beat bounce */
      setBeatKey((k) => k + 1);
    }, ms);

    return () => clearInterval(intervalRef.current);
  }, [bpm]);

  const handleSlider = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
      const newPct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setPct(newPct);
      changesRef.current += 1;
      if (changesRef.current >= 6 && !milestoneFired.current) {
        milestoneFired.current = true;
        onMilestone(50, 50);
      }
    },
    [onMilestone]
  );

  const interval = 60000 / bpm;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        flex: 1,
        justifyContent: 'center',
        width: '100%',
      }}
    >
      {/* Scene card */}
      <div
        style={{
          width: 320,
          height: 340,
          borderRadius: 18,
          position: 'relative',
          overflow: 'hidden',
          background: interacted
            ? `radial-gradient(ellipse at 50% 35%, rgba(255,107,107,0.15), ${C.nightSky} 70%)`
            : C.nightSky,
          border: `3px solid ${interacted ? 'rgba(207,74,74,0.4)' : C.nightEdge}`,
          boxShadow: 'none',
          transition: 'all 0.6s ease',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Starfield />

        {/* Runway — static white background, no flicker */}
        <div
          style={{
            width: '85%',
            height: 80,
            position: 'relative',
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.08)',
            zIndex: 2,
          }}
        >
          {/* Ground line */}
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: 0,
              right: 0,
              height: 2,
              background: 'rgba(255,255,255,0.08)',
            }}
          />
          {/* Emoji — walks on beat, bounces on each tick */}
          <div
            key={beatKey}
            style={{
              position: 'absolute',
              bottom: 12,
              left: `${charPos}%`,
              transform: 'translateX(-50%)',
              transition: 'left 0.1s linear',
              animation: `beatBounce ${interval}ms ease-out forwards`,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                transform: flip ? 'scaleX(-1)' : 'scaleX(1)',
                fontSize: 34,
              }}
            >
              {emoji}
            </span>
          </div>
        </div>

        {/* Label */}
        <div
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            fontFamily: "'Nunito', sans-serif",
            color: '#FFFFFF',
            zIndex: 2,
            marginTop: 28,
            transition: 'all 0.3s',
            textAlign: 'center',
          }}
        >
          {label}
          <div style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.6)',
            marginTop: 2,
          }}>
            {bpm} BPM
          </div>
        </div>
      </div>

      {/* Slider (outside card) */}
      <div style={{ position: 'relative', width: '88%' }}>
        <div
          style={{
            width: '100%',
            height: 64,
            background: 'rgba(0,0,0,0.04)',
            borderRadius: 32,
            position: 'relative',
            border: '2px solid color-mix(in srgb, var(--game-primary) 30%, transparent)',
            cursor: 'pointer',
            touchAction: 'none',
            overflow: 'hidden',
          }}
          onPointerDown={handleSlider}
          onPointerMove={(e) => {
            if (e.buttons > 0) handleSlider(e);
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${pct * 100}%`,
              background: 'linear-gradient(90deg, var(--game-primary), var(--game-accent))',
              borderRadius: 32,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: `${pct * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: '#8B1A1A',
              boxShadow: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.75rem',
              opacity: 0.4,
              pointerEvents: 'none',
            }}
          >
            🐌
          </div>
          <div
            style={{
              position: 'absolute',
              right: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.75rem',
              opacity: 0.4,
              pointerEvents: 'none',
            }}
          >
            🚀
          </div>
        </div>
      </div>

    </div>
  );
}
