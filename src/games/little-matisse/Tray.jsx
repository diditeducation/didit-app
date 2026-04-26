import { useRef, useCallback, useEffect, useState } from 'react';
import CutoutShape from './CutoutShape';

/**
 * Returns a multiplier (≤ 1) for the tray tiles. We try to make them
 * fit the viewport, but never shrink below MIN_SCALE so the tiles stay
 * easy for little fingers to grab. If they still don't fit, the tray
 * scrolls horizontally.
 */
const MIN_SCALE = 0.5;   // smallest tile is 120 → 60px, still draggable
function useTrayScale(largestSize, count) {
  const compute = () => {
    if (typeof window === 'undefined') return 1;
    const available = Math.min(window.innerWidth, 480) - 32;   // 16px side pad each
    const gaps = 8 * (count - 1);
    const ideal = (available - gaps) / count;
    return Math.max(MIN_SCALE, Math.min(1, ideal / largestSize));
  };
  const [scale, setScale] = useState(compute);
  useEffect(() => {
    const onResize = () => setScale(compute());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [largestSize, count]);
  return scale;
}

/**
 * Bottom tray holding 4 draggable cutout tiles.
 * Tiles pulse gently with staggered delays.
 * On drag: ghost follows pointer; original fades.
 * On drop inside canvas: parent handles placement.
 * On drop outside: tile restores.
 */
export default function Tray({
  tiles,          // [{ shape, color, size, rotation, placed }]
  draggingIdx,    // which tile is being dragged (null if none)
  onDragStart,    // (index) => void
  onDragEnd,      // () => void — cancelled drag
}) {
  const largestSize = tiles.reduce((m, t) => Math.max(m, t.size || 0), 1);
  const scale = useTrayScale(largestSize, tiles.length);
  const trayHeight = Math.max(120, Math.round(largestSize * scale + 24));
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        padding: '12px 16px',
        minHeight: trayHeight,
        flexShrink: 0,
        // Fall back to horizontal swipe on very narrow phones so no
        // tile is ever clipped off-screen.
        overflowX: 'auto',
        overflowY: 'visible',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
      }}
    >
      <style>{`
        @keyframes tilePulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.04); }
        }
      `}</style>

      {tiles.map((tile, i) => (
        <TrayTile
          key={i}
          tile={tile}
          index={i}
          isDragging={draggingIdx === i}
          scale={scale}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      ))}
    </div>
  );
}

function TrayTile({ tile, index, isDragging, scale = 1, onDragStart }) {
  const tileRef = useRef(null);
  const renderSize = Math.round(tile.size * scale);

  const handlePointerDown = useCallback((e) => {
    if (tile.placed) return;
    // touchAction: 'none' below already cancels native scroll/zoom; no
    // need to call e.preventDefault() (doing both can break taps on
    // some iOS Safari builds).
    onDragStart(index);
  }, [tile.placed, index, onDragStart]);

  if (tile.placed) {
    // Empty slot — shape was placed
    return (
      <div style={{ width: renderSize, height: renderSize, flexShrink: 0 }} />
    );
  }

  return (
    <div
      ref={tileRef}
      onPointerDown={handlePointerDown}
      style={{
        width: renderSize,
        height: renderSize,
        flexShrink: 0,
        opacity: isDragging ? 0.25 : 1,
        cursor: 'grab',
        touchAction: 'none',
        animation: isDragging
          ? 'none'
          : `tilePulse 2s ease-in-out ${index * 0.3}s infinite`,
        transition: 'opacity 0.2s ease',
      }}
    >
      <CutoutShape
        shape={tile.shape}
        color={tile.color}
        size={renderSize}
        rotation={tile.rotation}
      />
    </div>
  );
}
