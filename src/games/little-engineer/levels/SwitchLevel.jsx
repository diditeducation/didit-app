import { useState, useEffect, useRef, useMemo } from 'react';
import { initAudio, sound } from '../audio';

const C = {
  nightSky: '#0f1b2d',
  nightMid: '#162544',
  nightLight: '#1e3460',
  warmGlow: '#ffd666',
  warmGlowSoft: '#ffd66640',
  warmOrange: '#ffab40',
  accentGreen: '#69db7c',
  textSoft: '#a8a0b4',
};

const KEYFRAMES_ID = 'didit-switch-level-keyframes';
const keyframesCSS = `
@keyframes twinkle{0%,100%{opacity:0.2}50%{opacity:0.8}}
@keyframes sparkleFloat{0%{transform:scale(1) translateY(0);opacity:1}100%{transform:scale(0) translateY(-80px);opacity:0}}
@keyframes floatUpFade{0%{opacity:1;transform:translateX(-50%) translateY(0)}100%{opacity:0;transform:translateX(-50%) translateY(-30px)}}
@keyframes handBounceDown{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}
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
  const idRef = { current: 0 };
  useEffect(() => {
    if (!active) return;
    const colors = [C.warmGlow, '#ff6b6b', C.accentGreen, '#74c0fc'];
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
const Lightbulb = ({ on, size = 90 }) => {
  const s = size;
  const cx = s / 2, bulbR = s * 0.28, bulbCy = s * 0.34;
  const neckW = s * 0.14, baseTop = bulbCy + bulbR * 0.75 + s * 0.06, baseH = s * 0.15;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`bg${s}`} cx="45%" cy="38%" r="55%">
          <stop offset="0%" stopColor={on ? 'rgba(255,255,245,1)' : '#484858'} />
          <stop offset="50%" stopColor={on ? 'rgba(255,230,120,1)' : '#383848'} />
          <stop offset="100%" stopColor={on ? 'rgba(255,190,50,0.7)' : '#2a2a3a'} />
        </radialGradient>
        <filter id={`gl${s}`}><feGaussianBlur stdDeviation={s * 0.07} result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <linearGradient id={`ba${s}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b0b0b0" /><stop offset="100%" stopColor="#707070" />
        </linearGradient>
      </defs>
      {on && <>
        <circle cx={cx} cy={bulbCy} r={bulbR * 2.2} fill={C.warmGlow} opacity={0.06}>
          <animate attributeName="r" values={`${bulbR * 2};${bulbR * 2.4};${bulbR * 2}`} dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx={cx} cy={bulbCy} r={bulbR * 1.5} fill="#fff8e0" opacity={0.1} />
      </>}
      <circle cx={cx} cy={bulbCy} r={bulbR} fill={`url(#bg${s})`}
        stroke={on ? 'rgba(255,200,60,0.5)' : '#444'} strokeWidth={1.5}
        filter={on ? `url(#gl${s})` : 'none'} />
      <ellipse cx={cx - bulbR * 0.2} cy={bulbCy - bulbR * 0.25} rx={bulbR * 0.15} ry={bulbR * 0.28}
        fill={`rgba(255,255,255,${on ? 0.4 : 0.08})`} transform={`rotate(-15 ${cx} ${bulbCy})`} />
      <path d={`M ${cx - bulbR * 0.5} ${bulbCy + bulbR * 0.72} Q ${cx - neckW} ${baseTop - 2} ${cx - neckW} ${baseTop} L ${cx + neckW} ${baseTop} Q ${cx + neckW} ${baseTop - 2} ${cx + bulbR * 0.5} ${bulbCy + bulbR * 0.72}`}
        fill={on ? 'rgba(255,220,120,0.4)' : '#383848'} stroke={on ? 'rgba(200,170,60,0.3)' : '#444'} strokeWidth={0.8} />
      <rect x={cx - neckW - 1} y={baseTop} width={neckW * 2 + 2} height={baseH} rx={2} fill={`url(#ba${s})`} stroke="#666" strokeWidth={0.8} />
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

/* ── Switch Button ── */
const SwitchButton = ({ on, onClick }) => (
  <div onClick={() => { initAudio(); onClick(); }} style={{
    width: 100, height: 130, borderRadius: 22, cursor: 'pointer',
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
      width: 42, height: 72, borderRadius: 21, background: C.nightSky,
      border: `2px solid ${C.nightLight}`, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: on ? `radial-gradient(circle at 40% 35%, ${C.accentGreen}, #3a9a4a)` : 'radial-gradient(circle at 40% 35%, #555, #3a3a4a)',
        border: `2px solid ${on ? C.accentGreen : '#555'}`,
        position: 'absolute', left: 3, top: on ? 5 : 31,
        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }} />
    </div>
    <div style={{ marginTop: 6, fontSize: 14, fontWeight: 800, fontFamily: 'Nunito, sans-serif', color: on ? C.accentGreen : C.textSoft }}>
      {on ? 'ON' : 'OFF'}
    </div>
  </div>
);

/* ── Level Component ── */
export default function SwitchLevel({ onComplete, onMilestone }) {
  const [on, setOn] = useState(false);
  const [step, setStep] = useState(0); // 0=not started, 1=turned on once, 2=turned off, 3=turned on again (done)
  const [done, setDone] = useState(false);
  const [sparkle, setSparkle] = useState(false);
  const [showWakeUp, setShowWakeUp] = useState(false);
  const milestoneFired = useRef(false);

  useEffect(() => { injectKeyframes(); }, []);

  // Call onComplete after level is solved
  useEffect(() => {
    if (done && onComplete) {
      const t = setTimeout(onComplete, 1200);
      return () => clearTimeout(t);
    }
  }, [done, onComplete]);

  const toggle = () => {
    initAudio();
    const next = !on;
    setOn(next);
    if (next) {
      sound.toggleOn();
      setSparkle(true);
      setTimeout(() => setSparkle(false), 100);
      if (step === 0) {
        setStep(1);
        setShowWakeUp(true);
        setTimeout(() => setShowWakeUp(false), 1500);
        if (!milestoneFired.current) {
          milestoneFired.current = true;
          console.log('SwitchLevel: onMilestone firing', { step });
          onMilestone?.(50, 30);
        }
      }
      if (step === 2) {
        setStep(3);
        setDone(true);
        setTimeout(() => sound.celebrate(), 400);
      }
    } else {
      sound.toggleOff();
      if (step === 1) setStep(2);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div style={{
        width: 310, height: 280, borderRadius: 18, position: 'relative', overflow: 'hidden',
        background: on
          ? `radial-gradient(ellipse at 50% 35%, rgba(255,214,102,0.15), ${C.nightSky} 70%)`
          : C.nightSky,
        border: `3px solid ${on ? C.warmGlow + '44' : C.nightLight}`,
        boxShadow: 'none',
        transition: 'all 0.6s ease',
      }}>
        <Starfield />
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 2, height: 30, background: on ? C.warmGlow + '66' : '#444' }} />
        <div style={{ position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)' }}>
          <Lightbulb on={on} size={95} />
        </div>
        <Sparkles active={sparkle} x="50%" y="40%" />
        <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', fontSize: 56, filter: on ? 'none' : 'brightness(0.25)', transition: 'filter 0.6s ease' }}>🧸</div>
        {showWakeUp && (
          <div style={{
            position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
            fontSize: 14, color: C.warmGlow, fontWeight: 700, fontFamily: 'Nunito, sans-serif',
            whiteSpace: 'nowrap', textShadow: `0 0 20px ${C.warmGlowSoft}`,
            animation: 'floatUpFade 1.5s ease-out forwards',
          }}>Wake up ✨</div>
        )}
      </div>

      {/* Switch with hand hints */}
      <div style={{ position: 'relative' }}>
        <SwitchButton on={on} onClick={toggle} />
        {step === 1 && on && (
          <div style={{
            position: 'absolute', top: 16, left: '58%', transform: 'translateX(-50%)',
            fontSize: 28, zIndex: 10, pointerEvents: 'none',
            animation: 'handBounceDown 1s ease-in-out infinite',
          }}>👇</div>
        )}
        {step === 2 && !on && (
          <div style={{
            position: 'absolute', bottom: 26, left: '58%', transform: 'translateX(-50%)',
            fontSize: 28, zIndex: 10, pointerEvents: 'none',
            animation: 'handBounceUp 1s ease-in-out infinite',
          }}>☝️</div>
        )}
      </div>
    </div>
  );
}
