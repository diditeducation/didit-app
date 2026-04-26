import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../design-system/layouts/GameShell';
import Confetti from '../../design-system/components/Confetti';
import SuccessScreen from '../../design-system/components/SuccessScreen';
import FeedbackModal from '../../components/FeedbackModal';
import { fonts } from '../../design-system/tokens';
import theme from './theme';
import IntroScreen from './IntroScreen';
import NewCardArea from './NewCardArea';
import Docket from './Docket';
import ProgressBar from './ProgressBar';
import { initAudio, sound, playCardSound } from './audio';
import { getStarterCards, getRoundCard, ROUNDS } from './deckLogic';
import { DOCKET_CAP } from './cards';
import { trackGameOpen, trackGameComplete } from '../../analytics';

/**
 * State machine
 *   intro        — title + 3 fanned cards + "tap to begin"
 *   transition   — title fades, starters slide into docket, first card flips in
 *   round        — main loop, the kid keeps or skips
 *   celebration  — short on-stage pause then SuccessScreen takes over
 */

export default function Game() {
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Initial draw — three random foods.
  const [starters] = useState(() => getStarterCards());

  const [phase, setPhase] = useState('intro');           // 'intro' | 'transition' | 'round' | 'celebration'
  const [docket, setDocket] = useState([]);              // grows from 3 → up to 5
  const [roundIndex, setRoundIndex] = useState(0);
  const [completedRounds, setCompletedRounds] = useState(0);
  const [newCard, setNewCard] = useState(null);
  const drawnIds = useRef(new Set());                    // every card the deck has surfaced

  const [pulseSlotIdx, setPulseSlotIdx] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [milestone, setMilestone] = useState({ active: false, originX: 50, originY: 50 });
  const [showFlip, setShowFlip] = useState(false);
  const [swapHint, setSwapHint] = useState(false);

  const docketRef = useRef(null);
  const docketCardRefs = useRef([]);                     // [el, el, ...] per slot
  const setDocketSlotRef = useCallback((idx, el) => {
    docketCardRefs.current[idx] = el;
  }, []);

  useEffect(() => { trackGameOpen('little-trader'); }, []);

  // ── Intro → Transition ─────────────────────────────────────
  const beginGame = () => {
    initAudio();
    sound.cardFlip();
    setPhase('transition');
    // Starters land in the docket while title fades.
    setTimeout(() => setDocket(starters.slice(0, 3)), 250);
    // First round card flips in.
    setTimeout(() => {
      const card = getRoundCard(0, drawnIds.current);
      if (card) drawnIds.current.add(card.id);
      setNewCard(card);
      setShowFlip(true);
      sound.cardFlip();
      sound.progressTick();
      setPhase('round');
    }, 900);
    // Reset flip animation flag so subsequent rounds re-trigger.
    setTimeout(() => setShowFlip(false), 1500);
  };

  // ── Round resolution helpers ────────────────────────────────
  const advanceRound = useCallback(() => {
    const next = roundIndex + 1;
    setCompletedRounds(next);
    if (next >= ROUNDS) {
      // → celebration
      setPhase('celebration');
      sound.celebration();
      // After a beat, fire confetti + open SuccessScreen.
      setTimeout(() => {
        setMilestone({ active: true, originX: 50, originY: 55 });
        trackGameComplete('little-trader');
      }, 700);
      setTimeout(() => setShowSuccess(true), 1400);
      return;
    }
    // Draw next card.
    const card = getRoundCard(next, drawnIds.current);
    if (card) drawnIds.current.add(card.id);
    setRoundIndex(next);
    setNewCard(card);
    setShowFlip(true);
    setSwapHint(false);
    setTimeout(() => setShowFlip(false), 600);
    sound.cardFlip();
    sound.progressTick();
  }, [roundIndex]);

  // ── Drag hit-testing for NewCardArea ────────────────────────
  const hitTest = (clientX, clientY) => {
    const drect = docketRef.current?.getBoundingClientRect();
    if (!drect) return { zone: 'outside' };
    const insideDocket =
      clientX >= drect.left &&
      clientX <= drect.right &&
      clientY >= drect.top &&
      clientY <= drect.bottom;
    if (!insideDocket) return { zone: 'outside' };

    // If full, look for a specific slot under the pointer for swap.
    if (docket.length >= DOCKET_CAP) {
      for (let i = 0; i < docketCardRefs.current.length; i++) {
        const el = docketCardRefs.current[i];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
          return { zone: 'docket-card', slotIndex: i };
        }
      }
      // Inside docket but not on a card → no-op (return to centre).
      return { zone: 'outside' };
    }

    return { zone: 'docket' };
  };

  // ── Resolve drag (keep / swap / cancel) ─────────────────────
  const handleResolve = (result) => {
    if (!newCard) return;
    if (result.zone === 'docket' && docket.length < DOCKET_CAP) {
      // Keep: append to next empty slot.
      const slotIdx = docket.length;
      setDocket((d) => [...d, newCard]);
      sound.cardThunk();
      pulseSlot(slotIdx);
      setNewCard(null);
      // Brief gap before flipping in the next card so the kid sees the
      // landing animation finish.
      setTimeout(() => advanceRound(), 350);
      return;
    }
    if (result.zone === 'docket-card' && docket.length >= DOCKET_CAP) {
      // Swap.
      const swapIdx = result.slotIndex;
      const incoming = newCard;
      setDocket((d) => d.map((c, i) => (i === swapIdx ? incoming : c)));
      sound.cardPop();
      sound.cardThunk();
      pulseSlot(swapIdx);
      setNewCard(null);
      setTimeout(() => advanceRound(), 350);
      return;
    }
    // Outside / cancel — just unset drag state so card springs back.
    // (NewCardArea already animates the spring via its internal state reset.)
  };

  const handleSkip = () => {
    if (!newCard) return;
    sound.cardWhoosh();
    setNewCard(null);
    setTimeout(() => advanceRound(), 250);
  };

  const pulseSlot = (idx) => {
    setPulseSlotIdx(idx);
    setTimeout(() => setPulseSlotIdx(null), 350);
  };

  // ── Tap-to-hear on docket cards (idle interaction) ──────────
  const onTapDocketCard = (card) => {
    if (phase !== 'round') return;
    initAudio();
    playCardSound(card.sound);
  };

  const showSwapMode = phase === 'round' && docket.length >= DOCKET_CAP && (newCard != null);

  // Track swap hint glow once docket fills up so the kid sees the dashed
  // outlines as soon as the next card arrives — not only mid-drag.
  useEffect(() => { setSwapHint(showSwapMode); }, [showSwapMode]);

  // ── Reset for "Play again" ──────────────────────────────────
  const handlePlayAgain = () => {
    drawnIds.current = new Set();
    const fresh = getStarterCards();
    setDocket([]);
    setRoundIndex(0);
    setCompletedRounds(0);
    setNewCard(null);
    setMilestone({ active: false, originX: 50, originY: 50 });
    setShowSuccess(false);
    setPhase('intro');
    // Stash the new starters by remounting the IntroScreen with a fresh key.
    // Since `starters` is held in useState(initial), we can't easily refresh
    // it without resetting the component; for simplicity we re-init via
    // effect below.
    setStartersKey((k) => k + 1);
    setStartersOverride(fresh);
  };

  // Allow Play Again to inject a fresh starter trio.
  const [startersKey, setStartersKey] = useState(0);
  const [startersOverride, setStartersOverride] = useState(null);
  const activeStarters = startersOverride || starters;

  return (
    <div style={theme}>
      <GameShell title="Little Trader" hideTabs onBack={() => navigate('/hub')}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            gap: 6,
            paddingTop: 4,
          }}
        >
          {/* Progress bar — hidden on intro, visible from transition onward. */}
          {phase !== 'intro' && (
            <ProgressBar completed={completedRounds} active={roundIndex} />
          )}

          {/* Stage area */}
          {phase === 'intro' && (
            <IntroScreen
              key={startersKey}
              starters={activeStarters}
              onBegin={beginGame}
              phase="idle"
            />
          )}

          {(phase === 'transition' || phase === 'round' || phase === 'celebration') && (
            <NewCardArea
              key={newCard?.id ?? `empty-${roundIndex}`}
              card={newCard}
              showFlip={showFlip}
              isFull={docket.length >= DOCKET_CAP}
              onResolve={handleResolve}
              onSkip={handleSkip}
              hitTest={hitTest}
            />
          )}

          {/* Docket — fades in once transition is underway. */}
          {(phase === 'transition' || phase === 'round' || phase === 'celebration') && (
            <Docket
              ref={docketRef}
              cards={docket}
              swapMode={swapHint}
              pulseSlotIdx={pulseSlotIdx}
              setSlotRef={setDocketSlotRef}
              onTapCard={onTapDocketCard}
            />
          )}
        </div>

        {/* End-of-game footnote: tiny text under the docket */}
        {phase === 'celebration' && (
          <div
            style={{
              position: 'fixed',
              bottom: 96,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: 14,
              color: 'var(--game-primary)',
              pointerEvents: 'none',
            }}
          >
            your treasure!
          </div>
        )}
      </GameShell>

      <Confetti
        active={milestone.active}
        originX={milestone.originX}
        originY={milestone.originY}
        onComplete={() => setMilestone((m) => ({ ...m, active: false }))}
      />

      <SuccessScreen
        visible={showSuccess}
        gameName="Little Trader"
        learnedText="trade-offs and choosing what to keep"
        onPlayAgain={handlePlayAgain}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        showShare
        gameId="little-trader"
        boughtItems={docket.map((c) => ({
          emoji: c.emoji,
          name: c.label,
        }))}
        boughtLabel="Your docket"
      />

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        gameName="Little Trader"
      />
    </div>
  );
}
