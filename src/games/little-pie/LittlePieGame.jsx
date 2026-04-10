import { useState, useRef, useEffect, useMemo } from 'react';
import { initAudio, sound } from './audio';

// ── Constants ─────────────────────────────────────────────────
const SVG_W = 260, SVG_H = 260, CX = 130, CY = 130, R = 100;
const CHIP_SIZE = 76;   // tray chip outer box size
const CHIP_R   = 28;    // radius of arc inside chip
const SNAP_R   = 56;    // snap-to-slot tolerance (screen px)
const FONT = "'Nunito', sans-serif";

const PIE_COLORS = ['#CF4A4A', '#E8AAAA', '#C23C3C', '#F2C4BE', '#D05050', '#F9D4CF'];

// ── Level defs — ALL spans, no "gap" index ────────────────────
// Every slice is a piece the child must place.
export const LEVEL_DEFS = [
  { spans: [180, 180] },           // L1: 2 halves
  { spans: [120, 120, 120] },      // L2: 3 thirds
  { spans: [240, 120] },           // L3: big + small
  { spans: [150, 120, 90] },       // L4: 3 unequal
  { spans: [130, 100, 80, 50] },   // L5: 4 pieces
  { spans: [110, 90, 72, 52, 36] },// L6: 5 pieces (110+90+72+52+36=360)
];

// ── Helpers ───────────────────────────────────────────────────
function ptOnCircle(cx, cy, r, deg) {
  const rad = (deg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function makePiePath(cx, cy, r, a1, a2) {
  const [x1, y1] = ptOnCircle(cx, cy, r, a1);
  const [x2, y2] = ptOnCircle(cx, cy, r, a2);
  const large = (a2 - a1) > 180 ? 1 : 0;
  return `M ${cx.toFixed(1)} ${cy.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
}

// Chip path — same formula but centered in CHIP_SIZE box
function makeChipPath(a1, a2) {
  return makePiePath(CHIP_SIZE / 2, CHIP_SIZE / 2, CHIP_R, a1, a2);
}

function buildSlices(def) {
  let cursor = 0;
  return def.spans.map((span, i) => {
    const s = { id: i, start: cursor, end: cursor + span, span, color: PIE_COLORS[i % PIE_COLORS.length] };
    cursor += span;
    return s;
  });
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Keyframes ─────────────────────────────────────────────────
const KF_ID = 'didit-pie-kf';
function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KF_ID)) return;
  const el = document.createElement('style');
  el.id = KF_ID;
  el.textContent = `
    @keyframes pieSnapIn {
      0%   { transform: scale(1.25); opacity: 0.6; }
      55%  { transform: scale(0.9); }
      75%  { transform: scale(1.05); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes piePulse {
      0%   { filter: drop-shadow(0 0 0px rgba(194,60,60,0)); }
      40%  { filter: drop-shadow(0 0 18px rgba(194,60,60,0.9)); }
      100% { filter: drop-shadow(0 0 6px rgba(194,60,60,0.3)); }
    }
    @keyframes chipIdle {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-5px); }
    }
  `;
  document.head.appendChild(el);
}

// ── Component ─────────────────────────────────────────────────
export default function LittlePieGame({ levelDef, onMilestone }) {
  injectKeyframes();

  const svgRef = useRef(null);
  const completeFired = useRef(false);

  // Build slices once per levelDef
  const slices = useMemo(() => buildSlices(levelDef), [levelDef]);

  // Pieces in the tray — same data as slices but shuffled
  const [pieces] = useState(() => shuffle(slices.map(s => ({ ...s }))));

  // placedMap: { [slotId]: color } — which slots are filled and with what color
  const [placedMap, setPlacedMap] = useState({});
  // usedPieceIds: which pieces have been dragged out of the tray
  const [usedPieceIds, setUsedPieceIds] = useState(new Set());

  const [dragging, setDragging]       = useState(null); // index into `pieces`
  const [dragPos,   setDragPos]       = useState({ x: 0, y: 0 });
  const [pulsing,   setPulsing]       = useState(false);
  const [justSnapped, setJustSnapped] = useState(null); // slotId that just snapped (for pop anim)

  const placedCount = Object.keys(placedMap).length;
  const allPlaced   = placedCount === slices.length;

  // ── Slot center in screen coords ──────────────────────────
  function getSlotCenter(sliceId) {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect  = svgRef.current.getBoundingClientRect();
    const scale = rect.width / SVG_W;
    const s     = slices[sliceId];
    const mid   = (s.start + s.end) / 2;
    const [sx, sy] = ptOnCircle(CX, CY, R * 0.6, mid);
    return { x: rect.left + sx * scale, y: rect.top + sy * scale };
  }

  // ── Start drag ────────────────────────────────────────────
  function startDrag(e, pieceIdx) {
    e.preventDefault();
    initAudio();
    sound.pickup();
    setDragging(pieceIdx);
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    setDragPos({ x: cx, y: cy });
  }

  // ── Drop ─────────────────────────────────────────────────
  function handleDrop(px, py) {
    if (dragging === null) return;
    const piece = pieces[dragging];

    // Find nearest empty slot within SNAP_R
    let bestSlot = null, bestDist = Infinity;
    slices.forEach(s => {
      if (placedMap[s.id] !== undefined) return; // already filled
      const c = getSlotCenter(s.id);
      const d = Math.hypot(px - c.x, py - c.y);
      if (d < SNAP_R && d < bestDist) {
        bestDist = d;
        bestSlot = s.id;
      }
    });

    if (bestSlot !== null) {
      sound.snap();
      setJustSnapped(bestSlot);
      setTimeout(() => setJustSnapped(null), 450);

      const newPlacedMap    = { ...placedMap, [bestSlot]: piece.color };
      const newUsedPieceIds = new Set(usedPieceIds);
      newUsedPieceIds.add(piece.id);

      setPlacedMap(newPlacedMap);
      setUsedPieceIds(newUsedPieceIds);

      // All placed?
      if (Object.keys(newPlacedMap).length === slices.length && !completeFired.current) {
        completeFired.current = true;
        setPulsing(true);
        setTimeout(() => {
          sound.chime();
          if (svgRef.current) {
            const rect = svgRef.current.getBoundingClientRect();
            const xPct = ((rect.left + rect.width  * 0.5) / window.innerWidth)  * 100;
            const yPct = ((rect.top  + rect.height * 0.5) / window.innerHeight) * 100;
            onMilestone && onMilestone(xPct, yPct);
          } else {
            onMilestone && onMilestone(50, 45);
          }
        }, 600);
      }
    }

    setDragging(null);
  }

  // ── Pointer listeners ─────────────────────────────────────
  useEffect(() => {
    if (dragging === null) return;
    function onMove(e) {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      setDragPos({ x, y });
    }
    function onUp(e) {
      const x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
      handleDrop(x, y);
    }
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup',   onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup',   onUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, placedMap, usedPieceIds]);

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      gap:            20,
      padding:        '12px 0 8px',
      userSelect:     'none',
      touchAction:    'none',
      width:          '100%',
    }}>

      {/* ── Pie SVG ──────────────────────────────────────── */}
      <svg
        ref={svgRef}
        width={SVG_W}
        height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{
          maxWidth:  'min(88vw, 300px)',
          maxHeight: 'min(88vw, 300px)',
          display:   'block',
          animation: pulsing ? 'piePulse 0.9s ease-out forwards' : 'none',
        }}
      >
        <defs>
          <radialGradient id="pieShine" cx="38%" cy="28%" r="55%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* Outer glow ring */}
        <circle
          cx={CX} cy={CY} r={R + 8}
          fill="rgba(194,60,60,0.05)"
          stroke="rgba(194,60,60,0.15)"
          strokeWidth={1.5}
        />

        {/* Each slice: filled if placed, otherwise dashed outline */}
        {slices.map(s => {
          const filled = placedMap[s.id] !== undefined;
          const color  = placedMap[s.id] || null;
          const d      = makePiePath(CX, CY, R, s.start, s.end);

          if (filled) {
            return (
              <path
                key={s.id}
                d={d}
                fill={color}
                stroke="white"
                strokeWidth={2}
                style={{
                  animation: justSnapped === s.id ? 'pieSnapIn 0.45s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
                  transformOrigin: `${CX}px ${CY}px`,
                }}
              />
            );
          }

          // Empty slot — dashed arc outline only (no fill, so child sees the gap)
          const [x1, y1] = ptOnCircle(CX, CY, R, s.start);
          const [x2, y2] = ptOnCircle(CX, CY, R, s.end);
          const large = s.span > 180 ? 1 : 0;
          // Two radial lines + arc
          return (
            <g key={s.id}>
              {/* Radial edges */}
              <line
                x1={CX} y1={CY} x2={x1} y2={y1}
                stroke="rgba(194,60,60,0.28)" strokeWidth={1.5} strokeDasharray="5 4"
              />
              <line
                x1={CX} y1={CY} x2={x2} y2={y2}
                stroke="rgba(194,60,60,0.28)" strokeWidth={1.5} strokeDasharray="5 4"
              />
              {/* Arc */}
              <path
                d={`M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`}
                fill="none"
                stroke="rgba(194,60,60,0.28)"
                strokeWidth={1.5}
                strokeDasharray="5 4"
              />
              {/* Light fill hint */}
              <path
                d={d}
                fill="rgba(194,60,60,0.04)"
              />
            </g>
          );
        })}

        {/* Shine overlay */}
        <circle cx={CX} cy={CY - R * 0.18} r={R * 0.32} fill="url(#pieShine)" style={{ pointerEvents: 'none' }} />

        {/* Center dot */}
        <circle cx={CX} cy={CY} r={5} fill="white" />
      </svg>

      {/* ── Tray ─────────────────────────────────────────── */}
      {!allPlaced && (
        <div style={{
          display:        'flex',
          flexWrap:       'wrap',
          gap:            10,
          justifyContent: 'center',
          padding:        '6px 16px 4px',
          maxWidth:       '100%',
        }}>
          {pieces.map((piece, idx) => {
            const isPlaced   = usedPieceIds.has(piece.id);
            const isDragging = dragging === idx;

            if (isPlaced) return null; // disappears once placed

            return (
              <div
                key={piece.id}
                onPointerDown={dragging === null ? (e) => startDrag(e, idx) : undefined}
                style={{
                  width:       CHIP_SIZE,
                  height:      CHIP_SIZE,
                  borderRadius: 14,
                  border:      '2px solid rgba(194,60,60,0.25)',
                  background:  'rgba(255,251,245,0.95)',
                  boxShadow:   '0 3px 10px rgba(194,60,60,0.12)',
                  display:     'flex',
                  alignItems:  'center',
                  justifyContent: 'center',
                  cursor:      'grab',
                  opacity:     isDragging ? 0.2 : 1,
                  transition:  'opacity 0.15s',
                  touchAction: 'none',
                  flexShrink:  0,
                  // gentle idle float on pieces not yet dragged
                  animation:   dragging === null
                    ? `chipIdle ${2.2 + (piece.id * 0.35)}s ease-in-out ${piece.id * 0.18}s infinite`
                    : 'none',
                }}
              >
                <svg
                  width={CHIP_SIZE}
                  height={CHIP_SIZE}
                  viewBox={`0 0 ${CHIP_SIZE} ${CHIP_SIZE}`}
                >
                  <defs>
                    <radialGradient id={`cs${piece.id}`} cx="38%" cy="30%" r="55%">
                      <stop offset="0%"   stopColor="rgba(255,255,255,0.25)" />
                      <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
                    </radialGradient>
                  </defs>
                  <path
                    d={makeChipPath(piece.start, piece.end)}
                    fill={piece.color}
                    stroke="white"
                    strokeWidth={1.5}
                  />
                  <path
                    d={makeChipPath(piece.start, piece.end)}
                    fill={`url(#cs${piece.id})`}
                  />
                </svg>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Drag ghost ───────────────────────────────────── */}
      {dragging !== null && (() => {
        const piece    = pieces[dragging];
        const ghostSz  = CHIP_SIZE * 1.45;
        return (
          <div style={{
            position:      'fixed',
            left:          dragPos.x - ghostSz / 2,
            top:           dragPos.y - ghostSz / 2,
            width:         ghostSz,
            height:        ghostSz,
            pointerEvents: 'none',
            zIndex:        500,
          }}>
            <svg width={ghostSz} height={ghostSz} viewBox={`0 0 ${CHIP_SIZE} ${CHIP_SIZE}`}>
              <path
                d={makeChipPath(piece.start, piece.end)}
                fill={piece.color}
                stroke="white"
                strokeWidth={1.5}
                style={{ filter: 'drop-shadow(0 5px 14px rgba(194,60,60,0.4))' }}
              />
            </svg>
          </div>
        );
      })()}
    </div>
  );
}
