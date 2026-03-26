import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import theme from './theme';
import { easing, colors } from '../../design-system/tokens';

const KEYFRAMES_ID = 'didit-engineer-hero-keyframes';

const keyframesCSS = `
@keyframes heroGlow {
  0%, 100% { box-shadow: none; }
  50% { box-shadow: none; }
}
@keyframes heroPulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.15); opacity: 1; }
}
@keyframes heroSpark {
  0% { opacity: 0; transform: translateY(0) scale(0.5); }
  30% { opacity: 1; transform: translateY(-8px) scale(1); }
  100% { opacity: 0; transform: translateY(-20px) scale(0.3); }
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

function HeroVisual() {
  injectKeyframes();

  const containerStyle = {
    width: '180px',
    height: '180px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const glowRingStyle = {
    position: 'absolute',
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(75,123,232,0.15) 0%, transparent 70%)',
    animation: `heroGlow 3s ${easing.out} infinite`,
  };

  const pulseRingStyle = {
    position: 'absolute',
    width: '130px',
    height: '130px',
    borderRadius: '50%',
    border: '2px solid rgba(75,123,232,0.2)',
    animation: `heroPulse 2.5s ${easing.out} infinite`,
  };

  const circleStyle = {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${colors.blueberryDark}, ${colors.blueberry})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: 'none',
  };

  const emojiStyle = {
    fontSize: '3.5rem',
    filter: 'none',
    zIndex: 1,
  };

  const sparkStyle = (delay, left) => ({
    position: 'absolute',
    fontSize: '0.8rem',
    animation: `heroSpark 1.8s ${easing.out} ${delay}s infinite`,
    left,
    top: '30%',
    zIndex: 2,
  });

  return (
    <div style={containerStyle}>
      <div style={glowRingStyle} />
      <div style={pulseRingStyle} />
      <div style={circleStyle}>
        <img src="/game%20illustrations/Bulb.png" alt="Little Engineer" style={{ width: '80%', height: '80%', objectFit: 'contain', zIndex: 1 }} />
        <span style={sparkStyle(0, '15%')}>⚡</span>
        <span style={sparkStyle(0.6, '75%')}>⚡</span>
        <span style={sparkStyle(1.2, '50%')}>✨</span>
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [soundOn, setSoundOn] = useState(true);

  return (
    <div style={theme}>
      <GameHomeLayout
        heroVisual={<HeroVisual />}
        title="Engineer"
        tagline="Build, connect, solve — your toddler's first engineering challenge."
        illustration="/game%20illustrations/Bulb.png"
        tag="🔧 Electrical Engineering"
        description="Switches to flip, wires to connect, circuits to complete. Binary logic and systems thinking."
        skillPills={[{ label: 'Cause & effect' }, { label: 'Binary logic' }, { label: 'Systems thinking' }]}
        onPlay={() => navigate('/games/little-engineer/play')}
        onBack={() => navigate('/hub')}
        parentTipBody={
          <span>
            Sit with your little one and let them tap around. Ask <em>&quot;what do you think happens if we press that?&quot;</em> — then find out together.
            <br /><br />
            That&apos;s it. Have fun! 🌟
          </span>
        }
        soundOn={soundOn}
        onSoundToggle={() => setSoundOn(!soundOn)}
      />
    </div>
  );
}
