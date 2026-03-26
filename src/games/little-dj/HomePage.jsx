import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import theme from './theme';
import { easing, colors } from '../../design-system/tokens';

const KEYFRAMES_ID = 'didit-dj-hero-keyframes';

const keyframesCSS = `
@keyframes djSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes djGlow {
  0%, 100% { box-shadow: none; }
  50% { box-shadow: none; }
}
@keyframes djPulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.15); opacity: 1; }
}
@keyframes djNote {
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
    background: 'radial-gradient(circle, rgba(255,107,107,0.15) 0%, transparent 70%)',
    animation: `djGlow 3s ${easing.out} infinite`,
  };

  const pulseRingStyle = {
    position: 'absolute',
    width: '130px',
    height: '130px',
    borderRadius: '50%',
    border: '2px solid rgba(255,107,107,0.2)',
    animation: `djPulse 2.5s ${easing.out} infinite`,
  };

  // Vinyl record
  const vinylStyle = {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: `radial-gradient(circle,
      ${colors.coralDark} 0%,
      ${colors.coralDark} 15%,
      ${colors.coral} 16%,
      ${colors.coralDark} 17%,
      ${colors.coralDark} 30%,
      ${colors.coral} 31%,
      ${colors.coralDark} 32%,
      ${colors.coralDark} 48%,
      ${colors.coral} 49%,
      ${colors.coralDark} 50%,
      ${colors.coralDark} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: 'none',
    animation: `djSpin 4s linear infinite`,
  };

  // Center label of vinyl
  const centerLabelStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${colors.coral}, ${colors.coralLight})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    boxShadow: 'none',
  };

  const noteStyle = (delay, left) => ({
    position: 'absolute',
    fontSize: '0.8rem',
    animation: `djNote 1.8s ${easing.out} ${delay}s infinite`,
    left,
    top: '25%',
    zIndex: 2,
  });

  return (
    <div style={containerStyle}>
      <div style={glowRingStyle} />
      <div style={pulseRingStyle} />
      <div style={vinylStyle}>
        <img src="/game%20illustrations/Music.png" alt="Little DJ" style={{ width: '80%', height: '80%', objectFit: 'contain', position: 'absolute', top: '10%', left: '10%' }} />
      </div>
      <span style={noteStyle(0, '10%')}>🎵</span>
      <span style={noteStyle(0.6, '80%')}>🎶</span>
      <span style={noteStyle(1.2, '50%')}>✨</span>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={theme}>
      <GameHomeLayout
        heroVisual={<HeroVisual />}
        title="Little DJ"
        tagline="Tap, slide, mix — your toddler's first music lesson."
        illustration="/game%20illustrations/Music.png"
        tag="🎵 Music Fundamentals"
        description="Sliders for tempo, notes to stretch, and tracks to play with. Rhythm, pitch, and composition."
        skillPills={[{ label: 'Pitch & tone' }, { label: 'Tempo & rhythm' }, { label: 'Sound layering' }]}
        onPlay={() => navigate('/games/little-dj/play')}
        onBack={() => navigate('/hub')}
        parentTipBody={
          <span>
            Sit with your little one and explore sounds together. Ask <em>&quot;can you feel the beat?&quot;</em> or <em>&quot;is that sound high or low?&quot;</em>
            <br /><br />
            Let them tap, slide and mix at their own pace. 🎧
          </span>
        }
      />
    </div>
  );
}
