import { useEffect } from 'react';
import { fonts, easing, colors } from '../tokens';
import Button from './Button';

const KEYFRAMES_ID = 'didit-celebration-keyframes';

const keyframesCSS = `
@keyframes celebrateBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
@keyframes celebrateIn {
  0% { transform: scale(0.3) rotate(-15deg); opacity: 0; }
  60% { transform: scale(1.1) rotate(3deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
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

export default function CelebrationOverlay({
  emoji,
  headline,
  stars = 3,
  onDismiss,
  autoClose,
}) {
  useEffect(() => {
    injectKeyframes();
  }, []);

  useEffect(() => {
    if (autoClose && onDismiss) {
      const timer = setTimeout(onDismiss, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onDismiss]);

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(255,255,255,0.92)',
    zIndex: 300,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  };

  const emojiStyle = {
    fontSize: '5rem',
    animation: `celebrateBounce 1s ${easing.bounce} infinite alternate`,
  };

  const headlineStyle = {
    fontFamily: fonts.display,
    fontWeight: 900,
    fontSize: '3rem',
    color: colors.coral,
    textAlign: 'center',
    animation: `celebrateIn 0.6s ${easing.bounce}`,
    padding: '0 24px',
  };

  const starsContainerStyle = {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  };

  const starStyle = (i) => ({
    fontSize: '2.5rem',
    animation: `celebrateIn 0.5s ${easing.bounce} ${i * 150}ms both`,
  });

  const buttonWrapperStyle = {
    marginTop: '24px',
  };

  const starCount = Math.max(1, Math.min(3, stars));

  return (
    <div style={overlayStyle}>
      <div style={emojiStyle}>{emoji}</div>
      <div style={headlineStyle}>{headline}</div>
      <div style={starsContainerStyle}>
        {Array.from({ length: starCount }, (_, i) => (
          <span key={i} style={starStyle(i)}>⭐</span>
        ))}
      </div>
      <div style={buttonWrapperStyle}>
        <Button variant="ghost" onClick={onDismiss}>
          Play again 🎮
        </Button>
      </div>
    </div>
  );
}
