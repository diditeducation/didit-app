import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../design-system/layouts/GameShell';
import Confetti from '../../design-system/components/Confetti';
import Toast from '../../design-system/components/Toast';
import SuccessScreen from '../../design-system/components/SuccessScreen';
import FeedbackModal from '../../components/FeedbackModal';
import { useToast } from '../../design-system/useToast';
import { fonts } from '../../design-system/tokens';
import theme from './theme';
import BeatLevel from './levels/BeatLevel';
import TempoLevel from './levels/TempoLevel';
import PitchLevel from './levels/PitchLevel';
import MixLevel from './levels/MixLevel';
import Waveform from './Waveform';

const levels = [
  { id: 1, label: '💓 Beat' },
  { id: 2, label: '🏃 Tempo' },
  { id: 3, label: '🎵 Pitch' },
  { id: 4, label: '🎚️ Mix' },
];

export default function Game() {
  const navigate = useNavigate();
  const [activeLevel, setActiveLevel] = useState(1);
  const [showNext, setShowNext] = useState(false);
  const [completedLevels, setCompletedLevels] = useState(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [milestone, setMilestone] = useState({
    active: false,
    originX: 50,
    originY: 50,
  });
  const [nextAction, setNextAction] = useState(null);
  const { toast, showToast } = useToast();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const handleComplete = (levelId) => {
    if (completedLevels.has(levelId)) return;
    setCompletedLevels((prev) => new Set(prev).add(levelId));
    setShowNext(false);
    setNextAction(null);
    if (levelId === 4) {
      setTimeout(() => setShowSuccess(true), 1500);
    } else {
      setActiveLevel(levelId + 1);
    }
  };

  const triggerMilestone = (originX, originY, nextFn, message, toastTop, toastDuration = 1500) => {
    setMilestone({ active: true, originX, originY });
    setNextAction(() => nextFn);
    setShowNext(true);
    if (message) {
      setTimeout(() => showToast(message, toastDuration, toastTop), 600);
    }
  };

  const nextBtnStyle = {
    display: 'block',
    margin: '12px auto 0',
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
        title="Little DJ"
        levels={levels}
        activeLevel={activeLevel}
        onLevelChange={(id) => setActiveLevel(id)}
        onBack={() => navigate('/hub')}
        unlockedUpTo={4}
        topSlot={
          <div style={{ padding: '4px 24px 8px' }}>
            <Waveform height={48} />
          </div>
        }
        bottomSlot={
          showNext ? (
            <div style={{ padding: '0 24px 16px' }}>
              <button
                style={nextBtnStyle}
                onClick={() => {
                  setShowNext(false);
                  setMilestone({ active: false, originX: 50, originY: 50 });
                  if (nextAction) nextAction();
                }}
              >
                {activeLevel === 4 ? 'Finished! 🎧' : 'Next ▶'}
              </button>
            </div>
          ) : null
        }
      >
        {/* Level content — unmounted when success screen shows, stopping all audio */}
        {!showSuccess && activeLevel === 1 && (
          <BeatLevel
            onMilestone={(x, y) =>
              triggerMilestone(x, y, () => handleComplete(1), "You've got the beat! 💓", 40, 3000)
            }
          />
        )}
        {!showSuccess && activeLevel === 2 && (
          <TempoLevel
            onMilestone={(x, y) =>
              triggerMilestone(x, y, () => handleComplete(2), 'Speed master! 🏃', 22)
            }
          />
        )}
        {!showSuccess && activeLevel === 3 && (
          <PitchLevel
            onMilestone={(x, y) =>
              triggerMilestone(x, y, () => handleComplete(3), 'Perfect pitch! 🎵', 20)
            }
          />
        )}
        {!showSuccess && activeLevel === 4 && (
          <MixLevel
            onMilestone={(x, y) =>
              triggerMilestone(x, y, () => handleComplete(4), 'DJ master! 🎧', 20)
            }
          />
        )}
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
        onComplete={() => setMilestone((m) => ({ ...m, active: false }))}
      />

      <SuccessScreen
        visible={showSuccess}
        gameName="Little DJ"
        learnedText="beat, tempo, pitch and mixing"
        onPlayAgain={() => navigate('/games/little-dj')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
      />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} gameName="Little DJ" />
    </div>
  );
}
