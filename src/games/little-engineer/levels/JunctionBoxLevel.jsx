import { useState, useEffect, useRef, useMemo } from 'react';
import { initAudio, sound } from '../audio';
import { colors } from '../../../design-system/tokens';
import Confetti from '../../../design-system/components/Confetti';

/* ── Animal sounds ── */
const ANIMAL_SOUNDS = {
  '🐶':'Woof! 🐶', '🐱':'Meow! 🐱', '🐭':'Squeak! 🐭', '🐹':'Squeak! 🐹',
  '🐰':'Thump! 🐰', '🦊':'Yip! 🦊', '🐻':'Roar! 🐻', '🐼':'Roar! 🐼',
  '🐨':'Grunt! 🐨', '🐯':'Roar! 🐯', '🦁':'Roar! 🦁', '🐮':'Moo! 🐮',
  '🐷':'Oink! 🐷', '🐸':'Ribbit! 🐸', '🐙':'Blub! 🐙', '🦋':'Flutter! 🦋',
  '🐢':'Hiss! 🐢', '🦕':'Roar! 🦕', '🐳':'Splash! 🐳', '🦓':'Neigh! 🦓',
  '🦒':'Hum! 🦒', '🐘':'Trumpet! 🐘', '🦘':'Thump! 🦘', '🦔':'Sniff! 🦔',
  '🐧':'Squawk! 🐧', '🦜':'Squawk! 🦜', '🦩':'Honk! 🦩', '🦚':'Honk! 🦚',
  '🐬':'Click! 🐬', '🦭':'Bark! 🦭',
};

/* ── Colours ── */
const C = {
  nightSky:    '#0d1228',
  nightMid:    '#151e3a',
  nightLight:  '#1e2e58',
  warmGlow:    colors.sunMid,       // #E8B840
  accentGreen: colors.grassMid,     // #4CC830
  accentBlue:  colors.blueberry,    // #9BB5E8
  accentTeal:  colors.sky,          // #4ECDC4
  accentCoral: colors.coralMid,     // #CF4A4A
  accentRed:   colors.coralDark,    // #C23C3C
};

/* ── Wire colours per switch index (did it palette) ── */
const WIRE_COLORS = [colors.sky, colors.sunMid, colors.coralMid, colors.grassMid, colors.blueberryDark];

/* ── Animal pool ── */
const ANIMALS = [
  '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯',
  '🦁','🐮','🐷','🐸','🐙','🦋','🐢','🦕','🐳','🦓',
  '🦒','🐘','🦘','🦔','🐧','🦜','🦩','🦚','🐬','🦭',
];

/* ── SVG layout ── */
const SVG_W = 440;
const SVG_H = 300;
const SW_CX = 58;   // switch column centre X
const BL_CX = 382;  // bulb column centre X
const ROW_Y = [65, 150, 235];  // three row Y centres
const R     = 34;              // circle radius (68px diam — above 64px minimum)
const WF_X  = SW_CX + R + 5;  // wire start X  = 97
const WT_X  = BL_CX - R - 5;  // wire end X    = 343
const CP    = 88;              // bezier control-point offset

/* ── Keyframes ── */
const KEYFRAMES_ID = 'didit-jxb-v2-kf';
const keyframesCSS = `
@keyframes twinkle      { 0%,100%{opacity:0.15} 50%{opacity:0.8} }
@keyframes sparkleFloat { 0%{transform:scale(1) translateY(0);opacity:1} 100%{transform:scale(0) translateY(-60px);opacity:0} }
@keyframes popIn        { 0%{transform:scale(0)} 65%{transform:scale(1.28)} 100%{transform:scale(1)} }
@keyframes trayPop      { 0%{transform:scale(0) translateY(-8px);opacity:0} 60%{transform:scale(1.22) translateY(0);opacity:1} 100%{transform:scale(1) translateY(0);opacity:1} }
@keyframes handBounce   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(9px)} }
@keyframes toastFloatUp { 0%{opacity:1;transform:translateX(-50%) translateY(0)} 65%{opacity:1;transform:translateX(-50%) translateY(-18px)} 100%{opacity:0;transform:translateX(-50%) translateY(-44px)} }
@keyframes slotFill     { 0%{transform:scale(0)} 65%{transform:scale(1.25)} 100%{transform:scale(1)} }
`;

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const el = document.createElement('style');
  el.id = KEYFRAMES_ID;
  el.textContent = keyframesCSS;
  document.head.appendChild(el);
}

/* ── Helpers ── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const generateMapping = () => shuffle([0, 1, 2]);

function pickAnimal(used) {
  const avail = ANIMALS.filter(a => !used.includes(a));
  const pool  = avail.length > 0 ? avail : ANIMALS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* SVG bezier path from switch si to bulb bi */
function wirePath(si, bi) {
  const sy = ROW_Y[si], by = ROW_Y[bi];
  return `M ${WF_X} ${sy} C ${WF_X + CP} ${sy}, ${WT_X - CP} ${by}, ${WT_X} ${by}`;
}

/* ── Stars (SVG children, stable via useMemo) ── */
const Stars = () => {
  const pts = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      cx: 10 + Math.random() * (SVG_W - 20),
      cy: 10 + Math.random() * (SVG_H - 20),
      r:  0.8 + Math.random() * 1.2,
      del: (Math.random() * 3).toFixed(2),
      dur: (2.5 + Math.random() * 2).toFixed(2),
    })), []);
  return (
    <>
      {pts.map(s => (
        <circle key={s.id} cx={s.cx} cy={s.cy} r={s.r} fill="#fff">
          <animate attributeName="opacity"
            values="0.08;0.65;0.08"
            dur={`${s.dur}s`} begin={`${s.del}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </>
  );
};


/* ════════════════════════════════════════════════════════
   JunctionBoxLevel
   ════════════════════════════════════════════════════════ */
export default function JunctionBoxLevel({ onComplete, totalAnimals = 6 }) {
  useEffect(() => { injectKeyframes(); }, []);

  /* Round 0 is the intro (1st animal); each later round adds one more.
     The level finishes once `totalAnimals` have been collected. */
  const lastRound = Math.max(1, totalAnimals - 1);

  const [round,          setRound]         = useState(0);
  const [mapping,        setMapping]       = useState(generateMapping);
  const [wColors,        setWColors]       = useState(() => shuffle(WIRE_COLORS).slice(0, 3));
  const [targetBulb,     setTargetBulb]    = useState(1);  // intro: always middle
  const [currentAnimal,  setCurrentAnimal] = useState(() => pickAnimal([]));
  const [wrongWire,      setWrongWire]     = useState(null);  // switch idx showing wrong highlight
  const [solved,         setSolved]        = useState(false);
  const [trayItems,  setTrayItems] = useState([]);
  const [confetti,   setConfetti] = useState({ active: false, x: 75, y: 50 });
  const [bulbMsg,        setBulbMsg]       = useState(null);  // toast shown above lit bulb
  const [bulbMsgKey,     setBulbMsgKey]    = useState(0);     // remount key for animation restart

  const usedRef  = useRef([]);   // animals already collected (for pickAnimal)
  const keyRef   = useRef(0);    // unique key counter for tray items
  const svgRef   = useRef(null); // ref to game SVG for confetti origin

  /* Round 0 is a single-switch intro; rounds 1-5 are full 3-switch puzzle */
  const isIntro = round === 0;

  /* The switch whose wire leads to targetBulb */
  const correctSw = isIntro ? 1 : mapping.indexOf(targetBulb);

  /* Bulb that briefly flickers when a wrong switch is tapped */
  const wrongBulb = wrongWire !== null ? (isIntro ? 1 : mapping[wrongWire]) : null;

  /* Show hand hint only at very start, before first interaction */
  const showHint = round === 0 && !solved && trayItems.length === 0 && wrongWire === null;

  /* ── Switch tap handler ── */
  const handleSwitch = (swIdx) => {
    if (solved || wrongWire !== null) return;
    initAudio();
    sound.tap();

    if (swIdx === correctSw) {
      /* ── CORRECT ── */
      sound.success();
      setSolved(true);

      const capturedRound      = round;
      const capturedAnimal     = currentAnimal;
      const capturedTargetBulb = targetBulb;

      /* Confetti burst from the bulb position */
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const cx = (rect.left + (BL_CX / SVG_W) * rect.width) / window.innerWidth * 100;
        const cy = (rect.top  + (ROW_Y[capturedTargetBulb] / SVG_H) * rect.height) / window.innerHeight * 100;
        setConfetti({ active: true, x: cx, y: cy });
        setTimeout(() => setConfetti(prev => ({ ...prev, active: false })), 100);
      }

      /* Toast above animal: round 0 = intro, round 1 = encouragement, round 2+ = animal sound */
      if (capturedRound === 0) {
        setBulbMsg("It's on!");
        setBulbMsgKey(k => k + 1);
      } else if (capturedRound === 1) {
        setBulbMsg('You got it! 🎉');
        setBulbMsgKey(k => k + 1);
      } else if (capturedRound >= 2) {
        setBulbMsg(ANIMAL_SOUNDS[capturedAnimal] ?? capturedAnimal);
        setBulbMsgKey(k => k + 1);
      }

      /* After 1s: animal drops to tray (light stays lit) */
      setTimeout(() => {
        sound.pop();
        usedRef.current = [...usedRef.current, capturedAnimal];
        setTrayItems(prev => [...prev, { animal: capturedAnimal, key: keyRef.current++ }]);
        setBulbMsg(null);
      }, 1000);

      /* After 3s: start next round (light goes off) */
      setTimeout(() => {
        if (capturedRound >= lastRound) {
          onComplete?.(usedRef.current);
        } else {
          setRound(capturedRound + 1);
          setMapping(generateMapping());
          setWColors(shuffle(WIRE_COLORS).slice(0, 3));
          setTargetBulb(Math.floor(Math.random() * 3));
          setCurrentAnimal(pickAnimal(usedRef.current));
          setSolved(false);
        }
      }, 3000);

    } else {
      /* ── WRONG ── */
      sound.dim();
      setWrongWire(swIdx);
      setTimeout(() => setWrongWire(null), 800);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>

      {/* ── Puzzle scene ── */}
      <div style={{
        width: '100%', maxWidth: SVG_W, borderRadius: 18, overflow: 'visible',
        background: C.nightSky, border: `3px solid ${C.nightLight}`,
        position: 'relative',
      }}>
        <svg ref={svgRef} width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: 'block' }}>

          {/* Defs: bulb radial gradient + glow filter */}
          <defs>
            {/* Bulb: warm radial gradient when lit */}
            <radialGradient id="jxbBulbLit" cx="40%" cy="35%" r="65%" gradientUnits="objectBoundingBox">
              <stop offset="0%"   stopColor="#fff9c4" stopOpacity="0.97" />
              <stop offset="38%"  stopColor={C.warmGlow} stopOpacity="0.92" />
              <stop offset="100%" stopColor="#7a4e00" stopOpacity="0.88" />
            </radialGradient>
            <filter id="jxbBulbGlow" x="-70%" y="-70%" width="240%" height="240%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {/* Button: top-light gradient overlay for bevel face */}
            <linearGradient id="jxbBtnFace" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="white" stopOpacity="0.20" />
              <stop offset="55%"  stopColor="white" stopOpacity="0.04" />
              <stop offset="100%" stopColor="black" stopOpacity="0.22" />
            </linearGradient>
            {/* Button dome: radial sheen on the coloured cap */}
            <radialGradient id="jxbDome" cx="36%" cy="30%" r="60%" gradientUnits="objectBoundingBox">
              <stop offset="0%"   stopColor="white" stopOpacity="0.72" />
              <stop offset="45%"  stopColor="white" stopOpacity="0.08" />
              <stop offset="100%" stopColor="black" stopOpacity="0.30" />
            </radialGradient>
          </defs>

          {/* Stars */}
          <Stars />

          {/* ── Column labels ── */}
          <text x={SW_CX} y={14} textAnchor="middle" fontSize={9} fontFamily="Nunito, sans-serif" fontWeight="700"
            fill="white" opacity={0.35} letterSpacing="0.08em">SWITCH</text>
          <text x={(WF_X + WT_X) / 2} y={14} textAnchor="middle" fontSize={9} fontFamily="Nunito, sans-serif" fontWeight="700"
            fill="white" opacity={0.35} letterSpacing="0.08em">WIRE</text>
          <text x={BL_CX} y={14} textAnchor="middle" fontSize={9} fontFamily="Nunito, sans-serif" fontWeight="700"
            fill="white" opacity={0.35} letterSpacing="0.08em">LIGHT</text>

          {/* ── Wires ── */}
          {(isIntro ? [1] : [0, 1, 2]).map(si => {
            const bi        = isIntro ? 1 : mapping[si];
            const isWrong   = wrongWire === si;
            const isCorrect = solved && si === correctSw;
            const isFaded   = solved && si !== correctSw;
            return (
              <path key={`w${si}`}
                d={wirePath(si, bi)}
                fill="none"
                stroke={isCorrect ? C.warmGlow : wColors[si]}
                strokeWidth={isCorrect ? 6 : isWrong ? 5 : 4}
                strokeLinecap="round"
                opacity={isFaded ? 0.1 : isCorrect ? 1 : 0.72}
                style={{ transition: 'opacity 0.3s ease, stroke 0.25s ease, stroke-width 0.2s ease' }}
              />
            );
          })}

          {/* ── Target bulb indicator: bright solid ring + two expanding pulses ── */}
          {!solved && (<>
            {/* Static solid bright ring */}
            <circle cx={BL_CX} cy={ROW_Y[targetBulb]} r={R + 5}
              fill="none" stroke="white" strokeWidth={4} opacity={0.9} />
            {/* Fast inner pulse */}
            <circle cx={BL_CX} cy={ROW_Y[targetBulb]} r={R + 5}
              fill="none" stroke="white" strokeWidth={3.5} opacity={1}>
              <animate attributeName="r"       values={`${R+4};${R+20};${R+4}`} dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.85;0;0.85"             dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="stroke-width" values="3.5;0.5;3.5"        dur="1.2s" repeatCount="indefinite" />
            </circle>
            {/* Slower outer bloom */}
            <circle cx={BL_CX} cy={ROW_Y[targetBulb]} r={R + 5}
              fill="none" stroke="white" strokeWidth={2} opacity={0.6}>
              <animate attributeName="r"       values={`${R+5};${R+30};${R+5}`} dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6"               dur="1.8s" repeatCount="indefinite" />
            </circle>
          </>)}

          {/* ── Bulbs ── */}
          {(isIntro ? [1] : [0, 1, 2]).map(j => {
            const cy = ROW_Y[j];
            const isTarget = j === targetBulb;
            const isSolved = solved && j === targetBulb;
            const isFlicker = j === wrongBulb;
            const flickerColor = wrongWire !== null ? wColors[wrongWire] : C.accentBlue;
            return (
              <g key={`b${j}`}>
                {/* Pulsing ambient halo when lit */}
                {isSolved && (
                  <circle cx={BL_CX} cy={cy} r={R + 14} fill={C.warmGlow} opacity={0.13}>
                    <animate attributeName="r"       values={`${R+10};${R+24};${R+10}`} dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.18;0.04;0.18"             dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Dim halo flicker when wrong switch tapped — shows connection but no real power */}
                {isFlicker && (
                  <circle cx={BL_CX} cy={cy} r={R + 8} fill={flickerColor} opacity={0.18} />
                )}
                {/* Bulb body — lit uses radial gradient + glow filter */}
                <circle cx={BL_CX} cy={cy} r={R}
                  fill={isSolved ? 'url(#jxbBulbLit)' : isFlicker ? flickerColor + '22' : C.nightMid}
                  stroke={isSolved ? C.warmGlow : isFlicker ? flickerColor : isTarget ? C.warmGlow + '55' : C.nightLight}
                  strokeWidth={isSolved ? 3 : isFlicker ? 2.5 : 2}
                  filter={isSolved ? 'url(#jxbBulbGlow)' : undefined}
                  style={{ transition: 'stroke 0.2s ease, fill 0.2s ease' }}
                />
                {/* Glass shine */}
                <ellipse cx={BL_CX - 10} cy={cy - 11} rx={7} ry={5}
                  fill="white" opacity={isSolved ? 0.35 : 0.07} />
                {/* Animal emoji */}
                {isSolved && (
                  <text x={BL_CX} y={cy + 14}
                    textAnchor="middle" fontSize={44}
                    style={{
                      transformBox: 'fill-box',
                      transformOrigin: 'center',
                      animation: 'popIn 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                    }}>
                    {currentAnimal}
                  </text>
                )}
              </g>
            );
          })}

          {/* ── Switches (circular beveled arcade button) ── */}
          {(isIntro ? [1] : [0, 1, 2]).map(i => {
            const cy = ROW_Y[i];
            const isCorrect = solved && i === correctSw;
            const isWrong   = wrongWire === i;
            const baseColor  = '#0e1c3a';
            const ringColor  = '#253d70';
            const domeColor  = wColors[i];
            return (
              <g key={`s${i}`}
                onClick={() => handleSwitch(i)}
                style={{ cursor: solved ? 'default' : 'pointer' }}
              >
                {/* Invisible hit area — 68×68 */}
                <rect x={SW_CX - R} y={cy - R} width={R * 2} height={R * 2} fill="transparent" />
                {/* Outer housing ring — dark recess */}
                <circle cx={SW_CX} cy={cy} r={R + 4} fill="#050c1c" />
                {/* Drop shadow below button — depth illusion */}
                <circle cx={SW_CX} cy={cy + 3} r={R} fill="#020710" opacity={0.75} />
                {/* Button face */}
                <circle cx={SW_CX} cy={cy} r={R}
                  fill={baseColor}
                  stroke={ringColor}
                  strokeWidth={isWrong || isCorrect ? 2.5 : 1.5}
                  style={{ transition: 'fill 0.22s ease, stroke 0.22s ease' }}
                />
                {/* Face gradient — top-lit bevel */}
                <circle cx={SW_CX} cy={cy} r={R} fill="url(#jxbBtnFace)" />
                {/* Top bevel highlight arc */}
                <ellipse cx={SW_CX} cy={cy - R * 0.42} rx={R * 0.62} ry={R * 0.22}
                  fill="white" opacity={0.25} />
                {/* Bottom bevel shadow arc */}
                <ellipse cx={SW_CX} cy={cy + R * 0.48} rx={R * 0.58} ry={R * 0.18}
                  fill="black" opacity={0.40} />
                {/* Coloured dome cap */}
                <circle cx={SW_CX} cy={cy} r={24}
                  fill={domeColor}
                  style={{ transition: 'fill 0.22s ease' }}
                />
                {/* Dome sheen */}
                <circle cx={SW_CX} cy={cy} r={24} fill="url(#jxbDome)" />
                {/* Wire-colour nub at right edge */}
                <circle cx={SW_CX + R + 1} cy={cy} r={5} fill={wColors[i]} opacity={0.95} />
              </g>
            );
          })}

          {/* ── Initial hand hint — 👇 above first button, bounces down toward it ── */}
          {showHint && (
            <text x={SW_CX} y={ROW_Y[isIntro ? 1 : 0] - R - 6}
              textAnchor="middle" fontSize={26}
              style={{ animation: 'handBounce 0.9s ease-in-out infinite', userSelect: 'none', display: 'block' }}>
              👇
            </text>
          )}

        </svg>

        {/* Confetti from bulb */}
        <Confetti active={confetti.active} originX={confetti.x} originY={confetti.y}
          onComplete={() => setConfetti(prev => ({ ...prev, active: false }))} />

        {/* Floating toast above the lit bulb */}
        {bulbMsg && solved && (
          <div key={bulbMsgKey} style={{
            position: 'absolute',
            left: `${BL_CX / SVG_W * 100}%`,
            top: `${Math.max(4, (ROW_Y[targetBulb] - R - 32) / SVG_H * 100)}%`,
            transform: 'translateX(-50%)',
            background: 'white',
            borderRadius: 9999,
            padding: '5px 16px',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: '0.82rem',
            color: C.warmGlow,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 20,
            animation: 'toastFloatUp 2s ease-out forwards',
          }}>
            {bulbMsg}
          </div>
        )}
      </div>

      {/* ── Collection docket — one slot per animal to collect ── */}
      <div style={{
        width: '100%', maxWidth: SVG_W,
        borderRadius: 14,
        background: C.nightMid, border: `2px solid ${C.nightLight}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: '10px 16px',
      }}>
        {Array.from({ length: totalAnimals }, (_, i) => {
          const item = trayItems[i];
          return (
            <div key={i} style={{
              width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
              border: item ? `2px solid ${C.nightLight}` : '2px dashed rgba(255,255,255,0.18)',
              background: item ? C.nightSky : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26,
              animation: item ? 'slotFill 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
            }}>
              {item?.animal ?? ''}
            </div>
          );
        })}
      </div>

    </div>
  );
}
