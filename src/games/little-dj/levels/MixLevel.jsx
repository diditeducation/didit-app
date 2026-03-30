import { useState, useEffect, useRef, useMemo } from 'react';
import { initAudio, sound } from '../audio';

const C = {
  nightSky: '#0f1b2d',
  nightMid: '#162544',
  nightEdge: '#1e3460',
  warmGlow: '#ffd666',
  coralGlow: '#E8AAAA',
};

const KEYFRAMES_ID = 'didit-mix-level-keyframes';
const keyframesCSS = `
@keyframes twinkle{0%,100%{opacity:0.2}50%{opacity:0.8}}
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

const LAYER_DATA = [
  { id: 'kick',    icon: '🥁', name: 'Kick Drum' },
  { id: 'hihat',   icon: '🎩', name: 'Hi-Hat' },
  { id: 'melody',  icon: '🎹', name: 'Melody' },
];

export default function MixLevel({ onMilestone }) {
  const [active, setActive] = useState({});
  const [pressedId, setPressedId] = useState(null);
  const intervalRef = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const milestoneFired = useRef(false);

  const activeCount = Object.keys(active).filter((k) => active[k]).length;

  useEffect(() => {
    injectKeyframes();
  }, []);

  const toggle = (id) => {
    initAudio();
    setActive((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      const count = Object.keys(next).filter((k) => next[k]).length;
      if (count >= 2 && !milestoneFired.current) {
        milestoneFired.current = true;
        setTimeout(() => onMilestone(50, 30), 400);
      }
      return next;
    });
  };

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (activeCount === 0) return;
    const ms = (60 / 100) * 1000;
    let beat = 0;
    intervalRef.current = setInterval(() => {
      const a = activeRef.current;
      if (a.kick) sound.kick();
      if (a.hihat) sound.hihat();
      if (a.snare && (beat === 1 || beat === 3)) sound.snare();
      if (a.bass) {
        const notes = [0, 0, 5, 3];
        sound.bass(notes[beat]);
      }
      if (a.melody) sound.melody();
      beat = (beat + 1) % 4;
    }, ms);
    return () => clearInterval(intervalRef.current);
  }, [activeCount]);

  const isGlowing = activeCount > 0;

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
          width: 320,
          height: 340,
          borderRadius: 18,
          position: 'relative',
          overflow: 'hidden',
          background: C.nightSky,
          border: `3px solid ${isGlowing ? 'rgba(207,74,74,0.4)' : C.nightEdge}`,
          boxShadow: 'none',
          transition: 'all 0.6s ease',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        <Starfield />

        {/* Layer rows — flex fill the full card height */}
        {LAYER_DATA.map((layer) => {
          const on = !!active[layer.id];
          const isPressed = pressedId === layer.id;
          return (
            <div
              key={layer.id}
              onPointerDown={() => {
                setPressedId(layer.id);
                toggle(layer.id);
              }}
              onPointerUp={() => setPressedId(null)}
              onPointerLeave={() => setPressedId(null)}
              style={{
                flex: 1,
                width: '100%',
                minHeight: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                background: 'transparent',
                borderLeft: on ? '3px solid var(--game-primary)' : '3px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.3s',
                userSelect: 'none',
                boxSizing: 'border-box',
                zIndex: 2,
                transform: isPressed ? 'scale(0.97)' : 'scale(1)',
                position: 'relative',
              }}
            >
              {/* Icon + Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 40, flexShrink: 0, lineHeight: 1 }}>
                  {layer.icon}
                </span>
                <span
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    fontFamily: "'Nunito', sans-serif",
                    color: on ? '#fff' : 'rgba(255,255,255,0.5)',
                    transition: 'color 0.3s',
                  }}
                >
                  {layer.name}
                </span>
              </div>

              {/* Rounded pressable button */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: on ? 'var(--game-primary)' : 'rgba(255,255,255,0.12)',
                  border: on ? '2px solid rgba(255,255,255,0.35)' : '2px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: isPressed ? 'scale(0.88)' : on ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: on ? '0 0 12px rgba(255,107,107,0.45)' : 'none',
                }}
              >
                <span style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 900,
                  fontSize: '0.65rem',
                  color: on ? '#fff' : 'rgba(255,255,255,0.35)',
                  letterSpacing: '0.06em',
                  transition: 'color 0.2s',
                }}>
                  {on ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
