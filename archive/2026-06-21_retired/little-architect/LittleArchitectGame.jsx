import { useState, useRef, useEffect } from 'react';
import { initAudio, sound } from './audio';

// ── Constants ────────────────────────────────────────────────
const STAGE_W = 300;
const STAGE_H = 250;
const CHIP_SIZE = 52;

// Blueberry palette (hex matches tokens.js exactly)
const BD = '#3A6CE5'; // blueberryDark
const BM = '#6B8FD8'; // blueberryMid
const BB = '#9BB5E8'; // blueberry
const BL = '#CFD9F4'; // blueberryLight

// ── Level definitions ────────────────────────────────────────
// Pieces are in back-to-front z-order (render first = behind).
// Each piece: { id, color, type, x, y, w, h }
// Types: rect | square | triangle-up | triangle-left | triangle-right
export const LEVEL_DEFS = [
  {
    name: 'House',
    emoji: '🏠',
    pieces: [
      { id: 'wall',    color: BD, type: 'rect',        x: 68,  y: 155, w: 164, h: 88  },
      { id: 'chimney', color: BM, type: 'rect',        x: 180, y: 35,  w: 26,  h: 58  },
      { id: 'roof',    color: BB, type: 'triangle-up', x: 48,  y: 90,  w: 204, h: 68  },
      { id: 'door',    color: BM, type: 'rect',        x: 116, y: 196, w: 52,  h: 47  },
      { id: 'window',  color: BL, type: 'square',      x: 178, y: 165, w: 44,  h: 44  },
    ],
  },
  {
    name: 'Rocket',
    emoji: '🚀',
    pieces: [
      { id: 'fin-left',  color: BB, type: 'triangle-left',  x: 44,  y: 168, w: 62,  h: 62  },
      { id: 'fin-right', color: BB, type: 'triangle-right', x: 194, y: 168, w: 62,  h: 62  },
      { id: 'body',      color: BD, type: 'rect',           x: 106, y: 95,  w: 88,  h: 145 },
      { id: 'nose',      color: BM, type: 'triangle-up',    x: 106, y: 28,  w: 88,  h: 68  },
      { id: 'window',    color: BL, type: 'square',         x: 121, y: 115, w: 58,  h: 58  },
    ],
  },
  {
    name: 'Castle',
    emoji: '🏰',
    pieces: [
      { id: 'base',        color: BM, type: 'rect',        x: 38,  y: 185, w: 224, h: 58  },
      { id: 'tower-left',  color: BD, type: 'rect',        x: 38,  y: 108, w: 68,  h: 82  },
      { id: 'tower-right', color: BD, type: 'rect',        x: 194, y: 108, w: 68,  h: 82  },
      { id: 'gate',        color: BB, type: 'rect',        x: 118, y: 185, w: 64,  h: 58  },
      { id: 'flag',        color: BL, type: 'triangle-up', x: 50,  y: 52,  w: 30,  h: 56  },
    ],
  },
];

// ── Keyframe injection ───────────────────────────────────────
const KF_ID = 'didit-arch-kf';
function injectKeyframes() {
  if (typeof document === 'undefined' || document.getElementById(KF_ID)) return;
  const el = document.createElement('style');
  el.id = KF_ID;
  el.textContent = `
    @keyframes archSnap {
      0%   { filter: brightness(1.7) drop-shadow(0 0 12px rgba(58,108,229,0.9)); }
      100% { filter: brightness(1)   drop-shadow(0 0 0px  rgba(58,108,229,0)); }
    }
    @keyframes archWin {
      0%   { filter: drop-shadow(0 0 0px  rgba(255,220,50,0)); }
      30%  { filter: drop-shadow(0 0 32px rgba(255,220,50,1)) drop-shadow(0 0 64px rgba(255,180,0,0.7)); }
      100% { filter: drop-shadow(0 0 8px  rgba(255,220,50,0.2)); }
    }
    @keyframes archChipBounce {
      0%   { transform: scale(1); }
      40%  { transform: scale(1.18); }
      70%  { transform: scale(0.94); }
      100% { transform: scale(1); }
    }
  `;
  document.head.appendChild(el);
}

// ── Shape path helpers ───────────────────────────────────────
function shapePoints(type, x, y, w, h) {
  if (type === 'triangle-up')    return `${x},${y + h} ${x + w},${y + h} ${x + w / 2},${y}`;
  if (type === 'triangle-left')  return `${x + w},${y} ${x + w},${y + h} ${x},${y + h / 2}`;
  if (type === 'triangle-right') return `${x},${y} ${x},${y + h} ${x + w},${y + h / 2}`;
  return null; // rect/square use <rect>
}

function StageShape({ piece, ghost = false, snapping = false }) {
  const { type, x, y, w, h, color, id } = piece;
  const isRect = type === 'rect' || type === 'square';
  const fill   = ghost ? 'rgba(58,108,229,0.07)' : color;
  const stroke = ghost ? 'rgba(58,108,229,0.38)'  : 'rgba(255,255,255,0.9)';
  const strokeW = ghost ? 1.5 : 2;
  const dash    = ghost ? '6 4' : undefined;
  const anim    = snapping ? 'archSnap 0.45s ease-out forwards' : 'none';

  const props = { fill, stroke, strokeWidth: strokeW, strokeDasharray: dash };

  if (isRect) {
    return (
      <rect
        key={id}
        x={x} y={y} width={w} height={h}
        {...props}
        style={{ animation: anim }}
      />
    );
  }
  const pts = shapePoints(type, x, y, w, h);
  return (
    <polygon
      key={id}
      points={pts}
      {...props}
      style={{ animation: anim }}
    />
  );
}

// ── Tray chip shape (normalised to 0,0 space) ────────────────
function ChipShape({ type }) {
  const P = 10; // padding inside chip
  const W = CHIP_SIZE - P * 2;
  const H = CHIP_SIZE - P * 2;
  const fill   = 'rgba(255,255,255,0.78)';
  const common = { fill, stroke: 'none' };

  if (type === 'rect') {
    const rh = Math.round(H * 0.52);
    return <rect x={P} y={P + (H - rh) / 2} width={W} height={rh} {...common} />;
  }
  if (type === 'square') {
    const s = Math.round(Math.min(W, H) * 0.82);
    const ox = P + (W - s) / 2;
    const oy = P + (H - s) / 2;
    return <rect x={ox} y={oy} width={s} height={s} {...common} />;
  }
  if (type === 'triangle-up') {
    return <polygon points={`${P},${P + H} ${P + W},${P + H} ${P + W / 2},${P}`} {...common} />;
  }
  if (type === 'triangle-left') {
    return <polygon points={`${P + W},${P} ${P + W},${P + H} ${P},${P + H / 2}`} {...common} />;
  }
  if (type === 'triangle-right') {
    return <polygon points={`${P},${P} ${P},${P + H} ${P + W},${P + H / 2}`} {...common} />;
  }
  return null;
}

// ── Component ────────────────────────────────────────────────
export default function LittleArchitectGame({ levelDef, onMilestone }) {
  injectKeyframes();

  const { pieces } = levelDef;
  const stageRef   = useRef(null);
  const completeFired = useRef(false);

  const [placed,      setPlaced]      = useState(new Set());
  const [dragging,    setDragging]    = useState(null); // { pieceId, x, y }
  const [justSnapped, setJustSnapped] = useState(null);
  const [pulsing,     setPulsing]     = useState(false);

  // ── Global pointer handlers ──────────────────────────────
  useEffect(() => {
    if (!dragging) return;

    function onMove(e) {
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      setDragging(d => ({ ...d, x: cx, y: cy }));
    }

    function onUp(e) {
      const cx = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const cy = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

      const stage = stageRef.current;
      let snapped = false;
      if (stage) {
        const rect = stage.getBoundingClientRect();
        if (cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom) {
          snapped = true;
        }
      }

      if (snapped) {
        sound.snap();
        const pieceId = dragging.pieceId;
        setJustSnapped(pieceId);
        setTimeout(() => setJustSnapped(null), 500);

        setPlaced(prev => {
          const next = new Set(prev).add(pieceId);
          if (next.size === pieces.length && !completeFired.current) {
            completeFired.current = true;
            setPulsing(true);
            setTimeout(() => {
              sound.chime();
              if (stageRef.current) {
                const r = stageRef.current.getBoundingClientRect();
                const xPct = (r.left + r.width  * 0.5) / window.innerWidth  * 100;
                const yPct = (r.top  + r.height * 0.4) / window.innerHeight * 100;
                onMilestone?.(xPct, yPct);
              } else {
                onMilestone?.(50, 40);
              }
            }, 480);
          }
          return next;
        });
      } else {
        sound.boing();
      }
      setDragging(null);
    }

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup',   onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup',   onUp);
    };
  }, [dragging, pieces.length]);

  const CONTAINER_H = STAGE_H + 110;
  const scale = typeof window !== 'undefined'
    ? Math.min(1, (window.innerWidth - 32) / STAGE_W)
    : 1;

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      alignItems:    'center',
      padding:       '8px 0 4px',
      width:         '100%',
      userSelect:    'none',
      touchAction:   'none',
    }}>
      {/* ── Scaled wrapper ──────────────────────────────── */}
      <div style={{
        width:           STAGE_W,
        height:          CONTAINER_H,
        transform:       `scale(${scale})`,
        transformOrigin: 'top center',
        position:        'relative',
      }}>

        {/* ── Stage ───────────────────────────────────── */}
        <div
          ref={stageRef}
          style={{
            position:     'absolute',
            top: 0, left: 0,
            width:        STAGE_W,
            height:       STAGE_H,
            borderRadius: 18,
            background:   'rgba(58,108,229,0.04)',
            border:       '1.5px solid rgba(58,108,229,0.14)',
            overflow:     'hidden',
          }}
        >
          <svg
            width={STAGE_W}
            height={STAGE_H}
            viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
            style={{ animation: pulsing ? 'archWin 1.4s ease-out forwards' : 'none' }}
          >
            <defs>
              <linearGradient id="archSkyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="rgba(207,217,244,0.35)" />
                <stop offset="100%" stopColor="rgba(207,217,244,0.06)" />
              </linearGradient>
            </defs>

            {/* Sky gradient */}
            <rect x={0} y={0} width={STAGE_W} height={STAGE_H} fill="url(#archSkyGrad)" />
            {/* Ground strip */}
            <rect x={0} y={STAGE_H - 8} width={STAGE_W} height={8} fill="rgba(58,108,229,0.10)" />

            {/* Render each piece in z-order: ghost if unplaced, colored if placed */}
            {pieces.map(p => (
              <StageShape
                key={p.id}
                piece={p}
                ghost={!placed.has(p.id)}
                snapping={justSnapped === p.id}
              />
            ))}
          </svg>
        </div>

        {/* ── Tray ────────────────────────────────────── */}
        <div style={{
          position:        'absolute',
          top:             STAGE_H + 14,
          left:            0,
          width:           STAGE_W,
          display:         'flex',
          justifyContent:  'center',
          alignItems:      'center',
          gap:             6,
          flexWrap:        'nowrap',
        }}>
          {pieces.map(p => {
            const isPlaced     = placed.has(p.id);
            const isDraggingThis = dragging?.pieceId === p.id;
            return (
              <div
                key={p.id}
                onPointerDown={isPlaced ? undefined : (e) => {
                  e.preventDefault();
                  initAudio();
                  sound.pickup();
                  setDragging({ pieceId: p.id, x: e.clientX, y: e.clientY });
                }}
                style={{
                  width:        CHIP_SIZE,
                  height:       CHIP_SIZE,
                  borderRadius: 14,
                  background:   isPlaced ? 'rgba(0,0,0,0.05)' : p.color,
                  opacity:      isPlaced ? 0.32 : isDraggingThis ? 0.45 : 1,
                  cursor:       isPlaced ? 'default' : 'grab',
                  touchAction:  'none',
                  boxShadow:    isPlaced || isDraggingThis ? 'none' : '0 4px 14px rgba(0,0,0,0.22)',
                  animation:    (!isPlaced && !isDraggingThis) ? undefined : undefined,
                  transition:   'opacity 0.2s, box-shadow 0.2s',
                  flexShrink:   0,
                }}
              >
                <svg
                  width={CHIP_SIZE}
                  height={CHIP_SIZE}
                  viewBox={`0 0 ${CHIP_SIZE} ${CHIP_SIZE}`}
                  style={{ display: 'block' }}
                >
                  <ChipShape type={p.type} />
                </svg>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Drag ghost (fixed, outside scaled container) ── */}
      {dragging && !placed.has(dragging.pieceId) && (() => {
        const p = pieces.find(pc => pc.id === dragging.pieceId);
        if (!p) return null;
        const gs = CHIP_SIZE + 12;
        return (
          <div style={{
            position:      'fixed',
            left:          dragging.x - gs / 2,
            top:           dragging.y - gs / 2,
            width:         gs,
            height:        gs,
            pointerEvents: 'none',
            zIndex:        9999,
            filter:        'drop-shadow(0 10px 24px rgba(58,108,229,0.5))',
            transform:     'scale(1.12)',
          }}>
            <div style={{
              width:        gs,
              height:       gs,
              borderRadius: 16,
              background:   p.color,
            }}>
              <svg
                width={gs}
                height={gs}
                viewBox={`0 0 ${CHIP_SIZE} ${CHIP_SIZE}`}
                style={{ display: 'block' }}
              >
                <ChipShape type={p.type} />
              </svg>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
