import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../design-system/layouts/GameShell';
import Confetti from '../../design-system/components/Confetti';
import SuccessScreen from '../../design-system/components/SuccessScreen';
import FeedbackModal from '../../components/FeedbackModal';
import { fonts } from '../../design-system/tokens';
import theme from './theme';
import NewCardArea from './NewCardArea';
import Docket from './Docket';
import ProgressBar from './ProgressBar';
import { initAudio, sound, playCardSound } from './audio';
import { getStarterCards, getRoundCard, pickTheme, ROUNDS } from './deckLogic';
import { DOCKET_CAP, THEME_TINT } from './cards';
import { trackGameOpen, trackGameComplete } from '../../analytics';

/**
 * State machine
 *   intro        — Your Cards docket sits up near the middle, "Start Trading"
 *                  pill below it. The new-card slot above is empty.
 *   transition   — pill fades out, docket animates DOWN to its play position,
 *                  first card flips in above it.
 *   round        — main loop, the kid keeps or skips
 *   celebration  — short on-stage pause then SuccessScreen takes over
 *
 * A single playthrough is bounded by THEME (Animals / Food / Toys) — every
 * card surfaced this game comes from the chosen theme, and the whole UI
 * tints itself to match the theme's accent colour.
 */

const INTRO_DOCKET_OFFSET_PX = 220;

// Build the first playthrough's data deterministically inside one helper so
// "Play Again" and the initial mount both use identical setup logic.
function buildPlaythrough() {
  const themeId = pickTheme();
  const starters = getStarterCards(themeId);
  return { themeId, starters };
}

export default function Game() {
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Pick this playthrough's theme + starter docket once per mount.
  const initial = useState(buildPlaythrough)[0];
  const [themeId, setThemeId] = useState(initial.themeId);
  const [docket, setDocket] = useState(initial.starters);

  const [phase, setPhase] = useState('intro');
  const [roundIndex, setRoundIndex] = useState(0);
  const [completedRounds, setCompletedRounds] = useState(0);
  const [newCard, setNewCard] = useState(null);
  // Track every card already shown so cards never repeat — including the
  // starter trio so round 1 can't surface a duplicate.
  const drawnIds = useRef(new Set(initial.starters.map((c) => c.id)));

  const [pulseSlotIdx, setPulseSlotIdx] = useState(null);
  const [hoveredSlotIdx, setHoveredSlotIdx] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [milestone, setMilestone] = useState({ active: false, originX: 50, originY: 50 });
  const [showFlip, setShowFlip] = useState(false);
  const [swapHint, setSwapHint] = useState(false);

  const docketRef = useRef(null);
  const docketCardRefs = useRef([]);
  const setDocketSlotRef = useCallback((idx, el) => {
    docketCardRefs.current[idx] = el;
  }, []);

  useEffect(() => { trackGameOpen('little-trader'); }, []);

  // Per-theme metadata is still used for the SuccessScreen label, but the
  // in-game UI keeps a single yellow/amber scheme regardless of theme so
  // the player isn't confused by the docket changing colour every game.
  const tintMeta = THEME_TINT[themeId] || THEME_TINT.food;

  // ── Intro → Transition ─────────────────────────────────────
  const beginGame = () => {
    initAudio();
    sound.cardFlip();
    setPhase('transition');
    setTimeout(() => {
      const card = getRoundCard(0, themeId, drawnIds.current);
      if (card) drawnIds.current.add(card.id);
      setNewCard(card);
      setShowFlip(true);
      sound.cardFlip();
      sound.progressTick();
      setPhase('round');
    }, 700);
    setTimeout(() => setShowFlip(false), 1300);
  };

  // ── Round resolution helpers ────────────────────────────────
  const advanceRound = useCallback(() => {
    const next = roundIndex + 1;
    setCompletedRounds(next);
    if (next >= ROUNDS) {
      // Last selection made — go straight to SuccessScreen.
      // SuccessScreen has its own confetti + chime so we don't gate on a
      // local "celebration" pause.
      sound.celebration();
      trackGameComplete('little-trader');
      setShowSuccess(true);
      return;
    }
    const card = getRoundCard(next, themeId, drawnIds.current);
    if (card) drawnIds.current.add(card.id);
    setRoundIndex(next);
    setNewCard(card);
    setShowFlip(true);
    setSwapHint(false);
    setTimeout(() => setShowFlip(false), 600);
    sound.cardFlip();
    sound.progressTick();
  }, [roundIndex, themeId]);

  // ── Drag hit-testing ───────────────────────────────────────
  // Always reports which slot the pointer is over (even when the docket
  // isn't full) so the parent can scale that slot for hover feedback.
  const hitTest = (clientX, clientY) => {
    const drect = docketRef.current?.getBoundingClientRect();
    if (!drect) return { zone: 'outside' };
    const insideDocket =
      clientX >= drect.left &&
      clientX <= drect.right &&
      clientY >= drect.top &&
      clientY <= drect.bottom;
    if (!insideDocket) return { zone: 'outside' };

    let overSlotIdx = null;
    for (let i = 0; i < docketCardRefs.current.length; i++) {
      const el = docketCardRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
        overSlotIdx = i;
        break;
      }
    }

    if (docket.length >= DOCKET_CAP) {
      // Full → only a swap onto a specific card resolves; report the slot
      // whether for resolve or hover (caller decides).
      if (overSlotIdx != null) return { zone: 'docket-card', slotIndex: overSlotIdx };
      return { zone: 'outside' };
    }
    return { zone: 'docket', slotIndex: overSlotIdx };
  };

  const handleHoverChange = (hit) => {
    if (!hit || hit.zone === 'outside') {
      setHoveredSlotIdx(null);
      return;
    }
    if (hit.zone === 'docket-card') {
      setHoveredSlotIdx(hit.slotIndex);
      return;
    }
    if (hit.zone === 'docket') {
      // Not full — highlight either the slot under pointer (if any) or the
      // next empty slot the card would land in.
      setHoveredSlotIdx(hit.slotIndex != null ? hit.slotIndex : docket.length);
      return;
    }
    setHoveredSlotIdx(null);
  };

  const handleResolve = (result) => {
    setHoveredSlotIdx(null);
    if (!newCard) return;
    // On the last round we skip the small "card landing" pause so the
    // SuccessScreen comes up the instant the kid drops the card.
    const isLastRound = roundIndex >= ROUNDS - 1;
    const advanceDelay = isLastRound ? 0 : 350;
    if (result.zone === 'docket' && docket.length < DOCKET_CAP) {
      const slotIdx = docket.length;
      setDocket((d) => [...d, newCard]);
      sound.cardThunk();
      pulseSlot(slotIdx);
      setNewCard(null);
      if (advanceDelay) setTimeout(() => advanceRound(), advanceDelay);
      else advanceRound();
      return;
    }
    if (result.zone === 'docket-card' && docket.length >= DOCKET_CAP) {
      const swapIdx = result.slotIndex;
      const incoming = newCard;
      setDocket((d) => d.map((c, i) => (i === swapIdx ? incoming : c)));
      sound.cardPop();
      sound.cardThunk();
      pulseSlot(swapIdx);
      setNewCard(null);
      if (advanceDelay) setTimeout(() => advanceRound(), advanceDelay);
      else advanceRound();
      return;
    }
  };

  const handleSkip = () => {
    if (!newCard) return;
    sound.cardWhoosh();
    setNewCard(null);
    const isLastRound = roundIndex >= ROUNDS - 1;
    if (isLastRound) advanceRound();
    else setTimeout(() => advanceRound(), 250);
  };

  const pulseSlot = (idx) => {
    setPulseSlotIdx(idx);
    setTimeout(() => setPulseSlotIdx(null), 350);
  };

  const onTapDocketCard = (card) => {
    if (phase !== 'round') return;
    initAudio();
    playCardSound(card.sound);
  };

  const showSwapMode = phase === 'round' && docket.length >= DOCKET_CAP && (newCard != null);
  useEffect(() => { setSwapHint(showSwapMode); }, [showSwapMode]);

  // ── Reset for "Play again" ──────────────────────────────────
  const handlePlayAgain = () => {
    const fresh = buildPlaythrough();
    drawnIds.current = new Set(fresh.starters.map((c) => c.id));
    setThemeId(fresh.themeId);
    setDocket(fresh.starters);
    setRoundIndex(0);
    setCompletedRounds(0);
    setNewCard(null);
    setHoveredSlotIdx(null);
    setMilestone({ active: false, originX: 50, originY: 50 });
    setShowSuccess(false);
    setPhase('intro');
  };

  const isIntro     = phase === 'intro';
  const showCTA     = phase === 'intro' || phase === 'transition';
  const showNewCard = phase === 'transition' || phase === 'round' || phase === 'celebration';

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
            position: 'relative',
          }}
        >
          {!isIntro && (
            <ProgressBar
              completed={completedRounds}
              active={roundIndex}
              accentColor="var(--game-primary)"
            />
          )}

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              opacity: showNewCard ? 1 : 0,
              transition: 'opacity 0.35s ease',
            }}
          >
            {showNewCard && (
              <NewCardArea
                key={newCard?.id ?? `empty-${roundIndex}`}
                card={newCard}
                showFlip={showFlip}
                // Match the docket header colour for visual consistency.
                accentColor="var(--trader-docket-text)"
                onResolve={handleResolve}
                onSkip={handleSkip}
                hitTest={hitTest}
                onHoverChange={handleHoverChange}
              />
            )}
          </div>

          <div
            style={{
              position: 'relative',
              transform: isIntro
                ? `translateY(-${INTRO_DOCKET_OFFSET_PX}px)`
                : 'translateY(0)',
              transition: 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <Docket
              ref={docketRef}
              cards={docket}
              swapMode={swapHint}
              pulseSlotIdx={pulseSlotIdx}
              hoveredSlotIdx={hoveredSlotIdx}
              setSlotRef={setDocketSlotRef}
              onTapCard={onTapDocketCard}
            />

            {/* Drag instruction — sits BELOW the docket panel, centred */}
            {!isIntro && (
              <div
                style={{
                  textAlign: 'center',
                  fontFamily: fonts.display,
                  fontWeight: 600,
                  fontSize: 12,
                  color: 'var(--game-text-muted)',
                  padding: '0 16px',
                  marginTop: 4,
                }}
              >
                Drop the new card on any slot to keep it, or click next to skip
              </div>
            )}

            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 24,
                display: 'flex',
                justifyContent: 'center',
                opacity: showCTA && isIntro ? 1 : 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: showCTA && isIntro ? 'auto' : 'none',
              }}
            >
              <button
                type="button"
                onClick={beginGame}
                style={{
                  background: 'var(--game-primary)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '16px 40px',
                  minHeight: 56,
                  fontFamily: fonts.display,
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  boxShadow: 'none',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  letterSpacing: '0.02em',
                }}
              >
                Start Trading <span style={{ fontSize: '1.1rem' }}>→</span>
              </button>
            </div>
          </div>
        </div>

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
        learnedText={`trade-offs and choosing what to keep — ${tintMeta.label.toLowerCase()} edition`}
        onPlayAgain={handlePlayAgain}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        showShare
        gameId="little-trader"
        boughtItems={docket.map((c) => ({
          emoji: c.emoji,
          name: c.label,
        }))}
        boughtLabel={`Your ${tintMeta.label}`}
      />

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        gameName="Little Trader"
      />
    </div>
  );
}
