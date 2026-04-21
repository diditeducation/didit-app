import { useRef, useCallback } from 'react';
import CutoutShape from './CutoutShape';

/**
 * The collage board: renders anchor shape + placed shapes, accepts drops.
 * Coordinates stored as percentages for responsiveness.
 */
export default function Canvas({
  anchor,         // { shape, color, rotation }
  placedShapes,   // [{ shape, color, size, rotation, xPct, yPct }]
  onDrop,         // (xPct, yPct) => void
}) {
  const canvasRef = useRef(null);

  const handlePointerUp = useCallback((e) => {
    if (!onDrop) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    onDrop(xPct, yPct);
  }, [onDrop]);

  return (
    <div
      ref={canvasRef}
      onPointerUp={handlePointerUp}
      style={{
        flex: 1,
        position: 'relative',
        borderRadius: 20,
        background: '#FFFFFF',
        border: '1.5px solid #E0DCD6',
        overflow: 'hidden',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        minHeight: 0,
      }}
    >
      <style>{`
        @keyframes anchorFloat {
          0%, 100% { transform: translate(-50%, -50%) rotate(var(--anchor-rot-start)); }
          50%      { transform: translate(-50%, -50%) rotate(var(--anchor-rot-end)); }
        }
        @keyframes placePop {
          0%   { transform: translate(-50%, -50%) rotate(var(--place-rot)) scale(0); opacity: 0; }
          60%  { transform: translate(-50%, -50%) rotate(var(--place-rot)) scale(1.15); opacity: 1; }
          100% { transform: translate(-50%, -50%) rotate(var(--place-rot)) scale(1); opacity: 1; }
        }
        @keyframes sparkleOut {
          0%   { transform: translate(-50%, -50%) rotate(var(--sparkle-rot)) scale(1); opacity: 1; }
          100% { transform: translate(var(--sparkle-tx), var(--sparkle-ty)) rotate(var(--sparkle-rot)) scale(0.3); opacity: 0; }
        }
      `}</style>

      {/* Anchor shape — centred, slow floating rotation */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '75%',
          aspectRatio: '1 / 1',
          '--anchor-rot-start': `${anchor.rotation - 2}deg`,
          '--anchor-rot-end': `${anchor.rotation + 2}deg`,
          animation: 'anchorFloat 4s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <CutoutShape
          shape={anchor.shape}
          color={anchor.color}
          size="100%"
          rotation={0}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Placed shapes */}
      {placedShapes.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${s.xPct}%`,
            top: `${s.yPct}%`,
            width: s.size,
            height: s.size,
            '--place-rot': `${s.rotation}deg`,
            animation: 'placePop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            pointerEvents: 'none',
            zIndex: 2 + i,
          }}
        >
          <CutoutShape
            shape={s.shape}
            color={s.color}
            size={s.size}
            rotation={0}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      ))}
    </div>
  );
}
