import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../design-system/layouts/GameShell';
import Confetti from '../../design-system/components/Confetti';
import Toast from '../../design-system/components/Toast';
import SuccessScreen from '../../design-system/components/SuccessScreen';
import FeedbackModal from '../../components/FeedbackModal';
import { useToast } from '../../design-system/useToast';
import theme from './theme';
import PieBoard, { LEVEL_DEFS } from './Board';
import { trackGameOpen, trackLevelComplete, trackGameComplete } from '../../analytics';

const COMPLETE_TOASTS = [
  '100%! 🎉',
  'Whole again!',
  'Full circle! ⭐',
  'Perfect fit!',
  'Complete! ✨',
  'All in! 💯',
];

// Colors match PieBoard

function ptOnCircle(cx, cy, r, deg) {
  const rad = (deg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}
function makePiePath(cx, cy, r, a1, a2) {
  const [x1, y1] = ptOnCircle(cx, cy, r, a1);
  const [x2, y2] = ptOnCircle(cx, cy, r, a2);
  const large = (a2 - a1) > 180 ? 1 : 0;
  return `M ${cx.toFixed(1)} ${cy.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
}

function PieIcon({ levelDef, size = 48 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.44;
  const allSlices = [
    ...levelDef.filled.map(f => ({ ...f })),
    ...levelDef.gaps.map(g => ({ ...g })),
  ].sort((a, b) => a.start - b.start);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r + 2} fill="rgba(0,0,0,0.05)" />
      {allSlices.map((s, i) => (
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

const BOUGHT_ITEMS = LEVEL_DEFS.map((def) => ({
  node: <PieIcon levelDef={def} size={48} />,
  name: '',
}));

export default function Game() {
  const navigate = useNavigate();

  const [activeLevel,     setActiveLevel]     = useState(1);
  const [completedLevels, setCompletedLevels] = useState(new Set());
  const [showSuccess,     setShowSuccess]     = useState(false);
  const [milestone,       setMilestone]       = useState({ active: false, originX: 50, originY: 50 });
  const { toast, showToast } = useToast();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => { trackGameOpen('little-analyst'); }, []);

  const handleComplete = (levelId) => {
    if (completedLevels.has(levelId)) return;
    setCompletedLevels(prev => new Set(prev).add(levelId));
    trackLevelComplete('little-analyst', levelId);
    if (levelId === 6) {
      trackGameComplete('little-analyst');
      setTimeout(() => setShowSuccess(true), 1500);
    } else {
      setActiveLevel(levelId + 1);
    }
  };

  const triggerMilestone = (originX, originY) => {
    setMilestone({ active: true, originX, originY });
    const msg = COMPLETE_TOASTS[Math.floor(Math.random() * COMPLETE_TOASTS.length)];
    setTimeout(() => showToast(msg, 1800, 22), 400);
    const levelId = activeLevel;
    setTimeout(() => handleComplete(levelId), 2200);
  };

  return (
    <div style={theme}>
      <GameShell
        title="Little Analyst"
        hideTabs
        onBack={() => navigate('/hub')}
        topSlot={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, paddingBottom: 10 }}>
            {Array.from({ length: 6 }, (_, i) => {
              const id     = i + 1;
              const active = id === activeLevel;
              const done   = completedLevels.has(id);
              return (
                <div key={id} style={{
                  width:      active ? 22 : 10,
                  height:     10,
                  borderRadius: 999,
                  background: done || active ? 'var(--game-primary)' : 'rgba(0,0,0,0.12)',
                  opacity:    done ? 0.45 : 1,
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
            <PieBoard
              key={activeLevel}
              levelDef={LEVEL_DEFS[activeLevel - 1]}
              onMilestone={(x, y) => triggerMilestone(x, y)}
            />
          )}
        </div>
      </GameShell>

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
        learnedText="percentages, pie charts, how pieces make a whole"
        onPlayAgain={() => {
          setShowSuccess(false);
          setActiveLevel(1);
          setCompletedLevels(new Set());
        }}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        showShare
        gameId="little-analyst"
        boughtItems={BOUGHT_ITEMS}
        boughtLabel="You completed 6 pies!"
      />

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        gameName="Little Analyst"
      />
    </div>
  );
}
