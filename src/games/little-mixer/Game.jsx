import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../design-system/layouts/GameShell';
import Confetti from '../../design-system/components/Confetti';
import Toast from '../../design-system/components/Toast';
import SuccessScreen from '../../design-system/components/SuccessScreen';
import FeedbackModal from '../../components/FeedbackModal';
import { useToast } from '../../design-system/useToast';
import { initAudio, sound } from './audio';
import theme from './theme';
import Waveform from './Waveform';
import MixLevel from './levels/MixLevel';

const levels = [
  { id: 1, label: '🥁 Duo' },
  { id: 2, label: '🎸 Trio' },
  { id: 3, label: '🔔 Quartet' },
  { id: 4, label: '🎛️ Full Mix' },
];

const LEVEL_TOASTS = {
  1: 'Piano & Drum! 🥁',
  2: 'Trio groove! 🎸',
  3: 'Quartet beat! 🔔',
  4: 'Full Mix! 🎛️',
};
const LEVEL_EMOJIS = { 1: '🥁', 2: '🎸', 3: '🔔', 4: '🎛️' };

const ALL_ITEMS = [
  { emoji: '🎹', name: 'Piano' },
  { emoji: '🔔', name: 'Chime' },
  { emoji: '🥁', name: 'Drum' },
  { emoji: '🫧', name: 'Bubbles' },
  { emoji: '🪘', name: 'Snare' },
  { emoji: '🎈', name: 'Boing' },
];

export default function Game() {
  const navigate = useNavigate();
  const [activeLevel, setActiveLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [milestone, setMilestone] = useState({ active: false, originX: 50, originY: 50 });
  const { toast, showToast } = useToast();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [emojiPopup, setEmojiPopup] = useState(null);
  const emojiTimer = useRef(null);
  const emojiKey = useRef(0);

  const handleComplete = (levelId) => {
    if (completedLevels.has(levelId)) return;
    setCompletedLevels((prev) => new Set(prev).add(levelId));
    if (levelId === levels.length) {
      setShowSuccess(true);
    } else {
      setActiveLevel(levelId + 1);
    }
  };

  const triggerMilestone = (originX, originY) => {
    initAudio();
    sound.levelComplete();
    setMilestone({ active: true, originX, originY });
    setTimeout(() => showToast(LEVEL_TOASTS[activeLevel], 1500, 22), 600);

    const levelId = activeLevel;
    clearTimeout(emojiTimer.current);
    emojiKey.current += 1;
    setEmojiPopup({ emoji: LEVEL_EMOJIS[levelId], key: emojiKey.current });
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
        title="Little DJ"
        levels={levels}
        activeLevel={activeLevel}
        onLevelChange={(id) => setActiveLevel(id)}
        onBack={() => navigate('/hub')}
        unlockedUpTo={levels.length}
        topSlot={
          <div style={{ padding: '4px 24px 8px' }}>
            <Waveform height={48} />
          </div>
        }
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
          {!showSuccess && (
            <MixLevel
              key={activeLevel}
              level={activeLevel}
              isLast={activeLevel === levels.length}
              onMilestone={(x, y) => triggerMilestone(x, y)}
            />
          )}
        </div>
      </GameShell>

      {emojiPopup && (
        <div
          key={emojiPopup.key}
          style={{
            position: 'fixed', top: '50%', left: '50%',
            zIndex: 300, fontSize: '6rem', lineHeight: 1,
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
        onComplete={() => setMilestone((m) => ({ ...m, active: false }))}
      />

      <SuccessScreen
        visible={showSuccess}
        gameName="Little DJ"
        learnedText="6 different sounds — piano, drum, boing, chime, snare & bubbles"
        onPlayAgain={() => {
          setShowSuccess(false);
          setActiveLevel(1);
          setCompletedLevels(new Set());
        }}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        boughtItems={ALL_ITEMS}
        boughtLabel="Instruments"
      />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} gameName="Little DJ" />
    </div>
  );
}
