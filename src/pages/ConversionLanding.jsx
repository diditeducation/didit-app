import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAMES } from '../data/games';
import { TRIAL_GAME_IDS } from '../data/trialGames';
import { trackPageView, trackLandingClick } from '../analytics';
import { DemoContext } from '../context/DemoContext';
import DiditLogo from '../components/DiditLogo';

// The 3 free games, lazy-loaded so they only download when actually played
// inline. Rendered in an overlay over the landing — no route change.
const DEMO_GAMES = {
  'little-shopper': lazy(() => import('../games/little-shopper/Game')),
  'little-engineer': lazy(() => import('../games/little-engineer/Game')),
  'little-dj': lazy(() => import('../games/little-dj/Game')),
};
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
} from './GameIllustrations';

const PRICE = '$15';

// Concept lifestyle photos (text baked into each image). Each flips on tap to
// reveal the game it points to and a short write-up of what it builds.
// NOTE: ordered so the grid leads with images that are NOT in the hero
// collage (1/Shopper, 4/Analyst, 6/Astronaut) — avoids a repeated photo
// directly under the hero.
const CONCEPTS = [
  {
    src: '/concepts/1.jpg?v=4',
    game: 'Little Shopper',
    concept: 'budgeting',
    text: "Coins in, coins out — they earn, weigh what things cost, and decide what's worth buying. The very first taste of saving, long before pocket money arrives.",
  },
  {
    src: '/concepts/2.jpg?v=4',
    game: 'Little Coder',
    concept: 'sequencing commands',
    text: 'They can chain simple commands to guide a character to a goal, and they see how the commands execute.',
  },
  {
    src: '/concepts/3.jpg?v=4',
    game: 'Little Consultant',
    concept: 'structured thinking',
    text: 'It starts with sorting blocks by colour, then by shape, then by pattern — learning to categorise, a precursor to problem solving.',
  },
  {
    src: '/concepts/4.jpg?v=4',
    game: 'Little DJ',
    concept: 'pattern recognition',
    text: 'Tap a cell, hear it loop — stacking beats into a groove is structure and repetition in disguise, the same sense that sits at the root of maths.',
  },
  {
    src: '/concepts/5.jpg?v=4',
    game: 'Little Astronaut',
    concept: 'spatial reasoning',
    text: 'Connecting stars into constellations helps them recognise and memorise shapes, the quiet foundation for geometry.',
  },
  {
    src: '/concepts/6.jpg?v=4',
    game: 'Little Matisse',
    concept: 'composition',
    text: 'A blank canvas and total freedom encourages them to place shapes, pull together something beautiful, and gain confidence in their creativity.',
  },
];

// Same illustration map the hub (GameGrid) uses, so the cards are identical.
const GAME_ILLUSTRATIONS = {
  shopper: ShopperIllustration,
  mixer: DJIllustration,
  engineer: EngineerIllustration,
  chef: ChefIllustration,
  dj: PianistIllustration,
  coder: CoderIllustration,
  chemist: ChemistIllustration,
  astronomer: AstronomerIllustration,
  pie: AnalystIllustration,
  matisse: MatisseIllustration,
  trader: TraderIllustration,
  consultant: ConsultantIllustration,
};

// Wavy underline that tiles at a fixed wavelength + stroke thickness, so it
// looks identical under any word width (no stretch/squash).
function Squiggle({ children }) {
  return <span className="lp-squiggle">{children}</span>;
}

// Concept photo that flips on tap to reveal its game + a short write-up.
function ConceptCard({ src, game, concept, text, nudge }) {
  const g = GAMES.find((x) => x.title === game);
  const [flipped, setFlipped] = useState(false);
  const [touched, setTouched] = useState(false);
  const toggle = () => { setTouched(true); setFlipped((f) => !f); };
  return (
    <div
      className={`lp-concept${flipped ? ' flipped' : ''}${nudge && !touched ? ' nudge' : ''}`}
      onClick={toggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
    >
      <div className="lp-concept-inner">
        <div className="lp-concept-face lp-concept-front">
          <img src={src} alt="" loading="lazy" />
          <span className="lp-concept-flip" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></svg>
          </span>
        </div>
        <div className="lp-concept-face lp-concept-back">
          <div className="lp-concept-game" style={{ color: g?.colorDark }}>{game}</div>
          {g && (
            <div className="lp-concept-skills">
              {g.skills.map((s) => (
                <span
                  key={s}
                  className="lp-concept-skill"
                  style={{ borderColor: g.colorLight, color: g.colorDark }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          <div className="lp-concept-sep" />
          <p className="lp-concept-text">
            We're introducing the concept of{' '}
            <strong className="lp-concept-keyword">{concept}</strong>. {text}
          </p>
        </div>
      </div>
    </div>
  );
}

// One card, two modes. Identical layout to the hub's gg-card — only the
// corner badge + bottom button change between free and members-only.
// Static fan of three game cards for the hero — purely visual.
const HERO_FAN_IDS = ['little-shopper', 'little-engineer', 'little-dj'];
function HeroFan() {
  return (
    <div className="lp-fan" aria-hidden="true">
      {HERO_FAN_IDS.map((id, i) => {
        const game = GAMES.find((g) => g.id === id);
        if (!game) return null;
        const Illustration = GAME_ILLUSTRATIONS[game.illustrationKey];
        return (
          <div key={id} className={`lp-fan-card lp-fan-${i}`}>
            <div
              className="lp-fan-arch"
              style={{
                background: game.color,
                backgroundImage: game.bgImage ? `url('${game.bgImage}')` : undefined,
              }}
            >
              <div className="lp-fan-circle">{Illustration ? <Illustration /> : null}</div>
            </div>
            <div className="lp-fan-title" style={{ color: game.colorDark }}>{game.title}</div>
          </div>
        );
      })}
    </div>
  );
}

// Jukebox: a controlled coverflow showing 3 cards. The PARENT owns the centred
// index so it can render a live preview of the centred game below. Click a side
// card / the arrows / swipe to spin a new game to the centre; click the centre
// card to fire onSelectCenter.
// Square game card for the "Try them!" grid: arch + illustration, title, and
// skill pills only (no description). Whole card is tappable.
function SquareGameCard({ game, locked, selected, onClick }) {
  const Illustration = GAME_ILLUSTRATIONS[game.illustrationKey];
  return (
    <button
      className={`lp-sq${locked ? ' is-locked' : ''}${selected ? ' is-selected' : ''}`}
      style={selected ? { borderColor: game.colorDark } : undefined}
      onClick={onClick}
      aria-pressed={selected}
      aria-label={locked ? `Preview ${game.title}` : `Play ${game.title}`}
    >
      <div
        className="lp-sq-arch"
        style={{
          background: game.color,
          backgroundImage: game.bgImage ? `url('${game.bgImage}')` : undefined,
        }}
      >
        <div className="lp-sq-circle">{Illustration ? <Illustration /> : null}</div>
        {locked && (
          <span className="lp-sq-lock" aria-hidden="true">🔒</span>
        )}
      </div>
      <div className="lp-sq-body">
        <div className="lp-sq-title" style={{ color: game.colorDark }}>{game.title}</div>
      </div>
      {locked && <span className="lp-sq-overlay" aria-hidden="true" />}
    </button>
  );
}

// Coverflow carousel for "Try them!": the selected game sits larger in the
// centre, neighbours shrink and fade to each side. Click a side card or use the
// arrows / swipe to bring it to the centre.
function GameCarousel({ games, selectedId, onSelect }) {
  const startX = useRef(null);
  const n = games.length;
  const index = Math.max(0, games.findIndex((g) => g.id === selectedId));
  const VISIBLE = 2; // centre + 2 on each side

  const go = (dir) => {
    const ni = (index + dir + n) % n;
    onSelect(games[ni]);
  };
  const onDown = (e) => { startX.current = e.clientX; };
  const onUp = (e) => {
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    startX.current = null;
  };

  return (
    <div className="lp-carousel">
      <button className="lp-carousel-arrow lp-carousel-prev" onClick={() => go(-1)} aria-label="Previous game">‹</button>
      <div
        className="lp-carousel-stage"
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerLeave={() => { startX.current = null; }}
      >
        {games.map((game, i) => {
          let o = i - index;
          if (o > n / 2) o -= n;
          if (o < -n / 2) o += n;
          const abs = Math.abs(o);
          if (abs > VISIBLE) return null;
          const sign = Math.sign(o);
          const x = sign * abs * 170; // evenly-stepped, overlapping jukebox spacing
          const scale = abs === 0 ? 1 : abs === 1 ? 0.82 : 0.66;
          const opacity = abs === 0 ? 1 : abs === 1 ? 1 : 0.5;
          const isCenter = o === 0;
          const free = TRIAL_GAME_IDS.includes(game.id);
          return (
            <div
              key={game.id}
              className="lp-carousel-slot"
              style={{
                transform: `translate(calc(-50% + ${x}px), -50%) scale(${scale})`,
                opacity,
                zIndex: 100 - abs,
                pointerEvents: 'auto',
              }}
            >
              <SquareGameCard
                game={game}
                locked={!free}
                selected={isCenter}
                onClick={() => onSelect(game)}
              />
            </div>
          );
        })}
      </div>
      <button className="lp-carousel-arrow lp-carousel-next" onClick={() => go(1)} aria-label="Next game">›</button>
    </div>
  );
}

export default function ConversionLanding() {
  const navigate = useNavigate();
  const [showStickyBar, setShowStickyBar] = useState(false);
  // Carousel order: free games first, arranged so Little Engineer is featured
  // (centre) with Little Shopper to its left and Little DJ to its right.
  const FEATURED_ORDER = ['little-shopper', 'little-engineer', 'little-dj'];
  // Paid games: surface Little Chemist and Little Analyst near the front.
  const PAID_PRIORITY = ['little-chemist', 'little-pie'];
  const paidGames = GAMES.filter((g) => !TRIAL_GAME_IDS.includes(g.id));
  const orderedPaidGames = [
    ...PAID_PRIORITY.map((id) => paidGames.find((g) => g.id === id)).filter(Boolean),
    ...paidGames.filter((g) => !PAID_PRIORITY.includes(g.id)),
  ];
  const orderedGames = [
    ...FEATURED_ORDER.map((id) => GAMES.find((g) => g.id === id)).filter(Boolean),
    ...orderedPaidGames,
  ];
  const [selectedId, setSelectedId] = useState('little-engineer');

  useEffect(() => { trackPageView('landing_v2'); }, []);

  useEffect(() => {
    const tried = sessionStorage.getItem('didit_tried_demo') === '1';
    const onScroll = () => setShowStickyBar(tried || window.scrollY > 520);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goCheckout = (where) => { trackLandingClick(where); navigate('/checkout'); };
  const selectGame = (game) => {
    setSelectedId(game.id);
    if (TRIAL_GAME_IDS.includes(game.id)) {
      trackLandingClick(`demo_play_${game.id}`);
      sessionStorage.setItem('didit_tried_demo', '1');
    } else {
      trackLandingClick(`grid_${game.id}`);
    }
  };

  const selectedGame = GAMES.find((g) => g.id === selectedId);
  const selectedFree = TRIAL_GAME_IDS.includes(selectedId);
  const PhoneGame = selectedFree ? DEMO_GAMES[selectedId] : null;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#FFFBF5;--surface:#fff;--border:#EDE5D8;--text:#2D2A26;--muted:#9A8F82;
  --lime:#D4DB4A;--blue:#3A6CE5;--coral:#CF4A4A;--sun:#E8B840;--grass:#2EA820;--gold:#E8B840;
}
.lp{font-family:'Nunito',sans-serif;background:var(--bg);color:var(--text);overflow-x:hidden;-webkit-font-smoothing:antialiased}
.lp-nav{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:16px 28px;background:rgba(255,251,245,0.9);backdrop-filter:blur(14px);border-bottom:1px solid rgba(0,0,0,0.04)}
.lp-login{position:absolute;right:28px;top:50%;transform:translateY(-50%);font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;color:var(--text);cursor:pointer;background:#fff;border:1px solid var(--border);border-radius:9999px;padding:8px 20px;box-shadow:0 1px 3px rgba(0,0,0,0.05);transition:background .15s ease,border-color .15s ease}
.lp-login:hover{background:#FBF6EE;border-color:#DFD4C2}

/* Hero — headline with floating dots + a wider, smaller subhead */
.lp-hero{position:relative;text-align:center;padding:56px 24px 8px;max-width:880px;margin:0 auto}
.lp-hero h1,.lp-hero-sub,.lp-hero-note,.lp-hero .lp-btn{position:relative;z-index:1}
.lp-hero h1{font-weight:900;font-size:clamp(30px,4.6vw,48px);line-height:1.08;letter-spacing:-0.02em;color:var(--text);margin-bottom:16px}
.lp-hero h1 .lp-kw{color:var(--blue)}
.lp-hero-sub{font-size:clamp(13.5px,1.55vw,16px);line-height:1.62;color:var(--text);max-width:680px;margin:0 auto 12px}
.lp-hero-sub em{font-style:normal;font-weight:900;color:var(--coral)}
.lp-hero-play{position:relative;z-index:1;font-size:clamp(17px,2.2vw,22px);font-weight:800;line-height:1.4;letter-spacing:-0.01em;color:var(--text);max-width:620px;margin:0 auto 8px}
/* Static fan of three game cards in the hero — purely decorative */
.lp-fan{position:relative;z-index:1;margin:8px auto 4px;display:flex;justify-content:center;align-items:flex-end;height:clamp(190px,26vw,236px);max-width:560px;pointer-events:none}
.lp-fan-card{position:relative;width:clamp(132px,18vw,168px);background:#fff;border:1px solid var(--border);border-radius:18px;box-shadow:0 16px 38px rgba(0,0,0,0.16);overflow:hidden;transform-origin:center bottom}
.lp-fan-0{transform:rotate(-9deg) translateX(28%) translateY(10px);z-index:1}
.lp-fan-1{transform:translateY(-14px) scale(1.06);z-index:3;position:relative}
.lp-fan-2{transform:rotate(9deg) translateX(-28%) translateY(10px);z-index:1}
.lp-fan-arch{position:relative;height:clamp(96px,13vw,126px);background-size:cover;background-position:center}
.lp-fan-circle{position:absolute;bottom:6px;left:50%;transform:translateX(-50%);width:clamp(66px,9vw,86px);height:clamp(66px,9vw,86px);border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden}
.lp-fan-circle>*{width:78%;height:78%;object-fit:contain}
.lp-fan-circle svg{width:78%;height:78%}
.lp-fan-title{padding:11px 8px 14px;text-align:center;font-weight:900;font-size:clamp(12px,1.5vw,15px);letter-spacing:-0.02em;white-space:nowrap}
@media(max-width:480px){.lp-fan{max-width:336px}.lp-fan-card{width:110px}.lp-fan-0{transform:rotate(-7deg) translateX(5%) translateY(8px)}.lp-fan-1{transform:translateY(-8px) scale(1.03)}.lp-fan-2{transform:rotate(7deg) translateX(-5%) translateY(8px)}.lp-fan-title{font-size:11.5px;padding:9px 6px 12px}}
@keyframes lpFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
/* "Try them!" — coverflow carousel above a tablet preview */
.lp-try-stack{display:flex;flex-direction:column;align-items:center;gap:30px;max-width:880px;margin:10px auto 0;padding:0 4px}
.lp-carousel{position:relative;width:100%;display:flex;align-items:center;justify-content:center;gap:8px}
.lp-carousel-stage{position:relative;flex:1 1 auto;max-width:720px;height:340px;overflow:hidden;touch-action:pan-y;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 8%,#000 92%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 8%,#000 92%,transparent 100%)}
.lp-carousel-slot{position:absolute;left:50%;top:50%;width:252px;transform-origin:center center;transition:transform .42s cubic-bezier(.22,1,.36,1),opacity .42s ease;will-change:transform}
.lp-carousel-arrow{position:relative;z-index:200;flex:0 0 auto;align-self:center;width:46px;height:46px;border-radius:50%;border:1px solid var(--border);background:#fff;color:var(--text);font-size:27px;line-height:1;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;padding-bottom:4px;box-shadow:0 6px 18px rgba(0,0,0,0.14);transition:transform .15s,opacity .15s}
.lp-carousel-arrow:hover{transform:scale(1.08)}
.lp-sq{position:relative;display:flex;flex-direction:column;width:100%;aspect-ratio:4/5;text-align:center;background:#fff;border:1.5px solid var(--border);border-radius:18px;overflow:hidden;cursor:pointer;font-family:inherit;padding:0;box-shadow:0 10px 24px rgba(0,0,0,0.1);transition:box-shadow .15s}
.lp-sq.is-locked .lp-sq-arch{filter:saturate(.85)}
.lp-sq.is-selected{box-shadow:0 18px 38px rgba(0,0,0,0.2)}
.lp-sq-arch{position:relative;flex:0 0 38%;background-size:cover;background-position:center}
.lp-sq-circle{position:absolute;bottom:-36px;left:50%;transform:translateX(-50%);width:90px;height:90px;border-radius:50%;background:#fff;border:4px solid #fff;box-shadow:0 5px 14px rgba(0,0,0,0.12);display:flex;align-items:center;justify-content:center;overflow:hidden}
.lp-sq-circle>*{width:80%;height:80%;object-fit:contain}
.lp-sq-circle svg{width:80%;height:80%}
.lp-sq-lock{position:absolute;left:50%;top:24px;transform:translateX(-50%);z-index:4;font-size:34px;line-height:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.18))}
.lp-sq-overlay{position:absolute;inset:0;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,0.7) 0%,rgba(255,255,255,0.32) 40%,rgba(255,255,255,0) 72%);pointer-events:none;z-index:3}
.lp-sq-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:42px 12px 16px}
.lp-sq-title{font-weight:900;font-size:26px;letter-spacing:-0.02em;line-height:1.15;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
/* Tablet mockup */
.lp-tablet{position:relative;width:min(580px,95vw);aspect-ratio:3/4;overflow:hidden;background:#15110D;border-radius:42px;padding:30px;box-shadow:0 30px 70px rgba(0,0,0,0.32),inset 0 0 0 2px rgba(255,255,255,0.06)}
.lp-tablet::before{content:'';position:absolute;left:50%;top:9px;transform:translateX(-50%);width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.22)}
.lp-tablet-screen{position:relative;width:100%;height:100%;border-radius:16px;overflow:hidden;background:#fff;display:flex;flex-direction:column}
.lp-tablet-screen>*{flex:1;min-height:0;height:100%!important}
/* Free games render GameShell, hard-coded to 100dvh — force it to fill the
   fixed-height screen instead of stretching the tablet past its 4/3 ratio. */
.lp-tablet-screen div[style*="100dvh"]{height:100%!important;max-height:100%!important}
/* Locked-game card inside the tablet — game-coloured panel, flip-card-back style.
   Centred stack: illustration, title, main skill, instructions, description, and a
   small floating "Unlock to play" button right below. */
.lp-locked{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px 30px;overflow:hidden}
.lp-locked-circle{width:104px;height:104px;border-radius:50%;background:#fff;border:5px solid rgba(255,255,255,0.75);box-shadow:0 10px 26px rgba(0,0,0,0.16);display:flex;align-items:center;justify-content:center;overflow:hidden;margin-bottom:20px;flex-shrink:0}
.lp-locked-circle>*{width:78%;height:78%;object-fit:contain}
.lp-locked-circle svg{width:78%;height:78%}
.lp-locked-title{font-weight:900;font-size:30px;letter-spacing:-0.02em;line-height:1.08;margin-bottom:10px}
.lp-locked-skill{display:inline-flex;align-items:center;font-size:13.5px;font-weight:800;padding:6px 16px;border-radius:9999px;background:rgba(255,255,255,0.7);letter-spacing:.01em;white-space:nowrap;margin-bottom:16px}
.lp-locked-instructions{font-size:17px;font-weight:800;line-height:1.4;max-width:420px;margin-bottom:18px}
.lp-locked-skills{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:430px;margin-bottom:26px}
.lp-locked-pill{display:inline-flex;align-items:center;font-size:13px;font-weight:700;padding:7px 14px;border-radius:9999px;background:rgba(255,255,255,0.6);line-height:1;white-space:nowrap}
.lp-locked-cta{display:inline-flex;align-items:center;gap:9px;border:none;border-radius:9999px;padding:14px 32px;font-family:inherit;font-size:16px;font-weight:900;color:#fff;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,0.24);transition:transform .15s,box-shadow .15s}
.lp-locked-cta:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(0,0,0,0.3)}
@media(max-width:560px){.lp-carousel-stage{height:290px}.lp-carousel-slot{width:200px}.lp-sq-circle{width:74px;height:74px;bottom:-30px}.lp-sq-title{font-size:22px}.lp-sq-lock{font-size:30px;top:18px}.lp-sq-body{padding:36px 10px 14px}.lp-carousel-arrow{width:40px;height:40px;font-size:23px}.lp-tablet{padding:20px;border-radius:30px}}
.lp-hero-note{font-size:13px;font-weight:700;color:var(--muted);margin-bottom:22px}

/* Tiling wavy underline — constant wavelength + thickness at any width */
.lp-squiggle{position:relative;display:inline-block;white-space:nowrap}
.lp-squiggle::after{content:'';position:absolute;left:-2px;right:-2px;bottom:-7px;height:8px;pointer-events:none;background-repeat:repeat-x;background-position:left center;background-size:22px 8px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='8' viewBox='0 0 22 8'%3E%3Cpath d='M0,4 Q5.5,8 11,4 T22,4' fill='none' stroke='%23F0DC90' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E")}

/* Floating dots scattered around the headline */
.lp-dots{position:absolute;inset:0;z-index:0;pointer-events:none}
.lp-dot{position:absolute;border-radius:50%;opacity:.85}
@keyframes lpFloatA{0%,100%{transform:translate(0,0)}25%{transform:translate(9px,-11px)}50%{transform:translate(-7px,-18px)}75%{transform:translate(-12px,-4px)}}
@keyframes lpFloatB{0%,100%{transform:translate(0,0)}33%{transform:translate(-14px,9px)}66%{transform:translate(12px,-14px)}}
@keyframes lpFloatC{0%,100%{transform:translate(0,0)}20%{transform:translate(-10px,-7px)}55%{transform:translate(14px,8px)}80%{transform:translate(5px,-16px)}}
@keyframes lpFloatD{0%,100%{transform:translate(0,0)}40%{transform:translate(16px,12px)}70%{transform:translate(-12px,-10px)}}
.lp-dot.d1{width:14px;height:14px;background:var(--lime);left:9%;top:20%;animation:lpFloatA 7s ease-in-out infinite;animation-delay:0s}
.lp-dot.d2{width:10px;height:10px;background:var(--blue);left:17%;top:64%;animation:lpFloatC 9s ease-in-out infinite;animation-delay:.6s}
.lp-dot.d3{width:18px;height:18px;background:var(--coral);left:84%;top:24%;animation:lpFloatB 8s ease-in-out infinite;animation-delay:.3s}
.lp-dot.d4{width:12px;height:12px;background:var(--sun);left:90%;top:66%;animation:lpFloatD 10s ease-in-out infinite;animation-delay:1.1s}
.lp-dot.d5{width:8px;height:8px;background:var(--grass);left:27%;top:12%;animation:lpFloatB 6.5s ease-in-out infinite;animation-delay:1.4s}
.lp-dot.d6{width:11px;height:11px;background:var(--coral);left:72%;top:9%;animation:lpFloatC 8.5s ease-in-out infinite;animation-delay:.5s}
.lp-dot.d7{width:9px;height:9px;background:var(--blue);left:6%;top:46%;animation:lpFloatD 7.5s ease-in-out infinite;animation-delay:.9s}
.lp-dot.d8{width:13px;height:13px;background:var(--sun);left:93%;top:44%;animation:lpFloatA 9.5s ease-in-out infinite;animation-delay:.2s}
@media(max-width:640px){.lp-dots{display:none}}

.lp-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;border-radius:9999px;font-family:'Nunito',sans-serif;font-weight:800;cursor:pointer;transition:transform .2s,box-shadow .2s,filter .2s}
.lp-btn:hover{transform:translateY(-2px)}
.lp-btn-lime{background:var(--lime);color:#1A1A1A;padding:14px 32px;font-size:16px;box-shadow:0 6px 20px rgba(212,219,74,0.4)}
.lp-btn-lime:hover{filter:brightness(1.05)}
.lp-btn-dark{background:var(--text);color:#fff;padding:15px 36px;font-size:16px}
.lp-btn-dark:hover{box-shadow:0 8px 24px rgba(0,0,0,0.22)}

.lp-section{max-width:1000px;margin:0 auto;padding:10px 24px 28px}
.lp-eyebrow{font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);text-align:center;margin-bottom:8px}
.lp-h2{text-align:center;font-weight:900;font-size:clamp(19px,2.4vw,25px);letter-spacing:-0.02em;margin-bottom:6px}
.lp-sub{text-align:center;color:var(--muted);font-size:15px;margin-bottom:28px}

/* Card grid — same column sizing as the hub */
.lp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(220px,46%),1fr));gap:20px}

/* ── Olipop-style carousel ── */
.lp-carousel-wrap{position:relative;max-width:1120px;margin:0 auto}
.lp-carousel{display:flex;align-items:stretch;gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;padding:6px 24px 14px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.lp-carousel::-webkit-scrollbar{display:none}
.lp-slide{flex:0 0 auto;width:236px;scroll-snap-align:center}
.lp-slide .lp-card{height:100%}
.lp-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:20;width:46px;height:46px;border-radius:50%;border:1px solid var(--border);background:#fff;color:var(--text);font-size:28px;line-height:1;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;padding-bottom:4px;box-shadow:0 4px 16px rgba(0,0,0,0.12);transition:transform .15s,box-shadow .15s}
.lp-arrow:hover{transform:translateY(-50%) scale(1.08);box-shadow:0 6px 20px rgba(0,0,0,0.16)}
.lp-arrow-left{left:-8px}
.lp-arrow-right{right:-8px}
@media(max-width:760px){.lp-arrow{display:none}}

/* ── Card: copied from the hub's gg-card ── */
.lp-card{display:flex;flex-direction:column;overflow:visible;transition:transform .2s ease,box-shadow .2s ease;cursor:pointer;background:#fff;position:relative;border-radius:16px;border:1px solid var(--border)}
.lp-card:hover{transform:translateY(-4px);box-shadow:0 10px 28px rgba(0,0,0,0.10)}
.lp-arch-header{position:relative;height:160px;border-radius:16px 16px 0 0;overflow:hidden;background-size:cover;background-position:center;flex-shrink:0}
.lp-arch-header::after{content:'';position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:160%;height:64px;background:#fff;border-radius:50% 50% 0 0}
.lp-arch-circle{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);width:110px;height:110px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;z-index:2}
.lp-arch-circle svg{width:90px;height:90px;display:block}
.lp-card-body{padding:12px 16px 18px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;flex:1}
.lp-card-title{font-weight:900;font-size:1.35rem;margin:-10px 0 0;letter-spacing:-0.02em;white-space:nowrap}
.lp-card-tag{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:9999px;font-size:0.65rem;font-weight:700;letter-spacing:0.02em;white-space:nowrap}
.lp-card-desc{font-size:0.78rem;color:var(--text);line-height:1.5;margin:0}
.lp-skills{display:flex;flex-wrap:wrap;justify-content:center;gap:5px;margin:2px 0}
.lp-skills-break{flex-basis:100%;width:0;height:0}
.lp-skill{font-size:0.6rem;font-weight:800;padding:2px 8px;border-radius:9999px;border:1.5px solid;letter-spacing:.01em;white-space:nowrap}
.lp-card-btn{margin-top:auto;width:100%;padding:10px 28px;border-radius:9999px;border:none;color:#fff;font-family:'Nunito',sans-serif;font-size:0.85rem;font-weight:800;cursor:pointer;transition:filter .2s;display:flex;align-items:center;justify-content:center;gap:7px}
.lp-card-btn:hover{filter:brightness(1.08)}
.lp-card-btn-lock{background:var(--text)}

/* Corner badge — icon only: green open padlock = free, red closed padlock = locked */
.lp-badge{position:absolute;top:9px;right:9px;z-index:10;display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:#fff;box-shadow:0 2px 9px rgba(0,0,0,0.18)}
.lp-badge-unlocked{color:var(--grass)}
.lp-badge-locked{color:var(--coral)}

/* Inline game box — expands inside the carousel section, no route change.
   The !important overrides force GameShell (which is hard-coded to 100dvh)
   to instead fill this fixed-height box. */
.lp-inline-game{position:relative;max-width:760px;margin:18px auto 4px;border-radius:22px;overflow:hidden;background:var(--bg);border:1px solid var(--border);box-shadow:0 16px 44px rgba(0,0,0,0.16);animation:lpExpand .38s cubic-bezier(.16,1,.3,1)}
@keyframes lpExpand{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}
.lp-inline-frame{height:min(660px,78vh)}
/* Theme wrapper gets a definite height so % heights below resolve... */
.lp-inline-frame > div{height:100%!important}
/* ...then every GameShell div hard-coded to 100dvh is forced to fill it. */
.lp-inline-frame div[style*="100dvh"]{height:100%!important;max-height:100%!important}
.lp-inline-close{position:absolute;top:10px;right:10px;z-index:30;display:inline-flex;align-items:center;gap:5px;background:var(--text);color:#fff;border:none;border-radius:9999px;padding:8px 15px;font-family:'Nunito',sans-serif;font-weight:800;font-size:13px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,0.28)}
.lp-inline-close:hover{filter:brightness(1.12)}
.lp-inline-load{display:flex;align-items:center;justify-content:center;height:min(660px,78vh);font-family:'Nunito',sans-serif;font-weight:800;color:var(--muted)}

/* Locked cards (4 onwards) get a subtle grey wash to read as locked */
.lp-card-lock-tint{position:absolute;inset:0;border-radius:16px;opacity:0.4;pointer-events:none;z-index:5}

.lp-unlock-wrap{text-align:center;margin-top:36px}
.lp-unlock-sub{margin-top:12px;color:var(--muted);font-size:14px;font-weight:600}

/* ── Carousel + CTA share one tall white→green gradient zone ── */
.lp-cta-zone{position:relative;background:linear-gradient(180deg,rgba(240,240,160,0) 38%,#F0F0A0 78%);padding:0 0 60px}
.lp-wave{position:absolute;left:0;right:0;height:60px;overflow:hidden;line-height:0}
.lp-wave svg{width:100%;height:100%;display:block}
.lp-wave-bottom{bottom:-40px}
.lp-cta-inner{position:relative;z-index:2;text-align:center;padding:20px 24px 0}
.lp-cta-bob{display:inline-block;animation:lpCtaBob 3s ease-in-out infinite}
@keyframes lpCtaBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
/* Chunky, tactile "press me" button with a colored ledge */
.lp-cta-btn{background:#F7D560;color:#1A1A1A;border:none;border-radius:9999px;font-family:'Nunito',sans-serif;font-weight:900;font-size:clamp(21px,2.8vw,27px);padding:24px 64px;cursor:pointer;box-shadow:0 9px 0 #D9B23E,0 18px 34px rgba(0,0,0,0.22);transition:transform .1s ease,box-shadow .1s ease}
.lp-cta-btn:hover{transform:translateY(-2px);box-shadow:0 10px 0 #D9B23E,0 22px 38px rgba(0,0,0,0.24)}
.lp-cta-btn:active{transform:translateY(5px);box-shadow:0 3px 0 #D9B23E,0 8px 16px rgba(0,0,0,0.20)}
.lp-cta-sub{margin-top:22px;color:#3d3a2e;font-size:14px;font-weight:700}
@media(prefers-reduced-motion:reduce){.lp-cta-bob{animation:none}}

.lp-paid{background:#fff;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}

/* Concept photo grid — flip cards (front: photo, back: game + write-up) */
.lp-concepts{padding:40px 0 44px}
.lp-concept-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;max-width:880px;margin:0 auto;padding:6px 24px 16px}
.lp-concept{width:100%;height:328px;cursor:pointer;perspective:1200px;background:transparent;outline:none}
.lp-concept-inner{position:relative;width:100%;height:100%;transition:transform .6s cubic-bezier(.22,1,.36,1);transform-style:preserve-3d}
.lp-concept.flipped .lp-concept-inner{transform:rotateY(180deg)}
.lp-concept.nudge .lp-concept-inner{animation:lpNudge 2.6s ease-in-out 1.2s 3}
@keyframes lpNudge{0%,72%,100%{transform:rotateY(0)}10%{transform:rotateY(-26deg)}24%{transform:rotateY(-12deg)}36%{transform:rotateY(-26deg)}}
@media(prefers-reduced-motion:reduce){.lp-concept.nudge .lp-concept-inner{animation:none}}
.lp-concept-face{position:absolute;inset:0;border-radius:18px;overflow:hidden;-webkit-backface-visibility:hidden;backface-visibility:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.10)}
.lp-concept-front img{width:100%;height:100%;object-fit:cover;display:block}
.lp-concept-flip{position:absolute;bottom:11px;right:11px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.92);color:var(--text);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 9px rgba(0,0,0,0.18)}
.lp-concept-back{transform:rotateY(180deg);background:#fff;border:1px solid var(--border);display:flex;flex-direction:column;padding:26px 24px;text-align:left}
.lp-concept-game{font-weight:900;font-size:19px;letter-spacing:-0.01em;color:var(--text)}
.lp-concept-skills{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.lp-concept-skill{font-size:10.5px;font-weight:800;padding:3px 9px;border-radius:9999px;border:1.5px solid;letter-spacing:.01em;white-space:nowrap}
.lp-concept-sep{height:2px;background:var(--border);border-radius:2px;margin:14px 0 15px}
.lp-concept-text{font-size:14px;line-height:1.62;color:var(--text)}
.lp-concept-keyword{font-weight:900}
@media(max-width:760px){.lp-concept-strip{grid-template-columns:repeat(2,1fr)}}
@media(max-width:480px){.lp-concept-strip{grid-template-columns:1fr;max-width:340px}.lp-concept{height:300px}.lp-concept-back{padding:22px 20px}}

/* ── Testimonials — parent & carer quotes ── */
.lp-quotes{max-width:1040px;margin:0 auto;padding:48px 24px 52px;text-align:center}
.lp-quotes-eyebrow{font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
.lp-quotes-h2{font-weight:900;font-size:clamp(26px,3.8vw,38px);letter-spacing:-0.02em;color:var(--text);line-height:1.15;margin-bottom:36px}
.lp-quotes-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;text-align:left}
.lp-quote{display:flex;flex-direction:column;gap:14px;margin:0;background:#fff;border:1px solid var(--border);border-radius:20px;padding:24px;box-shadow:0 6px 18px rgba(0,0,0,0.05)}
.lp-quote-mark{font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:52px;line-height:0.4;height:24px;color:var(--sun);opacity:0.55}
.lp-quote-title{font-weight:900;font-size:18.5px;letter-spacing:-0.01em;color:var(--text);margin-top:-4px}
.lp-quote blockquote{margin:0;font-size:17.5px;line-height:1.62;color:var(--text);font-weight:600}
.lp-quote figcaption{display:flex;flex-direction:column;gap:2px;margin-top:auto}
.lp-quote-name{font-weight:800;font-size:15.5px;color:var(--text)}
.lp-quote-role{font-size:12.5px;color:var(--muted)}
@media(max-width:640px){.lp-quotes-grid{grid-template-columns:1fr;gap:16px}.lp-quotes{padding:36px 20px 40px}}

.lp-accordion{max-width:720px;margin:0 auto;padding:8px 24px 24px}
.lp-acc{border-top:1px solid var(--border)}
.lp-acc:last-of-type{border-bottom:1px solid var(--border)}
.lp-acc summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:22px 4px;font-family:'Nunito',sans-serif;font-weight:900;font-size:18px;color:var(--text)}
.lp-acc summary::-webkit-details-marker{display:none}
.lp-acc-plus{flex-shrink:0;width:22px;height:22px;position:relative;color:var(--muted);transition:transform .28s cubic-bezier(.16,1,.3,1)}
.lp-acc-plus::before,.lp-acc-plus::after{content:'';position:absolute;background:currentColor;border-radius:2px}
.lp-acc-plus::before{left:0;top:9.5px;width:22px;height:3px}
.lp-acc-plus::after{left:9.5px;top:0;width:3px;height:22px}
.lp-acc[open] .lp-acc-plus{transform:rotate(135deg);color:var(--blue)}
.lp-acc-body{padding:0 4px 24px;animation:lpAccIn .3s ease}
@keyframes lpAccIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
.lp-acc-p{font-size:15.5px;line-height:1.6;color:var(--text);font-weight:600;margin:0 0 14px}
.lp-acc-p:last-child{margin-bottom:0}
.lp-acc-p strong{font-weight:900}
.lp-acc-num{font-weight:900}
.lp-acc-h{font-family:'Nunito',sans-serif;font-weight:800;font-size:19px;line-height:1.3;color:var(--text);margin:2px 0 20px}
.lp-acc-squig{position:relative;display:inline-block;white-space:nowrap;color:var(--blue)}
.lp-acc-principle{display:flex;gap:16px;align-items:flex-start;margin-bottom:18px}
.lp-acc-principle:last-child{margin-bottom:0}
.lp-acc-pnum{font-family:'Nunito',sans-serif;font-weight:900;font-size:30px;line-height:1;flex-shrink:0;min-width:38px}
.lp-acc-ptitle{font-weight:900;font-size:16px;color:var(--text);margin:0 0 4px}
.lp-acc-ptext{font-size:14.5px;line-height:1.55;color:var(--muted);font-weight:600;margin:0}
.lp-acc-story{display:flex;gap:24px;align-items:center;background:#FAF6DC;border-radius:18px;padding:24px;margin-top:2px}
.lp-acc-story-visual{flex-shrink:0;width:132px;height:132px;border-radius:50% 42% 55% 45%;background:#fff;display:flex;align-items:center;justify-content:center}
.lp-acc-story-visual img{width:104px;height:104px;object-fit:contain}
.lp-acc-story-text{flex:1;min-width:0}
.lp-acc-eyebrow{font-size:11.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:0 0 8px}
@media(max-width:560px){.lp-acc-story{flex-direction:column;align-items:center;text-align:left;padding:22px 18px}.lp-acc-story-visual{width:100px;height:100px}.lp-acc-story-visual img{width:78px;height:78px}}
.lp-footer{padding:36px 24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;max-width:1000px;margin:0 auto;color:var(--muted);font-size:13px}
.lp-footer-links{display:flex;gap:22px}
.lp-footer-links button{background:none;border:none;color:var(--muted);font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;cursor:pointer;padding:0}
.lp-footer-links button:hover{color:var(--text);text-decoration:underline}

.lp-sticky{position:fixed;left:0;right:0;bottom:0;z-index:60;background:#fff;border-top:1px solid var(--border);box-shadow:0 -4px 24px rgba(0,0,0,0.1);padding:12px 20px;display:flex;align-items:center;justify-content:space-between;gap:14px;transform:translateY(120%);transition:transform .35s cubic-bezier(.16,1,.3,1)}
.lp-sticky.show{transform:translateY(0)}
.lp-sticky-text{font-weight:800;font-size:14px}
.lp-sticky-text span{color:var(--muted);font-weight:600;display:block;font-size:12px}

@media(max-width:640px){
  .lp-why{grid-template-columns:1fr;gap:22px}
  .lp-hero{padding:36px 20px 24px}
  .lp-footer{flex-direction:column;text-align:center}
}
      `}</style>

      <div className="lp">
        <nav className="lp-nav">
          <DiditLogo height={51} hideBeta onNavigate={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          <button className="lp-login" onClick={() => { trackLandingClick('nav_login'); navigate('/signin'); }}>
            Log in
          </button>
        </nav>

        {/* Hero — capable-kid headline framed by floating dots */}
        <header className="lp-hero">
          <div className="lp-dots" aria-hidden="true">
            <span className="lp-dot d1" /><span className="lp-dot d2" /><span className="lp-dot d3" />
            <span className="lp-dot d4" /><span className="lp-dot d5" /><span className="lp-dot d6" />
            <span className="lp-dot d7" /><span className="lp-dot d8" />
          </div>
          <h1>
            <span className="lp-kw" style={{ color: 'var(--grass)' }}>Finance.</span>{' '}
            <span className="lp-kw" style={{ color: 'var(--blue)' }}>Engineering.</span><br />
            <span className="lp-kw" style={{ color: 'var(--coral)' }}>Music.</span>{' '}
            <span className="lp-kw" style={{ color: '#e8b840' }}>Code.</span>{' '}
            <span style={{ color: 'var(--muted)' }}>And more.</span>
          </h1>
          <p className="lp-hero-play">Real world skills for curious kids aged 2&nbsp;to&nbsp;5,<br />explored through play.</p>
          <HeroFan />
        </header>

        {/* Proof — the real learning hiding inside each game (before the ask) */}
        <section className="lp-concepts">
          <h2 className="lp-h2">There's real learning behind every game</h2>
          <p className="lp-sub" style={{ fontSize: '18px' }}>
            <span style={{ color: 'var(--blue)', fontWeight: 800 }}>Tap the cards</span> and discover some of our many games and the real-world skills they tackle.
          </p>
          <div className="lp-concept-strip">
            {CONCEPTS.map((c, i) => (
              <ConceptCard key={c.src} src={c.src} game={c.game} concept={c.concept} text={c.text} nudge={i === 1} />
            ))}
          </div>
        </section>

        {/* Carousel + CTA share one tall white→green gradient zone */}
        <div className="lp-cta-zone">
          <div className="lp-wave lp-wave-bottom" aria-hidden="true">
            <svg viewBox="0 0 1440 60" preserveAspectRatio="none"><path d="M0,30 C200,0 400,60 600,30 C800,0 1000,60 1200,30 C1350,10 1440,40 1440,30 L1440,0 L0,0 Z" fill="#F0F0A0" /></svg>
          </div>

          <section className="lp-section" id="try" style={{ paddingBottom: 0 }}>
          <h2 className="lp-h2">Try and get a sampler 👇</h2>

          <div className="lp-try-stack">
            {/* Top: pick a game from the coverflow carousel */}
            <GameCarousel games={orderedGames} selectedId={selectedId} onSelect={selectGame} />

            {/* Below: tablet showing the selected game */}
            <div className="lp-tablet">
              <div className="lp-tablet-screen">
                {PhoneGame ? (
                  <Suspense fallback={<div className="lp-inline-load">Loading…</div>}>
                    <DemoContext.Provider value={{ isDemo: true }}>
                      <PhoneGame key={selectedId} />
                    </DemoContext.Provider>
                  </Suspense>
                ) : (
                  <div className="lp-locked" style={{ background: selectedGame.colorLight }}>
                    <div className="lp-locked-circle">
                      {(() => {
                        const Ill = GAME_ILLUSTRATIONS[selectedGame.illustrationKey];
                        return Ill ? <Ill /> : null;
                      })()}
                    </div>
                    <div className="lp-locked-title" style={{ color: selectedGame.colorDark }}>{selectedGame.title}</div>
                    <span className="lp-locked-skill" style={{ color: selectedGame.colorDark }}>{selectedGame.tag}</span>
                    {selectedGame.instructions && (
                      <p className="lp-locked-instructions" style={{ color: selectedGame.colorDark }}>{selectedGame.instructions}</p>
                    )}
                    {selectedGame.skills?.length > 0 && (
                      <div className="lp-locked-skills">
                        {selectedGame.skills.map((s) => (
                          <span key={s} className="lp-locked-pill" style={{ color: selectedGame.colorDark }}>{s}</span>
                        ))}
                      </div>
                    )}
                    <button
                      className="lp-locked-cta"
                      style={{ background: selectedGame.colorDark }}
                      onClick={() => goCheckout(`tablet_unlock_${selectedGame.id}`)}
                    >
                      🔓 Unlock to play
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          </section>

          {/* Conversion CTA — sits on the green base of the shared gradient zone */}
          <div className="lp-cta-inner">
            <span className="lp-cta-bob">
              <button className="lp-cta-btn" onClick={() => goCheckout('unlock_main')}>
                Unlock all games for {PRICE}/month
              </button>
            </span>
            <div className="lp-cta-sub">New games added regularly · Cancel anytime</div>
          </div>
        </div>

        {/* Testimonials — made-up parent & carer quotes */}
        <section className="lp-quotes">
          <p className="lp-quotes-eyebrow">Don't just take our word for it</p>
          <h2 className="lp-quotes-h2">
            <span style={{ color: 'var(--grass)' }}>Loved</span> by <Squiggle>parents &amp; carers</Squiggle>
          </h2>
          <div className="lp-quotes-grid">
            <figure className="lp-quote">
              <div className="lp-quote-mark" aria-hidden="true">&ldquo;</div>
              <div className="lp-quote-title">Widening their world</div>
              <blockquote>
                "Technology changes so fast, and I think the way kids learn has to evolve with
                it. I love that this gives my daughter real exposure to real-world concepts
                early. It genuinely feels like a head start."
              </blockquote>
              <figcaption>
                <span className="lp-quote-name" style={{ color: 'var(--grass)' }}>Maya R.</span>
                <span className="lp-quote-role">Parent of a 3-year-old</span>
              </figcaption>
            </figure>
            <figure className="lp-quote">
              <div className="lp-quote-mark" aria-hidden="true">&ldquo;</div>
              <div className="lp-quote-title">Finally, something <em>actually</em> enriching</div>
              <blockquote>
                "I love that it's not overstimulating. It's so well designed, simple and
                intuitive. And I use it as a tool to play together with my children, rather than
                the hypnotising, mindless games we'd tried before."
              </blockquote>
              <figcaption>
                <span className="lp-quote-name" style={{ color: 'var(--blue)' }}>Daniel K.</span>
                <span className="lp-quote-role">Dad of two</span>
              </figcaption>
            </figure>
            <figure className="lp-quote">
              <div className="lp-quote-mark" aria-hidden="true">&ldquo;</div>
              <div className="lp-quote-title">I can see it clicking</div>
              <blockquote>
                "It was fascinating to watch my son develop and advance his skills as he
                played. I could really see him grasp one concept and then move on to the next.
                The progression is real."
              </blockquote>
              <figcaption>
                <span className="lp-quote-name" style={{ color: 'var(--coral)' }}>Sofia L.</span>
                <span className="lp-quote-role">Parent of a 4-year-old</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <div className="lp-accordion">
          <details
            className="lp-acc"
            onToggle={(e) => { if (e.target.open) trackLandingClick('footer_philosophy'); }}
          >
            <summary>
              Our Design Philosophy
              <span className="lp-acc-plus" aria-hidden="true" />
            </summary>
            <div className="lp-acc-body">
              <p className="lp-acc-h">Thoughtfully made for little hands and{' '}<span className="lp-acc-squig">big a-ha moments.<svg viewBox="0 0 200 12" preserveAspectRatio="none" style={{ position: 'absolute', bottom: '-5px', left: '-4px', width: 'calc(100% + 8px)', height: '11px', overflow: 'visible', pointerEvents: 'none', transform: 'rotate(-2deg)', transformOrigin: 'left center' }}><path d="M2,9 C8,3 15,13 25,7 C35,1 42,12 55,5 C65,0 72,11 85,6 C95,2 100,13 112,7 C122,3 128,14 140,8 C150,4 155,12 168,6 C178,2 185,11 198,7" fill="none" stroke="#F0DC90" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></svg></span></p>
              <div className="lp-acc-principle">
                <div className="lp-acc-pnum" style={{ color: 'var(--coral)' }}>01</div>
                <div><div className="lp-acc-ptitle">Play Together. That&apos;s the Magic.</div><p className="lp-acc-ptext">The games are a tool in your parenting toolkit, for you and your child to explore together. Your encouragement and coaching makes the learning moment more magical.</p></div>
              </div>
              <div className="lp-acc-principle">
                <div className="lp-acc-pnum" style={{ color: 'var(--blue)' }}>02</div>
                <div><div className="lp-acc-ptitle">Big Concepts. Made Simple.</div><p className="lp-acc-ptext">The ideas may be big, but the games are simple. Designed for tiny fingers, they are intuitive and tactile, without being overwhelming.</p></div>
              </div>
              <div className="lp-acc-principle">
                <div className="lp-acc-pnum" style={{ color: 'var(--grass)' }}>03</div>
                <div><div className="lp-acc-ptitle">No Clutter. No Surprises.</div><p className="lp-acc-ptext">A clean, safe, distraction-free space. Designed for your child to explore and for you to feel at ease. Zero ads, ever.</p></div>
              </div>
            </div>
          </details>
          <details
            className="lp-acc"
            onToggle={(e) => { if (e.target.open) trackLandingClick('footer_story'); }}
          >
            <summary>
              Our Story
              <span className="lp-acc-plus" aria-hidden="true" />
            </summary>
            <div className="lp-acc-body">
              <div className="lp-acc-story">
                <div className="lp-acc-story-visual">
                  <img src="/game%20illustrations/Bulb.png" alt="" />
                </div>
                <div className="lp-acc-story-text">
                  <p className="lp-acc-eyebrow">How it started</p>
                  <p className="lp-acc-p">We&apos;re parents from Sydney, Australia who have a wonderfully energetic and curious toddler. {'🧡'}</p>
                  <p className="lp-acc-p">Teaching our child is one of our favourite things to do together. But when we went looking for games to play with him, we kept running into the same two problems. <span className="lp-acc-num" style={{ color: 'var(--coral)' }}>1.</span> Most kids&apos; games are loud, busy, and designed to keep little eyes glued to the screen. <span className="lp-acc-num" style={{ color: 'var(--blue)' }}>2.</span> The educational ones, while great for letters and numbers, rarely go beyond the basics.</p>
                  <p className="lp-acc-p">So we built some games. The more we played, the more we realised how capable kids really are. Their minds can stretch so much further than we give them credit for. <strong>We hope your family gets to discover that too as you play along!</strong></p>
                </div>
              </div>
            </div>
          </details>
        </div>

        <footer className="lp-footer">
          <div>
            <DiditLogo height={30} hideBeta />
            <div style={{ marginTop: 4 }}>Real-world concepts for tiny humans.</div>
          </div>
          <nav className="lp-footer-links">
            <button onClick={() => { trackLandingClick('footer_about'); navigate('/about'); }}>About did·it</button>
          </nav>
          <div>&copy; 2026 did·it. All rights reserved.</div>
        </footer>

        {/* Sticky conversion bar */}
        <div className={`lp-sticky${showStickyBar ? ' show' : ''}`}>
          <div className="lp-sticky-text">
            Unlock every game
            <span>{PRICE}/month · Cancel anytime</span>
          </div>
          <button className="lp-btn lp-btn-lime" onClick={() => goCheckout('sticky_unlock')} style={{ padding: '12px 24px', fontSize: 15 }}>
            Unlock →
          </button>
        </div>

      </div>
    </>
  );
}
