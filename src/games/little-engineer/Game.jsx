import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../design-system/layouts/GameShell';
import Confetti from '../../design-system/components/Confetti';
import Toast from '../../design-system/components/Toast';
import SuccessScreen from '../../design-system/components/SuccessScreen';
import { useToast } from '../../design-system/useToast';
import { fonts } from '../../design-system/tokens';
import theme from './theme';
import SwitchLevel from './levels/SwitchLevel';
import WireLevel from './levels/WireLevel';
import BatteryLevel from './levels/BatteryLevel';

const levels = [
  { id: 1, label: '⚡ Switch' },
  { id: 2, label: '🔌 Wire' },
  { id: 3, label: '🔋 Battery' },
];

export default function Game() {
  const navigate = useNavigate();
  const [activeLevel, setActiveLevel] = useState(1);
  const [showNext, setShowNext] = useState(false);
  const [completedLevel, setCompletedLevel] = useState(null);
  const [completedLevels, setCompletedLevels] = useState(new Set());
  const [unlockedUpTo, setUnlockedUpTo] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [milestone, setMilestone] = useState({
    active: false,
    originX: 50,
    originY: 50,
  });
  const [nextAction, setNextAction] = useState(null);
  const { toast, showToast } = useToast();

  const handleComplete = (levelId) => {
    if (completedLevels.has(levelId)) return;
    setCompletedLevels((prev) => new Set(prev).add(levelId));
    setCompletedLevel(levelId);
    setShowNext(false);
    setNextAction(null);
    if (levelId >= unlockedUpTo) setUnlockedUpTo(levelId + 1);
    if (levelId === 3) {
      setTimeout(() => setShowSuccess(true), 1500);
    } else {
      setActiveLevel(levelId + 1);
    }
  };

  const triggerMilestone = (originX, originY, nextFn, message, toastTop) => {
    console.log('triggerMilestone called', { originX, originY, message });
    setMilestone({ active: true, originX, originY });
    console.log('milestone state after set:', { active: true, originX, originY });
    setNextAction(() => nextFn);
    setShowNext(true);
    if (message) {
      setTimeout(() => showToast(message, 1500, toastTop), 600);
    }
  };

  const nextBtnStyle = {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 300,
    background: 'var(--game-primary)',
    color: '#FFFFFF',
    borderRadius: '9999px',
    padding: '16px 48px',
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: '1rem',
    border: 'none',
    cursor: 'pointer',
    boxShadow: 'none',
    whiteSpace: 'nowrap',
    bottom: '24px',
    animation: 'nextFloatUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  };

  return (
    <div style={theme}>
      <style>{`
        @keyframes nextFloatUp {
          from { bottom: -80px; }
          to { bottom: 32px; }
        }
      `}</style>

      <GameShell
        title="Little Engineer"
        levels={levels}
        activeLevel={activeLevel}
        onLevelChange={(id) => setActiveLevel(id)}
        onBack={() => navigate('/hub')}
        unlockedUpTo={unlockedUpTo}
      >
        {activeLevel === 1 && (
          <SwitchLevel
            onMilestone={(x, y) =>
              triggerMilestone(x, y, () => handleComplete(1), 'You did it!! 🎉', 32)
            }
          />
        )}
        {activeLevel === 2 && (
          <WireLevel
            onMilestone={(x, y) =>
              triggerMilestone(x, y, () => handleComplete(2), 'Fixed it! 🔌', 22)
            }
          />
        )}
        {activeLevel === 3 && (
          <BatteryLevel
            onMilestone={(x, y) => {
              triggerMilestone(x, y, () => handleComplete(3), 'Powered up! 🔋', 20);
              setTimeout(() => handleComplete(3), 1500);
            }}
          />
        )}
      </GameShell>

      <Toast
        message={toast.message}
        visible={toast.visible}
        topPercent={toast.topPercent}
        duration={toast.duration}
      />

      {console.log('rendering Confetti with:', milestone.active, milestone.originX, milestone.originY)}
      <Confetti
        active={milestone.active}
        originX={milestone.originX}
        originY={milestone.originY}
        onComplete={() => setMilestone((m) => ({ ...m, active: false }))}
      />

      {showNext && activeLevel < 3 && (
        <button
          style={nextBtnStyle}
          onClick={() => {
            setShowNext(false);
            setMilestone({ active: false, originX: 50, originY: 50 });
            if (nextAction) nextAction();
          }}
        >
          Next ▶
        </button>
      )}

      <SuccessScreen
        visible={showSuccess}
        gameName="Little Engineer"
        learnedText="how a circuit works"
        onPlayAgain={() => navigate('/games/little-engineer')}
        onBack={() => navigate('/hub')}
      />
    </div>
  );
}
