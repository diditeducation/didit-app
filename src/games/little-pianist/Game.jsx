import { useState, useRef, useEffect } from 'react';
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
import SolfegLevel from './levels/SolfegLevel';
import MelodyLevel from './levels/MelodyLevel';
import { SONG_CATALOG } from './songCatalog';
import { trackGameOpen, trackLevelComplete, trackGameComplete } from '../../analytics';

// Pick 3 random songs from the catalog (called once per module load so it
// stays stable across re-renders but changes on full page refresh)
function pickSongs() {
  const shuffled = [...SONG_CATALOG].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

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

  // Stable song selection for this play session
  const [selectedSongs] = useState(pickSongs);

  const levels = [
    { id: 1, label: '🎵 Do-Re-Mi' },
    { id: 2, label: `${selectedSongs[0].emoji} ${selectedSongs[0].short}` },
    { id: 3, label: `${selectedSongs[1].emoji} ${selectedSongs[1].short}` },
    { id: 4, label: `${selectedSongs[2].emoji} ${selectedSongs[2].short}` },
  ];

  useEffect(() => { trackGameOpen('little-pianist'); }, []);

  const handleComplete = (levelId) => {
    if (completedLevels.has(levelId)) return;
    setCompletedLevels((prev) => new Set(prev).add(levelId));
    trackLevelComplete('little-pianist', levelId);
    if (levelId === levels.length) {
      trackGameComplete('little-pianist');
      setTimeout(() => setShowSuccess(true), 1500);
    } else {
      setActiveLevel(levelId + 1);
    }
  };

  const triggerMilestone = (originX, originY, message, toastTop, toastDuration = 1500) => {
    // Play level-complete chime
    initAudio();
    sound.levelComplete();

    setMilestone({ active: true, originX, originY });
    if (message) {
      setTimeout(() => showToast(message, toastDuration, toastTop), 600);
    }
    // Emoji pop then auto-advance
    const song = activeLevel === 1 ? { emoji: '🎹' } : selectedSongs[activeLevel - 2];
    const levelId = activeLevel;
    clearTimeout(emojiTimer.current);
    emojiKey.current += 1;
    setEmojiPopup({ emoji: song.emoji, key: emojiKey.current });
    emojiTimer.current = setTimeout(() => {
      setEmojiPopup(null);
      handleComplete(levelId);
    }, 2000);
  };

  // Success screen: list all 5 levels
  const allSongs = [
    { emoji: '🎹', name: 'Do-Re-Mi' },
    ...selectedSongs.map((s) => ({ emoji: s.emoji, name: s.title })),
  ];
  const learnedText = ['Do-Re-Mi', ...selectedSongs.map((s) => s.title)].join(', ');

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
        title="Little Pianist"
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
          {!showSuccess && activeLevel === 1 && (
            <SolfegLevel
              onMilestone={(x, y) => triggerMilestone(x, y, 'Do Re Mi! 🎵', 22)}
            />
          )}
          {!showSuccess && activeLevel === 2 && (
            <MelodyLevel
              key={selectedSongs[0].id}
              song={selectedSongs[0]}
              onMilestone={(x, y) => triggerMilestone(x, y, selectedSongs[0].toast, 22)}
            />
          )}
          {!showSuccess && activeLevel === 3 && (
            <MelodyLevel
              key={selectedSongs[1].id}
              song={selectedSongs[1]}
              onMilestone={(x, y) => triggerMilestone(x, y, selectedSongs[1].toast, 22)}
            />
          )}
          {!showSuccess && activeLevel === 4 && (
            <MelodyLevel
              key={selectedSongs[2].id}
              song={selectedSongs[2]}
              onMilestone={(x, y) => triggerMilestone(x, y, selectedSongs[2].toast, 22)}
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
        gameName="Little Pianist"
        learnedText={learnedText}
        onPlayAgain={() => {
          setShowSuccess(false);
          setActiveLevel(1);
          setCompletedLevels(new Set());
        }}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        showShare
        gameId="little-pianist"
        boughtItems={allSongs}
        boughtLabel="Songs & skills"
      />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} gameName="Little Pianist" />
    </div>
  );
}
