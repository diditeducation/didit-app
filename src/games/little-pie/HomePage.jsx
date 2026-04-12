import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import theme from './theme';

const KEYFRAMES_ID = 'didit-pie-hero-keyframes';

function injectHeroKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes pieheroRotate {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes pieheroFloat {
      0%   { transform: translate(0px, 0px); }
      50%  { transform: translate(5px, -6px); }
      100% { transform: translate(0px, 0px); }
    }
  `;
  document.head.appendChild(style);
}

function ptOnCircle(cx, cy, r, deg) {
  const rad = (deg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function makePiePath(cx, cy, r, a1, a2) {
  const [x1, y1] = ptOnCircle(cx, cy, r, a1);
  const [x2, y2] = ptOnCircle(cx, cy, r, a2);
  const span = a2 - a1;
  return `M ${cx.toFixed(1)} ${cy.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${span > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
}

function HeroVisual() {
  injectHeroKeyframes();

  const CX = 65, CY = 65, R = 52;
  // 3 connected slices + 1 floating-out slice
  const connectedSlices = [
    { start: 0,   end: 90,  color: '#CF4A4A' },
    { start: 90,  end: 200, color: '#F2C4BE' },
    { start: 200, end: 280, color: '#E8AAAA' },
  ];
  // Floating slice
  const floatSlice = { start: 280, end: 360, color: '#C23C3C' };

  // Midpoint angle of floating slice for offset direction
  const floatMid = (floatSlice.start + floatSlice.end) / 2;
  const floatRad = (floatMid - 90) * Math.PI / 180;
  const offsetX = Math.cos(floatRad) * 8;
  const offsetY = Math.sin(floatRad) * 8;

  return (
    <div style={{
      width: 200,
      height: 190,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <svg
        width={130}
        height={130}
        viewBox="0 0 130 130"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <radialGradient id="pieHeroShineV2" cx="38%" cy="32%" r="55%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <filter id="pieHeroShadowV2" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(194,60,60,0.28)" />
          </filter>
          <filter id="floatSliceShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(194,60,60,0.4)" />
          </filter>
        </defs>

        {/* Background ring */}
        <circle
          cx={CX} cy={CY} r={R + 5}
          fill="rgba(194,60,60,0.06)"
          stroke="rgba(194,60,60,0.15)"
          strokeWidth={1.5}
        />

        {/* Connected slices */}
        <g filter="url(#pieHeroShadowV2)">
          {connectedSlices.map((s, i) => (
            <path
              key={i}
              d={makePiePath(CX, CY, R, s.start, s.end)}
              fill={s.color}
              stroke="white"
              strokeWidth={2}
            />
          ))}
        </g>

        {/* Floating-out slice with gentle animation */}
        <g
          transform={`translate(${offsetX}, ${offsetY})`}
          style={{ animation: 'pieheroFloat 2.8s ease-in-out infinite' }}
          filter="url(#floatSliceShadow)"
        >
          <path
            d={makePiePath(CX, CY, R, floatSlice.start, floatSlice.end)}
            fill={floatSlice.color}
            stroke="white"
            strokeWidth={2}
          />
        </g>

        {/* Center dot */}
        <circle cx={CX} cy={CY} r={5} fill="white" />

        {/* Shine overlay */}
        <circle
          cx={CX}
          cy={CY - R * 0.2}
          r={R * 0.38}
          fill="url(#pieHeroShineV2)"
          style={{ pointerEvents: 'none' }}
        />
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
        title="Analyst"
        tagline="Fill the missing pieces to complete the chart."
        tag="🥧 Data visualisation"
        description="A pie chart appears with pieces missing. Drag the right slice to complete it — discovering how parts fit into a whole and form 100%."
        skillPills={[{ label: 'Percentages' }, { label: 'Shapes' }, { label: 'Spatial recognition' }]}
        gameId="little-pie"
        onPlay={() => navigate('/games/little-pie/play')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        shareButton
        parentTipBody={
          <span>
            Point to each slice and say &quot;this piece is BIG&quot; or &quot;this piece is small&quot;. Ask &quot;which piece is missing?&quot; then help them drag it in. Fractions at play! 🥧
          </span>
        }
      />
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        gameName="Little Analyst"
      />
    </div>
  );
}
