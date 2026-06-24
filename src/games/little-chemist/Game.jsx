import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../design-system/layouts/GameShell';
import Confetti from '../../design-system/components/Confetti';
import Toast from '../../design-system/components/Toast';
import SuccessScreen from '../../design-system/components/SuccessScreen';
import FeedbackModal from '../../components/FeedbackModal';
import { useToast } from '../../design-system/useToast';
import theme from './theme';
import Level1 from './levels/Level1';
import Level2 from './levels/Level2';
import Level3 from './levels/Level3';
import Level4 from './levels/Level4';
import Level5 from './levels/Level5';
import Level6 from './levels/Level6';
import { trackGameOpen, trackLevelComplete, trackGameComplete } from '../../analytics';

// ── Elements ─────────────────────────────────────────────────
// Each element uses a didit palette Dark fill + base-shade letter
const ELEMENTS = [
  { symbol: 'H',  name: 'Hydrogen', fill: '#3A6CE5', dark: '#3A6CE5', text: '#9BB5E8' }, // blueberryDark / blueberry
  { symbol: 'O',  name: 'Oxygen',   fill: '#C23C3C', dark: '#C23C3C', text: '#F2C4BE' }, // coralDark / coralLight
  { symbol: 'C',  name: 'Carbon',   fill: '#2EA820', dark: '#2EA820', text: '#BEE060' }, // grassDark / grass
  { symbol: 'N',  name: 'Nitrogen', fill: '#03B292', dark: '#03B292', text: '#4ECDC4' }, // skyDark / sky
  { symbol: 'Na', name: 'Sodium',   fill: '#EE6A30', dark: '#EE6A30', text: '#F0DC90' }, // sunDark / sun
  { symbol: 'Fe', name: 'Iron',     fill: '#1A1040', dark: '#1A1040', text: '#9BB5E8' }, // night / blueberry
];

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeLevels() {
  const elements = shuffled(ELEMENTS); // one unique element per level
  return elements.map(element => ({
    leftCount: randomInt(1, 4),
    startRight: 0,
    element,
  }));
}

const BALANCE_TOASTS = [
  'Yippee, balanced! ⚗️',
  'Hooray, you got it! 🧪',
  'Amazing balance! 🔬',
  'Perfect! ⚛️',
  'Woohoo! 🧫',
  'Brilliant! 🧬',
  'You nailed it! ⚗️',
  'Eureka! 🧪',
];

const LAB_EMOJIS = ['🧪', '⚗️', '⚛️'];

// Tiny atom ball for success screen
function AtomBall({ el, size = 48 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: el.fill,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: el.symbol.length > 1 ? size * 0.26 : size * 0.32,
      fontWeight: 600, color: el.text,
      fontFamily: "'Nunito', sans-serif",
      flexShrink: 0,
    }}>
      {el.symbol}
    </div>
  );
}

// ── Level components array ────────────────────────────────────
const LEVEL_COMPONENTS = [Level1, Level2, Level3, Level4, Level5, Level6];

const LEVEL_DEFS = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  label: `⚗️ ${i + 1}`,
}));

// ── Game ──────────────────────────────────────────────────────
export default function Game() {
  const navigate = useNavigate();

  // Generate all 6 level configs once on game load
  const [levelConfigs] = useState(() => makeLevels());

  const [activeLevel,     setActiveLevel]     = useState(1);
  const [completedLevels, setCompletedLevels] = useState(new Set());
  const [showSuccess,     setShowSuccess]     = useState(false);
  const [milestone,       setMilestone]       = useState({ active: false, originX: 50, originY: 50 });
  const { toast, showToast } = useToast();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [emojiPopup,   setEmojiPopup]   = useState(null);
  const emojiTimer = useRef(null);
  const emojiKey   = useRef(0);

  useEffect(() => { trackGameOpen('little-chemist'); }, []);

  const handleComplete = (levelId) => {
    if (completedLevels.has(levelId)) return;
    setCompletedLevels(prev => new Set(prev).add(levelId));
    trackLevelComplete('little-chemist', levelId);
    if (levelId === 6) {
      trackGameComplete('little-chemist');
      setTimeout(() => setShowSuccess(true), 1500);
    } else {
      setActiveLevel(levelId + 1);
    }
  };

  const triggerMilestone = (originX, originY) => {
    const cfg = levelConfigs[activeLevel - 1];
    setMilestone({ active: true, originX, originY });
    const msg = BALANCE_TOASTS[Math.floor(Math.random() * BALANCE_TOASTS.length)];
    setTimeout(() => showToast(msg, 1500, 22), 600);

    const levelId = activeLevel;
    clearTimeout(emojiTimer.current);
    emojiKey.current += 1;
    const labEmoji = LAB_EMOJIS[Math.floor(Math.random() * LAB_EMOJIS.length)];
    setEmojiPopup({ emoji: labEmoji, key: emojiKey.current });
    emojiTimer.current = setTimeout(() => {
      setEmojiPopup(null);
      handleComplete(levelId);
    }, 2000);
  };

  const cfg = levelConfigs[activeLevel - 1];
  const LevelComponent = LEVEL_COMPONENTS[activeLevel - 1];

  // Unique elements encountered across all levels (for success screen)
  const uniqueElements = [...new Map(levelConfigs.map(c => [c.element.symbol, c.element])).values()];
  const boughtItems    = uniqueElements.map(el => ({ node: <AtomBall el={el} />, name: el.name }));

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
        title="Little Chemist"
        hideTabs
        onBack={() => navigate('/hub')}
        instructions="Let your little one add atoms to balance the seesaw by matching the number on the left."
        topSlot={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, paddingBottom: 10 }}>
            {Array.from({ length: 6 }, (_, i) => {
              const id = i + 1;
              const active = id === activeLevel;
              const done   = completedLevels.has(id);
              return (
                <div key={id} style={{
                  width: active ? 22 : 10, height: 10, borderRadius: 999,
                  background: done || active ? 'var(--game-primary)' : 'rgba(0,0,0,0.12)',
                  opacity: done ? 0.45 : 1,
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                }} />
              );
            })}
          </div>
        }
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
          {!showSuccess && (
            <LevelComponent
              key={activeLevel}
              leftCount={cfg.leftCount}
              element={cfg.element}
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
        onComplete={() => setMilestone(m => ({ ...m, active: false }))}
      />

      <SuccessScreen
        visible={showSuccess}
        gameName="Little Chemist"
        learnedText="atomic balance and the elements"
        onPlayAgain={() => {
          setShowSuccess(false);
          setActiveLevel(1);
          setCompletedLevels(new Set());
        }}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        showShare
        gameId="little-chemist"
        boughtItems={boughtItems}
        boughtLabel="Elements you balanced"
      />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} gameName="Little Chemist" />
    </div>
  );
}
