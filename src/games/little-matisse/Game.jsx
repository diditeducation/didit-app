import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../design-system/layouts/GameShell';
import Confetti from '../../design-system/components/Confetti';
import Toast from '../../design-system/components/Toast';
import SuccessScreen from '../../design-system/components/SuccessScreen';
import FeedbackModal from '../../components/FeedbackModal';
import { useToast } from '../../design-system/useToast';
import { fonts, colors, easing } from '../../design-system/tokens';
import { initAudio, sound } from './audio';
import theme from './theme';
import Canvas from './Canvas';
import Tray from './Tray';
import CutoutShape from './CutoutShape';
import { SHAPE_KEYS } from './shapes';
import { COLORS } from './palette';
import { trackGameOpen, trackLevelComplete, trackGameComplete } from '../../analytics';

const TILE_COUNT = 4;
const LEVEL_COUNT = 6;
const TILE_SIZES = [80, 96, 112, 128];

const LEVEL_TOASTS = [
  'Beautiful! 🎨',
  'Magnifique! ✨',
  'What a collage! 🖼️',
  'So creative! 🌟',
  'Like Matisse! 🎭',
  'A masterpiece! 👏',
];

// --- Randomisation helpers ---

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr, exclude = []) {
  const pool = arr.filter(x => !exclude.includes(x));
  return pool[Math.floor(Math.random() * pool.length)];
}

// Group visually similar colours so we never pick two that look alike
const COLOR_GROUPS = {
  '#E63946': 'red',    '#FF006E': 'red',
  '#FF6B35': 'orange',
  '#F9DC5C': 'yellow', '#FFD23F': 'yellow',
  '#06D6A0': 'green',  '#8FBC5A': 'green',  '#00C9A7': 'green',
  '#118AB2': 'blue',   '#264FAE': 'blue',
  '#C77DFF': 'purple', '#7B2FF7': 'purple',
};

function pickDistinctColor(usedColors) {
  const usedGroups = usedColors.map(c => COLOR_GROUPS[c]).filter(Boolean);
  // Prefer colours from unused groups
  let pool = COLORS.filter(c => !usedColors.includes(c) && !usedGroups.includes(COLOR_GROUPS[c]));
  // Fallback: just avoid exact duplicates
  if (pool.length === 0) pool = COLORS.filter(c => !usedColors.includes(c));
  return pool[Math.floor(Math.random() * pool.length)];
}

function randRange(min, max) {
  return min + Math.random() * (max - min);
}

function generateLevel() {
  const anchorShape = pickRandom(SHAPE_KEYS);
  const anchorColor = pickRandom(COLORS);

  const usedShapes = [anchorShape];
  const usedColors = [anchorColor];
  const sizes = shuffle(TILE_SIZES);

  const tiles = [];
  for (let i = 0; i < TILE_COUNT; i++) {
    const shape = pickRandom(SHAPE_KEYS, usedShapes);
    const color = pickDistinctColor(usedColors);
    usedShapes.push(shape);
    usedColors.push(color);
    tiles.push({
      shape,
      color,
      size: sizes[i],
      rotation: Math.round(randRange(-25, 25)),
      placed: false,
    });
  }

  return {
    anchor: {
      shape: anchorShape,
      color: anchorColor,
      rotation: Math.round(randRange(-8, 8)),
    },
    tiles,
  };
}


// --- Mini artwork renderer for recap ---
function MiniArtwork({ artwork, size = 200 }) {
  if (!artwork) return null;
  const { anchor, placedShapes } = artwork;
  const scale = size / 400; // original canvas is roughly 400px

  return (
    <div style={{
      width: size,
      height: size,
      position: 'relative',
      borderRadius: 16,
      background: '#FFFFFF',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
    }}>
      {/* Anchor */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '75%',
        aspectRatio: '1 / 1',
        transform: `translate(-50%, -50%) rotate(${anchor.rotation}deg)`,
        pointerEvents: 'none',
      }}>
        <CutoutShape
          shape={anchor.shape}
          color={anchor.color}
          size="100%"
          rotation={0}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      {/* Placed shapes */}
      {placedShapes.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${s.xPct}%`,
            top: `${s.yPct}%`,
            width: s.size * scale,
            height: s.size * scale,
            transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
            pointerEvents: 'none',
          }}
        >
          <CutoutShape
            shape={s.shape}
            color={s.color}
            size={s.size * scale}
            rotation={0}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      ))}
    </div>
  );
}

export default function Game() {
  const navigate = useNavigate();

  const [activeLevel, setActiveLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState(new Set());
  const [level, setLevel] = useState(() => generateLevel());
  const [placedShapes, setPlacedShapes] = useState([]);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [ghostPos, setGhostPos] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [milestone, setMilestone] = useState({ active: false, originX: 50, originY: 50 });
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [artworks, setArtworks] = useState([]);       // saved compositions
  const [featuredIdx, setFeaturedIdx] = useState(0);   // which artwork to feature

  const { toast, showToast } = useToast();

  const canvasRef = useRef(null);
  const completionTimer = useRef(null);

  const placedCount = placedShapes.length;

  useEffect(() => { trackGameOpen('little-matisse'); }, []);

  useEffect(() => {
    return () => clearTimeout(completionTimer.current);
  }, []);

  // --- Level completion ---
  const advanceLevel = useCallback((savedArtwork) => {
    const newArtworks = [...artworks, savedArtwork];
    setArtworks(newArtworks);

    if (activeLevel >= LEVEL_COUNT) {
      // Game complete — pick a random featured artwork
      trackGameComplete('little-matisse');
      setFeaturedIdx(Math.floor(Math.random() * newArtworks.length));
      setShowSuccess(true);
    } else {
      // Next level
      trackLevelComplete('little-matisse', activeLevel);
      setCompletedLevels(prev => new Set(prev).add(activeLevel));
      setActiveLevel(prev => prev + 1);
      setLevel(generateLevel());
      setPlacedShapes([]);
    }
  }, [activeLevel, artworks]);

  // --- Drag handlers ---

  const handleDragStart = useCallback((index) => {
    initAudio();
    setDraggingIdx(index);
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (draggingIdx === null) return;
    setGhostPos({ x: e.clientX, y: e.clientY });
  }, [draggingIdx]);

  const handlePointerUp = useCallback((e) => {
    if (draggingIdx === null) return;

    const tile = level.tiles[draggingIdx];
    const canvasEl = canvasRef.current;

    if (canvasEl) {
      const rect = canvasEl.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;

      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        const xPct = ((x - rect.left) / rect.width) * 100;
        const yPct = ((y - rect.top) / rect.height) * 100;

        const newPlaced = [...placedShapes, {
          shape: tile.shape,
          color: tile.color,
          size: tile.size,
          rotation: tile.rotation,
          xPct,
          yPct,
        }];
        setPlacedShapes(newPlaced);

        const newTiles = [...level.tiles];
        newTiles[draggingIdx] = { ...newTiles[draggingIdx], placed: true };
        setLevel(prev => ({ ...prev, tiles: newTiles }));

        sound.pop(newPlaced.length - 1);

        // Level complete — all 4 shapes placed, enable Next button
        if (newPlaced.length === TILE_COUNT) {
          completionTimer.current = setTimeout(() => {
            sound.chime();
            setMilestone({ active: true, originX: 50, originY: 50 });

            const toastMsg = LEVEL_TOASTS[activeLevel - 1] || 'Beautiful! 🎨';
            setTimeout(() => showToast(toastMsg, 1500, 22), 300);
          }, 500);
        }
      }
    }

    setDraggingIdx(null);
    setGhostPos(null);
  }, [draggingIdx, level, placedShapes, activeLevel, advanceLevel, showToast]);

  const handleDragCancel = useCallback(() => {
    setDraggingIdx(null);
    setGhostPos(null);
  }, []);

  const resetGame = useCallback(() => {
    setActiveLevel(1);
    setCompletedLevels(new Set());
    setLevel(generateLevel());
    setPlacedShapes([]);
    setDraggingIdx(null);
    setGhostPos(null);
    setShowSuccess(false);
    setSparkles([]);
    setArtworks([]);
    setFeaturedIdx(0);
    setMilestone({ active: false, originX: 50, originY: 50 });
  }, []);

  const handleNext = useCallback(() => {
    const savedArtwork = {
      anchor: level.anchor,
      placedShapes,
    };
    advanceLevel(savedArtwork);
  }, [level, placedShapes, advanceLevel]);

  const levelComplete = placedCount === TILE_COUNT;
  const draggingTile = draggingIdx !== null ? level.tiles[draggingIdx] : null;
  const featuredArtwork = artworks[featuredIdx] || null;

  return (
    <div
      style={{ ...theme, minHeight: '100dvh', background: 'var(--game-bg)' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handleDragCancel}
    >
      <style>{`
        @keyframes nextBtnIn {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <GameShell
        title="Little Matisse"
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
            {Array.from({ length: LEVEL_COUNT }).map((_, i) => {
              const levelNum = i + 1;
              const isActive = levelNum === activeLevel;
              const isDone = completedLevels.has(levelNum) || showSuccess;
              return (
                <div
                  key={i}
                  style={{
                    width: isActive && !showSuccess ? 22 : 10,
                    height: 10,
                    borderRadius: 999,
                    background: isDone || isActive
                      ? 'var(--game-primary)'
                      : 'rgba(0,0,0,0.12)',
                    opacity: isDone && !isActive ? 0.45 : 1,
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                  }}
                />
              );
            })}
          </div>
        }
      >
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: 0,
          minHeight: 0,
        }}>
          {!showSuccess && (
            <>
              {/* Canvas area */}
              <div
                ref={canvasRef}
                style={{
                  flex: 1,
                  display: 'flex',
                  margin: '4px 12px 0',
                  minHeight: 0,
                }}
              >
                <Canvas
                  key={activeLevel}
                  anchor={level.anchor}
                  placedShapes={placedShapes}
                />
              </div>

              {/* Tray */}
              {!levelComplete && (
                <Tray
                  tiles={level.tiles}
                  draggingIdx={draggingIdx}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragCancel}
                />
              )}

              {/* Next button — appears after all shapes placed */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '16px 24px',
                minHeight: levelComplete ? 'auto' : 0,
              }}>
                {levelComplete && (
                  <button
                    onClick={handleNext}
                    style={{
                      padding: '14px 48px',
                      background: 'var(--game-primary)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 9999,
                      fontFamily: fonts.display,
                      fontWeight: 800,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      animation: 'nextBtnIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  >
                    {activeLevel < LEVEL_COUNT ? 'Next →' : 'Finish →'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </GameShell>

      {/* Ghost element following pointer during drag */}
      {draggingTile && ghostPos && (
        <div
          style={{
            position: 'fixed',
            left: ghostPos.x,
            top: ghostPos.y,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 200,
          }}
        >
          <CutoutShape
            shape={draggingTile.shape}
            color={draggingTile.color}
            size={draggingTile.size}
            rotation={draggingTile.rotation}
          />
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
        gameName="Little Matisse"
        learnedText="6 beautiful collages"
        onPlayAgain={resetGame}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        showShare
        gameId="little-matisse"
        boughtItems={featuredArtwork ? [{ node: <MiniArtwork artwork={featuredArtwork} size={160} />, name: '' }] : null}
        boughtLabel="Your featured artwork"
      />

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        gameName="Little Matisse"
      />
    </div>
  );
}
