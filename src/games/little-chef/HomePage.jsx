import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import theme from './theme';
import { easing } from '../../design-system/tokens';

const KEYFRAMES_ID = 'didit-chef-hero-keyframes';

const keyframesCSS = `
@keyframes chefGlow {
  0%, 100% { box-shadow: none; }
  50% { box-shadow: none; }
}
@keyframes chefPulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.15); opacity: 1; }
}
@keyframes chefFloat {
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
    background: 'radial-gradient(circle, rgba(238,106,48,0.15) 0%, transparent 70%)',
    animation: `chefGlow 3s ${easing.out} infinite`,
  };

  const pulseRingStyle = {
    position: 'absolute',
    width: '130px',
    height: '130px',
    borderRadius: '50%',
    border: '2px solid rgba(238,106,48,0.2)',
    animation: `chefPulse 2.5s ${easing.out} infinite`,
  };

  const circleStyle = {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 40% 35%, var(--game-accent), var(--game-primary))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: 'none',
  };

  const sparkStyle = (delay, left) => ({
    position: 'absolute',
    fontSize: '0.8rem',
    animation: `chefFloat 1.8s ${easing.out} ${delay}s infinite`,
    left,
    top: '25%',
    zIndex: 2,
  });

  return (
    <div style={containerStyle}>
      <div style={glowRingStyle} />
      <div style={pulseRingStyle} />
      <div style={circleStyle}>
        <img src="/game%20illustrations/Pizza.png" alt="Little Chef" style={{ width: '80%', height: '80%', objectFit: 'contain', zIndex: 1 }} />
      </div>
      <span style={sparkStyle(0, '10%')}>🍳</span>
      <span style={sparkStyle(0.6, '80%')}>✨</span>
      <span style={sparkStyle(1.2, '50%')}>👨‍🍳</span>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div style={theme}>
      <GameHomeLayout
        heroVisual={<HeroVisual />}
        title="Chef"
        tagline="Follow the recipe, cook the meal — order matters!"
        illustration="/game%20illustrations/Pizza.png"
        tag="🍳 Cooking & Sequencing"
        description="Crack the egg. Pour the flour. Mix. The order matters. Change a step, change the result."
        skillPills={[{ label: 'Sequencing' }, { label: 'Planning' }, { label: 'Process' }]}
        gameId="little-chef"
        onPlay={() => navigate('/games/little-chef/play')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        shareButton
        parentTipBody={
          <span>
            Cook together! Point to each step and say{' '}
            <em>&quot;what comes next?&quot;</em> — let them tap the ingredient.
            <br />
            <br />
            Talk about why order matters — you can&apos;t frost a cake before baking it! 🎂
          </span>
        }
      />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} gameName="Little Chef" />
    </div>
  );
}
