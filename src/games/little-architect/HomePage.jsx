import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import theme from './theme';

const KF_ID = 'didit-arch-hero-kf';
function injectHeroKeyframes() {
  if (typeof document === 'undefined' || document.getElementById(KF_ID)) return;
  const el = document.createElement('style');
  el.id = KF_ID;
  el.textContent = `
    @keyframes archHeroFloat {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-9px); }
    }
    @keyframes archHeroPulse {
      0%, 100% { opacity: 0.45; }
      50%       { opacity: 0.9; }
    }
  `;
  document.head.appendChild(el);
}

// Blueberry palette
const BD = '#3A6CE5';
const BM = '#6B8FD8';
const BB = '#9BB5E8';
const BL = '#CFD9F4';

function HeroVisual() {
  injectHeroKeyframes();

  // Rendered at roughly half scale of the 300×250 stage
  // viewBox "0 0 300 295" (extra height for floating piece below)
  return (
    <div style={{
      width: 200,
      height: 195,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
    }}>
      <svg
        width={168}
        height={196}
        viewBox="0 0 300 295"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <filter id="archHeroShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(58,108,229,0.28)" />
          </filter>
          <filter id="archHeroPieceShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="5" stdDeviation="10" floodColor="rgba(58,108,229,0.4)" />
          </filter>
        </defs>

        {/* Sky gradient bg */}
        <rect x={0} y={0} width={300} height={250} fill="rgba(207,217,244,0.22)" rx={14} />
        <rect x={0} y={242} width={300} height={8} fill="rgba(58,108,229,0.10)" rx={0} />

        {/* ── House (complete minus door) ── */}
        <g filter="url(#archHeroShadow)">
          {/* Wall */}
          <rect x={68} y={155} width={164} height={88} fill={BD} />
          {/* Chimney */}
          <rect x={180} y={35} width={26} height={58} fill={BM} />
          {/* Roof */}
          <polygon points="48,158 252,158 150,90" fill={BB} />
          {/* Window */}
          <rect x={178} y={165} width={44} height={44} fill={BL} />
          {/* Door ghost — dashed outline */}
          <rect
            x={116} y={196} width={52} height={47}
            fill="rgba(58,108,229,0.1)"
            stroke="rgba(58,108,229,0.45)"
            strokeWidth={2.5}
            strokeDasharray="6 4"
            style={{ animation: 'archHeroPulse 2s ease-in-out infinite' }}
          />
        </g>

        {/* ── Floating door piece ── */}
        <g
          filter="url(#archHeroPieceShadow)"
          style={{ animation: 'archHeroFloat 2.4s ease-in-out infinite' }}
        >
          <rect x={116} y={256} width={52} height={47} fill={BM} rx={2} />
          {/* White shine on piece */}
          <rect x={119} y={259} width={22} height={12} fill="rgba(255,255,255,0.28)" rx={2} />
        </g>
      </svg>
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
        title="Architect"
        tagline="Drag the pieces onto the outline to build it."
        tag="🏗️ Spatial building"
        description="A building silhouette appears on screen. Drag the chunky shape pieces from the tray to fill it in — discovering how different shapes come together to make something real."
        skillPills={[{ label: 'Shapes' }, { label: 'Spatial reasoning' }, { label: 'Building' }]}
        gameId="little-architect"
        onPlay={() => navigate('/games/little-architect/play')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        shareButton
        parentTipBody={
          <span>
            Name each shape as you hand it over — "this is a triangle, it goes on top!" Spatial language (over, under, beside) builds early maths foundations. 🏗️
          </span>
        }
      />
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        gameName="Little Architect"
      />
    </div>
  );
}
