import { useState, useEffect, useRef, useMemo } from 'react';
import { initAudio, sound } from '../audio';

const C = {
  nightSky: '#0f1b2d',
  nightEdge: '#1e3460',
};

const KEYFRAMES_ID = 'didit-instrument-level-keyframes';
const keyframesCSS = `
@keyframes twinkle{0%,100%{opacity:0.2}50%{opacity:0.8}}
@keyframes wrongShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
@keyframes correctPop{0%{transform:scale(1)}50%{transform:scale(1.18)}100%{transform:scale(1)}}
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

const INSTRUMENTS = [
  { id: 'piano',   emoji: '🎹', name: 'Piano',   play: () => sound.piano() },
  { id: 'guitar',  emoji: '🎸', name: 'Guitar',  play: () => sound.guitar() },
  { id: 'drum',    emoji: '🥁', name: 'Drum',    play: () => sound.kick() },
  { id: 'trumpet', emoji: '🎺', name: 'Trumpet', play: () => sound.trumpet() },
];

export default function InstrumentLevel({ onMilestone }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentIdxRef = useRef(0);
  const [phase, setPhase] = useState('listening');
  const [score, setScore] = useState(0);
  const [wrongIdx, setWrongIdx] = useState(null);
  const [pressedIdx, setPressedIdx] = useState(null);
  const milestoneFired = useRef(false);

  const pickNext = () => {
    const idx = Math.floor(Math.random() * INSTRUMENTS.length);
    currentIdxRef.current = idx;
    setCurrentIdx(idx);
    setPhase('listening');
    setWrongIdx(null);
  };

  const playSound = () => {
    initAudio();
    INSTRUMENTS[currentIdxRef.current].play();
    setPhase('guessing');
  };

  const replaySound = () => {
    initAudio();
    INSTRUMENTS[currentIdxRef.current].play();
  };

  const handleGuess = (idx) => {
    if (phase !== 'guessing') return;
    if (idx === currentIdxRef.current) {
      setPhase('correct');
      setScore((prev) => {
        const next = prev + 1;
        if (next >= 3 && !milestoneFired.current) {
          milestoneFired.current = true;
          setTimeout(() => onMilestone(50, 30), 400);
        }
        return next;
      });
      setTimeout(() => { pickNext(); setTimeout(playSound, 300); }, 1500);
    } else {
      setPhase('wrong');
      setWrongIdx(idx);
      setTimeout(() => {
        setPhase('guessing');
        setWrongIdx(null);
        INSTRUMENTS[currentIdxRef.current].play();
      }, 900);
    }
  };

  useEffect(() => {
    injectKeyframes();
    const idx = Math.floor(Math.random() * INSTRUMENTS.length);
    currentIdxRef.current = idx;
    setCurrentIdx(idx);
    setPhase('listening');
    const t = setTimeout(() => {
      initAudio();
      INSTRUMENTS[idx].play();
      setPhase('guessing');
    }, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ display: 'flex', flex: 1, width: '100%', alignItems: 'center' }}>
      <div
        style={{
          width: 320,
          height: 340,
          position: 'relative',
          overflow: 'hidden',
          background: C.nightSky,
          border: `3px solid ${score > 0 ? 'rgba(207,74,74,0.4)' : C.nightEdge}`,
          borderRadius: 18,
          margin: '0 auto',
          transition: 'border-color 0.4s ease',
        }}
      >
        <Starfield />

        {/* Score dots */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            zIndex: 2,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: i < score ? 'var(--game-primary)' : 'rgba(255,255,255,0.2)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* Mystery instrument display */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontSize: 72,
              lineHeight: 1,
              filter: phase === 'correct' ? 'none' : 'blur(2px) brightness(0.3)',
            }}
          >
            {phase === 'correct' ? INSTRUMENTS[currentIdx].emoji : '🎵'}
          </div>
          <button
            onClick={() => { initAudio(); replaySound(); }}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1.5px solid rgba(255,255,255,0.25)',
              borderRadius: 20,
              padding: '6px 16px',
              color: 'rgba(255,255,255,0.8)',
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            {phase === 'listening' ? '🔊 Playing...' : '🔊 Play again'}
          </button>
        </div>

        {/* 4 instrument buttons — 2x2 grid */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            zIndex: 2,
          }}
        >
          {INSTRUMENTS.map((inst, i) => {
            const isCorrect = phase === 'correct' && i === currentIdx;
            const isWrong = phase === 'wrong' && i === wrongIdx;
            const isPressed = pressedIdx === i;
            return (
              <button
                key={inst.id}
                onPointerDown={() => { setPressedIdx(i); handleGuess(i); }}
                onPointerUp={() => setPressedIdx(null)}
                onPointerLeave={() => setPressedIdx(null)}
                style={{
                  height: 70,
                  borderRadius: 14,
                  border: `2px solid ${isCorrect ? '#1DD1A1' : isWrong ? '#FF6B6B' : 'rgba(255,255,255,0.15)'}`,
                  background: isCorrect ? 'rgba(29,209,161,0.2)' : isWrong ? 'rgba(255,107,107,0.2)' : 'rgba(255,255,255,0.07)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  transform: isPressed ? 'scale(0.94)' : 'scale(1)',
                  transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  animation: isCorrect ? 'correctPop 0.4s ease-out' : isWrong ? 'wrongShake 0.5s ease-out' : 'none',
                }}
              >
                <span style={{ fontSize: 28, lineHeight: 1 }}>{inst.emoji}</span>
                <span
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    color: isCorrect ? '#1DD1A1' : isWrong ? '#FF6B6B' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {inst.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
