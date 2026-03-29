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

const KEYFRAMES_ID = 'didit-findcat-level-keyframes';
const keyframesCSS = `
@keyframes twinkle{0%,100%{opacity:0.2}50%{opacity:0.8}}
@keyframes sparkleFloat{0%{transform:scale(1) translateY(0);opacity:1}100%{transform:scale(0) translateY(-80px);opacity:0}}
@keyframes catBounce{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-6px) scale(1.1)}}
@keyframes floatUpFade{0%{opacity:1;transform:translateX(-50%) translateY(0)}100%{opacity:0;transform:translateX(-50%) translateY(-30px)}}
@keyframes catBreath{0%,100%{transform:scale(1);opacity:0.7}50%{transform:scale(1.08);opacity:1}}
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

/* ── Lightbulb ── */
const Lightbulb = ({ on, size = 90, id = '' }) => {
  const s = size;
  const cx = s / 2, bulbR = s * 0.28, bulbCy = s * 0.34;
  const neckW = s * 0.14, baseTop = bulbCy + bulbR * 0.75 + s * 0.06, baseH = s * 0.15;
  const uid = `fc${id}${s}`;
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
const MiniSwitch = ({ on, onClick }) => (
  <div onClick={() => { initAudio(); onClick(); }} style={{
    width: 72, height: 96, borderRadius: 16, cursor: 'pointer',
    background: `linear-gradient(180deg, ${C.nightMid}, ${C.nightSky})`,
    border: `3px solid ${on ? C.accentGreen + '88' : C.nightLight}`,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    userSelect: 'none', transition: 'all 0.3s ease',
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
    <div style={{ marginTop: 4, fontSize: 11, fontWeight: 800, fontFamily: 'Nunito, sans-serif', color: on ? C.accentGreen : C.textSoft }}>
      {on ? 'ON' : 'OFF'}
    </div>
  </div>
);

const CARD_W = 320;
const CARD_H = 340;
const COL_X = [55, 160, 265];
const SWITCH_Y = 20;
const SWITCH_H = 70;
const BULB_Y = 230;
const BULB_SIZE = 68;

/* ── Level 2: Find the Cat ── */
export default function WireLevel({ onMilestone }) {
  const [catBulb] = useState(() => Math.floor(Math.random() * 3));
  const [activeBulb, setActiveBulb] = useState(-1);
  const [found, setFound] = useState(false);
  const [sparkle, setSparkle] = useState(false);
  const [showMeow, setShowMeow] = useState(false);
  const milestoneFired = useRef(false);

  useEffect(() => { injectKeyframes(); }, []);

  const handleSwitch = (idx) => {
    if (found) return;
    initAudio();

    if (activeBulb === idx) {
      setActiveBulb(-1);
      sound.toggleOff();
      return;
    }

    setActiveBulb(idx);
    sound.toggleOn();

    if (idx === catBulb) {
      setFound(true);
      setSparkle(true);
      setTimeout(() => setSparkle(false), 100);
      setShowMeow(true);
      setTimeout(() => setShowMeow(false), 1500);
      setTimeout(() => sound.celebrate(), 300);
      if (!milestoneFired.current) {
        milestoneFired.current = true;
        onMilestone?.(50, 30);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Scene card */}
      <div style={{
        width: CARD_W, height: CARD_H, borderRadius: 18, position: 'relative', overflow: 'hidden',
        background: activeBulb >= 0
          ? `radial-gradient(ellipse at ${COL_X[activeBulb] / CARD_W * 100}% 75%, rgba(255,214,102,0.12), ${C.nightSky} 70%)`
          : C.nightSky,
        border: `3px solid ${found ? C.warmGlow + '44' : C.nightLight}`,
        transition: 'all 0.6s ease',
        touchAction: 'none', userSelect: 'none',
      }}>
        <Starfield />

        {/* Straight vertical wires from switch to bulb */}
        <svg width={CARD_W} height={CARD_H} viewBox={`0 0 ${CARD_W} ${CARD_H}`}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
          {[0, 1, 2].map(i => {
            const isOn = activeBulb === i;
            return (
              <line key={`wire-${i}`}
                x1={COL_X[i]} y1={SWITCH_Y + SWITCH_H + 5}
                x2={COL_X[i]} y2={BULB_Y}
                stroke={isOn ? C.warmGlow : '#334'}
                strokeWidth={4}
                opacity={isOn ? 0.7 : 0.3}
                style={{ transition: 'all 0.4s ease' }}
              />
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
            <MiniSwitch on={activeBulb === i} onClick={() => handleSwitch(i)} />
            {/* Proactive hand hint on middle switch before first tap */}
            {i === 1 && activeBulb === -1 && !found && (
              <div style={{
                position: 'absolute', bottom: -2, left: '55%', transform: 'translateX(-50%)',
                fontSize: 24, pointerEvents: 'none', zIndex: 10,
                animation: 'handBounceUp 1s ease-in-out infinite',
              }}>☝️</div>
            )}
          </div>
        ))}

        {/* 3 bulbs at bottom with cats */}
        {[0, 1, 2].map(i => {
          const isOn = activeBulb === i;
          const hasCat = catBulb === i;
          const catVisible = hasCat && isOn;
          return (
            <div key={`bulb-${i}`} style={{
              position: 'absolute',
              left: COL_X[i] - BULB_SIZE / 2,
              top: BULB_Y,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              zIndex: 2,
            }}>
              <Lightbulb on={isOn} size={BULB_SIZE} id={`fc${i}`} />
              {hasCat && (
                <div style={{
                  fontSize: 36,
                  marginTop: -2,
                  filter: catVisible ? 'none' : 'brightness(0.45)',
                  transition: 'filter 0.6s ease',
                  animation: catVisible ? 'catBounce 0.6s ease-out' : 'catBreath 2s ease-in-out infinite',
                }}>🐱</div>
              )}
              {!hasCat && (
                <div style={{ fontSize: 36, marginTop: -2, opacity: 0 }}>🐱</div>
              )}
            </div>
          );
        })}

        {/* Sparkles on found cat */}
        <Sparkles
          active={sparkle}
          x={`${(COL_X[catBulb] / CARD_W) * 100}%`}
          y="85%"
        />

        {/* "Meow!" float text */}
        {showMeow && (
          <div style={{
            position: 'absolute', bottom: 10,
            left: `${COL_X[catBulb]}px`,
            transform: 'translateX(-50%)',
            fontSize: 14, color: C.warmGlow, fontWeight: 700, fontFamily: 'Nunito, sans-serif',
            whiteSpace: 'nowrap', textShadow: `0 0 20px ${C.warmGlowSoft}`,
            animation: 'floatUpFade 1.5s ease-out forwards',
            zIndex: 10,
          }}>Meow! 🐱</div>
        )}
      </div>
    </div>
  );
}
