import { useState, useEffect } from 'react';
import Confetti from './Confetti';
import ShareButton from './ShareButton';
import { trackSuccessClick } from '../../analytics';
import { playSuccessChime } from '../sharedSounds';
import { useSoundManager } from '../useSoundManager';
import { PAGE_MAX_WIDTH } from '../layout';
import { useNavigate } from 'react-router-dom';
import { GAMES } from '../../data/games';
import { useDemo } from '../../context/DemoContext';
import DiditLogo from '../../components/DiditLogo';
import { colors } from '../tokens';
import {
  ShopperIllustration, DJIllustration, EngineerIllustration,
  ChefIllustration, PianistIllustration, CoderIllustration,
  ChemistIllustration, AstronomerIllustration, AnalystIllustration,
  ArchitectIllustration, MatisseIllustration, TraderIllustration,
  ConsultantIllustration,
} from '../../components/GameIllustrations';

const ILLUSTRATIONS = {
  shopper: ShopperIllustration, mixer: DJIllustration, engineer: EngineerIllustration,
  chef: ChefIllustration, dj: PianistIllustration, coder: CoderIllustration,
  chemist: ChemistIllustration, astronomer: AstronomerIllustration,
  pie: AnalystIllustration, architect: ArchitectIllustration,
  matisse: MatisseIllustration, trader: TraderIllustration,
  consultant: ConsultantIllustration,
};

const KEYFRAMES_ID = 'didit-success-screen-keyframes';

const keyframesCSS = `
@keyframes successZoomIn {
  from {
    transform: scale(0.92);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
@keyframes emojiBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
@keyframes coinFloat {
  0%   { transform: translateY(0px) rotate(0deg); }
  50%  { transform: translateY(-4px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}
`;

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = keyframesCSS;
  document.head.appendChild(style);
}

const FONT = "'Nunito', sans-serif";

/* Pixel-perfect copy of ShopBoard Coin (wallet variant, 32px) */
function SuccessCoin({ floatDelay = 0 }) {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 36% 30%, #fff9c0 0%, #f5c535 26%, #d4a010 58%, #a07008 100%)',
        border: 'none',
        boxShadow: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
        animation: `coinFloat 2s ease-in-out infinite`,
        animationDelay: `${floatDelay || 0}s`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '14%',
          left: '20%',
          width: '32%',
          height: '20%',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.35)',
          pointerEvents: 'none',
        }}
      />
      <span
        style={{
          fontSize: 'clamp(0.5rem, 1.6vw, 0.65rem)',
          fontWeight: 900,
          fontFamily: FONT,
          color: '#7a5000',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        $1
      </span>
    </div>
  );
}

export default function SuccessScreen({ visible, gameName, learnedText, learnedSentence = null, onPlayAgain, onBack, savedCoins = null, boughtItems = null, boughtLabel = 'You bought', onFeedback, showShare = false, gameId = null, featuredContent = null }) {
  const [confettiActive, setConfettiActive] = useState(false);
  const [savingsConfetti, setSavingsConfetti] = useState(false);
  const nav = useNavigate();
  const { muted, toggleMute } = useSoundManager();
  const { isDemo } = useDemo();

  useEffect(() => {
    injectKeyframes();
  }, []);

  useEffect(() => {
    if (visible) {
      setConfettiActive(true);
      if (savedCoins > 0) setSavingsConfetti(true);
      playSuccessChime();
    } else {
      setConfettiActive(false);
      setSavingsConfetti(false);
    }
  }, [visible, savedCoins]);

  if (!visible) return null;

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 400,
    // Reserve space at the top for the BetaBanner so the in-screen
    // header (logo + game name) is never tucked under the sticky banner
    // on any page or device.
    paddingTop: 'var(--app-banner-h, 0px)',
    boxSizing: 'border-box',
    background: 'var(--game-bg)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden',
    animation: 'successZoomIn 0.35s ease-out forwards',
  };

  const emojiStyle = {
    fontSize: '3rem',
    animation: 'emojiBounce 2s ease-in-out infinite',
    flexShrink: 0,
  };

  const headingStyle = {
    fontFamily: FONT,
    fontWeight: 900,
    fontSize: '1.8rem',
    color: 'var(--game-text)',
    flexShrink: 0,
  };

  const subheadingStyle = {
    fontFamily: FONT,
    fontWeight: 600,
    fontSize: '1rem',
    color: '#2D2A26',
    textAlign: 'center',
    maxWidth: '280px',
    marginBottom: 2,
    lineHeight: 1.4,
    flexShrink: 0,
  };

  const btnContainerStyle = {
    marginTop: 6,
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    maxWidth: '360px',
    flexShrink: 0,
  };

  const btnBase = {
    borderRadius: '9999px',
    padding: '12px 0',
    fontFamily: FONT,
    fontWeight: 700,
    fontSize: '0.78rem',
    border: 'none',
    cursor: 'pointer',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  };

  const primaryBtnStyle = {
    ...btnBase,
    background: 'var(--game-primary)',
    color: '#FFFFFF',
    fontWeight: 800,
  };

  const secondaryBtnStyle = {
    ...btnBase,
    background: 'color-mix(in srgb, var(--game-primary) 12%, transparent)',
    color: 'var(--game-primary)',
  };

  const homeBtnStyle = {
    ...btnBase,
    background: 'color-mix(in srgb, var(--game-text) 8%, transparent)',
    color: 'var(--game-text)',
    fontWeight: 700,
    fontSize: '0.85rem',
    padding: '14px 0',
  };

  // ── Demo / sampler mode ──────────────────────────────────────────────
  // Finishing a trial game must NOT drop the player into the full game
  // success screen. Instead we celebrate briefly and pivot straight to an
  // "unlock more games" call to action.
  if (isDemo) {
    const demoGame = GAMES.find(g => g.id === gameId);
    const DemoIllust = demoGame ? ILLUSTRATIONS[demoGame.illustrationKey] : null;
    return (
      // Absolute (not fixed) so the trial success screen stays contained
      // inside the iPad mockup on the landing page rather than covering the
      // whole viewport.
      <div style={{ ...overlayStyle, position: 'absolute', paddingTop: 0 }}>
        <div style={{ maxWidth: `${PAGE_MAX_WIDTH}px`, margin: '0 auto', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 24px', gap: 12, position: 'relative', textAlign: 'center' }}>
          <Confetti active={confettiActive} onComplete={() => setConfettiActive(false)} />
          {DemoIllust
            ? <div style={{ width: 92, height: 92, flexShrink: 0 }}><DemoIllust /></div>
            : <div style={emojiStyle}>🎉</div>}
          <div style={headingStyle}>
            <span style={{ color: '#2D2A26' }}>You </span>
            <span style={{ color: 'var(--game-primary)' }}>did it!</span>
          </div>
          <p style={{ ...subheadingStyle, maxWidth: 340, fontWeight: 700 }}>
            That&apos;s just a taste. Unlock every game and keep the real-world adventures going.
          </p>
          <button
            style={{ ...primaryBtnStyle, flex: '0 0 auto', width: '100%', maxWidth: 340, padding: '16px 0', fontSize: '1rem', background: colors.lime, color: '#1A1A1A', gap: 8 }}
            onClick={() => { trackSuccessClick('demo_unlock', gameId); nav('/checkout'); }}
          >
            <span>🔓</span><span>Unlock all games</span>
          </button>
          <button
            style={{ ...btnBase, flex: '0 0 auto', width: '100%', maxWidth: 340, padding: '14px 0', fontSize: '0.95rem', background: 'color-mix(in srgb, var(--game-primary) 12%, transparent)', color: 'var(--game-primary)' }}
            onClick={() => { trackSuccessClick('play_again', gameId); onPlayAgain(); }}
          >
            <span>🔄</span><span>Play again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <div style={{ maxWidth: `${PAGE_MAX_WIDTH}px`, margin: '0 auto', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header bar — identical to GameShell */}
      <div style={{ padding: '8px 16px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DiditLogo height={28} />
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: '0.9rem', color: 'var(--game-primary)', whiteSpace: 'nowrap' }}>{gameName}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => { trackSuccessClick('home_icon', gameId); nav('/hub'); }} aria-label="Games hub" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.06)', border: 'none', color: 'var(--game-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </button>
            <button onClick={toggleMute} aria-label="Toggle sound" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.06)', border: 'none', color: 'var(--game-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>
              {muted
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              }
            </button>
          </div>
        </div>
      </div>
      {/* Content area — centered */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 20px env(safe-area-inset-bottom, 16px)', gap: 14, position: 'relative' }}>
      {/* Floating dots */}
      <div style={{ position: 'absolute', width: 12, height: 12, borderRadius: '50%', background: 'var(--game-accent)', top: '8%', left: '8%', opacity: 0.4, pointerEvents: 'none', animation: 'coinFloat 8s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: 'var(--game-primary)', top: '15%', right: '10%', opacity: 0.35, pointerEvents: 'none', animation: 'coinFloat 11s ease-in-out infinite', animationDelay: '1s' }} />
      <div style={{ position: 'absolute', width: 10, height: 10, borderRadius: '50%', background: 'var(--game-warm)', bottom: '20%', left: '12%', opacity: 0.4, pointerEvents: 'none', animation: 'coinFloat 9s ease-in-out infinite', animationDelay: '2s' }} />
      <div style={{ position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: 'var(--game-accent)', bottom: '15%', right: '8%', opacity: 0.35, pointerEvents: 'none', animation: 'coinFloat 13s ease-in-out infinite', animationDelay: '3s' }} />
      <div style={{ position: 'absolute', width: 10, height: 10, borderRadius: '50%', background: 'var(--game-warm)', top: '45%', left: '5%', opacity: 0.3, pointerEvents: 'none', animation: 'coinFloat 10s ease-in-out infinite', animationDelay: '4s' }} />
      <div style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: 'var(--game-primary)', top: '55%', right: '6%', opacity: 0.35, pointerEvents: 'none', animation: 'coinFloat 12s ease-in-out infinite', animationDelay: '1.5s' }} />
      <Confetti active={confettiActive} onComplete={() => setConfettiActive(false)} />
      <Confetti active={savingsConfetti} originX={50} originY={30} onComplete={() => setSavingsConfetti(false)} />
      {(() => {
        const game = GAMES.find(g => g.id === gameId);
        const Illust = game ? ILLUSTRATIONS[game.illustrationKey] : null;
        return Illust
          ? <div style={{ width: 100, height: 100, flexShrink: 0 }}><Illust /></div>
          : <div style={emojiStyle}>🎉</div>;
      })()}
      <div style={headingStyle}><span style={{ color: '#2D2A26' }}>You </span><span style={{ color: 'var(--game-primary)', position: 'relative', display: 'inline-block' }}>did it!<svg viewBox="0 0 200 12" preserveAspectRatio="none" style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: 'calc(100% + 8px)', height: '12px', overflow: 'visible', pointerEvents: 'none', transform: 'rotate(-2deg)', transformOrigin: 'left center' }}><path d="M2,9 C8,3 15,13 25,7 C35,1 42,12 55,5 C65,0 72,11 85,6 C95,2 100,13 112,7 C122,3 128,14 140,8 C150,4 155,12 168,6 C178,2 185,11 198,7" fill="none" stroke="var(--game-warm)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg></span></div>
      <div style={subheadingStyle}>{(() => {
        if (learnedSentence) return learnedSentence;
        if (!learnedText) return null;
        const items = learnedText.split(',').map(s => s.trim()).filter(Boolean);
        let sentence;
        if (items.length === 1) sentence = items[0];
        else if (items.length === 2) sentence = `${items[0]} and ${items[1]}`;
        else sentence = `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
        return `You've learnt about ${sentence}.`;
      })()}</div>

      {/* Optional featured content slot (e.g. artwork recap) */}
      {featuredContent}

      {/* Savings — light coloured box */}
      {savedCoins > 0 && (
        <div style={{
          background: 'color-mix(in srgb, var(--game-primary) 8%, transparent)',
          borderRadius: 20,
          padding: '16px 20px',
          width: 'calc(100% - 32px)',
          maxWidth: '320px',
          margin: '0 auto',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'var(--game-primary)',
            letterSpacing: '0.08em',
            fontFamily: FONT,
          }}>
            You saved
          </span>
          <span style={{
            fontSize: '2.2rem',
            fontWeight: 900,
            color: 'var(--game-primary)',
            fontFamily: FONT,
            lineHeight: 1,
          }}>
            {`$${savedCoins}`}
          </span>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 4,
            maxWidth: savedCoins >= 5 ? '176px' : '100%',
            margin: '2px auto 0',
          }}>
            {Array.from({ length: savedCoins }, (_, i) =>
              <SuccessCoin key={i} floatDelay={i * 0.12} />
            )}
          </div>
        </div>
      )}

      {/* Bought items — grouped in background box */}
      {boughtItems != null && boughtItems.length > 0 && (
        <div style={{
          background: 'color-mix(in srgb, var(--game-primary) 8%, transparent)',
          borderRadius: 20,
          padding: '16px 20px',
          width: 'calc(100% - 32px)',
          maxWidth: '320px',
          margin: '0 auto',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'var(--game-primary)',
            textAlign: 'center',
            fontFamily: FONT,
          }}>
            {boughtLabel}
          </div>
          {(() => {
            const n = boughtItems.length;
            // Pick a column count for the *full* rows. Partial last rows
            // stay centered automatically because we use flex-wrap rather
            // than padding with empty cells.
            const cols = n <= 3 ? n : n === 4 ? 2 : 3;
            const itemBasis = `calc(${100 / cols}% - ${(12 * (cols - 1)) / cols}px)`;
            return (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 12,
                width: '100%',
              }}>
                {boughtItems.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      flexBasis: itemBasis,
                      maxWidth: itemBasis,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: '2rem', lineHeight: 1 }}>
                      {item.node ? item.node : item.emoji}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--game-primary)',
                      fontFamily: FONT,
                      textAlign: 'center',
                    }}>
                      {item.name}
                    </span>
                    {item.description && (
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 500,
                        color: 'var(--game-text-muted, #2D2A26)',
                        opacity: 0.75,
                        fontFamily: FONT,
                        textAlign: 'center',
                        lineHeight: 1.3,
                      }}>
                        {item.description}
                      </span>
                    )}
                    {item.price != null && (
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#2D2A26',
                        fontFamily: FONT,
                      }}>
                        {`$${item.price}`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Buttons (demo mode is handled by the early return above) ── */}
      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: '360px', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
          <button style={primaryBtnStyle} onClick={() => { trackSuccessClick('play_again', gameId); onPlayAgain(); }}>
            <span>🔄</span><span>Play again</span>
          </button>
          <button style={secondaryBtnStyle} onClick={() => {
            trackSuccessClick('another_game', gameId);
            const others = GAMES.filter(g => g.path !== window.location.pathname.replace('/play', ''));
            const pick = others[Math.floor(Math.random() * others.length)];
            nav(pick.path);
          }}>
            <span>🎲</span><span>Another game</span>
          </button>
        </div>
        <button style={homeBtnStyle} onClick={() => { trackSuccessClick('back_to_hub', gameId); (onBack || (() => nav('/hub')))(); }}>
          <span>🏠</span><span>Back to Hub</span>
        </button>
      </div>

      {/* Share + Feedback — subtle text links */}
      {(showShare || onFeedback) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, flexShrink: 0 }}>
          {showShare && (
            <ShareButton
              gameId={gameId}
              label="Share with a friend"
              style={{
                background: 'none', border: 'none', padding: 0,
                fontFamily: FONT, fontWeight: 600, fontSize: '0.72rem',
                color: 'var(--game-text-muted)', cursor: 'pointer',
                textDecoration: 'underline', textDecorationStyle: 'dashed',
                textUnderlineOffset: '3px',
              }}
            />
          )}
          {showShare && onFeedback && (
            <span style={{ color: 'var(--game-text-muted)', opacity: 0.4, fontSize: '0.72rem', userSelect: 'none' }}>•</span>
          )}
          {onFeedback && (
            <button
              onClick={onFeedback}
              style={{
                background: 'none', border: 'none', padding: 0,
                fontFamily: FONT, fontWeight: 600, fontSize: '0.72rem',
                color: 'var(--game-text-muted)', cursor: 'pointer',
                textDecoration: 'underline', textDecorationStyle: 'dashed',
                textUnderlineOffset: '3px',
              }}
            >
              Share feedback
            </button>
          )}
        </div>
      )}
      </div>
      </div>
    </div>
  );
}
