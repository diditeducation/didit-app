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

const ALL_ITEMS = [
  { emoji: '🎹', name: 'Melody' },
  { emoji: '🥁', name: 'Kick' },
  { emoji: '🎩', name: 'Hi-Hat' },
  { emoji: '🪘', name: 'Snare' },
  { emoji: '🎸', name: 'Bass' },
];

export default function Game() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [milestone, setMilestone] = useState({ active: false, originX: 50, originY: 50 });
  const { toast, showToast } = useToast();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  const handleMilestone = (originX, originY) => {
    initAudio();
    sound.levelComplete();
    setMilestone({ active: true, originX, originY });
    setTimeout(() => showToast('Mix Master! 🎛️', 1500, 22), 600);
    setTimeout(() => setShowSuccess(true), 2000);
  };

  return (
    <div style={theme}>
      <GameShell
        title="Little Mixer"
        levels={[]}
        onBack={() => navigate('/hub')}
        topSlot={
          <div style={{ padding: '4px 24px 8px' }}>
            <Waveform height={48} />
          </div>
        }
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
          {!showSuccess && (
            <MixLevel
              key={gameKey}
              onMilestone={(x, y) => handleMilestone(x, y)}
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
        onComplete={() => setMilestone((m) => ({ ...m, active: false }))}
      />

      <SuccessScreen
        visible={showSuccess}
        gameName="Little Mixer"
        learnedText="Beat Making, Mixing, Rhythm"
        onPlayAgain={() => {
          setShowSuccess(false);
          setGameKey((k) => k + 1);
        }}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        boughtItems={ALL_ITEMS}
        boughtLabel="Instruments"
      />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} gameName="Little Mixer" />
    </div>
  );
}
