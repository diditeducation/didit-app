import { useState, useRef, useEffect, useMemo } from 'react';
import { initAudio, sound } from './audio';

// ── Constants ────────────────────────────────────────────────
const SVG_W = 300, SVG_H = 300, CX = 150, CY = 150, R = 130;
const SNAP_R = 80; // px tolerance to snap into slot

// DiDit primary palette colors
const C = {
  blueberry: '#3A6CE5',  // blueberryDark
  coral:     '#C23C3C',  // coralDark
  grass:     '#2EA820',  // grassDark
  sky:       '#03B292',  // skyDark
  sun:       '#EE6A30',  // sunDark
  sunMid:    '#E8B840',  // sunMid
};

// ── Level definitions ────────────────────────────────────────
// All degree values are multiples of 3.6° so span/360*100 is always
// a whole integer — labels guaranteed to sum to 100%.
// filled: pre-drawn sections; gaps: pieces the child drags in.
export const LEVEL_DEFS = [
  // L1: 85% (306°) + 15% (54°) = 100%
  {
    filled: [{ start: 0, end: 306, color: C.blueberry }],
    gaps:   [{ id: 0, start: 306, end: 360, color: C.coral }],
  },
  // L2: 50% (180°) + 50% (180°) = 100%
  {
    filled: [{ start: 0, end: 180, color: C.grass }],
    gaps:   [{ id: 0, start: 180, end: 360, color: C.sun }],
  },
  // L3: 65% (234°) + 35% (126°) = 100%
  {
    filled: [{ start: 0, end: 234, color: C.sky }],
    gaps:   [{ id: 0, start: 234, end: 360, color: C.sunMid }],
  },
  // L4: 70% (252°) + 30% (108°) = 100%
  {
    filled: [{ start: 0, end: 252, color: C.coral }],
    gaps:   [{ id: 0, start: 252, end: 360, color: C.blueberry }],
  },
  // L5: 50% (180°) + 30% (108°) + 20% (72°) = 100%
  {
    filled: [{ start: 0, end: 180, color: C.grass }],
    gaps:   [
      { id: 0, start: 180, end: 288, color: C.coral },
      { id: 1, start: 288, end: 360, color: C.blueberry },
    ],
  },
  // L6: 40% (144°) + 30% (108°) + 20% (72°) + 10% (36°) = 100%
  {
    filled: [{ start: 0, end: 144, color: C.sky }],
    gaps:   [
      { id: 0, start: 144, end: 252, color: C.sun },
      { id: 1, start: 252, end: 324, color: C.coral },
      { id: 2, start: 324, end: 360, color: C.sunMid },
    ],
  },
];

// ── Safe percentage label (largest-remainder, always sums to 100) ─
// Takes an array of degree spans, returns array of integer percentages.
function spansToLabels(spans) {
  const raw    = spans.map(s => s / 360 * 100);
  const floors = raw.map(Math.floor);
  const rem    = 100 - floors.reduce((a, b) => a + b, 0);
  // give the remainder to the slices with the largest fractional parts
  const order  = raw.map((v, i) => [v - Math.floor(v), i])
                    .sort((a, b) => b[0] - a[0]);
  const result = [...floors];
  for (let i = 0; i < rem; i++) result[order[i][1]] += 1;
  return result;
}

// ── Geometry helpers ─────────────────────────────────────────
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

// ── Initial piece offset (div top-left relative to container) ─
// We want the visual "centre" of each loose piece to appear at a
// scatter position below (or beside) the pie.
function getInitialOffset(gap, gapIndex, totalGaps) {
  const midAngle = (gap.start + gap.end) / 2;
  // Approximate visual centroid of the wedge in SVG coords
  const [pcx, pcy] = ptOnCircle(CX, CY, R * 0.52, midAngle);

  // Scatter target in container coords — below the pie
  const stride  = totalGaps === 1 ? 0 : totalGaps <= 2 ? 130 : 110;
  const originX = CX - stride * (totalGaps - 1) / 2;
  const sx = originX + gapIndex * stride;
  const sy = SVG_H + 108;

  // Offset the SVG div so the piece centroid appears at (sx, sy)
  return { x: sx - pcx, y: sy - pcy };
}

// ── Keyframes ────────────────────────────────────────────────
const KF_ID = 'didit-pie-kf3';
function injectKeyframes() {
  if (typeof document === 'undefined' || document.getElementById(KF_ID)) return;
  const el = document.createElement('style');
  el.id = KF_ID;
  el.textContent = `
    @keyframes pieSnapBright {
      0%   { filter: brightness(1.5) drop-shadow(0 0 8px rgba(255,255,255,0.9)); }
      100% { filter: brightness(1)   drop-shadow(0 0 0px rgba(255,255,255,0)); }
    }
    @keyframes piePulseWin {
      0%   { filter: drop-shadow(0 0 0px  rgba(255,220,50,0)); }
      30%  { filter: drop-shadow(0 0 30px rgba(255,220,50,1)) drop-shadow(0 0 60px rgba(255,180,0,0.7)); }
      60%  { filter: drop-shadow(0 0 18px rgba(255,220,50,0.6)); }
      100% { filter: drop-shadow(0 0 8px  rgba(255,220,50,0.25)); }
    }
    @keyframes pieFloat {
      0%,100% { transform: translateY(0px);  }
      50%     { transform: translateY(-8px); }
    }
  `;
  document.head.appendChild(el);
}

// ── Clamp an SVG offset so the piece stays inside the container ─
// The loose-piece SVG is SVG_W × SVG_W in size.
// containerW / containerH come from the container div.
function clampOffset(off, containerW, containerH) {
  return {
    x: Math.max(-(SVG_W * 0.5), Math.min(containerW - SVG_W * 0.5, off.x)),
    y: Math.max(-(SVG_H * 0.3), Math.min(containerH - SVG_H * 0.7, off.y)),
  };
}

// ── Component ────────────────────────────────────────────────
export default function LittlePieGame({ levelDef, onMilestone }) {
  injectKeyframes();

  const { filled, gaps } = levelDef;
  const containerRef = useRef(null);
  const completeFired = useRef(false);

  // Pre-compute percentage labels for all slices so they sum to 100
  const allSpans  = [...filled.map(f => f.end - f.start), ...gaps.map(g => g.end - g.start)];
  const allLabels = spansToLabels(allSpans);
  const filledLabels = allLabels.slice(0, filled.length);
  const gapLabels    = allLabels.slice(filled.length);

  const initOffsets = useMemo(
    () => gaps.map((gap, i) => getInitialOffset(gap, i, gaps.length)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [offsets,     setOffsets]     = useState(initOffsets);
  const [placed,      setPlaced]      = useState(new Set());
  const [dragging,    setDragging]    = useState(null);
  // { pieceIdx, startClientX, startClientY, startOffset }
  const [justSnapped, setJustSnapped] = useState(null);
  const [pulsing,     setPulsing]     = useState(false);

  // ── Drag start ─────────────────────────────────────────────
  function startDrag(e, pieceIdx) {
    e.preventDefault();
    if (placed.has(pieceIdx)) return;
    initAudio();
    sound.pickup();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    setDragging({
      pieceIdx,
      startClientX: cx,
      startClientY: cy,
      startOffset: { ...offsets[pieceIdx] },
    });
  }

  // ── Pointer move / up ──────────────────────────────────────
  useEffect(() => {
    if (!dragging) return;

    function onMove(e) {
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = cx - dragging.startClientX;
      const dy = cy - dragging.startClientY;
      const cW = containerRef.current ? containerRef.current.offsetWidth  : SVG_W;
      const cH = containerRef.current ? containerRef.current.offsetHeight : SVG_H + 230;
      setOffsets(prev => {
        const next = [...prev];
        next[dragging.pieceIdx] = clampOffset(
          { x: dragging.startOffset.x + dx, y: dragging.startOffset.y + dy },
          cW, cH,
        );
        return next;
      });
    }

    function onUp(e) {
      const cx = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const cy = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
      const dx = cx - dragging.startClientX;
      const dy = cy - dragging.startClientY;
      const cW = containerRef.current ? containerRef.current.offsetWidth  : SVG_W;
      const cH = containerRef.current ? containerRef.current.offsetHeight : SVG_H + 230;
      const finalOff = clampOffset(
        { x: dragging.startOffset.x + dx, y: dragging.startOffset.y + dy },
        cW, cH,
      );

      // Snap check: if offset from (0,0) is within SNAP_R the piece fills its slot
      if (Math.hypot(finalOff.x, finalOff.y) < SNAP_R) {
        sound.snap();
        const nextOffsets = [...offsets];
        nextOffsets[dragging.pieceIdx] = { x: 0, y: 0 };
        setOffsets(nextOffsets);

        setJustSnapped(dragging.pieceIdx);
        setTimeout(() => setJustSnapped(null), 500);

        const nextPlaced = new Set(placed);
        nextPlaced.add(dragging.pieceIdx);
        setPlaced(nextPlaced);

        if (nextPlaced.size === gaps.length && !completeFired.current) {
          completeFired.current = true;
          setPulsing(true);
          setTimeout(() => {
            sound.chime();
            if (containerRef.current) {
              const rect = containerRef.current.getBoundingClientRect();
              const xPct = (rect.left + rect.width  * 0.5) / window.innerWidth  * 100;
              const yPct = (rect.top  + rect.height * 0.38) / window.innerHeight * 100;
              onMilestone?.(xPct, yPct);
            } else {
              onMilestone?.(50, 40);
            }
          }, 480);
        }
      } else {
        // Leave wherever they dropped
        const nextOffsets = [...offsets];
        nextOffsets[dragging.pieceIdx] = finalOff;
        setOffsets(nextOffsets);
      }

      setDragging(null);
    }

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup',   onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup',   onUp);
    };
  // offsets deliberately excluded — we read via dragging.startOffset
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, placed, gaps.length]);

  const CONTAINER_H = SVG_H + 230;
  // Pie scales dynamically to fit whatever space the game area gives
  // us — measured live on mount + on resize via ResizeObserver. Capped
  // at 0.85× native so the artwork never looks oversized on a giant
  // tablet, and floored at 0.45× so it stays readable on tiny phones.
  const outerRef = useRef(null);
  const [pieScale, setPieScale] = useState(0.7);
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const recalc = () => {
      const w = el.clientWidth || SVG_W;
      // Walk up to find the nearest ancestor with a bounded height —
      // typically the GameShell game area. Falls back to viewport.
      let h = el.parentElement?.clientHeight || 0;
      if (!h && typeof window !== 'undefined') {
        h = window.innerHeight - el.getBoundingClientRect().top - 16;
      }
      const widthScale  = (w - 16)  / SVG_W;
      const heightScale = h ? (h - 16) / CONTAINER_H : widthScale;
      const next = Math.max(0.45, Math.min(0.85, widthScale, heightScale));
      setPieScale(Number.isFinite(next) ? next : 0.7);
    };
    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);
    window.addEventListener('resize', recalc);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recalc);
    };
  }, [CONTAINER_H]);

  return (
    <div
      ref={outerRef}
      style={{
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        padding:       '8px 0 4px',
        width:         '100%',
        // Reserve vertical room for the (scaled) pie + piece area so
        // wedges below the pie aren't clipped.
        minHeight:     CONTAINER_H * pieScale,
        userSelect:    'none',
        touchAction:   'none',
      }}
    >
      {/* ── Outer wrapper — sized to fit pie + piece area ─── */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width:    SVG_W,
          height:   CONTAINER_H,
          transform: `scale(${pieScale})`,
          transformOrigin: 'top center',
        }}
      >
        {/* ── Main pie SVG ──────────────────────────────── */}
        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            animation: pulsing ? 'piePulseWin 1.4s ease-out forwards' : 'none',
          }}
        >
          <defs>
            <radialGradient id="psh3" cx="38%" cy="28%" r="55%">
              <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>

          {/* Subtle outer ring */}
          <circle cx={CX} cy={CY} r={R + 5}
            fill="rgba(0,0,0,0.03)"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth={1}
          />

          {/* Pre-filled sections */}
          {filled.map((f, i) => {
            const span     = f.end - f.start;
            const pct      = filledLabels[i];
            const mid      = (f.start + f.end) / 2;
            const labelR   = span > 120 ? R * 0.58 : R * 0.62;
            const [lx, ly] = ptOnCircle(CX, CY, labelR, mid);
            const fontSize = span < 60 ? 10 : 13;
            return (
              <g key={i}>
                <path
                  d={makePiePath(CX, CY, R, f.start, f.end)}
                  fill={f.color}
                  stroke="white"
                  strokeWidth={2}
                />
                <text
                  x={lx} y={ly}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800,
                    fontSize: fontSize,
                    fill: 'rgba(255,255,255,0.95)',
                    pointerEvents: 'none',
                  }}
                >{pct}%</text>
              </g>
            );
          })}

          {/* Gap slots ─ filled once placed, dashed outline when empty */}
          {gaps.map((gap, i) => {
            const isPlaced = placed.has(i);
            const d = makePiePath(CX, CY, R, gap.start, gap.end);

            if (isPlaced) {
              const pct    = gapLabels[i];
              const mid    = (gap.start + gap.end) / 2;
              const labelR = (gap.end - gap.start) > 120 ? R * 0.58 : R * 0.62;
              const [lx, ly] = ptOnCircle(CX, CY, labelR, mid);
              const fontSize = (gap.end - gap.start) < 60 ? 10 : 12;
              return (
                <g key={gap.id} style={{ animation: justSnapped === i ? 'pieSnapBright 0.45s ease-out forwards' : 'none' }}>
                  <path d={d} fill={gap.color} stroke="white" strokeWidth={2} />
                  <text
                    x={lx} y={ly}
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 800,
                      fontSize: fontSize,
                      fill: 'rgba(255,255,255,0.95)',
                      pointerEvents: 'none',
                    }}
                  >{pct}%</text>
                </g>
              );
            }

            // Empty — dashed outline
            const [x1, y1] = ptOnCircle(CX, CY, R, gap.start);
            const [x2, y2] = ptOnCircle(CX, CY, R, gap.end);
            const large = (gap.end - gap.start) > 180 ? 1 : 0;
            return (
              <g key={gap.id}>
                <path d={d} fill="rgba(0,0,0,0.04)" />
                <line
                  x1={CX} y1={CY} x2={x1} y2={y1}
                  stroke="rgba(0,0,0,0.18)" strokeWidth={1.5} strokeDasharray="4 3"
                />
                <line
                  x1={CX} y1={CY} x2={x2} y2={y2}
                  stroke="rgba(0,0,0,0.18)" strokeWidth={1.5} strokeDasharray="4 3"
                />
                <path
                  d={`M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`}
                  fill="none"
                  stroke="rgba(0,0,0,0.18)"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
              </g>
            );
          })}

          {/* Shine overlay */}
          <circle
            cx={CX} cy={CY - R * 0.18} r={R * 0.32}
            fill="url(#psh3)"
            style={{ pointerEvents: 'none' }}
          />
          {/* Centre dot */}
          <circle cx={CX} cy={CY} r={4} fill="white" />
        </svg>

        {/* ── Loose pieces (same SVG coord space as pie) ── */}
        {gaps.map((gap, i) => {
          if (placed.has(i)) return null;
          const off = offsets[i];
          const isDraggingThis = dragging?.pieceIdx === i;

          return (
            <svg
              key={gap.id}
              width={SVG_W}
              height={SVG_H}
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              onPointerDown={(e) => startDrag(e, i)}
              style={{
                position:    'absolute',
                top:         off.y,
                left:        off.x,
                cursor:      'grab',
                touchAction: 'none',
                zIndex:      isDraggingThis ? 20 : 2,
                filter:      isDraggingThis
                  ? 'drop-shadow(0 10px 24px rgba(0,0,0,0.35))'
                  : 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
                animation:   isDraggingThis
                  ? 'none'
                  : `pieFloat ${2.4 + i * 0.5}s ease-in-out ${i * 0.4}s infinite`,
                // scale up slightly while dragging for tactile feel
                transform:   isDraggingThis ? 'scale(1.06)' : 'scale(1)',
                transition:  isDraggingThis ? 'none' : 'transform 0.2s ease',
              }}
            >
              <defs>
                <radialGradient id={`psg${i}`} cx="38%" cy="30%" r="55%">
                  <stop offset="0%"   stopColor="rgba(255,255,255,0.22)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
                </radialGradient>
              </defs>
              {/* The wedge — drawn at the EXACT same CX/CY/R as the pie */}
              <path
                d={makePiePath(CX, CY, R, gap.start, gap.end)}
                fill={gap.color}
                stroke="white"
                strokeWidth={2.5}
              />
              {/* Shine on piece */}
              <path
                d={makePiePath(CX, CY, R, gap.start, gap.end)}
                fill={`url(#psg${i})`}
                style={{ pointerEvents: 'none' }}
              />
              {/* % label at wedge centroid */}
              {(() => {
                const pct = gapLabels[i];
                const mid = (gap.start + gap.end) / 2;
                const labelR = (gap.end - gap.start) > 120 ? R * 0.58 : R * 0.62;
                const [lx, ly] = ptOnCircle(CX, CY, labelR, mid);
                const fontSize = (gap.end - gap.start) < 60 ? 11 : 13;
                return (
                  <text
                    x={lx} y={ly}
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 800,
                      fontSize: fontSize,
                      fill: 'rgba(255,255,255,0.95)',
                      pointerEvents: 'none',
                      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    }}
                  >{pct}%</text>
                );
              })()}
            </svg>
          );
        })}
      </div>
    </div>
  );
}
