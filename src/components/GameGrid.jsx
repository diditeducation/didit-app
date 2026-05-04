import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackFilterSelect, trackLandingClick } from '../analytics';
import { playWelcomeChime } from '../design-system/sharedSounds';
import { colors, fonts, radii, shadows } from '../design-system/tokens';
import { CATEGORIES } from '../data/games';
import WishModal from './WishModal';
import {
  ShopperIllustration,
  DJIllustration,
  EngineerIllustration,
  ChefIllustration,
  PianistIllustration,
  CoderIllustration,
  ChemistIllustration,
  AstronomerIllustration,
  AnalystIllustration,
  MatisseIllustration,
  TraderIllustration,
  ConsultantIllustration,
} from '../pages/GameIllustrations';

const GAME_ILLUSTRATIONS = {
  shopper:    ShopperIllustration,
  mixer:      DJIllustration,
  engineer:   EngineerIllustration,
  chef:       ChefIllustration,
  dj:         PianistIllustration,
  coder:      CoderIllustration,
  chemist:    ChemistIllustration,
  astronomer: AstronomerIllustration,
  pie:        AnalystIllustration,
  matisse:    MatisseIllustration,
  trader:     TraderIllustration,
  consultant: ConsultantIllustration,
};

const cardCss = `
.gg-card{display:flex;flex-direction:column;overflow:visible;transition:transform .2s ease;cursor:pointer;background:white;position:relative;border-radius:16px;border:1px solid ${colors.border};width:100%}
.gg-card:hover{transform:translateY(-4px)}
.gg-arch-header{position:relative;height:160px;border-radius:16px 16px 0 0;overflow:hidden;background-size:cover;background-position:center;flex-shrink:0}
.gg-arch-header::after{content:'';position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:160%;height:64px;background:white;border-radius:50% 50% 0 0}
.gg-arch-circle{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);width:110px;height:110px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;z-index:2}
.gg-arch-circle svg{width:90px;height:90px;display:block}
.gg-body{padding:12px 16px 18px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;flex:1}
.gg-title{font-family:'Nunito',sans-serif;font-weight:900;font-size:1.35rem;margin:-10px 0 0;letter-spacing:-0.02em;white-space:nowrap}
.gg-tag{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:9999px;font-family:'Nunito',sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.02em;white-space:nowrap}
.gg-desc{font-size:0.78rem;color:#2D2A26;line-height:1.5;margin:0;font-family:'Nunito',sans-serif}

.gg-play-btn{padding:10px 28px;border-radius:9999px;border:none;font-family:'Nunito',sans-serif;font-size:0.85rem;font-weight:800;cursor:pointer;transition:all .25s;color:#fff;margin-top:auto;width:100%}
.gg-play-btn:hover{filter:brightness(1.1)}
.gg-pills::-webkit-scrollbar{display:none}

/* Gentle floating motion for the emoji on the wish + surprise cards.
   Random per-mount animation-delay (set inline) staggers them so they
   don't bob in lockstep. */
@keyframes diditEmojiFloat {
  0%   { transform: translateY(0)    rotate(0deg)   scale(1); }
  20%  { transform: translateY(-10px) rotate(-8deg)  scale(1.12); }
  45%  { transform: translateY(-4px)  rotate(4deg)   scale(0.95); }
  65%  { transform: translateY(-12px) rotate(-5deg)  scale(1.08); }
  85%  { transform: translateY(-2px)  rotate(6deg)   scale(1.03); }
  100% { transform: translateY(0)    rotate(0deg)   scale(1); }
}
.didit-emoji-float {
  display: inline-block;
  animation: diditEmojiFloat 2.6s ease-in-out infinite;
  will-change: transform;
}
/* Pill wand: smaller, gentler variant so it doesn't dominate the filter strip */
@keyframes diditWandFloat {
  0%,100% { transform: translateY(0)   rotate(0deg); }
  30%     { transform: translateY(-4px) rotate(-10deg); }
  70%     { transform: translateY(-2px) rotate(8deg); }
}
.didit-wand-float {
  display: inline-block;
  animation: diditWandFloat 2.2s ease-in-out infinite;
  will-change: transform;
}
`;

/**
 * Wish card — always pinned at the end of the games grid (regardless
 * of category filter). Visual mirror of SurpriseCard but in coral red
 * with a magic-wand emoji. Tapping opens the WishModal so parents can
 * submit a profession or skill they'd like a Did·It game built around.
 */
function WishCard({ onClick }) {
  // Random delay so the floating emoji doesn't sync with the surprise
  // card's emoji — feels organic.
  const emojiDelay = (Math.random() * 2).toFixed(1);
  return (
    <div
      className="gg-card"
      onClick={onClick}
      style={{
        cursor: 'pointer',
        background: colors.coralDark,
        // Same textured tile that the red game cards (and SurpriseCard's
        // yellow tile) use, then enlarged 130 % so the pattern reads
        // as a hero motif on these stand-out cards.
        backgroundImage: `url('/backgrounds/background-red.png')`,
        backgroundSize: '312px',
        backgroundRepeat: 'repeat',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        gap: 10,
        textAlign: 'center',
        minHeight: 280,
      }}
    >
      <span
        className="didit-emoji-float"
        style={{
          fontSize: 64,
          lineHeight: 1,
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.18))',
          animationDelay: `${emojiDelay}s`,
        }}
      >
        🪄
      </span>

      <div style={{
        fontSize: '1.4rem',
        fontWeight: 900,
        color: '#FFFFFF',
        fontFamily: fonts.display,
        letterSpacing: '-0.02em',
        marginTop: 4,
      }}>
        Submit a wish
      </div>

      <div style={{
        fontSize: '0.8rem',
        color: 'rgba(255,255,255,0.92)',
        fontFamily: fonts.display,
        fontWeight: 600,
        lineHeight: 1.5,
        maxWidth: 200,
      }}>
        We&apos;ll build a game from your idea.
      </div>

      <button
        style={{
          marginTop: 8,
          padding: '11px 28px',
          borderRadius: 9999,
          border: 'none',
          background: '#FFFFFF',
          color: colors.coralDark,
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: '0.9rem',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
          letterSpacing: '-0.01em',
        }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        Make a wish →
      </button>
    </div>
  );
}

function SurpriseCard({ onSurprise, onRandomPlay }) {
  // Per-mount random delay so the surprise + wish emojis float on
  // different phases — neither card looks mechanically synced.
  const emojiDelay = (Math.random() * 2).toFixed(1);
  return (
    <div
      className="gg-card"
      onClick={onRandomPlay}
      style={{
        cursor: 'pointer',
        background: colors.sunMid,
        // Pattern enlarged 130 % so the textured tile reads as a hero
        // motif on these stand-out cards.
        backgroundImage: `url('/backgrounds/background-yellow.png')`,
        backgroundSize: '312px',
        backgroundRepeat: 'repeat',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        gap: 10,
        textAlign: 'center',
        minHeight: 280,
      }}
    >
      <span
        className="didit-emoji-float"
        style={{
          fontSize: 64,
          lineHeight: 1,
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
          animationDelay: `${emojiDelay}s`,
        }}
      >
        🎲
      </span>

      <div style={{
        fontSize: '1.5rem',
        fontWeight: 900,
        color: colors.coralDark,
        fontFamily: fonts.display,
        letterSpacing: '-0.02em',
        marginTop: 4,
      }}>
        Can't pick?
      </div>

      <div style={{
        fontSize: '0.8rem',
        color: colors.coralDark,
        fontFamily: fonts.display,
        fontWeight: 600,
        lineHeight: 1.5,
        maxWidth: 190,
      }}>
        We'll pick a random game for you!
      </div>

      <button
        style={{
          marginTop: 8,
          padding: '11px 28px',
          borderRadius: 9999,
          border: 'none',
          background: 'white',
          color: colors.sunDark,
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: '0.9rem',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          letterSpacing: '-0.01em',
        }}
        onClick={e => { e.stopPropagation(); onRandomPlay(); }}
      >
        Let's go! →
      </button>

    </div>
  );
}

export default function GameGrid({ games, todayId, onNavigate, onSurprise }) {
  const [filter, setFilter] = useState('All');
  const [wishOpen, setWishOpen] = useState(false);

  // ── Seeded PRNG (mulberry32) ──────────────────────────────────────────────
  // Returns a deterministic pseudo-random number generator seeded by an integer.
  function seededRng(seed) {
    let s = seed >>> 0;
    return () => {
      s += 0x6D2B79F5;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Produce an integer seed from today's date (YYYYMMDD) so the order is
  // stable for all users all day but changes each new calendar day.
  function todaySeed() {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  }

  // Shuffle daily (stable within a day), then reorder so no two adjacent
  // cards share a color. In a 2-col grid, "adjacent" means i±1 (same row)
  // and i±2 (column neighbour).
  const shuffled = useMemo(() => {
    const rng = seededRng(todaySeed());
    // 1. Fisher-Yates shuffle with seeded rng
    const arr = [...games];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // 2. Greedy reorder: pick next card that avoids the last 2 colors placed
    const result = [];
    const pool = [...arr];
    while (pool.length > 0) {
      const c1 = result.length >= 1 ? result[result.length - 1].color : null;
      const c2 = result.length >= 2 ? result[result.length - 2].color : null;
      let idx = pool.findIndex(g => g.color !== c1 && g.color !== c2);
      if (idx === -1) idx = 0; // fallback if no non-conflicting card exists
      result.push(pool.splice(idx, 1)[0]);
    }
    return result;
  }, [games]);

  const filtered = filter === 'All'
    ? shuffled
    : shuffled.filter(g => g.category === filter);

  return (
    <div>
      <style>{cardCss}</style>

      {/* Header row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <span style={{
          fontSize: 18,
          fontWeight: 900,
          color: colors.text,
          fontFamily: fonts.display,
          letterSpacing: '-0.01em',
        }}>
          All games
        </span>
      </div>

      {/* Filter pills — horizontal scroll */}
      <div className="gg-pills" style={{
        display: 'flex',
        gap: 8,
        overflowX: 'scroll',
        paddingBottom: 6,
        marginBottom: 14,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setFilter(cat); if (cat !== 'All') trackFilterSelect(cat); }}
            style={{
              flexShrink: 0,
              padding: '7px 16px',
              borderRadius: radii.pill,
              border: 'none',
              background: filter === cat ? colors.text : 'white',
              color: filter === cat ? 'white' : colors.text,
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'background 0.18s ease, color 0.18s ease',
              boxShadow: shadows.sm,
            }}
          >
            {cat}
          </button>
        ))}

        {/* Wish pill — same treatment as the category pills so it
            reads as a peer action, not a greyed-out afterthought.
            Only the wand emoji gets animated. */}
        <button
          onClick={() => { setWishOpen(true); trackLandingClick('wish-card'); }}
          style={{
            flexShrink: 0,
            padding: '7px 16px',
            borderRadius: radii.pill,
            border: 'none',
            background: 'white',
            color: colors.text,
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'background 0.18s ease, color 0.18s ease',
            boxShadow: shadows.sm,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap',
          }}
        >
          <span aria-hidden="true" className="didit-wand-float">✨</span>
          Wish for a game
        </button>
      </div>

      {/* Cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 45%), 1fr))',
        gap: 20,
      }}>
        {(() => {
          const items = [];
          filtered.forEach((game, i) => {
            const Illustration = GAME_ILLUSTRATIONS[game.illustrationKey];
            items.push(
              <div
                key={game.id}
                className="gg-card"
                onClick={() => { playWelcomeChime(); onNavigate(game.path); }}
              >
                {/* Today badge */}
                {game.id === todayId && (
                  <div style={{
                    position: 'absolute',
                    top: 8, right: 8, zIndex: 10,
                    background: 'rgba(255,255,255,0.92)',
                    borderRadius: radii.pill,
                    padding: '2px 10px',
                    fontSize: 10, fontWeight: 800,
                    color: game.colorDark,
                    fontFamily: fonts.display,
                    letterSpacing: '0.02em',
                  }}>
                    Today
                  </div>
                )}
                {/* Arch header */}
                <div
                  className="gg-arch-header"
                  style={{
                    background: game.color,
                    backgroundImage: game.bgImage ? `url('${game.bgImage}')` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="gg-arch-circle">
                    {Illustration ? <Illustration /> : null}
                  </div>
                </div>
                {/* Body */}
                <div className="gg-body">
                  <div className="gg-title" style={{ color: game.colorDark }}>{game.title}</div>
                  <div className="gg-tag" style={{ background: game.colorLight, color: game.colorDark }}>{game.tag}</div>
                  <div className="gg-desc">{game.desc}</div>
                  <button
                    className="gg-play-btn"
                    style={{ background: game.colorDark }}
                    onClick={e => { e.stopPropagation(); playWelcomeChime(); onNavigate(game.path); }}
                  >
                    Play →
                  </button>
                </div>
              </div>
            );

            // SurpriseCard sits one row higher than before — after the
            // 4th game card it lands as slot 5 in a 2-col grid (was
            // slot 7).
            if (onSurprise && filter === 'All' && i === 3) {
              const randomGame = games[Math.floor(Math.random() * games.length)];
              items.push(
                <SurpriseCard
                  key="surprise-mid"
                  onSurprise={onSurprise}
                  onRandomPlay={() => { trackLandingClick('surprise-card'); onNavigate(randomGame.path); }}
                />
              );
            }

            // WishCard sits two rows higher than before — after the
            // 10th game card it lands as slot 11 (was slot 15 / end).
            if (filter === 'All' && i === 9) {
              items.push(
                <WishCard
                  key="wish-mid"
                  onClick={() => { setWishOpen(true); trackLandingClick('wish-card'); }}
                />
              );
            }
          });

          // Fallbacks for category filters with shorter game lists —
          // both helpers still appear, just at the end.
          if (onSurprise && filter === 'All' && filtered.length < 4) {
            const randomGame = games[Math.floor(Math.random() * games.length)];
            items.push(
              <SurpriseCard
                key="surprise-end"
                onSurprise={onSurprise}
                onRandomPlay={() => onNavigate(randomGame.path)}
              />
            );
          }
          if (filter !== 'All' || filtered.length < 10) {
            items.push(
              <WishCard key="wish-end" onClick={() => setWishOpen(true)} />
            );
          }

          return items;
        })()}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '48px 20px',
            color: colors.muted,
            fontFamily: fonts.display,
            fontSize: 14,
            fontWeight: 600,
          }}>
            No {filter} games yet — coming soon!
          </div>
        )}
      </div>

      <WishModal isOpen={wishOpen} onClose={() => setWishOpen(false)} />
    </div>
  );
}
