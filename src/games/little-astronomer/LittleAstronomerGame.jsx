import { useState, useMemo, useRef, useEffect } from 'react';
import { initAudio, sound } from './audio';

// ── Planet data ────────────────────────────────────────────────
export const PLANETS = [
  { id: 'saturn',  name: 'Saturn',  color: '#C4A35A', rings: true,  size: 'large',  bands: false },
  { id: 'jupiter', name: 'Jupiter', color: '#C88B3A', rings: false, size: 'large',  bands: true  },
  { id: 'mars',    name: 'Mars',    color: '#C1440E', rings: false, size: 'small',  bands: false },
  { id: 'earth',   name: 'Earth',   color: '#2E86AB', rings: false, size: 'medium', bands: false, patches: true },
  { id: 'neptune', name: 'Neptune', color: '#4B6CB7', rings: true,  size: 'medium', bands: false, thinRing: true },
  { id: 'mercury', name: 'Mercury', color: '#B5B5B5', rings: false, size: 'tiny',   bands: false, craters: true },
];

// Radius in px for each named size
const SIZE_RADIUS = { tiny: 28, small: 36, medium: 46, large: 58 };

// ── Inject keyframes once ─────────────────────────────────────
const KF_ID = 'little-astronomer-keyframes';
function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KF_ID)) return;
  const el = document.createElement('style');
  el.id = KF_ID;
  el.textContent = `
    @keyframes astroShake {
      0%,100% { transform: translateX(0) }
      20%     { transform: translateX(-6px) }
      40%     { transform: translateX(6px) }
      60%     { transform: translateX(-4px) }
      80%     { transform: translateX(4px) }
    }
    @keyframes twinkle {
      0%,100% { opacity: 0.2 }
      50%     { opacity: 0.9 }
    }
    @keyframes silhouetteFadeOut {
      from { opacity: 1 }
      to   { opacity: 0 }
    }
    @keyframes planetFadeIn {
      from { opacity: 0 }
      to   { opacity: 1 }
    }
  `;
  document.head.appendChild(el);
}

// ── PlanetSVG component ────────────────────────────────────────
export function PlanetSVG({ planet, size, silhouette = false, animating = false }) {
  const r = SIZE_RADIUS[planet.size] || 46;
  const totalSize = size || r * 2 + 40;
  const cx = totalSize / 2;
  const cy = totalSize / 2;
  const bodyFill = silhouette ? '#1a1a2e' : planet.color;
  const uid = `${planet.id}_${silhouette ? 's' : 'c'}`;

  const dropShadow = silhouette
    ? 'drop-shadow(0 0 6px rgba(255,255,255,0.2))'
    : animating
    ? 'drop-shadow(0 0 12px rgba(255,255,255,0.45))'
    : 'none';

  function lighten(hex) {
    const n = parseInt(hex.slice(1), 16);
    const rv = Math.min(255, ((n >> 16) & 0xff) + 55);
    const gv = Math.min(255, ((n >> 8) & 0xff) + 45);
    const bv = Math.min(255, (n & 0xff) + 30);
    return `rgb(${rv},${gv},${bv})`;
  }

  return (
    <svg
      width={totalSize}
      height={totalSize}
      viewBox={`0 0 ${totalSize} ${totalSize}`}
      style={{ overflow: 'visible', filter: dropShadow }}
    >
      <defs>
        <clipPath id={`clip_${uid}`}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
        {planet.rings && (
          <clipPath id={`ringback_${uid}`}>
            <rect x={0} y={0} width={totalSize} height={cy} />
          </clipPath>
        )}
      </defs>

      {/* Back ring (upper half) */}
      {planet.rings && !planet.thinRing && (
        <ellipse
          cx={cx} cy={cy}
          rx={r * 1.7} ry={r * 0.3}
          fill={silhouette ? '#0d0d1a' : 'rgba(196,163,90,0.55)'}
          transform={`rotate(-15, ${cx}, ${cy})`}
          clipPath={`url(#ringback_${uid})`}
        />
      )}
      {planet.rings && planet.thinRing && (
        <ellipse
          cx={cx} cy={cy}
          rx={r * 1.4} ry={r * 0.2}
          fill="none"
          stroke={silhouette ? '#0d0d1a' : 'rgba(100,140,220,0.5)'}
          strokeWidth={r * 0.1}
          clipPath={`url(#ringback_${uid})`}
        />
      )}

      {/* Main planet body */}
      <circle cx={cx} cy={cy} r={r} fill={bodyFill} />

      {/* Jupiter bands */}
      {!silhouette && planet.bands && (
        [0.52, 0.18, -0.18, -0.52].map((yOff, i) => (
          <ellipse
            key={i}
            cx={cx} cy={cy + r * yOff}
            rx={r * 0.94} ry={r * 0.09}
            fill={lighten(planet.color)}
            opacity={0.55}
            clipPath={`url(#clip_${uid})`}
          />
        ))
      )}

      {/* Earth patches */}
      {!silhouette && planet.patches && (
        <>
          <ellipse cx={cx - r*0.22} cy={cy - r*0.1}  rx={r*0.22} ry={r*0.16} fill="#3AB85A" opacity={0.85} transform={`rotate(-20,${cx-r*0.22},${cy-r*0.1})`}  clipPath={`url(#clip_${uid})`} />
          <ellipse cx={cx + r*0.28} cy={cy + r*0.22} rx={r*0.18} ry={r*0.13} fill="#3AB85A" opacity={0.75} clipPath={`url(#clip_${uid})`} />
          <ellipse cx={cx - r*0.05} cy={cy + r*0.35} rx={r*0.14} ry={r*0.09} fill="#3AB85A" opacity={0.7}  clipPath={`url(#clip_${uid})`} />
          <ellipse cx={cx + r*0.05} cy={cy - r*0.32} rx={r*0.10} ry={r*0.08} fill="#3AB85A" opacity={0.65} clipPath={`url(#clip_${uid})`} />
        </>
      )}

      {/* Mercury craters */}
      {!silhouette && planet.craters && (
        [
          { ox: -0.22, oy: -0.28, s: 0.11 },
          { ox:  0.28, oy:  0.12, s: 0.09 },
          { ox: -0.10, oy:  0.32, s: 0.07 },
          { ox:  0.14, oy: -0.08, s: 0.06 },
          { ox: -0.32, oy:  0.10, s: 0.05 },
        ].map((c, i) => (
          <circle
            key={i}
            cx={cx + r * c.ox} cy={cy + r * c.oy}
            r={r * c.s}
            fill="rgba(0,0,0,0.25)"
            stroke="rgba(0,0,0,0.12)"
            strokeWidth={1}
            clipPath={`url(#clip_${uid})`}
          />
        ))
      )}

      {/* Specular highlight */}
      {!silhouette && (
        <ellipse
          cx={cx - r*0.26} cy={cy - r*0.28}
          rx={r*0.26} ry={r*0.18}
          fill="rgba(255,255,255,0.18)"
          transform={`rotate(-15, ${cx-r*0.26}, ${cy-r*0.28})`}
          clipPath={`url(#clip_${uid})`}
        />
      )}

      {/* Front ring (lower half) */}
      {planet.rings && !planet.thinRing && (
        <ellipse
          cx={cx} cy={cy}
          rx={r * 1.7} ry={r * 0.3}
          fill={silhouette ? '#0d0d1a' : 'rgba(196,163,90,0.5)'}
          transform={`rotate(-15, ${cx}, ${cy})`}
          style={{ clipPath: `inset(${cy}px 0 0 0)` }}
        />
      )}
      {planet.rings && planet.thinRing && (
        <ellipse
          cx={cx} cy={cy}
          rx={r * 1.4} ry={r * 0.2}
          fill="none"
          stroke={silhouette ? '#0d0d1a' : 'rgba(100,140,220,0.45)'}
          strokeWidth={r * 0.1}
          style={{ clipPath: `inset(${cy}px 0 0 0)` }}
        />
      )}
    </svg>
  );
}

// ── Starfield ─────────────────────────────────────────────────
function Starfield({ stars }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {stars.map(s => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top:  `${s.y}%`,
            width:  s.size,
            height: s.size,
            borderRadius: '50%',
            background: '#ffffff',
            opacity: s.twinkle ? undefined : 0.55,
            animation: s.twinkle ? `twinkle 2s ${s.delay}s ease-in-out infinite` : 'none',
          }}
        />
      ))}
    </div>
  );
}

// ── FlyingPlanet ──────────────────────────────────────────────
// Renders a fixed-position planet that animates from `from` to `to`
function FlyingPlanet({ planet, from, to, svgSize }) {
  const [pos, setPos] = useState(from);

  useEffect(() => {
    // Kick off to target on next frame so CSS transition fires
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPos(to));
    });
    return () => cancelAnimationFrame(raf);
  }, [to.x, to.y]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        position: 'fixed',
        left: pos.x - svgSize / 2,
        top:  pos.y - svgSize / 2,
        width:  svgSize,
        height: svgSize,
        zIndex: 500,
        pointerEvents: 'none',
        transition: 'left 0.4s cubic-bezier(0.34,1.56,0.64,1), top 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <PlanetSVG planet={planet} size={svgSize} animating />
    </div>
  );
}

// ── Utility ────────────────────────────────────────────────────
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Main game component ────────────────────────────────────────
// Props: { planet, options, onMilestone }
// options = [correct, distractor1, distractor2] — will be reshuffled internally
export default function LittleAstronomerGame({ planet, options, onMilestone }) {
  injectKeyframes();

  const [flying, setFlying]           = useState(false);
  const [flyingFrom, setFlyingFrom]   = useState({ x: 0, y: 0 });
  const [flyingTo, setFlyingTo]       = useState({ x: 0, y: 0 });
  const [landed, setLanded]           = useState(false);
  const [shaking, setShaking]         = useState(null);
  const [done, setDone]               = useState(false);

  const silhouetteRef = useRef(null);
  const optionRefs    = useRef([]);

  const shuffledOptions = useMemo(
    () => shuffleArray(options || [planet]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [planet.id]
  );

  const stars = useMemo(() => Array.from({ length: 45 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2,
    twinkle: i < 5,
    delay: Math.random() * 3,
  })), []);

  // Reset on new planet
  useEffect(() => {
    setFlying(false);
    setLanded(false);
    setShaking(null);
    setDone(false);
  }, [planet.id]);

  const r = SIZE_RADIUS[planet.size] || 46;
  const silhouetteSvgSize = r * 2 + 60;
  const flyingSvgSize     = r * 2 + 40;

  const handleTap = (tappedPlanet, optionIndex) => {
    if (done || flying || landed) return;
    initAudio();

    if (tappedPlanet.id === planet.id) {
      setDone(true);

      // Capture positions
      const optEl = optionRefs.current[optionIndex];
      const silEl = silhouetteRef.current;

      let fromX = window.innerWidth  / 2;
      let fromY = window.innerHeight * 0.75;
      let toX   = window.innerWidth  / 2;
      let toY   = window.innerHeight * 0.3;

      if (optEl) {
        const rect = optEl.getBoundingClientRect();
        fromX = rect.left + rect.width  / 2;
        fromY = rect.top  + rect.height / 2;
      }
      if (silEl) {
        const rect = silEl.getBoundingClientRect();
        toX = rect.left + rect.width  / 2;
        toY = rect.top  + rect.height / 2;
      }

      setFlyingFrom({ x: fromX, y: fromY });
      setFlyingTo({ x: toX, y: toY });
      setFlying(true);
      sound.swoosh();

      // After animation completes
      setTimeout(() => {
        sound.thud();
        setFlying(false);
        setLanded(true);

        setTimeout(() => {
          sound.chime();
          let ox = 50, oy = 35;
          const silEl2 = silhouetteRef.current;
          if (silEl2) {
            const rect = silEl2.getBoundingClientRect();
            ox = ((rect.left + rect.width  / 2) / window.innerWidth)  * 100;
            oy = ((rect.top  + rect.height / 2) / window.innerHeight) * 100;
          }
          onMilestone(ox, oy);
        }, 300);
      }, 400);

    } else {
      sound.wrong();
      setShaking(tappedPlanet.id);
      setTimeout(() => setShaking(null), 550);
    }
  };

  return (
    <div style={{
      position: 'relative',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      minHeight: 420,
      paddingBottom: 24,
      overflow: 'hidden',
    }}>
      <Starfield stars={stars} />

      {/* Silhouette / revealed planet */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2,
        minHeight: 200,
      }}>
        <div ref={silhouetteRef}>
          {!landed ? (
            <PlanetSVG planet={planet} size={silhouetteSvgSize} silhouette />
          ) : (
            <div style={{ animation: 'planetFadeIn 0.3s ease-out forwards', textAlign: 'center' }}>
              <PlanetSVG planet={planet} size={silhouetteSvgSize} />
              <div style={{
                marginTop: 10,
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                fontSize: '1.2rem',
                color: '#E8B840',
                letterSpacing: 1,
              }}>
                {planet.name}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Options row */}
      <div style={{
        display: 'flex',
        gap: 20,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2,
        flexWrap: 'wrap',
        paddingTop: 8,
      }}>
        {shuffledOptions.map((p, i) => {
          const isCorrect = p.id === planet.id;
          const isShaking = shaking === p.id;
          const hideMe    = (flying && isCorrect) || (landed && isCorrect);
          const pr        = SIZE_RADIUS[p.size] || 46;
          const svgSize   = pr * 2 + 32;
          const tapSize   = Math.max(80, svgSize);

          return (
            <div
              key={p.id}
              ref={el => { optionRefs.current[i] = el; }}
              onClick={() => handleTap(p, i)}
              style={{
                width:  tapSize,
                height: tapSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: done ? 'default' : 'pointer',
                animation: isShaking ? 'astroShake 0.45s ease' : 'none',
                opacity: hideMe ? 0 : 1,
                transition: 'opacity 0.15s ease',
                WebkitTapHighlightColor: 'transparent',
                flexShrink: 0,
              }}
            >
              <PlanetSVG planet={p} size={svgSize} />
            </div>
          );
        })}
      </div>

      {/* Flying planet overlay */}
      {flying && (
        <FlyingPlanet
          planet={planet}
          from={flyingFrom}
          to={flyingTo}
          svgSize={flyingSvgSize}
        />
      )}
    </div>
  );
}
