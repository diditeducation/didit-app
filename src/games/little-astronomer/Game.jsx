import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../design-system/layouts/GameShell';
import Confetti from '../../design-system/components/Confetti';
import SuccessScreen from '../../design-system/components/SuccessScreen';
import FeedbackModal from '../../components/FeedbackModal';
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

  const boughtItems = levels.map(l => ({
    emoji: l.animal,
    name: l.animalName,
    description: l.description,
  }));

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
          {/* Level pips — tap to jump to any constellation.
              Each pip is wrapped in a 44px-tall invisible hit zone so
              little fingers can land anywhere near the dot. */}
          <div style={{
            display: 'flex',
            gap: 0,
            alignItems: 'center',
            flexShrink: 0,
            padding: '0 4px',
            maxWidth: '100%',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}>
            {levels.map((lvl, i) => {
              const id     = i + 1;
              const active = id === activeLevel;
              const done   = completedLevels.has(id);
              return (
                <button
                  key={id}
                  type="button"
                  aria-label={`Play ${lvl.animalName}`}
                  onPointerDown={(e) => {
                    if (id === activeLevel) return;
                    e.preventDefault();
                    setActiveLevel(id);
                    setMilestone(m => ({ ...m, active: false }));
                    setEmojiPopup(null);
                    clearTimeout(emojiTimer.current);
                  }}
                  style={{
                    minWidth: active ? 44 : 28,
                    height: 44,
                    flexShrink: 0,
                    border: 'none',
                    padding: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    touchAction: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{
                    display: 'block',
                    width: active ? 28 : 12,
                    height: 12,
                    borderRadius: 999,
                    background: active || done ? 'var(--game-primary)' : 'rgba(0,0,0,0.18)',
                    opacity: done && !active ? 0.45 : 1,
                    transition: 'all 0.2s ease',
                  }} />
                </button>
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
                {currentLevel.description && (
                  <span style={{
                    fontFamily: fonts.display,
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    color: 'var(--game-text)',
                    opacity: 0.75,
                    letterSpacing: '0.02em',
                  }}>
                    {currentLevel.description}
                  </span>
                )}
                <span style={{
                  fontFamily: fonts.display,
                  fontWeight: 500,
                  fontSize: '0.72rem',
                  color: 'var(--game-text-muted)',
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

      <Confetti
        active={milestone.active}
        originX={milestone.originX}
        originY={milestone.originY}
        onComplete={() => setMilestone(m => ({ ...m, active: false }))}
      />

      <SuccessScreen
        visible={showSuccess}
        gameName="Little Astronomer"
        learnedText="5 amazing constellations"
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
