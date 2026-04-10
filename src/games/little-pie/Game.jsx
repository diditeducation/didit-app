import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../design-system/layouts/GameShell';
import Confetti from '../../design-system/components/Confetti';
import Toast from '../../design-system/components/Toast';
import SuccessScreen from '../../design-system/components/SuccessScreen';
import FeedbackModal from '../../components/FeedbackModal';
import { useToast } from '../../design-system/useToast';
import { initAudio } from './audio';
import theme from './theme';
import LittlePieGame, { LEVEL_DEFS } from './LittlePieGame';
import { trackGameOpen, trackLevelComplete, trackGameComplete } from '../../analytics';

const BALANCE_TOASTS = [
  'Perfect slice! 🥧',
  'You got it! ✨',
  'Amazing! 🎉',
  'Nailed it! 🥧',
  'Woohoo! ⭐',
  'Brilliant! 🎊',
  'Right on! 🥧',
  'Spot on! 🌟',
];

// Small SVG showing each level's gap piece for the success screen
const PIE_COLORS = ['#CF4A4A', '#F2C4BE', '#E8AAAA', '#C23C3C', '#F9D4CF'];

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

// Full pie icon for the success screen
function PieIcon({ levelDef, size = 48 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.42;
  let cursor = 0;
  const slices = levelDef.spans.map((span, i) => {
    const s = { start: cursor, end: cursor + span, color: PIE_COLORS[i % PIE_COLORS.length] };
    cursor += span;
    return s;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r + 2} fill="rgba(194,60,60,0.08)" />
      {slices.map((s, i) => (
        <path
          key={i}
          d={makePiePath(cx, cy, r, s.start, s.end)}
          fill={s.color}
          stroke="white"
          strokeWidth={1.5}
        />
      ))}
      <circle cx={cx} cy={cy} r={3} fill="white" />
    </svg>
  );
}

const LEVEL_NAMES = ['2 halves', '3 thirds', 'Big & small', '3 pieces', '4 pieces', '5 pieces'];
const BOUGHT_ITEMS = LEVEL_DEFS.map((def, i) => ({
  node: <PieIcon levelDef={def} size={48} />,
  name: LEVEL_NAMES[i],
}));

export default function Game() {
  const navigate = useNavigate();

  const [activeLevel,     setActiveLevel]     = useState(1);
  const [completedLevels, setCompletedLevels] = useState(new Set());
  const [showSuccess,     setShowSuccess]     = useState(false);
  const [milestone,       setMilestone]       = useState({ active: false, originX: 50, originY: 50 });
  const { toast, showToast } = useToast();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [emojiPopup,   setEmojiPopup]   = useState(null);
  const emojiTimer = useRef(null);
  const emojiKey   = useRef(0);

  useEffect(() => { trackGameOpen('little-pie'); }, []);

  const handleComplete = (levelId) => {
    if (completedLevels.has(levelId)) return;
    setCompletedLevels(prev => new Set(prev).add(levelId));
    trackLevelComplete('little-pie', levelId);
    if (levelId === 6) {
      trackGameComplete('little-pie');
      setTimeout(() => setShowSuccess(true), 1500);
    } else {
      setActiveLevel(levelId + 1);
    }
  };

  const triggerMilestone = (originX, originY) => {
    setMilestone({ active: true, originX, originY });
    const msg = BALANCE_TOASTS[Math.floor(Math.random() * BALANCE_TOASTS.length)];
    setTimeout(() => showToast(msg, 1500, 22), 600);

    const levelId = activeLevel;
    clearTimeout(emojiTimer.current);
    emojiKey.current += 1;
    setEmojiPopup({ emoji: '🥧', key: emojiKey.current });
    emojiTimer.current = setTimeout(() => {
      setEmojiPopup(null);
      handleComplete(levelId);
    }, 2000);
  };

  return (
    <div style={theme}>
      <style>{`
        @keyframes emojiPopIn {
          0%   { transform: translate(-50%, -50%) scale(0.2); opacity: 0; }
          40%  { transform: translate(-50%, -50%) scale(1.25); opacity: 1; }
          60%  { transform: translate(-50%, -50%) scale(0.95); opacity: 1; }
          75%  { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
          85%  { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
      `}</style>

      <GameShell
        title="Little Analyst"
        hideTabs
        onBack={() => navigate('/hub')}
        topSlot={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, paddingBottom: 10 }}>
            {Array.from({ length: 6 }, (_, i) => {
              const id = i + 1;
              const active = id === activeLevel;
              const done   = completedLevels.has(id);
              return (
                <div key={id} style={{
                  width: active ? 22 : 10,
                  height: 10,
                  borderRadius: 999,
                  background: done || active ? 'var(--game-primary)' : 'rgba(0,0,0,0.12)',
                  opacity: done ? 0.45 : 1,
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                }} />
              );
            })}
          </div>
        }
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
          {!showSuccess && (
            <LittlePieGame
              key={activeLevel}
              levelDef={LEVEL_DEFS[activeLevel - 1]}
              onMilestone={(xPct, yPct) => triggerMilestone(xPct, yPct)}
            />
          )}
        </div>
      </GameShell>

      {emojiPopup && (
        <div
          key={emojiPopup.key}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            zIndex: 300,
            fontSize: '6rem',
            lineHeight: 1,
            pointerEvents: 'none',
            animation: 'emojiPopIn 2s ease-out forwards',
          }}
        >
          {emojiPopup.emoji}
        </div>
      )}

      <Toast
        message={toast.message}
        visible={toast.visible}
        topPercent={toast.topPercent}
        duration={toast.duration}
        color="var(--game-primary)"
      />

      <Confetti
        active={milestone.active}
        originX={milestone.originX}
        originY={milestone.originY}
        onComplete={() => setMilestone(m => ({ ...m, active: false }))}
      />

      <SuccessScreen
        visible={showSuccess}
        gameName="Little Analyst"
        learnedText="fractions and how things fit together 🥧"
        onPlayAgain={() => {
          setShowSuccess(false);
          setActiveLevel(1);
          setCompletedLevels(new Set());
        }}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        showShare
        gameId="little-pie"
        boughtItems={BOUGHT_ITEMS}
        boughtLabel="Pieces of the pie"
      />

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        gameName="Little Analyst"
      />
    </div>
  );
}
