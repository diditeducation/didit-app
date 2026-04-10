import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import theme from './theme';

const KF_ID = 'little-astronomer-home-keyframes';
function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KF_ID)) return;
  const el = document.createElement('style');
  el.id = KF_ID;
  el.textContent = `
    @keyframes orbitA {
      from { transform: rotate(0deg) translateX(38px) rotate(0deg); }
      to   { transform: rotate(360deg) translateX(38px) rotate(-360deg); }
    }
    @keyframes orbitB {
      from { transform: rotate(100deg) translateX(60px) rotate(-100deg); }
      to   { transform: rotate(460deg) translateX(60px) rotate(-460deg); }
    }
    @keyframes orbitC {
      from { transform: rotate(220deg) translateX(84px) rotate(-220deg); }
      to   { transform: rotate(580deg) translateX(84px) rotate(-580deg); }
    }
    @keyframes heroFloat {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-8px); }
    }
    @keyframes starFlick {
      0%, 100% { opacity: 0.35; }
      50%       { opacity: 1; }
    }
  `;
  document.head.appendChild(el);
}

function HeroVisual() {
  injectKeyframes();

  const containerW = 200;
  const containerH = 190;
  const bgSize = containerW * 0.9;

  return (
    <div style={{
      width: containerW,
      height: containerH,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'heroFloat 4s ease-in-out infinite',
    }}>
      {/* Dark circular background */}
      <div style={{
        width: bgSize,
        height: bgSize,
        borderRadius: '50%',
        background: '#0a0e1a',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 32px 8px rgba(232,184,64,0.18)',
      }} />

      {/* Star dots */}
      {[
        { top: 18,  left: 28,  size: 2.2, delay: '0s' },
        { top: 24,  left: 158, size: 1.8, delay: '0.7s' },
        { top: 148, left: 22,  size: 1.6, delay: '1.2s' },
        { top: 158, left: 162, size: 2.0, delay: '0.4s' },
        { top: 60,  left: 170, size: 1.4, delay: '1.8s' },
        { top: 165, left: 90,  size: 1.5, delay: '0.9s' },
        { top: 40,  left: 75,  size: 1.3, delay: '2.1s' },
      ].map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top:    s.top,
            left:   s.left,
            width:  s.size,
            height: s.size,
            borderRadius: '50%',
            background: '#ffffff',
            animation: `starFlick 2.5s ${s.delay} ease-in-out infinite`,
          }}
        />
      ))}

      {/* Orbit path rings */}
      {[76, 120, 168].map((diameter, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: diameter, height: diameter,
            borderRadius: '50%',
            border: `1px solid rgba(255,255,255,${0.14 - i * 0.04})`,
            transform: 'translate(-50%,-50%)',
          }}
        />
      ))}

      {/* Central sun */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: 18, height: 18,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 35%, #FFF0A0, #F0DC90, #E8B840)',
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 12px 4px rgba(240,220,144,0.6)',
        zIndex: 2,
      }} />

      {/* Inner orbit — blue planet */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: 0, height: 0,
        animation: 'orbitA 4s linear infinite',
      }}>
        <div style={{
          width: 10, height: 10,
          borderRadius: '50%',
          background: '#2E86AB',
          boxShadow: '0 0 5px rgba(46,134,171,0.7)',
          transform: 'translate(-50%,-50%)',
        }} />
      </div>

      {/* Middle orbit — red/mars */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: 0, height: 0,
        animation: 'orbitB 7s linear infinite',
      }}>
        <div style={{
          width: 8, height: 8,
          borderRadius: '50%',
          background: '#C1440E',
          boxShadow: '0 0 5px rgba(193,68,14,0.7)',
          transform: 'translate(-50%,-50%)',
        }} />
      </div>

      {/* Outer orbit — saturn with ring */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        width: 0, height: 0,
        animation: 'orbitC 11s linear infinite',
      }}>
        <div style={{
          position: 'relative',
          transform: 'translate(-50%,-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3,
        }}>
          {/* Ring */}
          <div style={{
            position: 'absolute',
            width: 22, height: 6,
            borderRadius: '50%',
            background: 'rgba(196,163,90,0.6)',
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%) rotate(-18deg)',
            zIndex: 0,
          }} />
          {/* Planet body */}
          <div style={{
            width: 12, height: 12,
            borderRadius: '50%',
            background: '#C4A35A',
            boxShadow: '0 0 6px rgba(196,163,90,0.7)',
            position: 'relative',
            zIndex: 1,
          }} />
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
        title="Astronomer"
        tagline="Match the planet to its silhouette."
        tag="🪐 Space & Planets"
        description="A mystery planet silhouette appears in the stars. Tap the right planet to match it and light up the sky!"
        skillPills={[
          { label: 'Planets' },
          { label: 'Shapes' },
          { label: 'Matching' },
        ]}
        gameId="little-astronomer"
        onPlay={() => navigate('/games/little-astronomer/play')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        shareButton
        parentTipBody="Point at the silhouette and ask 'what planet could this be?' Talk about Saturn's rings, Jupiter's size, or Earth's colours. Space is endless fun! 🚀"
      />
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        gameName="Little Astronomer"
      />
    </div>
  );
}
