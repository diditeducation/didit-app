import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import theme from './theme';
import { easing } from '../../design-system/tokens';

const KEYFRAMES_ID = 'didit-pour-hero-keyframes';

const keyframesCSS = `
@keyframes pourFloat {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-7px); }
}
@keyframes pourDotBob {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-4px); }
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

// Mini small jar SVG — 25x50
function MiniJarSVG({ balls, ballColor, lidColor }) {
  const ballEls = balls.map((_, i) => (
    <circle key={i} cx={12.5} cy={40 - i * 12} r={5} fill={ballColor} opacity={0.9} />
  ));
  return (
    <svg viewBox="0 0 25 55" width={25} height={55}>
      <path
        d="M 3 46 Q 3 53 12.5 53 Q 22 53 22 46 L 22 14 Q 22 9 12.5 9 Q 3 9 3 14 Z"
        fill="rgba(200,220,255,0.3)"
        stroke="rgba(107,143,216,0.55)"
        strokeWidth={1.5}
      />
      <rect x={2} y={5} width={21} height={7} rx={2} ry={2} fill={lidColor} opacity={0.9} />
      <line x1={6} y1={15} x2={6} y2={44} stroke="white" strokeWidth={1.5} opacity={0.25} strokeLinecap="round" />
      {ballEls}
    </svg>
  );
}

// Mini big jar SVG — 35x65
function MiniBigJarSVG({ balls, ballColor }) {
  const ballEls = balls.map((_, i) => (
    <circle key={i} cx={17.5} cy={55 - i * 13} r={6} fill={ballColor} opacity={0.92} />
  ));
  return (
    <svg viewBox="0 0 35 70" width={35} height={70}>
      <path
        d="M 4 58 Q 4 67 17.5 67 Q 31 67 31 58 L 31 18 L 4 18 Z"
        fill="rgba(200,220,255,0.3)"
        stroke="rgba(107,143,216,0.6)"
        strokeWidth={1.8}
      />
      <rect x={2} y={10} width={31} height={10} rx={3} ry={3} fill="#9A8F82" opacity={0.85} />
      <line x1={8} y1={22} x2={8} y2={55} stroke="white" strokeWidth={2} opacity={0.2} strokeLinecap="round" />
      {ballEls}
    </svg>
  );
}

function HeroVisual() {
  useEffect(() => {
    injectKeyframes();
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        width: 200,
        height: 190,
        flexDirection: 'column',
        gap: 0,
      }}
    >
      {/* Outer glow */}
      <div style={{
        position: 'absolute',
        width: 180,
        height: 170,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(107,143,216,0.12) 0%, transparent 70%)',
        top: 0,
        left: 10,
        pointerEvents: 'none',
      }} />

      {/* Content wrapper - floats */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        animation: `pourFloat 3.5s ${easing.out} infinite`,
        width: '100%',
      }}>
        {/* Small jars row */}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 14, alignItems: 'flex-end' }}>
          <div style={{ animation: `pourDotBob 3s ${easing.out} 0.2s infinite` }}>
            <MiniJarSVG
              balls={[1, 1, 1]}
              ballColor="#4CC830"
              lidColor="#4CC830"
            />
          </div>
          <div style={{ animation: `pourDotBob 3s ${easing.out} 0.6s infinite` }}>
            <MiniJarSVG
              balls={[1]}
              ballColor="#3A6CE5"
              lidColor="#3A6CE5"
            />
          </div>
        </div>

        {/* Arrow */}
        <div style={{
          color: 'rgba(107,143,216,0.6)',
          fontSize: '1.1rem',
          lineHeight: 1,
          marginTop: 2,
          marginBottom: 2,
        }}>
          ↓
        </div>

        {/* Big jar */}
        <div style={{ animation: `pourDotBob 3.5s ${easing.out} 1s infinite` }}>
          <MiniBigJarSVG
            balls={[1, 1, 1, 1]}
            ballColor="#6B8FD8"
          />
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
        title="Mathematician"
        tagline="Pour the jars to discover number bonds."
        tag="🔢 Number Bonds & Addition"
        description="Two small jars, one big jar. Tap to pour — and discover that the total is always the same, no matter how it's split!"
        skillPills={[{ label: 'Addition' }, { label: 'Number bonds' }, { label: 'Counting' }]}
        gameId="little-pour"
        onPlay={() => navigate('/games/little-pour/play')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        shareButton
        parentTipBody="After both jars are poured, count the balls together: '1, 2, 3, 4!' Say 'wow, it's always 4!' to highlight the number bond discovery. 🔢"
      />
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        gameName="Little Mathematician"
      />
    </div>
  );
}
