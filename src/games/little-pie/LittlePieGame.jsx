import { useState, useRef, useEffect } from 'react';
import { initAudio, sound } from './audio';

const SVG_W = 280, SVG_H = 280, CX = 140, CY = 140, R = 108;
const CHIP_SIZE = 92, CHIP_R = 34;
const SNAP_R = 80;
const FONT = "'Nunito', sans-serif";
const PIE_COLORS = ['#CF4A4A', '#F2C4BE', '#E8AAAA', '#C23C3C', '#F9D4CF'];

// ── Level definitions ─────────────────────────────────────────────
export const LEVEL_DEFS = [
  { spans: [180, 180], gap: 1 },
  { spans: [90, 90, 90, 90], gap: 2 },
  { spans: [270, 90], gap: 1 },
  { spans: [130, 110, 120], gap: 0 },
  { spans: [100, 120, 80, 60], gap: 2 },
  { spans: [72, 90, 108, 50, 40], gap: 3 },
];

// ── Helpers ──────────────────────────────────────────────────────
function ptOnCircle(cx, cy, r, deg) {
  const rad = (deg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function makePiePath(cx, cy, r, a1, a2) {
  const [x1, y1] = ptOnCircle(cx, cy, r, a1);
  const [x2, y2] = ptOnCircle(cx, cy, r, a2);
  const span = a2 - a1;
  return `M ${cx.toFixed(1)} ${cy.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${span > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
}

function makeChipPath(a1, a2) {
  return makePiePath(CHIP_SIZE / 2, CHIP_SIZE / 2, CHIP_R, a1, a2);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Build slices from level def ──────────────────────────────────
function buildSlices(def) {
  const slices = [];
  let cursor = 0;
  def.spans.forEach((span, i) => {
    slices.push({
      start: cursor,
      end: cursor + span,
      color: PIE_COLORS[i % PIE_COLORS.length],
      isGap: i === def.gap,
    });
    cursor += span;
  });
  return slices;
}

// ── Build 3 options (correct + 2 distractors) ────────────────────
function makeOptions(slices, gapIdx) {
  const gap = slices[gapIdx];
  const gapSpan = gap.end - gap.start;

  const correct = {
    start: gap.start,
    end: gap.end,
    isCorrect: true,
    color: gap.color,
  };

  const d1Span = Math.max(15, Math.round(gapSpan * 0.5));
  const d1 = {
    start: 0,
    end: d1Span,
    isCorrect: false,
    color: '#E8AAAA',
  };

  const d2Span = Math.min(320, Math.round(gapSpan * 1.6));
  const d2 = {
    start: 0,
    end: d2Span,
    isCorrect: false,
    color: '#E8AAAA',
  };

  return shuffle([correct, d1, d2]);
}

// ── Keyframes injected once ──────────────────────────────────────
const KEYFRAMES_ID = 'didit-pie-game-keyframes';
function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes pieShake {
      0%   { transform: translateX(0) rotate(0deg); }
      15%  { transform: translateX(-8px) rotate(-5deg); }
      30%  { transform: translateX(8px) rotate(5deg); }
      45%  { transform: translateX(-6px) rotate(-3deg); }
      60%  { transform: translateX(6px) rotate(3deg); }
      75%  { transform: translateX(-3px) rotate(-2deg); }
      90%  { transform: translateX(3px) rotate(2deg); }
      100% { transform: translateX(0) rotate(0deg); }
    }
    @keyframes piePulse {
      0%   { filter: drop-shadow(0 0 0px rgba(194,60,60,0)); }
      30%  { filter: drop-shadow(0 0 12px rgba(194,60,60,0.7)); }
      60%  { filter: drop-shadow(0 0 8px rgba(194,60,60,0.5)); }
      100% { filter: drop-shadow(0 0 4px rgba(194,60,60,0.3)); }
    }
  `;
  document.head.appendChild(style);
}

// ── Component ────────────────────────────────────────────────────
export default function LittlePieGame({ levelDef, onMilestone }) {
  injectKeyframes();

  const svgRef = useRef(null);

  const slices = buildSlices(levelDef);
  const gapIdx = levelDef.gap;

  const [options] = useState(() => makeOptions(slices, gapIdx));
  const [dragging, setDragging] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [snapped, setSnapped] = useState(false);
  const [shaking, setShaking] = useState(null);
  const [pulsing, setPulsing] = useState(false);

  const gapSlice = slices[gapIdx];

  // Get screen position of gap center
  function getGapCenter() {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const scale = rect.width / SVG_W;
    const midAngle = (gapSlice.start + gapSlice.end) / 2;
    const [svgX, svgY] = ptOnCircle(CX, CY, R * 0.6, midAngle);
    return {
      x: rect.left + svgX * scale,
      y: rect.top + svgY * scale,
    };
  }

  function startDrag(e, idx) {
    e.preventDefault();
    initAudio();
    sound.pickup();
    setDragging(idx);
    setDragPos({ x: e.clientX, y: e.clientY });
  }

  function handleDrop(px, py) {
    if (dragging === null) return;
    const center = getGapCenter();
    const dist = Math.hypot(px - center.x, py - center.y);
    const opt = options[dragging];

    if (dist < SNAP_R) {
      if (opt.isCorrect) {
        sound.snap();
        setSnapped(true);
        setPulsing(true);
        const capturedDragging = dragging;
        setTimeout(() => {
          sound.chime();
          if (svgRef.current) {
            const rect = svgRef.current.getBoundingClientRect();
            const xPct = ((center.x - rect.left) / rect.width) * 100;
            const yPct = ((center.y - rect.top) / rect.height) * 100;
            onMilestone && onMilestone(xPct, yPct);
          } else {
            onMilestone && onMilestone(50, 50);
          }
        }, 350);
      } else {
        sound.boing();
        const idx = dragging;
        setShaking(idx);
        setTimeout(() => setShaking(null), 550);
      }
    }

    setDragging(null);
  }

  useEffect(() => {
    if (dragging === null) return;

    function onMove(e) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      setDragPos({ x: clientX, y: clientY });
    }

    function onUp(e) {
      const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
      handleDrop(clientX, clientY);
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  // Gap dashed arc path (outline only, no fill)
  const [gx1, gy1] = ptOnCircle(CX, CY, R, gapSlice.start);
  const [gx2, gy2] = ptOnCircle(CX, CY, R, gapSlice.end);
  const gapSpan = gapSlice.end - gapSlice.start;
  const gapArcPath = `M ${gx1.toFixed(1)} ${gy1.toFixed(1)} A ${R} ${R} 0 ${gapSpan > 180 ? 1 : 0} 1 ${gx2.toFixed(1)} ${gy2.toFixed(1)}`;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 24,
      padding: '16px 0 8px',
      userSelect: 'none',
      touchAction: 'none',
    }}>
      {/* Pie SVG */}
      <svg
        ref={svgRef}
        width={SVG_W}
        height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{
          maxWidth: '90vw',
          maxHeight: '55vw',
          display: 'block',
          animation: pulsing ? 'piePulse 0.8s ease-out 2' : 'none',
        }}
      >
        <defs>
          <radialGradient id="pieShine" cx="40%" cy="30%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx={CX} cy={CY} r={R + 6}
          fill="rgba(194,60,60,0.06)"
          stroke="rgba(194,60,60,0.2)"
          strokeWidth={1.5}
        />

        {/* Non-gap slices; gap slice rendered when snapped */}
        {slices.map((s, i) => {
          if (s.isGap && !snapped) return null;
          return (
            <path
              key={i}
              d={makePiePath(CX, CY, R, s.start, s.end)}
              fill={s.color}
              stroke="white"
              strokeWidth={2}
            />
          );
        })}

        {/* Gap dashed outline (only when not snapped) */}
        {!snapped && (
          <path
            d={gapArcPath}
            fill="none"
            stroke="rgba(194,60,60,0.35)"
            strokeWidth={2}
            strokeDasharray="8 5"
          />
        )}

        {/* White center dot */}
        <circle cx={CX} cy={CY} r={5} fill="white" />

        {/* Radial shine overlay */}
        <circle
          cx={CX}
          cy={CY - R * 0.2}
          r={R * 0.35}
          fill="url(#pieShine)"
          style={{ pointerEvents: 'none' }}
        />
      </svg>

      {/* Chip tray */}
      {!snapped && (
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 16,
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 0',
        }}>
          {options.map((opt, idx) => {
            const isBeingDragged = dragging === idx;

            return (
              <div
                key={idx}
                onPointerDown={(!snapped && dragging === null) ? (e) => startDrag(e, idx) : undefined}
                style={{
                  width: CHIP_SIZE,
                  height: CHIP_SIZE,
                  borderRadius: 16,
                  border: '2px solid rgba(194,60,60,0.3)',
                  background: 'rgba(255,251,245,0.95)',
                  boxShadow: '0 2px 8px rgba(194,60,60,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: snapped ? 'default' : 'grab',
                  opacity: isBeingDragged ? 0.35 : 1,
                  transition: 'opacity 0.2s',
                  animation: shaking === idx ? 'pieShake 0.5s ease-out' : 'none',
                  touchAction: 'none',
                  userSelect: 'none',
                  flexShrink: 0,
                }}
              >
                <svg
                  width={CHIP_SIZE}
                  height={CHIP_SIZE}
                  viewBox={`0 0 ${CHIP_SIZE} ${CHIP_SIZE}`}
                >
                  <path
                    d={makeChipPath(opt.start, opt.end)}
                    fill={opt.color}
                    stroke="white"
                    strokeWidth={1.5}
                  />
                </svg>
              </div>
            );
          })}
        </div>
      )}

      {/* Drag ghost */}
      {dragging !== null && (
        <div style={{
          position: 'fixed',
          left: dragPos.x - CHIP_SIZE * 0.75,
          top: dragPos.y - CHIP_SIZE * 0.75,
          width: CHIP_SIZE * 1.5,
          height: CHIP_SIZE * 1.5,
          pointerEvents: 'none',
          zIndex: 500,
        }}>
          <svg
            width={CHIP_SIZE * 1.5}
            height={CHIP_SIZE * 1.5}
            viewBox={`0 0 ${CHIP_SIZE} ${CHIP_SIZE}`}
          >
            <path
              d={makeChipPath(options[dragging].start, options[dragging].end)}
              fill={options[dragging].color}
              stroke="white"
              strokeWidth={1.5}
              style={{ filter: 'drop-shadow(0 4px 12px rgba(194,60,60,0.35))' }}
            />
          </svg>
        </div>
      )}
    </div>
  );
}
