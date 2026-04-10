import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../design-system/layouts/GameShell';
import Confetti from '../../design-system/components/Confetti';
import Toast from '../../design-system/components/Toast';
import SuccessScreen from '../../design-system/components/SuccessScreen';
import FeedbackModal from '../../components/FeedbackModal';
import { useToast } from '../../design-system/useToast';
import theme from './theme';
import LittlePourGame, { LEVELS } from './LittlePourGame';
import { trackGameOpen, trackLevelComplete, trackGameComplete } from '../../analytics';

const LEVEL_DEFS = [
  { id: 1, label: '🫙 4s' },
  { id: 2, label: '🫙 5s' },
  { id: 3, label: '🫙 6s' },
  { id: 4, label: '🫙 10s' },
];

const LEVEL_TOASTS = [
  '4 makes 4! 🎯',
  'Same total! 🤯',
  'Number bonds! 🔢',
  'Always 10! 🏆',
];

const BOUGHT_ITEMS = [
  { emoji: '🫙', name: 'Bonds of 4' },
  { emoji: '🫙', name: 'Bonds of 5' },
  { emoji: '🫙', name: 'Bonds of 6' },
  { emoji: '🫙', name: 'Bonds of 10' },
];

export default function Game() {
  const navigate = useNavigate();
  const [activeLevel, setActiveLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [milestone, setMilestone] = useState({ active: false, originX: 50, originY: 50 });
  const { toast, showToast } = useToast();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  useEffect(() => { trackGameOpen('little-pour'); }, []);

  const handleLevelComplete = () => {
    const levelId = activeLevel;
    if (completedLevels.has(levelId)) return;

    const newCompleted = new Set(completedLevels).add(levelId);
    setCompletedLevels(newCompleted);
    trackLevelComplete('little-pour', levelId);

    if (levelId === LEVEL_DEFS.length) {
      trackGameComplete('little-pour');
      setTimeout(() => setShowSuccess(true), 1500);
    } else {
      showToast(LEVEL_TOASTS[levelId - 1], 1500, 22);
      setTimeout(() => {
        setActiveLevel(levelId + 1);
        setGameKey(k => k + 1);
      }, 800);
    }
  };

  const handleMilestone = (originX, originY) => {
    setMilestone({ active: true, originX, originY });
  };

  const handleLevelChange = (id) => {
    if (id > activeLevel && !completedLevels.has(id - 1)) return;
    setActiveLevel(id);
    setGameKey(k => k + 1);
  };

  return (
    <div style={theme}>
      <GameShell
        title="Little Mathematician"
        levels={LEVEL_DEFS}
        activeLevel={activeLevel}
        onLevelChange={handleLevelChange}
        onBack={() => navigate('/hub')}
        unlockedUpTo={activeLevel}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
          {!showSuccess && (
            <LittlePourGame
              key={`level-${activeLevel}-${gameKey}`}
              levelDef={LEVELS[activeLevel - 1]}
              onLevelComplete={handleLevelComplete}
              onMilestone={handleMilestone}
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
        gameName="Little Mathematician"
        learnedText="number bonds — how numbers add up to the same total 🔢"
        onPlayAgain={() => {
          setShowSuccess(false);
          setActiveLevel(1);
          setCompletedLevels(new Set());
          setGameKey(k => k + 1);
        }}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        showShare
        gameId="little-pour"
        boughtItems={BOUGHT_ITEMS}
        boughtLabel="Number bonds you discovered"
      />

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        gameName="Little Mathematician"
      />
    </div>
  );
}
