import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../design-system/layouts/GameShell';
import Confetti from '../../design-system/components/Confetti';
import Toast from '../../design-system/components/Toast';
import SuccessScreen from '../../design-system/components/SuccessScreen';
import FeedbackModal from '../../components/FeedbackModal';
import { useToast } from '../../design-system/useToast';
import { fonts } from '../../design-system/tokens';
import { initAudio, sound } from './audio';
import theme from './theme';
import ConstellationCanvas from './ConstellationCanvas';
import { pickLevels, LEVEL_COUNT } from './levelsData';
import { trackGameOpen, trackLevelComplete, trackGameComplete } from '../../analytics';

export default function Game() {
  const navigate = useNavigate();

  // Pick a fresh random set of 6 constellations; re-randomised on Play Again
  const [levels, setLevels] = useState(() => pickLevels());

  const [activeLevel,     setActiveLevel]     = useState(1);
  const [completedLevels, setCompletedLevels] = useState(new Set());
  const [showSuccess,     setShowSuccess]     = useState(false);
  const [milestone,       setMilestone]       = useState({ active: false, originX: 50, originY: 50 });
  const { toast, showToast } = useToast();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [emojiPopup,   setEmojiPopup]   = useState(null);

  const emojiTimer = useRef(null);
  const emojiKey   = useRef(0);

  useEffect(() => { trackGameOpen('little-astronomer'); }, []);

  const handleComplete = (levelId) => {
    if (completedLevels.has(levelId)) return;
    setCompletedLevels(prev => new Set(prev).add(levelId));
    trackLevelComplete('little-astronomer', levelId);
    if (levelId === LEVEL_COUNT) {
      trackGameComplete('little-astronomer');
      setShowSuccess(true);
    } else {
      setActiveLevel(levelId + 1);
    }
  };

  const triggerMilestone = (originX, originY, levelData) => {
    initAudio();
    sound.chime();
    setMilestone({ active: true, originX, originY });

    setTimeout(() => showToast(levelData.toast, 1500, 22), 500);

    const levelId = activeLevel;
    clearTimeout(emojiTimer.current);
    emojiKey.current += 1;
    setEmojiPopup({ emoji: levelData.animal, key: emojiKey.current });
    emojiTimer.current = setTimeout(() => {
      setEmojiPopup(null);
      handleComplete(levelId);
    }, 2200);
  };

  const currentLevel = levels[activeLevel - 1];

  const boughtItems = levels.map(l => ({ emoji: l.animal, name: l.animalName }));

  return (
    <div style={{ ...theme, minHeight: '100dvh', background: theme['--game-bg'] }}>
      <style>{`
        @keyframes emojiPopIn {
          0%   { transform: translate(-50%, -50%) scale(0.2); opacity: 0; }
          40%  { transform: translate(-50%, -50%) scale(1.25); opacity: 1; }
          60%  { transform: translate(-50%, -50%) scale(0.95); opacity: 1; }
          75%  { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
          85%  { transform: translate(-50%, -50%) scale(1);    opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1);    opacity: 0; }
        }
      `}</style>

      <GameShell
        title="Little Astronomer"
        hideTabs
        onBack={() => navigate('/hub')}
      >
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          overflow: 'hidden',
        }}>
          {/* Level pips — horizontal row above canvas */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            {levels.map((_, i) => {
              const id     = i + 1;
              const active = id === activeLevel;
              const done   = completedLevels.has(id);
              return (
                <div key={id} style={{
                  width: active ? 22 : 10, height: 10, borderRadius: 999,
                  background: done || active ? 'var(--game-primary)' : 'rgba(0,0,0,0.12)',
                  opacity: done ? 0.45 : 1, transition: 'all 0.3s ease', flexShrink: 0,
                }} />
              );
            })}
          </div>

          {!showSuccess && (
            <>
              <ConstellationCanvas
                key={activeLevel}
                levelId={activeLevel}
                stars={currentLevel.stars}
                sequence={currentLevel.sequence}
                animal={currentLevel.animal}
                onMilestone={(x, y) => triggerMilestone(x, y, currentLevel)}
              />

              {/* Name + fun fact — plain text below the canvas, no background */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                paddingHorizontal: 20,
                flexShrink: 0,
                maxWidth: 320,
                textAlign: 'center',
              }}>
                <span style={{
                  fontFamily: fonts.display,
                  fontWeight: 800,
                  fontSize: '1rem',
                  color: 'var(--game-primary)',
                  letterSpacing: '0.04em',
                }}>
                  {currentLevel.animalName}
                </span>
                <span style={{
                  fontFamily: fonts.display,
                  fontWeight: 500,
                  fontSize: '0.78rem',
                  color: 'rgba(255,255,255,0.55)',
                  lineHeight: 1.45,
                }}>
                  {currentLevel.toast}
                </span>
              </div>
            </>
          )}
        </div>
      </GameShell>

      {/* Full-screen animal emoji popup after each level */}
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
            animation: 'emojiPopIn 2.2s ease-out forwards',
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
        gameName="Little Astronomer"
        learnedText="6 amazing constellations"
        onPlayAgain={() => {
          setLevels(pickLevels());
          setShowSuccess(false);
          setActiveLevel(1);
          setCompletedLevels(new Set());
        }}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        showShare
        gameId="little-astronomer"
        boughtItems={boughtItems}
        boughtLabel="Constellations discovered"
      />

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        gameName="Little Astronomer"
      />
    </div>
  );
}
