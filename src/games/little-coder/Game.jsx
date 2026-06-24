import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../design-system/layouts/GameShell';
import Confetti from '../../design-system/components/Confetti';
import Toast from '../../design-system/components/Toast';
import SuccessScreen from '../../design-system/components/SuccessScreen';
import FeedbackModal from '../../components/FeedbackModal';
import { useToast } from '../../design-system/useToast';
import { colors, fonts, easing } from '../../design-system/tokens';
import theme from './theme';
import GridLevel from './GridLevel';
import { trackGameOpen, trackLevelComplete, trackGameComplete } from '../../analytics';

const LEVELS = [
  { id: 1, minMoves: 1 },
  { id: 2, minMoves: 2 },
  { id: 3, minMoves: 2 },
  { id: 4, minMoves: 3 },
  { id: 5, minMoves: 3 },
  { id: 6, minMoves: 4 },
];

const WIN_TOASTS = [
  '🧀 Found it!',
  'Great move! 🐭',
  'Nailed it! ✨',
  'Amazing! 🌟',
  'So close! 🔥',
  'You did it! 🏆',
];

/* ── Level pip indicator ── */
function LevelPips({ current, total }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      padding: '4px 0 14px',
    }}>
      {Array.from({ length: total }, (_, i) => {
        const isActive = i + 1 === current;
        const isDone   = i + 1 < current;
        return (
          <div key={i} style={{
            height: 8,
            width: isActive ? 28 : 8,
            borderRadius: 4,
            background: isActive
              ? colors.sunDark
              : isDone
                ? colors.sunMid
                : 'rgba(0,0,0,0.13)',
            transition: `all 0.35s ${easing.bounce}`,
          }} />
        );
      })}
    </div>
  );
}

export default function Game() {
  const navigate = useNavigate();
  const [activeLevel,     setActiveLevel]     = useState(1);
  const [showSuccess,     setShowSuccess]     = useState(false);
  const [milestone,       setMilestone]       = useState({ active: false, originX: 50, originY: 45 });
  const [feedbackOpen,    setFeedbackOpen]    = useState(false);
  const { toast, showToast } = useToast();
  const levelTimer = useRef(null);

  useEffect(() => { trackGameOpen('little-coder'); }, []);

  const handleWin = useCallback((originX = 50, originY = 45) => {
    const levelId = activeLevel;

    // Confetti burst from the rat's actual screen position
    setMilestone({ active: true, originX, originY });

    // Toast near the cheese cell
    const msg = WIN_TOASTS[levelId - 1] || '🎉 Yes!';
    const toastY = Math.round(originY) - 12; // just above the winning cell
    setTimeout(() => showToast(msg, 1500, toastY), 300);

    clearTimeout(levelTimer.current);
    levelTimer.current = setTimeout(() => {
      if (levelId >= LEVELS.length) {
        trackGameComplete('little-coder');
        setShowSuccess(true);
      } else {
        trackLevelComplete('little-coder', levelId);
        setActiveLevel(levelId + 1);
      }
    }, 1600);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLevel]);

  // Large rat on the left, 2×3 grid of small cheeses on the right — spans both columns via two items
  const ratNode = (
    <span style={{ fontSize: '3.4rem', lineHeight: 1 }}>🐭</span>
  );
  const cheeseGridNode = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} style={{ fontSize: '1.35rem', lineHeight: 1, textAlign: 'center' }}>🧀</span>
      ))}
    </div>
  );
  const boughtItems = [
    { node: ratNode,       name: '' },
    { node: cheeseGridNode, name: '' },
  ];

  return (
    <div style={theme}>
      <GameShell
        title="Little Coder"
        hideTabs
        onBack={() => navigate('/hub')}
        instructions="Let your little one tap the arrows to steer the rat all the way to the cheese."
        topSlot={
          <LevelPips current={activeLevel} total={LEVELS.length} />
        }
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          {!showSuccess && (
            <GridLevel
              key={activeLevel}
              minMoves={LEVELS[activeLevel - 1].minMoves}
              onWin={(x, y) => handleWin(x, y)}
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
        gameName="Little Coder"
        learnedText="giving commands — a building block to coding!"
        boughtItems={boughtItems}
        boughtLabel="You got 6 cheese — the rat is full!"
        onPlayAgain={() => {
          setShowSuccess(false);
          setActiveLevel(1);
          setMilestone({ active: false, originX: 50, originY: 45 });
        }}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        showShare
        gameId="little-coder"
      />

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        gameName="Little Coder"
      />
    </div>
  );
}
