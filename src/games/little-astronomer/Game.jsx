import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../design-system/layouts/GameShell';
import Confetti from '../../design-system/components/Confetti';
import Toast from '../../design-system/components/Toast';
import SuccessScreen from '../../design-system/components/SuccessScreen';
import FeedbackModal from '../../components/FeedbackModal';
import { useToast } from '../../design-system/useToast';
import { initAudio } from './audio';
import theme from './theme';
import LittleAstronomerGame, { PLANETS, PlanetSVG } from './LittleAstronomerGame';
import { trackGameOpen, trackLevelComplete, trackGameComplete } from '../../analytics';

const LEVEL_COUNT = 6;

const SPACE_TOASTS = [
  'To infinity! 🚀',
  'Stellar! ⭐',
  'Cosmic! 🌌',
  'Brilliant! 💫',
  'Out of this world! 🚀',
  'Perfect match! ✨',
  'Astronomical! 🔭',
  'Superstar! 🌟',
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick 2 random distractors from all other planets
function pickOptions(targetIdx) {
  const target = PLANETS[targetIdx];
  const others = PLANETS.filter((_, i) => i !== targetIdx);
  const distractors = shuffleArray(others).slice(0, 2);
  return shuffleArray([target, ...distractors]);
}

// Tiny planet node for success screen
function PlanetNode({ planet }) {
  const r = { tiny: 22, small: 28, medium: 36, large: 44 }[planet.size] || 36;
  const svgSize = r * 2 + 24;
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
    }}>
      <PlanetSVG planet={planet} size={svgSize} />
      <span style={{
        fontSize: '0.65rem',
        fontWeight: 700,
        fontFamily: "'Nunito', sans-serif",
        color: '#555',
      }}>
        {planet.name}
      </span>
    </div>
  );
}

export default function Game() {
  const navigate = useNavigate();

  // Generate shuffled options for each level once on mount
  const levelOptions = useMemo(
    () => PLANETS.map((_, idx) => pickOptions(idx)),
    []
  );

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
      setTimeout(() => setShowSuccess(true), 1500);
    } else {
      setActiveLevel(levelId + 1);
    }
  };

  const triggerMilestone = (originX, originY) => {
    initAudio();
    setMilestone({ active: true, originX, originY });

    const msg = SPACE_TOASTS[Math.floor(Math.random() * SPACE_TOASTS.length)];
    setTimeout(() => showToast(msg, 1500, 22), 600);

    const levelId = activeLevel;
    clearTimeout(emojiTimer.current);
    emojiKey.current += 1;
    setEmojiPopup({ emoji: '🪐', key: emojiKey.current });
    emojiTimer.current = setTimeout(() => {
      setEmojiPopup(null);
      handleComplete(levelId);
    }, 2000);
  };

  const planetIdx = activeLevel - 1;
  const planet    = PLANETS[planetIdx];
  const options   = levelOptions[planetIdx];

  const boughtItems = PLANETS.map(p => ({
    node: <PlanetNode planet={p} />,
    name: p.name,
  }));

  return (
    <div style={{ ...theme, minHeight: '100dvh', background: theme['--game-bg'] }}>
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
        title="Little Astronomer"
        hideTabs
        onBack={() => navigate('/hub')}
        topSlot={
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            paddingBottom: 10,
          }}>
            {Array.from({ length: LEVEL_COUNT }, (_, i) => {
              const id     = i + 1;
              const active = id === activeLevel;
              const done   = completedLevels.has(id);
              return (
                <div
                  key={id}
                  style={{
                    width:      active ? 22 : 10,
                    height:     10,
                    borderRadius: 999,
                    background: done || active ? 'var(--game-primary)' : 'rgba(255,255,255,0.18)',
                    opacity:    done ? 0.45 : 1,
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                  }}
                />
              );
            })}
          </div>
        }
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
          {!showSuccess && (
            <LittleAstronomerGame
              key={activeLevel}
              planet={planet}
              options={options}
              onMilestone={(x, y) => triggerMilestone(x, y)}
            />
          )}
        </div>
      </GameShell>

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
        onComplete={() => setMilestone(m => ({ ...m, active: false }))}
      />

      <SuccessScreen
        visible={showSuccess}
        gameName="Little Astronomer"
        learnedText="the planets of our solar system 🪐"
        onPlayAgain={() => {
          setShowSuccess(false);
          setActiveLevel(1);
          setCompletedLevels(new Set());
        }}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        showShare
        gameId="little-astronomer"
        boughtItems={boughtItems}
        boughtLabel="Planets discovered"
      />

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        gameName="Little Astronomer"
      />
    </div>
  );
}
