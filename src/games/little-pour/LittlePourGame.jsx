import { useState, useRef, useEffect, useCallback } from 'react';
import { initAudio, sound } from './audio';

export const LEVELS = [
  { total: 4,  rounds: [[2,2],[3,1],[1,3]] },
  { total: 5,  rounds: [[1,4],[2,3],[3,2]] },
  { total: 6,  rounds: [[1,5],[2,4],[3,3]] },
  { total: 10, rounds: [[4,6],[5,5],[7,3],[3,7]] },
];

const KEYFRAMES_ID = 'didit-little-pour-keyframes';

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes jarShake {
      0%   { transform: rotate(0deg); }
      20%  { transform: rotate(-6deg); }
      40%  { transform: rotate(6deg); }
      60%  { transform: rotate(-4deg); }
      80%  { transform: rotate(4deg); }
      100% { transform: rotate(0deg); }
    }
    @keyframes ballFly {
      0%   { transform: translate(0,0) scale(1); opacity: 1; }
      50%  { transform: translate(var(--fly-x), calc(var(--fly-y) * 0.4 - 40px)) scale(0.85); opacity: 0.9; }
      100% { transform: translate(var(--fly-x), var(--fly-y)) scale(0.7); opacity: 0; }
    }
    @keyframes jarGlow {
      0%, 100% { filter: drop-shadow(0 0 6px rgba(107,143,216,0.5)); }
      50%       { filter: drop-shadow(0 0 18px rgba(107,143,216,0.9)); }
    }
    @keyframes pourBounce {
      0%   { transform: scale(1); }
      40%  { transform: scale(1.08); }
      70%  { transform: scale(0.96); }
      100% { transform: scale(1); }
    }
  `;
  document.head.appendChild(style);
}

// Small jar SVG — 60x130 viewBox
function JarSVG({ ballCount, maxBalls, color, lidColor, poured, onClick, shake }) {
  const balls = [];
  for (let i = 0; i < ballCount; i++) {
    const cx = 30;
    const cy = 108 - i * 22;
    balls.push(<circle key={i} cx={cx} cy={cy} r={9} fill={color} opacity={0.92} />);
  }

  return (
    <svg
      viewBox="0 0 60 130"
      width={60}
      height={130}
      style={{
        cursor: poured ? 'default' : 'pointer',
        opacity: poured ? 0.3 : 1,
        transition: 'opacity 0.4s ease',
        animation: shake ? 'jarShake 0.4s' : undefined,
        overflow: 'visible',
      }}
      onClick={poured ? undefined : onClick}
    >
      {/* Jar body */}
      <path
        d="M 8 110 Q 8 125 30 125 Q 52 125 52 110 L 52 30 Q 52 20 30 20 Q 8 20 8 30 Z"
        fill="rgba(200,220,255,0.22)"
        stroke="rgba(107,143,216,0.5)"
        strokeWidth={2}
      />
      {/* Lid */}
      <rect x={5} y={15} width={50} height={13} rx={4} ry={4} fill={lidColor} opacity={0.9} />
      {/* Lid highlight */}
      <rect x={8} y={17} width={44} height={4} rx={2} ry={2} fill="rgba(255,255,255,0.35)" />
      {/* Glass shine */}
      <line x1={14} y1={32} x2={14} y2={108} stroke="white" strokeWidth={3} opacity={0.25} strokeLinecap="round" />
      {/* Balls */}
      {balls}
    </svg>
  );
}

// Big jar SVG — 80x170 viewBox
function BigJarSVG({ ballCount, maxBalls, ghostCount, glowing, ballColor }) {
  const balls = [];
  for (let i = 0; i < ballCount; i++) {
    const cx = 40;
    const cy = 148 - i * 24;
    balls.push(
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r={11}
        fill={ballColor || '#6B8FD8'}
        opacity={0.92}
        style={{ animation: 'pourBounce 0.25s ease-out' }}
      />
    );
  }

  // Ghost outlines — show where the remaining balls will go
  const ghosts = [];
  for (let i = 0; i < ghostCount; i++) {
    const idx = ballCount + i;
    const cx = 40;
    const cy = 148 - idx * 24;
    if (cy > 40) {
      ghosts.push(
        <circle
          key={`ghost-${i}`}
          cx={cx}
          cy={cy}
          r={11}
          fill="none"
          stroke="rgba(107,143,216,0.3)"
          strokeWidth={2}
          strokeDasharray="4 3"
        />
      );
    }
  }

  return (
    <svg
      viewBox="0 0 80 170"
      width={80}
      height={170}
      style={{
        overflow: 'visible',
        filter: glowing
          ? 'drop-shadow(0 0 12px rgba(107,143,216,0.7))'
          : undefined,
        transition: 'filter 0.3s ease',
        animation: glowing ? 'jarGlow 1.2s ease-in-out infinite' : undefined,
      }}
    >
      {/* Jar body */}
      <path
        d="M 10 145 Q 10 162 40 162 Q 70 162 70 145 L 70 35 L 10 35 Z"
        fill="rgba(200,220,255,0.22)"
        stroke="rgba(107,143,216,0.6)"
        strokeWidth={2.5}
      />
      {/* Lid */}
      <rect x={6} y={22} width={68} height={16} rx={5} ry={5} fill="#9A8F82" opacity={0.9} />
      {/* Lid highlight */}
      <rect x={10} y={24} width={60} height={5} rx={2.5} ry={2.5} fill="rgba(255,255,255,0.3)" />
      {/* Glass shine */}
      <line x1={18} y1={40} x2={18} y2={140} stroke="white" strokeWidth={4} opacity={0.2} strokeLinecap="round" />
      {/* Faint total number in center */}
      <text
        x={40}
        y={105}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={52}
        fontWeight={900}
        fontFamily="Nunito, sans-serif"
        fill="rgba(107,143,216,0.18)"
      >
        {maxBalls}
      </text>
      {/* Ghost circles */}
      {ghosts}
      {/* Balls */}
      {balls}
    </svg>
  );
}

export default function LittlePourGame({ levelDef, onLevelComplete, onMilestone }) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [leftPoured, setLeftPoured] = useState(false);
  const [rightPoured, setRightPoured] = useState(false);
  const [bigBalls, setBigBalls] = useState(0);
  const [glowing, setGlowing] = useState(false);
  const [droppingBalls, setDroppingBalls] = useState([]);
  const [shakeLeft, setShakeLeft] = useState(false);
  const [shakeRight, setShakeRight] = useState(false);

  const leftJarRef = useRef(null);
  const rightJarRef = useRef(null);
  const bigJarRef = useRef(null);
  const busyRef = useRef(false);
  const dropIdRef = useRef(0);

  useEffect(() => {
    injectKeyframes();
  }, []);

  const rounds = levelDef.rounds;
  const round = rounds[roundIdx];
  const [leftCount, rightCount] = round;
  const total = levelDef.total;

  // Reset round state when roundIdx changes
  useEffect(() => {
    setLeftPoured(false);
    setRightPoured(false);
    setBigBalls(0);
    setGlowing(false);
    setDroppingBalls([]);
    busyRef.current = false;
  }, [roundIdx, levelDef]);

  const getJarCenter = (ref) => {
    if (!ref.current) return { x: 0, y: 0 };
    const rect = ref.current.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  };

  const getBigJarCenter = () => {
    if (!bigJarRef.current) return { x: 0, y: 0 };
    const rect = bigJarRef.current.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height * 0.65,
    };
  };

  const pourBalls = useCallback((count, fromRef, isLeft) => {
    if (busyRef.current) return;
    if (isLeft && leftPoured) return;
    if (!isLeft && rightPoured) return;

    initAudio();
    sound.tap();

    if (isLeft) {
      setShakeLeft(true);
      setTimeout(() => setShakeLeft(false), 450);
      setLeftPoured(true);
    } else {
      setShakeRight(true);
      setTimeout(() => setShakeRight(false), 450);
      setRightPoured(true);
    }

    const fromPos = getJarCenter(fromRef);
    const toPos = getBigJarCenter();

    // Create flying ball dots
    const newDrops = [];
    for (let i = 0; i < count; i++) {
      const id = ++dropIdRef.current;
      const flyX = toPos.x - fromPos.x;
      const flyY = toPos.y - fromPos.y;
      newDrops.push({
        id,
        x: fromPos.x,
        y: fromPos.y,
        flyX,
        flyY,
        delay: i * 90,
        color: isLeft ? '#4CC830' : '#3A6CE5',
      });
    }
    setDroppingBalls(prev => [...prev, ...newDrops]);

    // Add balls to big jar one by one
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        setBigBalls(prev => prev + 1);
        sound.plop(0);
      }, i * 90 + 120);
    }

    // Remove flying balls after animation
    setTimeout(() => {
      const ids = new Set(newDrops.map(d => d.id));
      setDroppingBalls(prev => prev.filter(d => !ids.has(d.id)));
    }, count * 90 + 500);

    // After all balls settled, check completion
    const delay = count * 90 + 250;
    setTimeout(() => {
      const bothPoured = isLeft
        ? (rightPoured || rightCount === 0)
        : (leftPoured || leftCount === 0);

      if (bothPoured) {
        completePour();
      }
    }, delay);
  }, [leftPoured, rightPoured, leftCount, rightCount, roundIdx]);

  const checkBothPoured = useCallback((lp, rp) => {
    if (lp && rp) {
      completePour();
    }
  }, [roundIdx]);

  const completePour = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;

    setTimeout(() => {
      setGlowing(true);
      sound.fill();
      initAudio();
    }, 100);

    setTimeout(() => {
      sound.chime();
      if (onMilestone) onMilestone(50, 50);
    }, 400);

    setTimeout(() => {
      setGlowing(false);
      busyRef.current = false;

      if (roundIdx + 1 >= rounds.length) {
        // Level complete
        onLevelComplete();
      } else {
        setRoundIdx(prev => prev + 1);
      }
    }, 1400);
  }, [roundIdx, rounds, onLevelComplete, onMilestone]);

  // Whenever leftPoured or rightPoured changes, check if both done
  useEffect(() => {
    if (leftPoured && rightPoured && !busyRef.current) {
      completePour();
    }
  }, [leftPoured, rightPoured]);

  // Ghost count = total - bigBalls (remaining spaces for balls not yet in big jar)
  const leftRemaining = leftPoured ? 0 : leftCount;
  const rightRemaining = rightPoured ? 0 : rightCount;
  const ghostCount = leftRemaining + rightRemaining;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24, gap: 32, width: '100%', position: 'relative', userSelect: 'none' }}>

      {/* Small jars row */}
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 24 }}>
        {/* Left jar */}
        <div
          ref={leftJarRef}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: leftPoured ? 'default' : 'pointer' }}
          onClick={() => !leftPoured && !busyRef.current && pourBalls(leftCount, leftJarRef, true)}
        >
          <JarSVG
            ballCount={leftPoured ? 0 : leftCount}
            maxBalls={leftCount}
            color="#4CC830"
            lidColor="#4CC830"
            poured={leftPoured}
            shake={shakeLeft}
            onClick={() => !leftPoured && !busyRef.current && pourBalls(leftCount, leftJarRef, true)}
          />
        </div>

        {/* Right jar */}
        <div
          ref={rightJarRef}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: rightPoured ? 'default' : 'pointer' }}
          onClick={() => !rightPoured && !busyRef.current && pourBalls(rightCount, rightJarRef, false)}
        >
          <JarSVG
            ballCount={rightPoured ? 0 : rightCount}
            maxBalls={rightCount}
            color="#3A6CE5"
            lidColor="#3A6CE5"
            poured={rightPoured}
            shake={shakeRight}
            onClick={() => !rightPoured && !busyRef.current && pourBalls(rightCount, rightJarRef, false)}
          />
        </div>
      </div>

      {/* Arrow down */}
      <div style={{ color: 'rgba(107,143,216,0.5)', fontSize: '1.5rem', marginTop: -16, marginBottom: -16 }}>
        ↓
      </div>

      {/* Big jar */}
      <div ref={bigJarRef} style={{ display: 'flex', justifyContent: 'center' }}>
        <BigJarSVG
          ballCount={bigBalls}
          maxBalls={total}
          ghostCount={ghostCount}
          glowing={glowing}
          ballColor="#6B8FD8"
        />
      </div>

      {/* Flying ball dots overlay */}
      {droppingBalls.map(drop => (
        <div
          key={drop.id}
          style={{
            position: 'fixed',
            left: drop.x - 9,
            top: drop.y - 9,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: drop.color,
            pointerEvents: 'none',
            zIndex: 500,
            '--fly-x': `${drop.flyX}px`,
            '--fly-y': `${drop.flyY}px`,
            animationName: 'ballFly',
            animationDuration: '0.45s',
            animationDelay: `${drop.delay}ms`,
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
            animationFillMode: 'both',
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
