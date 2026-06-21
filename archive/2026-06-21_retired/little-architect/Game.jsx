import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../design-system/layouts/GameShell';
import Confetti from '../../design-system/components/Confetti';
import Toast from '../../design-system/components/Toast';
import SuccessScreen from '../../design-system/components/SuccessScreen';
import FeedbackModal from '../../components/FeedbackModal';
import { useToast } from '../../design-system/useToast';
import theme from './theme';
import LittleArchitectGame, { LEVEL_DEFS } from './LittleArchitectGame';
import { trackGameOpen, trackLevelComplete, trackGameComplete } from '../../analytics';

const COMPLETE_TOASTS = [
  'Built! 🏗️',
  'Standing tall! 🌟',
  'Complete! ✨',
  'Perfect build!',
  'All together! 🏠',
  'Nailed it! 💯',
];

// Blueberry palette colours (match LittleArchitectGame)
const BD = '#3A6CE5';
const BM = '#6B8FD8';
const BB = '#9BB5E8';
const BL = '#CFD9F4';

const STAGE_W = 300;
const STAGE_H = 250;

function shapePoints(type, x, y, w, h) {
  if (type === 'triangle-up')    return `${x},${y + h} ${x + w},${y + h} ${x + w / 2},${y}`;
  if (type === 'triangle-left')  return `${x + w},${y} ${x + w},${y + h} ${x},${y + h / 2}`;
  if (type === 'triangle-right') return `${x},${y} ${x},${y + h} ${x + w},${y + h / 2}`;
  return null;
}

function BuildingIcon({ levelDef, size = 48 }) {
  const h = Math.round(size * STAGE_H / STAGE_W);
  return (
    <svg
      width={size}
      height={h}
      viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
    >
      {levelDef.pieces.map(p => {
        const isRect = p.type === 'rect' || p.type === 'square';
        const common = {
          key:         p.id,
          fill:        p.color,
          stroke:      'white',
          strokeWidth: 4,
        };
        if (isRect) return <rect {...common} x={p.x} y={p.y} width={p.w} height={p.h} />;
        return <polygon {...common} points={shapePoints(p.type, p.x, p.y, p.w, p.h)} />;
      })}
    </svg>
  );
}

const BOUGHT_ITEMS = LEVEL_DEFS.map(def => ({
  node: <BuildingIcon levelDef={def} size={52} />,
  name: '',
}));

export default function Game() {
  const navigate = useNavigate();

  const [activeLevel,     setActiveLevel]     = useState(1);
  const [completedLevels, setCompletedLevels] = useState(new Set());
  const [showSuccess,     setShowSuccess]     = useState(false);
  const [milestone,       setMilestone]       = useState({ active: false, originX: 50, originY: 50 });
  const { toast, showToast } = useToast();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => { trackGameOpen('little-architect'); }, []);

  const handleComplete = (levelId) => {
    if (completedLevels.has(levelId)) return;
    setCompletedLevels(prev => new Set(prev).add(levelId));
    trackLevelComplete('little-architect', levelId);
    if (levelId === LEVEL_DEFS.length) {
      trackGameComplete('little-architect');
      setTimeout(() => setShowSuccess(true), 1600);
    } else {
      setActiveLevel(levelId + 1);
    }
  };

  const triggerMilestone = (originX, originY) => {
    setMilestone({ active: true, originX, originY });
    const msg = COMPLETE_TOASTS[Math.floor(Math.random() * COMPLETE_TOASTS.length)];
    setTimeout(() => showToast(msg, 1800, 22), 400);
    const levelId = activeLevel;
    setTimeout(() => handleComplete(levelId), 2200);
  };

  return (
    <div style={theme}>
      <GameShell
        title="Little Architect"
        hideTabs
        onBack={() => navigate('/hub')}
        topSlot={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, paddingBottom: 10 }}>
            {LEVEL_DEFS.map((_, i) => {
              const id     = i + 1;
              const active = id === activeLevel;
              const done   = completedLevels.has(id);
              return (
                <div key={id} style={{
                  width:        active ? 22 : 10,
                  height:       10,
                  borderRadius: 999,
                  background:   done || active ? 'var(--game-primary)' : 'rgba(0,0,0,0.12)',
                  opacity:      done ? 0.45 : 1,
                  transition:   'all 0.3s ease',
                  flexShrink:   0,
                }} />
              );
            })}
          </div>
        }
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
          {!showSuccess && (
            <LittleArchitectGame
              key={activeLevel}
              levelDef={LEVEL_DEFS[activeLevel - 1]}
              onMilestone={(x, y) => triggerMilestone(x, y)}
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
        onComplete={() => setMilestone(m => ({ ...m, active: false }))}
      />

      <SuccessScreen
        visible={showSuccess}
        gameName="Little Architect"
        learnedText="shapes, space, and how buildings come together"
        onPlayAgain={() => {
          setShowSuccess(false);
          setActiveLevel(1);
          setCompletedLevels(new Set());
        }}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        showShare
        gameId="little-architect"
        boughtItems={BOUGHT_ITEMS}
        boughtLabel="You built 3 buildings!"
      />

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        gameName="Little Architect"
      />
    </div>
  );
}
