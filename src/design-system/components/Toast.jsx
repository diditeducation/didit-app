import { useState, useEffect, useRef } from 'react';

const KEYFRAMES_ID = 'didit-toast-keyframes';

const keyframesCSS = `
@keyframes toastFloat {
  0%   { opacity: 1; transform: translateX(-50%) translateY(0); }
  60%  { opacity: 1; transform: translateX(-50%) translateY(-8px); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-30px); }
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

export default function Toast({ message, visible, topPercent = 35, duration = 2200, color }) {
  const [mounted, setMounted] = useState(false);
  const triggerCount = useRef(0);

  useEffect(() => {
    injectKeyframes();
  }, []);

  useEffect(() => {
    if (visible) {
      triggerCount.current += 1;
      setMounted(true);
    } else {
      setMounted(false);
    }
  }, [visible, message]);

  if (!mounted) return null;

  const bubbleStyle = {
    position: 'fixed',
    top: `${topPercent}%`,
    left: '50%',
    zIndex: 150,
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    fontFamily: 'Nunito, sans-serif',
    fontWeight: 900,
    fontSize: '0.9rem',
    color: color || 'var(--game-primary)',
    background: '#FFFFFF',
    padding: '8px 18px',
    borderRadius: '9999px',
    textShadow: 'none',
    animation: `toastFloat ${Math.min(duration, 2500)}ms ease-out forwards`,
  };

  const tailStyle = {
    position: 'absolute',
    bottom: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: '10px solid #FFFFFF',
    pointerEvents: 'none',
  };

  return (
    <div key={`${triggerCount.current}-${message}`} style={bubbleStyle}>
      {message}
      <div style={tailStyle} />
    </div>
  );
}
