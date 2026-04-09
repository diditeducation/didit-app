import { useState, useEffect, useRef, useCallback } from 'react';
import { colors, easing } from '../../design-system/tokens';
import { sound } from './audio';

const GRID     = 3;
const CELL     = 90;
const CELL_GAP = 6;
const BTN      = 60;
const BTN_GAP  = 6;

const DIRS = {
  UP:    [-1,  0],
  DOWN:  [ 1,  0],
  LEFT:  [ 0, -1],
  RIGHT: [ 0,  1],
};

const BTN_COLORS = {
  UP:    '#A29BFE',
  DOWN:  '#FF7675',
  LEFT:  '#74B9FF',
  RIGHT: '#FDCB6E',
};

const BTN_SHADOWS = {
  UP:    '0 5px 0 #7B72E9',
  DOWN:  '0 5px 0 #E05050',
  LEFT:  '0 5px 0 #4A8FE8',
  RIGHT: '0 5px 0 #E8A830',
};


/* ─── Position generator ─────────────────────────────────── */
function generatePositions(minMoves) {
  const cells = [];
  for (let r = 0; r < GRID; r++)
    for (let c = 0; c < GRID; c++)
      cells.push([r, c]);

  for (let attempt = 0; attempt < 200; attempt++) {
    const rat = cells[Math.floor(Math.random() * cells.length)];
    const valid = cells.filter(([r, c]) =>
      Math.abs(r - rat[0]) + Math.abs(c - rat[1]) === minMoves
    );
    if (valid.length > 0) {
      const cheese = valid[Math.floor(Math.random() * valid.length)];
      return { rat: [...rat], cheese: [...cheese] };
    }
  }
  return { rat: [0, 0], cheese: [0, 1] };
}

/* ─── Keyframes ──────────────────────────────────────────── */
const KF_ID = 'didit-grid-level-kf';
const KF_CSS = `
@keyframes ratBounce {
  0%   { transform: translateY(0)     scale(1);    }
  25%  { transform: translateY(-20px) scale(1.18); }
  55%  { transform: translateY(-8px)  scale(1.08); }
  75%  { transform: translateY(-14px) scale(1.12); }
  100% { transform: translateY(0)     scale(1);    }
}
@keyframes ratBumpUp    { 0%,100%{transform:translateY(0)}   45%{transform:translateY(-11px)} }
@keyframes ratBumpDown  { 0%,100%{transform:translateY(0)}   45%{transform:translateY(11px)}  }
@keyframes ratBumpLeft  { 0%,100%{transform:translateX(0)}   45%{transform:translateX(-11px)} }
@keyframes ratBumpRight { 0%,100%{transform:translateX(0)}   45%{transform:translateX(11px)}  }
@keyframes ratWin {
  0%   { transform: scale(1);    }
  30%  { transform: scale(1.4);  }
  55%  { transform: scale(1.2);  }
  70%  { transform: scale(1.35); }
  100% { transform: scale(1.25); }
}
@keyframes trailFade    { 0%{opacity:0.65;transform:scale(0.85)} 100%{opacity:0;transform:scale(0.2)} }
@keyframes cheeseGlow {
  0%,100% { filter: drop-shadow(0 0 5px #E8B840); }
  50%     { filter: drop-shadow(0 0 14px #E8B840) drop-shadow(0 0 6px #EE6A30); }
}
@keyframes cheeseWiggle {
  0%,100% { transform: rotate(0deg);  }
  20%     { transform: rotate(-7deg); }
  60%     { transform: rotate(7deg);  }
}
@keyframes cellWinGlow {
  0%,100% { box-shadow: 0 0 12px 4px rgba(76,200,48,0.55); }
  50%     { box-shadow: 0 0 28px 10px rgba(76,200,48,0.85); }
}
`;

function injectKF() {
  if (typeof document === 'undefined' || document.getElementById(KF_ID)) return;
  const el = document.createElement('style');
  el.id = KF_ID;
  el.textContent = KF_CSS;
  document.head.appendChild(el);
}


/* ─── Arrow button ───────────────────────────────────────── */
function ArrowBtn({ label, color, shadow, onPress }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onPointerDown={() => { setPressed(true); onPress(); }}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: '100%', height: '100%',
        background: color,
        border: 'none',
        borderRadius: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.6rem', fontWeight: 900, color: '#1A1A2E',
        cursor: 'pointer',
        transform: pressed ? 'scale(0.88) translateY(3px)' : 'scale(1)',
        transition: `transform 0.1s ${easing.bounce}`,
        boxShadow: pressed ? 'none' : shadow,
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        userSelect: 'none',
        lineHeight: 1,
      }}
    >
      {label}
    </button>
  );
}

/* ─── Main component ─────────────────────────────────────── */
export default function GridLevel({ minMoves, onWin }) {
  const [positions]  = useState(() => generatePositions(minMoves));
  const [ratPos,  setRatPos]      = useState(positions.rat);
  const [cheesePos]               = useState(positions.cheese);
  const [won,     setWon]         = useState(false);
  const [animState, setAnimState] = useState({ type: null, dir: null, key: 0 });
  const [trail,   setTrail]       = useState([]);
  const [glide,   setGlide]       = useState({ x: 0, y: 0, active: false });

  const ratPosRef  = useRef(positions.rat);
  const wonRef     = useRef(false);
  const trailIdRef = useRef(0);
  const cellRefs   = useRef([]);

  useEffect(() => { injectKF(); }, []);

  /* ── Rat animation ── */
  const getRatAnim = () => {
    if (!animState.type) return 'none';
    if (animState.type === 'win')    return `ratWin 0.5s ${easing.bounce} forwards`;
    if (animState.type === 'bounce') return `ratBounce 0.45s ${easing.bounce}`;
    const bumpMap = {
      UP: 'ratBumpUp', DOWN: 'ratBumpDown',
      LEFT: 'ratBumpLeft', RIGHT: 'ratBumpRight',
    };
    return `${bumpMap[animState.dir] || 'ratBumpUp'} 0.28s ease-out`;
  };

  /* ── Move handler ── */
  const move = useCallback((dir) => {
    if (wonRef.current) return;
    const [dr, dc] = DIRS[dir];
    const [r, c]   = ratPosRef.current;
    const nr = r + dr;
    const nc = c + dc;

    // Wall collision — animate bump, no command logged
    if (nr < 0 || nr >= GRID || nc < 0 || nc >= GRID) {
      sound.bump();
      setAnimState({ type: 'bump', dir, key: Date.now() });
      return;
    }

    // Valid move — start glide from the opposite direction so rat slides into the new cell
    sound.step();
    ratPosRef.current = [nr, nc];
    const step = CELL + CELL_GAP;
    const glideX = -dr === 0 ? (dc > 0 ? -step : step) : 0;
    const glideY = -dc === 0 ? (dr > 0 ? -step : step) : 0;
    setGlide({ x: glideX, y: glideY, active: true });
    setTimeout(() => setGlide({ x: 0, y: 0, active: false }), 16);

    const id = trailIdRef.current++;
    setTrail(t => [...t, { row: r, col: c, id }]);
    setTimeout(() => setTrail(t => t.filter(d => d.id !== id)), 650);

    if (nr === cheesePos[0] && nc === cheesePos[1]) {
      wonRef.current = true;
      sound.win();
      setRatPos([nr, nc]);
      setAnimState({ type: 'win', dir: null, key: Date.now() });
      setWon(true);
      // Calculate rat cell centre as % of viewport for confetti origin
      const cellEl = cellRefs.current[nr * GRID + nc];
      if (cellEl) {
        const rect = cellEl.getBoundingClientRect();
        const xPct = ((rect.left + rect.width  / 2) / window.innerWidth)  * 100;
        const yPct = ((rect.top  + rect.height / 2) / window.innerHeight) * 100;
        setTimeout(() => onWin(xPct, yPct), 420);
      } else {
        setTimeout(() => onWin(50, 50), 420);
      }
      return;
    }

    setRatPos([nr, nc]);
    setAnimState(s => ({ type: 'bounce', dir: null, key: s.key + 1 }));
  }, [cheesePos, onWin]);

  /* ── Keyboard support ── */
  useEffect(() => {
    const KEY_MAP = {
      ArrowUp: 'UP', ArrowDown: 'DOWN',
      ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
    };
    const handler = (e) => {
      if (KEY_MAP[e.key]) { e.preventDefault(); move(KEY_MAP[e.key]); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [move]);

  const ratAnim = getRatAnim();

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 20, width: '100%',
    }}>

      {/* ── 3×3 Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID}, ${CELL}px)`,
        gridTemplateRows:    `repeat(${GRID}, ${CELL}px)`,
        gap: CELL_GAP,
      }}>
        {Array.from({ length: GRID * GRID }, (_, i) => {
          const row = Math.floor(i / GRID);
          const col = i % GRID;
          const isRat    = ratPos[0] === row && ratPos[1] === col;
          const isCheese  = cheesePos[0] === row && cheesePos[1] === col;
          const isWinCell = won && isRat && isCheese;
          const isEven   = (row + col) % 2 === 0;
          const hasTrail = trail.some(d => d.row === row && d.col === col);

          return (
            <div key={i} ref={el => { cellRefs.current[i] = el; }} style={{
              width: CELL, height: CELL,
              borderRadius: 16,
              background: isWinCell
                ? colors.grassMid
                : isRat
                  ? `color-mix(in srgb, ${colors.sunMid} 22%, ${colors.bg})`
                  : isCheese
                    ? `color-mix(in srgb, ${colors.sunDark} 10%, ${colors.bg})`
                    : isEven ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.06)',
              border: `2px solid ${
                isWinCell  ? colors.grassDark
                : isCheese ? colors.sunMid + '80'
                : isRat    ? colors.sunMid + '40'
                : 'rgba(0,0,0,0.07)'
              }`,
              animation: isWinCell ? 'cellWinGlow 1s ease-in-out infinite' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
              transition: 'background 0.15s ease, border-color 0.15s ease',
            }}>
              {hasTrail && (
                <div style={{
                  position: 'absolute', width: 13, height: 13,
                  borderRadius: '50%', background: colors.sunMid,
                  animation: 'trailFade 0.65s ease-out forwards',
                  pointerEvents: 'none',
                }} />
              )}
              {isCheese && !won && (
                <span style={{
                  fontSize: CELL * 0.50, lineHeight: 1,
                  animation: 'cheeseGlow 2.2s ease-in-out infinite, cheeseWiggle 3.5s ease-in-out infinite',
                  userSelect: 'none', pointerEvents: 'none',
                }}>🧀</span>
              )}
              {isRat && (
                <span
                  key={animState.key}
                  style={{
                    fontSize: CELL * 0.50, lineHeight: 1,
                    animation: ratAnim,
                    userSelect: 'none', pointerEvents: 'none',
                    position: 'relative', zIndex: 2,
                    transform: glide.active
                      ? `translate(${glide.x}px, ${glide.y}px)`
                      : 'translate(0,0)',
                    transition: glide.active
                      ? 'none'
                      : `transform 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
                  }}
                >🐭</span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── D-Pad ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(3, ${BTN}px)`,
        gridTemplateRows:    `repeat(3, ${BTN}px)`,
        gap: BTN_GAP,
      }}>
        <div />
        <ArrowBtn label="↑" color={BTN_COLORS.UP}    shadow={BTN_SHADOWS.UP}    onPress={() => move('UP')} />
        <div />
        <ArrowBtn label="←" color={BTN_COLORS.LEFT}  shadow={BTN_SHADOWS.LEFT}  onPress={() => move('LEFT')} />
        <div style={{
          borderRadius: 16,
          background: 'rgba(0,0,0,0.04)',
          border: '2px solid rgba(0,0,0,0.07)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 2, userSelect: 'none',
        }}>
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🐭</span>
          <span style={{
            fontSize: '0.42rem', fontWeight: 700, letterSpacing: '0.06em',
            color: 'rgba(0,0,0,0.35)', fontFamily: "'Nunito', sans-serif",
            textTransform: 'uppercase', lineHeight: 1,
          }}>Commands</span>
        </div>
        <ArrowBtn label="→" color={BTN_COLORS.RIGHT} shadow={BTN_SHADOWS.RIGHT} onPress={() => move('RIGHT')} />
        <div />
        <ArrowBtn label="↓" color={BTN_COLORS.DOWN}  shadow={BTN_SHADOWS.DOWN}  onPress={() => move('DOWN')} />
        <div />
      </div>

    </div>
  );
}
