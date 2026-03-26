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
  textPrimary: '#e8e0d4',
  textSoft: '#a8a0b4',
};

const KEYFRAMES_ID = 'didit-battery-level-keyframes';
const keyframesCSS = `
@keyframes twinkle{0%,100%{opacity:0.2}50%{opacity:0.8}}
@keyframes sparkleFloat{0%{transform:scale(1) translateY(0);opacity:1}100%{transform:scale(0) translateY(-80px);opacity:0}}
@keyframes borderFlash{0%,100%{border-color:${C.nightLight}}50%{border-color:${C.accentRed}88}}
@keyframes wireFlicker1{0%,100%{opacity:1}50%{opacity:0.6}}
@keyframes wireFlicker2{0%,100%{opacity:1}30%{opacity:0.35}60%{opacity:0.85}80%{opacity:0.4}}
@keyframes wireFlicker3{0%,100%{opacity:1}15%{opacity:0.15}30%{opacity:0.8}45%{opacity:0.1}60%{opacity:0.9}80%{opacity:0.15}}
@keyframes gapPulse{0%,100%{opacity:0.3}50%{opacity:0.8}}
@keyframes floatHintSmall{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes hintPulse{0%,100%{opacity:0.3;transform:scale(0.95)}50%{opacity:1;transform:scale(1.05)}}
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
const Lightbulb = ({ on, size = 90, brightness = 1 }) => {
  const s = size;
  const cx = s / 2, bulbR = s * 0.28, bulbCy = s * 0.34;
  const neckW = s * 0.14, baseTop = bulbCy + bulbR * 0.75 + s * 0.06, baseH = s * 0.15;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`bgB${s}`} cx="45%" cy="38%" r="55%">
          <stop offset="0%" stopColor={on ? `rgba(255,255,245,${brightness})` : '#484858'} />
          <stop offset="50%" stopColor={on ? `rgba(255,230,120,${brightness})` : '#383848'} />
          <stop offset="100%" stopColor={on ? `rgba(255,190,50,${0.7 * brightness})` : '#2a2a3a'} />
        </radialGradient>
        <filter id={`glB${s}`}><feGaussianBlur stdDeviation={s * 0.07} result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <linearGradient id={`baB${s}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b0b0b0" /><stop offset="100%" stopColor="#707070" />
        </linearGradient>
      </defs>
      {on && <>
        <circle cx={cx} cy={bulbCy} r={bulbR * 2.2} fill={C.warmGlow} opacity={0.06 * brightness}>
          <animate attributeName="r" values={`${bulbR * 2};${bulbR * 2.4};${bulbR * 2}`} dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx={cx} cy={bulbCy} r={bulbR * 1.5} fill="#fff8e0" opacity={0.1 * brightness} />
      </>}
      <circle cx={cx} cy={bulbCy} r={bulbR} fill={`url(#bgB${s})`}
        stroke={on ? `rgba(255,200,60,${0.5 * brightness})` : '#444'} strokeWidth={1.5}
        filter={on ? `url(#glB${s})` : 'none'} />
      <ellipse cx={cx - bulbR * 0.2} cy={bulbCy - bulbR * 0.25} rx={bulbR * 0.15} ry={bulbR * 0.28}
        fill={`rgba(255,255,255,${on ? 0.4 * brightness : 0.08})`} transform={`rotate(-15 ${cx} ${bulbCy})`} />
      <path d={`M ${cx - bulbR * 0.5} ${bulbCy + bulbR * 0.72} Q ${cx - neckW} ${baseTop - 2} ${cx - neckW} ${baseTop} L ${cx + neckW} ${baseTop} Q ${cx + neckW} ${baseTop - 2} ${cx + bulbR * 0.5} ${bulbCy + bulbR * 0.72}`}
        fill={on ? `rgba(255,220,120,${0.4 * brightness})` : '#383848'} stroke={on ? 'rgba(200,170,60,0.3)' : '#444'} strokeWidth={0.8} />
      <rect x={cx - neckW - 1} y={baseTop} width={neckW * 2 + 2} height={baseH} rx={2} fill={`url(#baB${s})`} stroke="#666" strokeWidth={0.8} />
      {[0.25, 0.5, 0.75].map((f, i) => <line key={i} x1={cx - neckW} y1={baseTop + baseH * f} x2={cx + neckW} y2={baseTop + baseH * f} stroke="#666" strokeWidth={0.6} opacity={0.4} />)}
      <ellipse cx={cx} cy={baseTop + baseH + 2.5} rx={3.5} ry={2} fill="#888" />
      <g opacity={on ? brightness : 0.2}>
        <line x1={cx - 4} y1={bulbCy + 5} x2={cx - 2} y2={bulbCy - bulbR * 0.45} stroke={on ? '#fff' : '#666'} strokeWidth={1.6} strokeLinecap="round" />
        <line x1={cx + 4} y1={bulbCy + 5} x2={cx + 2} y2={bulbCy - bulbR * 0.45} stroke={on ? '#fff' : '#666'} strokeWidth={1.6} strokeLinecap="round" />
        <line x1={cx - 2} y1={bulbCy - bulbR * 0.45} x2={cx + 2} y2={bulbCy - bulbR * 0.45} stroke={on ? '#fff' : '#666'} strokeWidth={1.3} strokeLinecap="round" />
      </g>
      {on && [0, 60, 120, 180, 240, 300].map(deg => (
        <line key={deg}
          x1={cx + Math.cos(deg * Math.PI / 180) * (bulbR + 4)} y1={bulbCy + Math.sin(deg * Math.PI / 180) * (bulbR + 4)}
          x2={cx + Math.cos(deg * Math.PI / 180) * (bulbR + 12)} y2={bulbCy + Math.sin(deg * Math.PI / 180) * (bulbR + 12)}
          stroke={C.warmGlow} strokeWidth={1.8} strokeLinecap="round" opacity={0.25 * brightness}>
          <animate attributeName="opacity" values={`${0.12 * brightness};${0.35 * brightness};${0.12 * brightness}`} dur="2s" begin={`${deg * 0.005}s`} repeatCount="indefinite" />
        </line>
      ))}
    </svg>
  );
};

/* ── Battery Icon ── */
const BatteryIcon = ({ charge = 100, dead = false, size = 70, flicker = false }) => {
  const w = size * 0.55, h = size;
  const fillH = (h - 22) * Math.max(0, charge / 100);
  const fillColor = dead ? '#444' : charge > 40 ? C.accentGreen : charge > 15 ? C.warmOrange : C.accentRed;
  return (
    <svg width={w + 16} height={h + 16} viewBox={`0 0 ${w + 16} ${h + 16}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`bfB${size}${dead ? 'd' : ''}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={fillColor} /><stop offset="100%" stopColor={dead ? '#555' : charge > 40 ? '#a0e8a0' : charge > 15 ? '#ffe080' : '#ff9090'} />
        </linearGradient>
      </defs>
      <rect x={(w + 16) / 2 - 7} y={2} width={14} height={8} rx={3} fill={dead ? '#555' : '#888'} />
      <text x={(w + 16) / 2} y={-1} textAnchor="middle" fontSize="10" fontWeight="900" fill={C.accentRed} fontFamily="Nunito,sans-serif">+</text>
      <rect x={8} y={10} width={w} height={h - 8} rx={7} fill={C.nightMid} stroke={dead ? C.accentRed : '#555'} strokeWidth={2.5}
        opacity={flicker ? undefined : 1}>
        {flicker && <animate attributeName="opacity" values="1;0.4;1;0.6;1" dur="0.7s" repeatCount="indefinite" />}
      </rect>
      <rect x={12} y={10 + (h - 16) - fillH} width={w - 8} height={fillH} rx={4} fill={`url(#bfB${size}${dead ? 'd' : ''})`} opacity={dead ? 0.15 : 0.85}>
        {flicker && <animate attributeName="opacity" values="0.85;0.2;0.85;0.4;0.85" dur="0.7s" repeatCount="indefinite" />}
      </rect>
      <text x={(w + 16) / 2} y={h / 2 + 8} textAnchor="middle" fontSize={dead ? 16 : 20} opacity={dead ? 0.2 : 0.7}>⚡</text>
      <text x={(w + 16) / 2} y={h + 12} textAnchor="middle" fontSize="10" fontWeight="900" fill={C.accentBlue} fontFamily="Nunito,sans-serif">−</text>
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
export default function BatteryLevel({ onComplete, onMilestone }) {
  const [charge, setCharge] = useState(50);
  const [dead, setDead] = useState(false);
  const [replaced, setReplaced] = useState(false);
  const [switchOn, setSwitchOn] = useState(false);
  const [done, setDone] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const [alarming, setAlarming] = useState(false);
  const [sparkle, setSparkle] = useState(false);
  const pidRef = useRef(0);
  const containerRef = useRef(null);
  const drainRef = useRef(null);
  const alarmRef = useRef(null);

  const lightOn = switchOn && !dead;
  const brightness = dead ? 0 : charge / 100;
  const milestoneFired = useRef(false);
  const flickerLevel = !replaced && !dead && charge < 40 ? (charge < 10 ? 3 : charge < 25 ? 2 : 1) : 0;

  useEffect(() => { injectKeyframes(); }, []);

  // Auto-start: turn switch on after mount
  useEffect(() => {
    initAudio();
    const t = setTimeout(() => { setSwitchOn(true); sound.toggleOn(); }, 600);
    return () => clearTimeout(t);
  }, []);

  // Battery drain
  useEffect(() => {
    if (switchOn && !dead && !replaced) {
      drainRef.current = setInterval(() => {
        setCharge(prev => {
          if (prev <= 1) { setDead(true); setSwitchOn(false); sound.dim(); return 0; }
          return prev - 1.4;
        });
      }, 100);
    } else {
      clearInterval(drainRef.current);
    }
    return () => clearInterval(drainRef.current);
  }, [switchOn, dead, replaced]);

  // Alarm trigger
  useEffect(() => {
    if (charge < 40 && charge > 0 && !dead && !replaced) {
      if (!alarming) { setAlarming(true); sound.alarm(); }
    } else {
      setAlarming(false);
    }
  }, [charge, dead, replaced, alarming]);

  // Alarm repeat
  useEffect(() => {
    if (alarming) { alarmRef.current = setInterval(() => sound.alarm(), 2200); }
    else { clearInterval(alarmRef.current); }
    return () => clearInterval(alarmRef.current);
  }, [alarming]);

  // Pop sound when spare battery appears
  useEffect(() => {
    if (dead && !replaced) { setTimeout(() => sound.pop(), 300); }
  }, [dead, replaced]);

  // Energy particles
  useEffect(() => {
    if (!lightOn) { setParticles([]); return; }
    const iv = setInterval(() => {
      setParticles(prev => {
        let next = prev.map(p => ({ ...p, progress: p.progress + 0.018 })).filter(p => p.progress < 1);
        if (next.length < 5) next.push({ id: pidRef.current++, progress: 0 });
        return next;
      });
    }, 45);
    return () => clearInterval(iv);
  }, [lightOn]);

  // Completion
  useEffect(() => {
    if (replaced && switchOn && !done) {
      setDone(true);
      setSparkle(true);
      setTimeout(() => setSparkle(false), 100);
      setTimeout(() => sound.celebrate(), 300);
      if (!milestoneFired.current) {
        milestoneFired.current = true;
        onMilestone?.(50, 30);
      }
    }
  }, [replaced, switchOn, done]);

  // Call onComplete after level is solved
  useEffect(() => {
    if (done && onComplete) {
      const t = setTimeout(onComplete, 1200);
      return () => clearTimeout(t);
    }
  }, [done, onComplete]);

  const getRelPos = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cx - rect.left, y: cy - rect.top };
  };
  const onPtrDown = (e) => { e.preventDefault(); initAudio(); setDragging(true); setDragPos(getRelPos(e)); };
  const onPtrMove = (e) => { if (!dragging) return; e.preventDefault(); setDragPos(getRelPos(e)); };
  const onPtrUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragPos.x < 85 && dragPos.y > 90 && dragPos.y < 250) {
      setCharge(100);
      setDead(false);
      setReplaced(true);
      sound.snap();
      setSparkle(true);
      setTimeout(() => setSparkle(false), 100);
    }
  };

  const toggleSwitch = () => {
    initAudio();
    if (dead) { sound.error(); return; }
    const next = !switchOn;
    setSwitchOn(next);
    next ? sound.toggleOn() : sound.toggleOff();
  };

  const pathY = 150;
  const getParticlePos = (p) => ({ x: 65 + p * 190, y: pathY });
  const flickering = flickerLevel > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div ref={containerRef} style={{
        width: 320, height: 300, borderRadius: 18, position: 'relative',
        background: lightOn
          ? `radial-gradient(ellipse at 75% 30%, rgba(255,214,102,${0.12 * brightness}), ${C.nightSky} 70%)`
          : C.nightSky,
        border: `3px solid ${alarming ? C.accentRed + '88' : dead ? C.accentRed + '44' : C.nightLight}`,
        boxShadow: 'none',
        overflow: 'hidden', touchAction: 'none', userSelect: 'none',
        transition: 'all 0.4s ease',
        animation: alarming ? 'borderFlash 1s ease-in-out infinite' : 'none',
      }} onMouseMove={onPtrMove} onMouseUp={onPtrUp} onMouseLeave={onPtrUp} onTouchMove={onPtrMove} onTouchEnd={onPtrUp}>
        <Starfield />

        {/* Battery */}
        <div style={{ position: 'absolute', left: 14, top: pathY - 52, zIndex: 2 }}>
          <BatteryIcon charge={charge} dead={dead} size={84} flicker={flickering} />
          {dead && !replaced && <div style={{ position: 'absolute', inset: -6, borderRadius: 16, border: `2px dashed ${C.accentRed}66`, animation: 'gapPulse 1s ease-in-out infinite' }} />}
        </div>

        {/* Wire */}
        <div style={{
          position: 'absolute', left: 65, top: pathY - 6, width: 190, height: 12, borderRadius: 6,
          background: lightOn
            ? `linear-gradient(90deg, ${C.warmGlow}, ${C.warmOrange})`
            : replaced ? `linear-gradient(90deg, ${C.warmOrange}, #e8944c)` : 'linear-gradient(90deg, #444, #555)',
          boxShadow: 'none',
          opacity: dead ? 0.25 : 1, transition: 'all 0.3s ease',
          animation: flickering ? `wireFlicker${flickerLevel} ${flickerLevel === 3 ? '0.25' : flickerLevel === 2 ? '0.4' : '0.8'}s ease-in-out infinite` : 'none',
        }} />

        {/* Bulb */}
        <div style={{ position: 'absolute', right: 14, top: pathY - 52, zIndex: 2 }}>
          <Lightbulb on={lightOn} size={95} brightness={brightness} />
        </div>
        <Sparkles active={sparkle} x="80%" y="40%" />

        {/* Energy particles */}
        {particles.map(p => {
          const pos = getParticlePos(p.progress);
          return <div key={p.id} style={{
            position: 'absolute', left: pos.x - 4, top: pos.y - 4, width: 8, height: 8, borderRadius: '50%',
            background: `radial-gradient(circle, #fff, ${C.warmGlow})`, boxShadow: 'none',
            opacity: brightness, pointerEvents: 'none', zIndex: 3,
          }} />;
        })}

        {/* Spare battery */}
        {dead && !replaced && !dragging && (
          <div
            onMouseDown={onPtrDown} onTouchStart={onPtrDown}
            style={{
              position: 'absolute', left: 6, bottom: 14, zIndex: 20,
              cursor: 'grab', animation: 'floatHintSmall 1.5s ease-in-out infinite',
              background: `radial-gradient(ellipse, ${C.accentGreen}12, transparent 70%)`,
              borderRadius: 20, padding: '6px 8px',
            }}
          >
            <BatteryIcon charge={100} size={84} />
            <div style={{
              position: 'absolute', bottom: 2, right: -6, fontSize: 24,
              animation: 'hintPulse 1.5s ease-in-out infinite', pointerEvents: 'none',
            }}>☝️</div>
          </div>
        )}
      </div>

      {/* Drag ghost */}
      {dragging && (
        <div style={{
          position: 'fixed',
          left: (containerRef.current?.getBoundingClientRect().left || 0) + dragPos.x - 32,
          top: (containerRef.current?.getBoundingClientRect().top || 0) + dragPos.y - 52,
          pointerEvents: 'none', opacity: 0.75, zIndex: 100,
        }}>
          <BatteryIcon charge={100} size={84} />
        </div>
      )}

      {/* Switch after replace */}
      {replaced && !done && (
        <div style={{ position: 'relative' }}>
          <SwitchButton on={switchOn} onClick={toggleSwitch} />
          {!switchOn && (
            <>
              <div style={{
                position: 'absolute', inset: -8, borderRadius: 18, pointerEvents: 'none',
                background: `radial-gradient(ellipse, ${C.accentGreen}18, transparent 70%)`,
                animation: 'hintPulse 1.8s ease-in-out infinite',
              }} />
              <div style={{
                position: 'absolute', bottom: 24, left: '58%', transform: 'translateX(-50%)',
                fontSize: 28, zIndex: 10, pointerEvents: 'none',
                animation: 'handBounceUp 1s ease-in-out infinite',
              }}>☝️</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
