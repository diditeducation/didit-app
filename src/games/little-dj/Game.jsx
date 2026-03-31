import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../design-system/layouts/GameShell';
import Confetti from '../../design-system/components/Confetti';
import Toast from '../../design-system/components/Toast';
import SuccessScreen from '../../design-system/components/SuccessScreen';
import FeedbackModal from '../../components/FeedbackModal';
import { useToast } from '../../design-system/useToast';
import theme from './theme';
import Waveform from './Waveform';
import SolfegLevel from './levels/SolfegLevel';
import TwinkleLevel from './levels/TwinkleLevel';
import BirthdayLevel from './levels/BirthdayLevel';
import JingleLevel from './levels/JingleLevel';

const levels = [
  { id: 1, label: '🎵 Do-Re-Mi' },
  { id: 2, label: '🎂 Birthday' },
  { id: 3, label: '⭐ Twinkle' },
  { id: 4, label: '🔔 Jingle' },
];

const LEVEL_EMOJIS = { 1: '🎹', 2: '🎂', 3: '⭐', 4: '🎅' };
const LEVEL_NAMES  = { 1: 'Do-Re-Mi', 2: 'Birthday', 3: 'Twinkle', 4: 'Jingle' };

export default function Game() {
  const navigate = useNavigate();
  const [activeLevel, setActiveLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState(new Set());
  const [showSuccess, setShowSuccess] = useState(false);
  const [milestone, setMilestone] = useState({
    active: false,
    originX: 50,
    originY: 50,
  });
  const { toast, showToast } = useToast();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [emojiPopup, setEmojiPopup] = useState(null); // { emoji, key }
  const emojiTimer = useRef(null);
  const emojiKey = useRef(0);

  const handleComplete = (levelId) => {
    if (completedLevels.has(levelId)) return;
    setCompletedLevels((prev) => new Set(prev).add(levelId));
    if (levelId === levels.length) {
      setTimeout(() => setShowSuccess(true), 1500);
    } else {
      setActiveLevel(levelId + 1);
    }
  };

  const triggerMilestone = (originX, originY, message, toastTop, toastDuration = 1500) => {
    setMilestone({ active: true, originX, originY });
    if (message) {
      setTimeout(() => showToast(message, toastDuration, toastTop), 600);
    }
    // Show level emoji popup then auto-advance
    const emoji = LEVEL_EMOJIS[activeLevel];
    const levelId = activeLevel;
    clearTimeout(emojiTimer.current);
    emojiKey.current += 1;
    setEmojiPopup({ emoji, key: emojiKey.current });
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
        unlockedUpTo={levels.length || 1}
        topSlot={
          <div style={{ padding: '4px 24px 8px' }}>
            <Waveform height={48} />
          </div>
        }
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', pointerEvents: 'auto' }}>
          {!showSuccess && activeLevel === 1 && (
            <SolfegLevel
              onMilestone={(x, y) =>
                triggerMilestone(x, y, 'Do Re Mi! 🎵', 22)
              }
            />
          )}
          {!showSuccess && activeLevel === 2 && (
            <BirthdayLevel
              onMilestone={(x, y) =>
                triggerMilestone(x, y, 'Happy Birthday! 🎂', 22)
              }
            />
          )}
          {!showSuccess && activeLevel === 3 && (
            <TwinkleLevel
              onMilestone={(x, y) =>
                triggerMilestone(x, y, 'Twinkle Twinkle! ⭐', 22)
              }
            />
          )}
          {!showSuccess && activeLevel === 4 && (
            <JingleLevel
              onMilestone={(x, y) =>
                triggerMilestone(x, y, 'Jingle Bells! 🔔', 22)
              }
            />
          )}
        </div>
      </GameShell>

      {/* Level completion emoji popup */}
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
        onComplete={() => setMilestone((m) => ({ ...m, active: false }))}
      />

      <SuccessScreen
        visible={showSuccess}
        gameName="Little DJ"
        learnedText="musical notes and melodies"
        onPlayAgain={() => navigate('/games/little-dj')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        boughtItems={[1, 2, 3, 4].map((id) => ({ emoji: LEVEL_EMOJIS[id], name: LEVEL_NAMES[id] }))}
        boughtLabel="You played"
      />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} gameName="Little DJ" />
    </div>
  );
}
