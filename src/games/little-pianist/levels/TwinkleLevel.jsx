import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { initAudio, sound } from '../audio';

const C = {
  nightSky: '#0f1b2d',
  nightEdge: '#1e3460',
};

const KEYFRAMES_ID = 'didit-twinkle-level-keyframes';
const keyframesCSS = `
@keyframes twinkle{0%,100%{opacity:0.2}50%{opacity:0.8}}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 6px currentColor}50%{box-shadow:0 0 18px currentColor, 0 0 30px currentColor}}
@keyframes wrongShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
@keyframes nudgeBounce{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
@keyframes miniPop{0%{transform:translate(-50%,-50%) scale(0);opacity:1}100%{transform:translate(-50%,-50%) scale(1);opacity:0}}
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

const SOLFEGE = [
  { name: 'Do',  freq: 261.63, color: '#FF6B6B', staffY: 187, noteX: '8.7%'  },
  { name: 'Re',  freq: 293.66, color: '#FF9F43', staffY: 181, noteX: '22.4%' },
  { name: 'Mi',  freq: 329.63, color: '#FECA57', staffY: 174, noteX: '36.3%' },
  { name: 'Fa',  freq: 349.23, color: '#48DBFB', staffY: 168, noteX: '50%'   },
  { name: 'Sol', freq: 392.00, color: '#1DD1A1', staffY: 161, noteX: '63.7%' },
  { name: 'La',  freq: 440.00, color: '#54A0FF', staffY: 155, noteX: '77.6%' },
  { name: 'Ti',  freq: 493.88, color: '#C8A2FF', staffY: 148, noteX: '91.3%' },
];

// Twinkle Twinkle Little Star mapped to SOLFEGE indices
// Do Do Sol Sol La La Sol | Fa Fa Mi Mi Re Re Do
const MELODY = [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0];

const STAFF_LINE_YS = [122, 135, 148, 161, 174];

function MiniConfetti({ particles }) {
  return particles.map((p) => (
    <div
      key={p.id}
      style={{
        position: 'absolute',
        left: p.x,
        top: p.y,
        width: p.size,
        height: p.size,
        borderRadius: '50%',
        background: p.color,
        pointerEvents: 'none',
        zIndex: 10,
        animation: 'miniPop 0.5s ease-out forwards',
      }}
    />
  ));
}

export default function TwinkleLevel({ onMilestone }) {
  const [step, setStep] = useState(0);
  const [playedNotes, setPlayedNotes] = useState([]);
  const [pressedIdx, setPressedIdx] = useState(null);
  const [flashIdx, setFlashIdx] = useState(null);
  const [wrongIdx, setWrongIdx] = useState(null);
  const [particles, setParticles] = useState([]);
  const milestoneFired = useRef(false);
  const wrongTimer = useRef(null);
  const nextId = useRef(0);
  const cardRef = useRef(null);

  useEffect(() => {
    injectKeyframes();
  }, []);

  const done = step >= MELODY.length;
  const expectedIdx = done ? -1 : MELODY[step];
  const playedSet = useMemo(() => new Set(playedNotes), [playedNotes]);

  const spawnParticles = useCallback((btnEl, color) => {
    if (!cardRef.current || !btnEl) return;
    const cardRect = cardRef.current.getBoundingClientRect();
    const btnRect = btnEl.getBoundingClientRect();
    const cx = btnRect.left + btnRect.width / 2 - cardRect.left;
    const cy = btnRect.top + btnRect.height / 2 - cardRect.top;
    const newParticles = Array.from({ length: 8 }, () => ({
      id: nextId.current++,
      x: cx + (Math.random() - 0.5) * 60,
      y: cy + (Math.random() - 0.5) * 40,
      size: 4 + Math.random() * 6,
      color,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.includes(p)));
    }, 600);
  }, []);

  const handleTap = (idx, btnEl) => {
    initAudio();

    if (done) {
      sound.solfege(SOLFEGE[idx].freq);
      setFlashIdx(idx);
      setTimeout(() => setFlashIdx(null), 200);
      spawnParticles(btnEl, SOLFEGE[idx].color);
      return;
    }

    if (idx === expectedIdx) {
      sound.solfege(SOLFEGE[idx].freq);
      setFlashIdx(idx);
      setTimeout(() => setFlashIdx(null), 200);
      spawnParticles(btnEl, SOLFEGE[idx].color);
      const newPlayed = [...playedNotes, idx];
      setPlayedNotes(newPlayed);
      const nextStep = step + 1;
      setStep(nextStep);

      if (nextStep >= MELODY.length && !milestoneFired.current) {
        milestoneFired.current = true;
        setTimeout(() => onMilestone(50, 30), 400);
      }
    } else {
      setWrongIdx(idx);
      clearTimeout(wrongTimer.current);
      wrongTimer.current = setTimeout(() => setWrongIdx(null), 400);
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, width: '100%', alignItems: 'center' }}>
      <div
        ref={cardRef}
        style={{
          width: '100%',
          height: 400,
          position: 'relative',
          overflow: 'hidden',
          background: C.nightSky,
          border: `3px solid ${playedNotes.length > 0 ? 'rgba(207,74,74,0.4)' : C.nightEdge}`,
          borderRadius: 18,
          boxSizing: 'border-box',
          transition: 'border-color 0.4s ease',
        }}
      >
        <Starfield />
        <MiniConfetti particles={particles} />

        {/* Title */}
        <div style={{
          position: 'absolute',
          top: 14,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 5,
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 800,
          fontSize: '1.1rem',
          letterSpacing: 1,
          color: 'rgba(255,255,255,0.7)',
        }}>
          {'Twinkle Star'.split('').map((ch, i) => (
            <span
              key={i}
              style={{
                color: i < step
                  ? SOLFEGE[MELODY[i]]?.color ?? 'rgba(255,255,255,0.7)'
                  : 'rgba(255,255,255,0.3)',
                transition: 'color 0.3s',
              }}
            >
              {ch}
            </span>
          ))}
        </div>

        {/* Staff lines */}
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
        {/* Ledger line for Do */}
        <div style={{
          position: 'absolute',
          left: `calc(${SOLFEGE[0].noteX} - 10px)`,
          width: 20,
          top: SOLFEGE[0].staffY,
          height: 1.5,
          background: 'rgba(255,255,255,0.35)',
          zIndex: 2,
        }} />

        {/* Note dots on staff — stay colored once played */}
        {SOLFEGE.map((note, i) => {
          const hasBeenPlayed = playedSet.has(i) || done;
          const isTarget = i === expectedIdx;
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
                background: hasBeenPlayed ? note.color : isTarget ? 'rgba(255,255,255,0.3)' : 'transparent',
                border: `1.5px solid ${hasBeenPlayed ? note.color : isTarget ? 'rgba(255,255,255,0.4)' : 'transparent'}`,
                zIndex: 3,
                transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
                boxShadow: hasBeenPlayed ? `0 0 8px ${note.color}88` : 'none',
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
            height: 120,
            display: 'flex',
            alignItems: 'center',
            padding: '0 10px',
            gap: 6,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 4,
            backdropFilter: 'blur(4px)',
          }}
        >
          {SOLFEGE.map((note, i) => {
            const isPressed = pressedIdx === i;
            const isTarget = i === expectedIdx;
            const isWrong = wrongIdx === i;
            const isRepeat = isTarget && step > 0 && MELODY[step - 1] === MELODY[step];
            const isFlash = flashIdx === i;
            const showColor = isPressed || isFlash || done;
            return (
              <button
                key={i}
                onPointerDown={(e) => { if (isTarget || done) { setPressedIdx(i); handleTap(i, e.currentTarget); } }}
                onPointerUp={() => setPressedIdx(null)}
                onPointerLeave={() => setPressedIdx(null)}
                style={{
                  flex: 1,
                  height: 90,
                  borderRadius: 14,
                  border: 'none',
                  background: showColor ? note.color : '#555',
                  opacity: 1,
                  cursor: isTarget || done ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  padding: 0,
                  transition: 'background 0.15s',
                  color: note.color,
                  animation: isWrong
                    ? 'wrongShake 0.3s ease'
                    : isRepeat
                    ? 'nudgeBounce 0.6s ease-in-out infinite, pulseGlow 1s ease-in-out infinite'
                    : isTarget
                    ? 'pulseGlow 1s ease-in-out infinite'
                    : 'none',
                  outline: isTarget ? `3px solid #fff` : 'none',
                  outlineOffset: isTarget ? 2 : 0,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: showColor ? '#fff' : 'rgba(255,255,255,0.4)',
                  }}
                />
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800,
                    color: showColor ? '#fff' : 'rgba(255,255,255,0.4)',
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
