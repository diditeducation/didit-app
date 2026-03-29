import { useState, useEffect } from 'react';
import Confetti from './Confetti';
import ShareButton from './ShareButton';

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

function playSuccessChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
  } catch (e) {
    // Web Audio not supported, fail silently
  }
}

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = keyframesCSS;
  document.head.appendChild(style);
}

const FONT = "'Nunito', sans-serif";

/* Pixel-perfect copy of ShopGame Coin (wallet variant, 32px) */
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
      {/* Highlight oval */}
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
      {/* Label */}
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

function EmptySlot() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: '2px dashed rgba(255,255,255,0.15)',
        background: 'transparent',
        flexShrink: 0,
      }}
    />
  );
}

export default function SuccessScreen({ visible, gameName, learnedText, onPlayAgain, onBack, savedCoins = null, boughtItems = null, boughtLabel = 'You bought', onFeedback, showShare = false }) {
  const [confettiActive, setConfettiActive] = useState(false);
  const [savingsConfetti, setSavingsConfetti] = useState(false);

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
    background: 'var(--game-bg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '24px 20px env(safe-area-inset-bottom, 16px)',
    gap: 14,
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
    maxWidth: '320px',
    flexShrink: 0,
  };

  const primaryBtnStyle = {
    background: 'var(--game-primary)',
    color: '#FFFFFF',
    borderRadius: '9999px',
    padding: '14px 0',
    flex: 1,
    fontFamily: FONT,
    fontWeight: 800,
    fontSize: '0.85rem',
    boxShadow: 'none',
    border: 'none',
    cursor: 'pointer',
  };

  const ghostBtnStyle = {
    background: 'transparent',
    color: 'var(--game-text-muted)',
    borderRadius: '9999px',
    padding: '12px 0',
    flex: 1,
    fontFamily: FONT,
    fontWeight: 700,
    fontSize: '0.85rem',
    border: '1.5px solid color-mix(in srgb, var(--game-text-muted) 30%, transparent)',
    cursor: 'pointer',
  };

  return (
    <div style={overlayStyle}>
      <style>{`
        @keyframes coinFloat {
          0%   { transform: translateY(0px) rotate(0deg); }
          50%  { transform: translateY(-4px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `}</style>
      {/* Floating dots */}
      <div style={{ position: 'absolute', width: 12, height: 12, borderRadius: '50%', background: 'var(--game-accent)', top: '8%', left: '8%', opacity: 0.4, pointerEvents: 'none', animation: 'coinFloat 8s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: 'var(--game-primary)', top: '15%', right: '10%', opacity: 0.35, pointerEvents: 'none', animation: 'coinFloat 11s ease-in-out infinite', animationDelay: '1s' }} />
      <div style={{ position: 'absolute', width: 10, height: 10, borderRadius: '50%', background: 'var(--game-warm)', bottom: '20%', left: '12%', opacity: 0.4, pointerEvents: 'none', animation: 'coinFloat 9s ease-in-out infinite', animationDelay: '2s' }} />
      <div style={{ position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: 'var(--game-accent)', bottom: '15%', right: '8%', opacity: 0.35, pointerEvents: 'none', animation: 'coinFloat 13s ease-in-out infinite', animationDelay: '3s' }} />
      <div style={{ position: 'absolute', width: 10, height: 10, borderRadius: '50%', background: 'var(--game-warm)', top: '45%', left: '5%', opacity: 0.3, pointerEvents: 'none', animation: 'coinFloat 10s ease-in-out infinite', animationDelay: '4s' }} />
      <div style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: 'var(--game-primary)', top: '55%', right: '6%', opacity: 0.35, pointerEvents: 'none', animation: 'coinFloat 12s ease-in-out infinite', animationDelay: '1.5s' }} />
      <Confetti active={confettiActive} onComplete={() => setConfettiActive(false)} />
      <Confetti active={savingsConfetti} originX={50} originY={30} onComplete={() => setSavingsConfetti(false)} />
      <div style={emojiStyle}>🎉</div>
      <div style={headingStyle}><span style={{ color: '#2D2A26' }}>You </span><span style={{ color: 'var(--game-primary)', position: 'relative', display: 'inline-block' }}>did it!<svg viewBox="0 0 200 12" preserveAspectRatio="none" style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: 'calc(100% + 8px)', height: '12px', overflow: 'visible', pointerEvents: 'none', transform: 'rotate(-2deg)', transformOrigin: 'left center' }}><path d="M2,9 C8,3 15,13 25,7 C35,1 42,12 55,5 C65,0 72,11 85,6 C95,2 100,13 112,7 C122,3 128,14 140,8 C150,4 155,12 168,6 C178,2 185,11 198,7" fill="none" stroke="var(--game-warm)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg></span></div>
      <div style={subheadingStyle}>You've learnt about {learnedText} 🌟</div>

      {/* Savings box — only when savedCoins > 0 */}
      {savedCoins > 0 && (
        <div style={{
          background: 'color-mix(in srgb, var(--game-text) 6%, transparent)',
          borderRadius: 16,
          border: '1.5px solid rgba(255,255,255,0.25)',
          padding: '10px 16px',
          width: 'calc(100% - 32px)',
          maxWidth: '320px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}>
          {/* Label + Amount on one row */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
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
          </div>
          {/* Coin flex grid — max 5 per row, centered */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '4px',
            maxWidth: savedCoins >= 5 ? '176px' : '100%',
            margin: '2px auto 0',
          }}>
            {Array.from({ length: savedCoins }, (_, i) =>
              <SuccessCoin key={i} floatDelay={i * 0.12} />
            )}
          </div>
        </div>
      )}

      {/* Bought items box — only when boughtItems has items */}
      {boughtItems != null && boughtItems.length > 0 && (
        <div
          style={{
            background: 'color-mix(in srgb, var(--game-text) 6%, transparent)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            borderRadius: 16,
            padding: '8px 12px',
            width: 'calc(100% - 32px)',
            maxWidth: '320px',
            margin: '0 auto',
            boxSizing: 'border-box',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--game-primary)',
              textAlign: 'center',
              marginBottom: 8,
              fontFamily: FONT,
            }}
          >
            {boughtLabel}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
            }}
          >
            {boughtItems.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 16,
                  minWidth: 0,
                }}
              >
                <span style={{ fontSize: '2.4rem', lineHeight: 1 }}>{item.emoji}</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--game-primary)',
                    fontFamily: FONT,
                  }}
                >
                  {item.name}
                </span>
                {item.price != null && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#2D2A26',
                      fontFamily: FONT,
                    }}
                  >
                    {`$${item.price}`}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={btnContainerStyle}>
        <button style={primaryBtnStyle} onClick={onPlayAgain}>
          Play again 🔄
        </button>
        <button style={ghostBtnStyle} onClick={onBack}>
          ← Other games
        </button>
      </div>

      {/* Share + Feedback — subtle text links */}
      {(showShare || onFeedback) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, flexShrink: 0 }}>
          {showShare && (
            <ShareButton
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
  );
}
