import { useState, useEffect, useRef, useMemo } from 'react';
import { initAudio, sound } from '../audio';

const C = {
  nightSky: '#0f1b2d',
  nightEdge: '#1e3460',
};

const KEYFRAMES_ID = 'didit-solfeg-level-keyframes';
const keyframesCSS = `
@keyframes twinkle{0%,100%{opacity:0.2}50%{opacity:0.8}}
@keyframes noteLight{0%{transform:scale(0.6);opacity:0.3}60%{transform:scale(1.3)}100%{transform:scale(1);opacity:1}}
`;

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = keyframesCSS;
  document.head.appendChild(style);
}

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

// Treble clef staff lines at Y: [142,155,168,181,194] = F5,D5,B4,G4,E4 (top→bottom)
// Line spacing = 13px, half-step = 6.5px
// Do(C4)=ledger line below staff, Re=space below, Mi=line1, Fa=space1,
// Sol=line2, La=space2, Ti=line3(middle)
// noteX values match button centers (card 320px, padding 10px, gap 5px, 7 btns)
const SOLFEGE = [
  { name: 'Do',  freq: 261.63, color: '#FF6B6B', staffY: 207, noteX: 29  }, // ledger line below staff
  { name: 'Re',  freq: 293.66, color: '#FF9F43', staffY: 201, noteX: 73  }, // space below line 1
  { name: 'Mi',  freq: 329.63, color: '#FECA57', staffY: 194, noteX: 116 }, // line 1 (E4)
  { name: 'Fa',  freq: 349.23, color: '#48DBFB', staffY: 188, noteX: 160 }, // space 1 (F4)
  { name: 'Sol', freq: 392.00, color: '#1DD1A1', staffY: 181, noteX: 204 }, // line 2 (G4)
  { name: 'La',  freq: 440.00, color: '#54A0FF', staffY: 175, noteX: 247 }, // space 2 (A4)
  { name: 'Ti',  freq: 493.88, color: '#C8A2FF', staffY: 168, noteX: 291 }, // line 3 (B4)
];

const STAFF_LINE_YS = [142, 155, 168, 181, 194];

export default function SolfegLevel({ onMilestone }) {
  const [tapped, setTapped] = useState(new Set());
  const [pressedIdx, setPressedIdx] = useState(null);
  const [animKeys, setAnimKeys] = useState({});
  const milestoneFired = useRef(false);

  useEffect(() => {
    injectKeyframes();
  }, []);

  const handleTap = (idx) => {
    initAudio();
    sound.solfege(SOLFEGE[idx].freq);

    setAnimKeys((prev) => ({ ...prev, [idx]: (prev[idx] || 0) + 1 }));

    setTapped((prev) => {
      const next = new Set(prev);
      next.add(idx);
      if (next.size === 7 && !milestoneFired.current) {
        milestoneFired.current = true;
        setTimeout(() => onMilestone(50, 30), 400);
      }
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flex: 1, width: '100%', alignItems: 'center' }}>
      <div
        style={{
          width: 320,
          height: 340,
          position: 'relative',
          overflow: 'hidden',
          background: C.nightSky,
          border: `3px solid ${tapped.size > 0 ? 'rgba(207,74,74,0.4)' : C.nightEdge}`,
          borderRadius: 18,
          margin: '0 auto',
          transition: 'border-color 0.4s ease',
        }}
      >
        <Starfield />

        {/* Staff lines — span full button width */}
        {STAFF_LINE_YS.map((y, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 10,
              right: 10,
              top: y,
              height: 1.5,
              background: 'rgba(255,255,255,0.25)',
              zIndex: 2,
            }}
          />
        ))}
        {/* Ledger line for Do (C4 sits below the staff) */}
        <div style={{
          position: 'absolute',
          left: SOLFEGE[0].noteX - 10,
          width: 20,
          top: SOLFEGE[0].staffY,
          height: 1.5,
          background: 'rgba(255,255,255,0.35)',
          zIndex: 2,
        }} />

        {/* Note slots */}
        {SOLFEGE.map((note, i) => {
          const isTapped = tapped.has(i);
          const animKey = animKeys[i] || 0;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: note.noteX,
                top: note.staffY,
                transform: 'translate(-50%, -50%)',
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: isTapped ? note.color : 'rgba(255,255,255,0.15)',
                border: `1.5px solid ${isTapped ? note.color : 'rgba(255,255,255,0.25)'}`,
                zIndex: 3,
                transition: 'background 0.2s',
                animation: animKey > 0 ? `noteLight 0.35s ease-out` : 'none',
                boxShadow: isTapped ? `0 0 8px ${note.color}88` : 'none',
              }}
            />
          );
        })}

        {/* Buttons row */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            gap: 5,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 4,
            backdropFilter: 'blur(4px)',
          }}
        >
          {SOLFEGE.map((note, i) => {
            const isTapped = tapped.has(i);
            const isPressed = pressedIdx === i;
            return (
              <button
                key={i}
                onPointerDown={() => { setPressedIdx(i); handleTap(i); }}
                onPointerUp={() => setPressedIdx(null)}
                onPointerLeave={() => setPressedIdx(null)}
                style={{
                  flex: 1,
                  height: 56,
                  borderRadius: 10,
                  border: `2px solid ${isTapped ? note.color + 'aa' : 'rgba(255,255,255,0.15)'}`,
                  background: isTapped ? note.color + '25' : 'rgba(255,255,255,0.07)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  padding: 0,
                  transform: isPressed ? 'scale(0.9)' : 'scale(1)',
                  transition: 'all 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: isTapped ? note.color : 'rgba(255,255,255,0.3)',
                    transition: 'background 0.2s',
                  }}
                />
                <span
                  style={{
                    fontSize: '0.5rem',
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800,
                    color: isTapped ? note.color : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {note.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
