import { useState, useEffect, useRef, useMemo } from 'react';
import { initAudio, sound } from '../audio';

const C = {
  nightSky: '#0f1b2d',
  nightMid: '#162544',
  nightLight: '#1e3460',
  warmGlow: '#ffd666',
  warmGlowSoft: '#ffd66640',
  warmOrange: '#ffab40',
  accentRed: '#ff6b6b',
  accentGreen: '#69db7c',
  accentBlue: '#74c0fc',
  textSoft: '#a8a0b4',
};

const WIRE_COLORS = [C.accentRed, C.accentBlue, C.accentGreen];
const CARD_W = 320;
const CARD_H = 340;

const KEYFRAMES_ID = 'didit-trace-wire-level-keyframes';
const keyframesCSS = `
@keyframes twinkle{0%,100%{opacity:0.2}50%{opacity:0.8}}
@keyframes sparkleFloat{0%{transform:scale(1) translateY(0);opacity:1}100%{transform:scale(0) translateY(-80px);opacity:0}}
@keyframes headShake{0%{transform:translateX(0)}12%{transform:translateX(-6px) rotate(-2deg)}37%{transform:translateX(5px) rotate(1.5deg)}62%{transform:translateX(-3px) rotate(-1deg)}87%{transform:translateX(2px)}100%{transform:translateX(0)}}
@keyframes bulbPulse{0%,100%{filter:drop-shadow(0 0 4px ${C.warmGlow}80)}50%{filter:drop-shadow(0 0 12px ${C.warmGlow})}}
@keyframes electricFlow{0%{stroke-dashoffset:24}100%{stroke-dashoffset:0}}
@keyframes handBounceUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
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
  const stars = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 70,
      size: 1.5 + Math.random() * 1.5,
      delay: Math.random() * 3,
      dur: 2.5 + Math.random() * 2,
    })), []);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size, borderRadius: '50%', background: '#fff',
          animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
        }} />
      ))}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
        background: 'linear-gradient(to top, #0a1220, transparent)',
      }} />
    </div>
  );
};

/* ── Sparkles ── */
const Sparkles = ({ active, x = '50%', y = '50%' }) => {
  const [sparks, setSparks] = useState([]);
  const idRef = useRef(0);
  useEffect(() => {
    if (!active) return;
    const colors = [C.warmGlow, C.accentRed, C.accentGreen, C.accentBlue];
    const batch = Array.from({ length: 14 }, () => ({
      id: idRef.current++,
      color: colors[Math.floor(Math.random() * colors.length)],
      offsetX: (Math.random() - 0.5) * 120,
      offsetY: (Math.random() - 0.5) * 40,
      size: 4 + Math.random() * 6,
      delay: Math.random() * 0.3,
    }));
    setSparks(batch);
    const t = setTimeout(() => setSparks([]), 2000);
    return () => clearTimeout(t);
  }, [active]);
  if (!sparks.length) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none', zIndex: 50 }}>
      {sparks.map(s => (
        <div key={s.id} style={{
          position: 'absolute', left: s.offsetX, top: s.offsetY,
          width: s.size, height: s.size, borderRadius: '50%', background: s.color,
          animation: `sparkleFloat 1.5s ease-out ${s.delay}s forwards`,
          opacity: 0,
        }} />
      ))}
    </div>
  );
};

/* ── Lightbulb (SVG) ── */
const Lightbulb = ({ on, size = 90, id = '' }) => {
  const s = size;
  const cx = s / 2, bulbR = s * 0.28, bulbCy = s * 0.34;
  const neckW = s * 0.14, baseTop = bulbCy + bulbR * 0.75 + s * 0.06, baseH = s * 0.15;
  const uid = `tw${id}${s}`;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`bg${uid}`} cx="45%" cy="38%" r="55%">
          <stop offset="0%" stopColor={on ? 'rgba(255,255,245,1)' : '#484858'} />
          <stop offset="50%" stopColor={on ? 'rgba(255,230,120,1)' : '#383848'} />
          <stop offset="100%" stopColor={on ? 'rgba(255,190,50,0.7)' : '#2a2a3a'} />
        </radialGradient>
        <filter id={`gl${uid}`}><feGaussianBlur stdDeviation={s * 0.07} result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <linearGradient id={`ba${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b0b0b0" /><stop offset="100%" stopColor="#707070" />
        </linearGradient>
      </defs>
      {on && <>
        <circle cx={cx} cy={bulbCy} r={bulbR * 2.2} fill={C.warmGlow} opacity={0.06}>
          <animate attributeName="r" values={`${bulbR * 2};${bulbR * 2.4};${bulbR * 2}`} dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx={cx} cy={bulbCy} r={bulbR * 1.5} fill="#fff8e0" opacity={0.1} />
      </>}
      <circle cx={cx} cy={bulbCy} r={bulbR} fill={`url(#bg${uid})`}
        stroke={on ? 'rgba(255,200,60,0.5)' : '#444'} strokeWidth={1.5}
        filter={on ? `url(#gl${uid})` : 'none'} />
      <ellipse cx={cx - bulbR * 0.2} cy={bulbCy - bulbR * 0.25} rx={bulbR * 0.15} ry={bulbR * 0.28}
        fill={`rgba(255,255,255,${on ? 0.4 : 0.08})`} transform={`rotate(-15 ${cx} ${bulbCy})`} />
      <path d={`M ${cx - bulbR * 0.5} ${bulbCy + bulbR * 0.72} Q ${cx - neckW} ${baseTop - 2} ${cx - neckW} ${baseTop} L ${cx + neckW} ${baseTop} Q ${cx + neckW} ${baseTop - 2} ${cx + bulbR * 0.5} ${bulbCy + bulbR * 0.72}`}
        fill={on ? 'rgba(255,220,120,0.4)' : '#383848'} stroke={on ? 'rgba(200,170,60,0.3)' : '#444'} strokeWidth={0.8} />
      <rect x={cx - neckW - 1} y={baseTop} width={neckW * 2 + 2} height={baseH} rx={2} fill={`url(#ba${uid})`} stroke="#666" strokeWidth={0.8} />
      {[0.25, 0.5, 0.75].map((f, i) => <line key={i} x1={cx - neckW} y1={baseTop + baseH * f} x2={cx + neckW} y2={baseTop + baseH * f} stroke="#666" strokeWidth={0.6} opacity={0.4} />)}
      <ellipse cx={cx} cy={baseTop + baseH + 2.5} rx={3.5} ry={2} fill="#888" />
      <g opacity={on ? 1 : 0.2}>
        <line x1={cx - 4} y1={bulbCy + 5} x2={cx - 2} y2={bulbCy - bulbR * 0.45} stroke={on ? '#fff' : '#666'} strokeWidth={1.6} strokeLinecap="round" />
        <line x1={cx + 4} y1={bulbCy + 5} x2={cx + 2} y2={bulbCy - bulbR * 0.45} stroke={on ? '#fff' : '#666'} strokeWidth={1.6} strokeLinecap="round" />
        <line x1={cx - 2} y1={bulbCy - bulbR * 0.45} x2={cx + 2} y2={bulbCy - bulbR * 0.45} stroke={on ? '#fff' : '#666'} strokeWidth={1.3} strokeLinecap="round" />
      </g>
      {on && [0, 60, 120, 180, 240, 300].map(deg => (
        <line key={deg}
          x1={cx + Math.cos(deg * Math.PI / 180) * (bulbR + 4)} y1={bulbCy + Math.sin(deg * Math.PI / 180) * (bulbR + 4)}
          x2={cx + Math.cos(deg * Math.PI / 180) * (bulbR + 12)} y2={bulbCy + Math.sin(deg * Math.PI / 180) * (bulbR + 12)}
          stroke={C.warmGlow} strokeWidth={1.8} strokeLinecap="round" opacity={0.25}>
          <animate attributeName="opacity" values="0.12;0.35;0.12" dur="2s" begin={`${deg * 0.005}s`} repeatCount="indefinite" />
        </line>
      ))}
    </svg>
  );
};

/* ── Mini Switch ── */
const MiniSwitch = ({ on, onClick, shake }) => (
  <div onClick={() => { initAudio(); onClick(); }} style={{
    width: 72, height: 96, borderRadius: 16, cursor: 'pointer',
    background: `linear-gradient(180deg, ${C.nightMid}, ${C.nightSky})`,
    border: `3px solid ${on ? C.accentGreen + '88' : C.nightLight}`,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    userSelect: 'none', transition: 'all 0.3s ease',
    animation: shake ? 'headShake 0.5s ease-in-out' : 'none',
  }}
  onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.93)'; }}
  onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
  onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.93)'; }}
  onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; }}
  >
    <div style={{
      width: 32, height: 54, borderRadius: 16, background: C.nightSky,
      border: `2px solid ${C.nightLight}`, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        background: on ? `radial-gradient(circle at 40% 35%, ${C.accentGreen}, #3a9a4a)` : 'radial-gradient(circle at 40% 35%, #555, #3a3a4a)',
        border: `2px solid ${on ? C.accentGreen : '#555'}`,
        position: 'absolute', left: 2, top: on ? 4 : 24,
        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }} />
    </div>
    <div style={{ marginTop: 4, fontSize: 18, fontWeight: 800, fontFamily: 'Nunito, sans-serif', color: '#FFFFFF' }}>
      {on ? 'On' : 'Off'}
    </div>
  </div>
);

/* ── Generate a random wire mapping (shuffled, at least one crossing) ── */
function generateMapping() {
  const arr = [0, 1, 2];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (arr[0] === 0 && arr[1] === 1 && arr[2] === 2) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

/* ── Positions ── */
const COL_X = [55, 160, 265];
const SWITCH_Y = 20;
const SWITCH_H = 70;
const BULB_Y = 240;
const BULB_SIZE = 68;

/* ── SVG wire path (right-angle maze style, switch top → bulb bottom) ── */
function wirePath(switchX, switchBottomY, bulbX, bulbTopY, wireIdx) {
  // Each wire uses a different horizontal channel to avoid overlapping
  const totalH = bulbTopY - switchBottomY;
  const channelOffsets = [0.3, 0.5, 0.7];
  const channelY = switchBottomY + totalH * channelOffsets[wireIdx];

  if (switchX === bulbX) {
    return `M ${switchX} ${switchBottomY} L ${switchX} ${bulbTopY}`;
  }

  return `M ${switchX} ${switchBottomY} L ${switchX} ${channelY} L ${bulbX} ${channelY} L ${bulbX} ${bulbTopY}`;
}

/* ── Level 3: Trace the Wires ── */
export default function BatteryLevel({ onMilestone }) {
  const [mapping] = useState(() => generateMapping());
  const [targetBulb] = useState(() => Math.floor(Math.random() * 3));
  const [solved, setSolved] = useState(false);
  const [shakeIdx, setShakeIdx] = useState(-1);
  const [sparkle, setSparkle] = useState(false);
  const milestoneFired = useRef(false);

  useEffect(() => { injectKeyframes(); }, []);

  // mapping[switchIdx] = bulbIdx
  const correctSwitch = mapping.indexOf(targetBulb);

  const handleSwitchTap = (switchIdx) => {
    if (solved) return;
    initAudio();

    if (switchIdx === correctSwitch) {
      setSolved(true);
      setSparkle(true);
      setTimeout(() => setSparkle(false), 100);
      sound.celebrate();
      if (!milestoneFired.current) {
        milestoneFired.current = true;
        onMilestone?.(50, 30);
      }
    } else {
      sound.error();
      setShakeIdx(switchIdx);
      setTimeout(() => setShakeIdx(-1), 600);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Scene card */}
      <div style={{
        width: CARD_W, height: CARD_H, borderRadius: 18, position: 'relative',
        background: solved
          ? `radial-gradient(ellipse at ${(COL_X[targetBulb] / CARD_W) * 100}% 80%, rgba(255,214,102,0.12), ${C.nightSky} 70%)`
          : C.nightSky,
        border: `3px solid ${solved ? C.warmGlow + '44' : C.nightLight}`,
        overflow: 'hidden', touchAction: 'none', userSelect: 'none',
        transition: 'all 0.6s ease',
      }}>
        <Starfield />

        {/* SVG wires */}
        <svg
          width={CARD_W}
          height={CARD_H}
          viewBox={`0 0 ${CARD_W} ${CARD_H}`}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
        >
          {/* Insulation outlines first */}
          {[0, 1, 2].map(switchIdx => {
            const bulbIdx = mapping[switchIdx];
            return (
              <path
                key={`casing-${switchIdx}`}
                d={wirePath(COL_X[switchIdx], SWITCH_Y + SWITCH_H + 5, COL_X[bulbIdx], BULB_Y, switchIdx)}
                fill="none"
                stroke={C.nightSky}
                strokeWidth={14}
                strokeLinecap="square"
                strokeLinejoin="miter"
                opacity={solved && bulbIdx !== targetBulb ? 0.2 : 1}
                style={{ transition: 'opacity 0.4s ease' }}
              />
            );
          })}
          {/* Colored wires with electricity animation */}
          {[0, 1, 2].map(switchIdx => {
            const bulbIdx = mapping[switchIdx];
            const color = WIRE_COLORS[switchIdx];
            const isCorrectWire = bulbIdx === targetBulb;
            const glowing = solved && isCorrectWire;
            return (
              <g key={`wire-${switchIdx}`}>
                <path
                  d={wirePath(COL_X[switchIdx], SWITCH_Y + SWITCH_H + 5, COL_X[bulbIdx], BULB_Y, switchIdx)}
                  fill="none"
                  stroke={color}
                  strokeWidth={8}
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  opacity={glowing ? 1 : (solved ? 0.15 : 0.5)}
                  style={{
                    transition: 'all 0.4s ease',
                    filter: glowing ? `drop-shadow(0 0 8px ${color})` : 'none',
                  }}
                />
                <path
                  d={wirePath(COL_X[switchIdx], SWITCH_Y + SWITCH_H + 5, COL_X[bulbIdx], BULB_Y, switchIdx)}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="miter"
                  strokeDasharray="6 18"
                  opacity={glowing ? 0.9 : (solved ? 0.05 : 0.25)}
                  style={{
                    transition: 'opacity 0.4s ease',
                    animation: 'electricFlow 0.5s linear infinite',
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* 3 switches at top */}
        {[0, 1, 2].map(i => (
          <div key={`sw-${i}`} style={{
            position: 'absolute',
            left: COL_X[i] - 36,
            top: SWITCH_Y,
            zIndex: 3,
          }}>
            <MiniSwitch
              on={solved && i === correctSwitch}
              onClick={() => handleSwitchTap(i)}
              shake={shakeIdx === i}
            />
            {/* Proactive hand hint on middle switch before first tap */}
            {i === 1 && !solved && shakeIdx === -1 && (
              <div style={{
                position: 'absolute', bottom: -2, left: '55%', transform: 'translateX(-50%)',
                fontSize: 24, pointerEvents: 'none', zIndex: 10,
                animation: 'handBounceUp 1s ease-in-out infinite',
              }}>☝️</div>
            )}
          </div>
        ))}

        {/* 3 bulbs at bottom */}
        {[0, 1, 2].map(i => {
          const isTarget = i === targetBulb;
          const litUp = solved && isTarget;
          return (
            <div key={`bulb-${i}`} style={{
              position: 'absolute',
              left: COL_X[i] - BULB_SIZE / 2,
              top: BULB_Y,
              zIndex: 2,
              animation: isTarget && !solved ? 'bulbPulse 1.5s ease-in-out infinite' : 'none',
            }}>
              <Lightbulb on={litUp} size={BULB_SIZE} id={`tw${i}`} />
              {!isTarget && !solved && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(15,27,45,0.4)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }} />
              )}
            </div>
          );
        })}

        {/* Sparkles on target bulb */}
        <Sparkles
          active={sparkle}
          x={`${(COL_X[targetBulb] / CARD_W) * 100}%`}
          y={`${((BULB_Y + BULB_SIZE / 2) / CARD_H) * 100}%`}
        />
      </div>
    </div>
  );
}
