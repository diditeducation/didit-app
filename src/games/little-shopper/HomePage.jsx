import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import theme from './theme';
import { easing } from '../../design-system/tokens';

const KEYFRAMES_ID = 'didit-shopper-hero-keyframes';

const keyframesCSS = `
@keyframes shopperGlow {
  0%, 100% { box-shadow: none; }
  50% { box-shadow: none; }
}
@keyframes shopperPulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.15); opacity: 1; }
}
@keyframes shopperFloat {
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
    background: 'radial-gradient(circle, rgba(46,204,113,0.15) 0%, transparent 70%)',
    animation: `shopperGlow 3s ${easing.out} infinite`,
  };

  const pulseRingStyle = {
    position: 'absolute',
    width: '130px',
    height: '130px',
    borderRadius: '50%',
    border: '2px solid rgba(46,204,113,0.2)',
    animation: `shopperPulse 2.5s ${easing.out} infinite`,
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

  const emojiStyle = {
    fontSize: '4.5rem',
    filter: 'none',
    zIndex: 1,
  };

  const sparkStyle = (delay, left) => ({
    position: 'absolute',
    fontSize: '0.8rem',
    animation: `shopperFloat 1.8s ${easing.out} ${delay}s infinite`,
    left,
    top: '25%',
    zIndex: 2,
  });

  return (
    <div style={containerStyle}>
      <div style={glowRingStyle} />
      <div style={pulseRingStyle} />
      <div style={circleStyle}>
        <img src="/game%20illustrations/Bank.png" alt="Little Shopper" style={{ width: '80%', height: '80%', objectFit: 'contain', zIndex: 1 }} />
      </div>
      <span style={sparkStyle(0, '10%')}>🪙</span>
      <span style={sparkStyle(0.6, '80%')}>✨</span>
      <span style={sparkStyle(1.2, '50%')}>🛒</span>
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
        title="Shopper"
        tagline="Tap, count, and pay — your toddler's first shopping trip."
        illustration="/game%20illustrations/Bank.png"
        tag="💰 Financial Literacy"
        description="They earn coins, choose what to buy, decide what to save, and figure out what things are worth."
        skillPills={[{ label: 'Budgeting' }, { label: 'Saving vs spending' }, { label: 'Price comparison' }]}
        gameId="little-shopper"
        onPlay={() => navigate('/games/little-shopper/play')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        shareButton
        parentTipBody={
          <span>
            Sit together and let them pick items and count coins. Ask{' '}
            <em>&quot;how many coins do we need?&quot;</em> — then count together.
            <br />
            <br />
            That&apos;s it. Have fun! 🌟
          </span>
        }
      />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} gameName="Little Shopper" />
    </div>
  );
}
