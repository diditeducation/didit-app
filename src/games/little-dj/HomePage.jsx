import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import theme from './theme';
import { easing } from '../../design-system/tokens';

const KEYFRAMES_ID = 'didit-mixer-hero-keyframes';

const keyframesCSS = `
@keyframes mixerPulse {
  0%, 100% { transform: scaleY(1); opacity: 0.85; }
  50%       { transform: scaleY(1.5); opacity: 1; }
}
@keyframes mixerGlow {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
}
@keyframes mixerFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
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

const FADERS = [
  { color: '#CF4A4A', emoji: '🎹', height: '55%', delay: '0s' },
  { color: '#E8C840', emoji: '🥁', height: '75%', delay: '0.15s' },
  { color: '#54A0FF', emoji: '🎩', height: '40%', delay: '0.3s' },
  { color: '#1DD1A1', emoji: '🪘', height: '65%', delay: '0.45s' },
  { color: '#C8A2FF', emoji: '🎸', height: '50%', delay: '0.6s' },
];

function HeroVisual() {
  injectKeyframes();

  const consoleStyle = {
    width: '190px',
    height: '150px',
    background: '#0f1b2d',
    borderRadius: 20,
    padding: '10px 14px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    boxShadow: '0 8px 32px rgba(3,178,146,0.25), 0 2px 8px rgba(0,0,0,0.3)',
    animation: `mixerFloat 3s ${easing.out} infinite`,
    position: 'relative',
  };

  // Mini "screen" at top showing waveform bars
  const screenStyle = {
    width: '100%',
    height: 22,
    background: 'rgba(3,178,146,0.12)',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    overflow: 'hidden',
    border: '1px solid rgba(3,178,146,0.25)',
  };

  const fadersRowStyle = {
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    gap: 6,
    padding: '0 2px',
  };

  // Waveform bars inside the screen
  const screenBars = [0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.45, 0.75, 0.55, 0.85];

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 200, height: 190 }}>
      {/* Outer glow ring */}
      <div style={{
        position: 'absolute',
        width: 175, height: 140,
        borderRadius: 24,
        background: 'radial-gradient(circle, rgba(3,178,146,0.12) 0%, transparent 70%)',
        animation: `mixerGlow 2.5s ${easing.out} infinite`,
      }} />

      <div style={consoleStyle}>
        {/* Mini screen */}
        <div style={screenStyle}>
          {screenBars.map((h, i) => (
            <div key={i} style={{
              width: 4,
              height: `${h * 14}px`,
              borderRadius: 2,
              background: `rgba(3,178,146,${0.5 + h * 0.5})`,
              animation: `mixerPulse ${1.2 + i * 0.1}s ${easing.out} ${i * 0.08}s infinite`,
            }} />
          ))}
        </div>

        {/* Fader strips */}
        <div style={fadersRowStyle}>
          {FADERS.map((f) => (
            <div key={f.emoji} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              {/* Track groove */}
              <div style={{
                width: 3,
                height: 52,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 4,
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}>
                {/* Filled portion */}
                <div style={{
                  width: 3,
                  height: f.height,
                  background: f.color,
                  borderRadius: 4,
                  boxShadow: `0 0 6px ${f.color}99`,
                }} />
                {/* Fader knob */}
                <div style={{
                  position: 'absolute',
                  bottom: f.height,
                  width: 12,
                  height: 7,
                  background: '#fff',
                  borderRadius: 3,
                  boxShadow: `0 1px 4px rgba(0,0,0,0.5)`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                }} />
              </div>
              {/* Emoji label */}
              <span style={{ fontSize: '0.55rem', lineHeight: 1 }}>{f.emoji}</span>
            </div>
          ))}
        </div>
      </div>
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
        title="DJ"
        tagline="Tap a cell, hear it loop — layer up a beat from scratch."
        illustration="/game%20illustrations/Music.png"
        tag="🎛️ Beat Making"
        description="Five instruments across four beats — tap any cell to switch it on and hear it loop. Stack up drums, bass, melody and more until you've got your own groove going."
        skillPills={[{ label: 'Layering sounds' }, { label: 'Rhythm' }, { label: 'Creativity' }]}
        onPlay={() => navigate('/games/little-dj/play')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        shareButton
        parentTipBody={
          <span>
            Move your body to the beat and add layers together! Ask{' '}
            <em>&quot;what does the drum sound like?&quot;</em> then{' '}
            <em>&quot;what happens when we add the bass?&quot;</em>
            <br /><br />
            Every combination sounds musical — there are no wrong answers. 🥁
          </span>
        }
      />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} gameName="Little DJ" />
    </div>
  );
}
