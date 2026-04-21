import { useRef, useCallback } from 'react';
import CutoutShape from './CutoutShape';

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
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '12px 8px',
        minHeight: 210,
        flexShrink: 0,
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
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      ))}
    </div>
  );
}

function TrayTile({ tile, index, isDragging, onDragStart, onDragEnd }) {
  const tileRef = useRef(null);

  const handlePointerDown = useCallback((e) => {
    if (tile.placed) return;
    e.preventDefault();
    onDragStart(index);
  }, [tile.placed, index, onDragStart]);

  if (tile.placed) {
    // Empty slot — shape was placed
    return (
      <div style={{ width: tile.size, height: tile.size, flexShrink: 0 }} />
    );
  }

  return (
    <div
      ref={tileRef}
      onPointerDown={handlePointerDown}
      style={{
        width: tile.size,
        height: tile.size,
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
        size={tile.size}
        rotation={tile.rotation}
      />
    </div>
  );
}
