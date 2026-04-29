import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../design-system/layouts/GameShell';
import Confetti from '../../design-system/components/Confetti';
import SuccessScreen from '../../design-system/components/SuccessScreen';
import Toast from '../../design-system/components/Toast';
import FeedbackModal from '../../components/FeedbackModal';
import { useToast } from '../../design-system/useToast';
import { fonts } from '../../design-system/tokens';
import theme from './theme';
import ConsultantCanvas from './ConsultantCanvas';
import { initAudio, sound } from './audio';
import { LEVELS } from './shapes';
import { trackGameOpen, trackLevelComplete, trackGameComplete } from '../../analytics';

// Short encouragement toasts that fire occasionally when the kid puts a
// shape in the right box. Roughly one in three correct drops surfaces a
// message — frequent enough to feel responsive, rare enough not to nag.
const ENCOURAGEMENTS = ['Nice!', 'Yes!', 'Perfect!', 'Great!', 'Wow!', 'You got it!'];
const ENCOURAGE_CHANCE = 0.35;

/**
 * State machine:
 *   playing       — kid is sorting shapes for the current level
 *   transitioning — confetti just fired, getting ready for the next level
 *   complete      — final SuccessScreen
 *
 * Level transitions use a key change on ConsultantCanvas to remount with a
 * fresh shape pile (matching the spec's "shapes float back to a centre pile"
 * intent — the float-back is collapsed into a clean reset for v1).
 */
export default function Game() {
  const navigate = useNavigate();
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState('playing'); // 'playing' | 'transitioning' | 'complete'
  const [showSuccess, setShowSuccess] = useState(false);
  const [milestone, setMilestone] = useState({ active: false, originX: 50, originY: 50 });
  const { toast, showToast } = useToast();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const transitionTimerRef = useRef(null);

  useEffect(() => { trackGameOpen('little-consultant'); }, []);
  useEffect(() => () => clearTimeout(transitionTimerRef.current), []);

  const handleLevelComplete = useCallback(() => {
    initAudio();
    sound.celebrate();
    trackLevelComplete('little-consultant', level);
    setMilestone({ active: true, originX: 50, originY: 60 });
    setPhase('transitioning');

    if (level >= LEVELS.length) {
      // Final level done — fire SuccessScreen after a short celebratory beat.
      trackGameComplete('little-consultant');
      transitionTimerRef.current = setTimeout(() => {
        setShowSuccess(true);
        setPhase('complete');
      }, 1100);
    }
    // For levels 1 + 2 we DON'T auto-advance any more — the kid taps the
    // Next button below the centred homes when they're ready.
  }, [level]);

  const handleNextLevel = useCallback(() => {
    setLevel((l) => l + 1);
    setPhase('playing');
    setMilestone({ active: false, originX: 50, originY: 50 });
  }, []);

  // Fires every time a shape lands in the correct home. Surfaces an
  // encouragement toast on a random subset of those events, positioned
  // just above wherever the shape was dropped.
  const handleCorrectDrop = useCallback(({ clientY } = {}) => {
    if (Math.random() > ENCOURAGE_CHANCE) return;
    const msg = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];

    let topPercent = 28;
    if (typeof clientY === 'number' && typeof window !== 'undefined') {
      // Sit ~70 px above the drop, clamp to 6 % so it never tucks under
      // the top app-bar.
      const px = Math.max(window.innerHeight * 0.06, clientY - 70);
      topPercent = (px / window.innerHeight) * 100;
    }
    showToast(msg, 1100, topPercent);
  }, [showToast]);

  const handlePlayAgain = () => {
    setShowSuccess(false);
    setLevel(1);
    setPhase('playing');
    setMilestone({ active: false, originX: 50, originY: 50 });
  };

  return (
    <div style={theme}>
      <GameShell
        title="Little Consultant"
        hideTabs
        onBack={() => navigate('/hub')}
      >
        <div style={{ position: 'relative', flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
          <ConsultantCanvas
            key={level}
            level={level}
            phase={phase}
            onLevelComplete={handleLevelComplete}
            onCorrectDrop={handleCorrectDrop}
          />

          {/* Next button — only when a non-final level has just been
              completed. Sits below the (now-centred) homes. No shadow. */}
          {phase === 'transitioning' && level < LEVELS.length && (
            <button
              type="button"
              onClick={handleNextLevel}
              style={{
                position: 'absolute',
                bottom: '5%',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--game-primary)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 9999,
                padding: '14px 36px',
                minHeight: 52,
                fontFamily: fonts.display,
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: 'none',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                letterSpacing: '0.02em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Next <span style={{ fontSize: '1.1rem' }}>→</span>
            </button>
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
        gameName="Little Consultant"
        learnedSentence="You've learnt the concept of no gaps, no overlaps — a foundation in structured thinking."
        onPlayAgain={handlePlayAgain}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        showShare
        gameId="little-consultant"
      />

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        gameName="Little Consultant"
      />
    </div>
  );
}
