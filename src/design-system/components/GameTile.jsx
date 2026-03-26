import { useState, useEffect } from 'react';
import { shadows, radii, easing, colors } from '../tokens';

const KEYFRAMES_ID = 'didit-game-tile-keyframes';

const keyframesCSS = `
@keyframes celebrate {
  0% { transform: scale(0.5) rotate(-10deg); opacity: 0; }
  50% { transform: scale(1.15) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes wiggle {
  0% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(5px); }
  100% { transform: translateX(0); }
}
`;

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = keyframesCSS;
  document.head.appendChild(style);
}

const stateStyles = {
  default: {
    background: '#FFFFFF',
    boxShadow: 'none',
    border: '3px solid transparent',
    transform: 'scale(1) rotate(0deg)',
    cursor: 'grab',
    animation: 'none',
  },
  dragging: {
    background: '#FFFFFF',
    boxShadow: 'none',
    border: '3px solid transparent',
    transform: 'scale(1.12) rotate(4deg)',
    cursor: 'grabbing',
    animation: 'none',
  },
  correct: {
    background: colors.grassLight,
    boxShadow: 'none',
    border: `3px solid ${colors.grass}`,
    transform: 'scale(1) rotate(0deg)',
    cursor: 'grab',
    animation: `celebrate 0.6s ${easing.bounce}`,
  },
  wrong: {
    background: '#FFFFFF',
    boxShadow: 'none',
    border: '3px solid transparent',
    transform: 'scale(1) rotate(0deg)',
    cursor: 'grab',
    animation: '0.4s ease-in-out wiggle',
  },
};

export default function GameTile({
  emoji,
  state = 'default',
  onClick,
  onDragStart,
  onDragEnd,
  draggable = false,
}) {
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    injectKeyframes();
  }, []);

  const current = stateStyles[state] || stateStyles.default;

  const style = {
    width: '96px',
    height: '96px',
    borderRadius: radii.card,
    fontSize: '2.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `all 0.2s ${easing.bounce}`,
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    flexShrink: 0,
    ...current,
  };

  // Hover effect only for default state
  if (hovered && state === 'default') {
    style.transform = 'scale(1.08) rotate(-3deg)';
    style.boxShadow = 'none';
  }

  return (
    <div
      style={style}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
    >
      {emoji}
    </div>
  );
}
