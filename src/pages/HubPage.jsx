import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../design-system/tokens';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import ShareButton from '../design-system/components/ShareButton';
import DiditLogo from '../components/DiditLogo';
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
  ArchitectIllustration,
  MatisseIllustration,
} from './GameIllustrations';

// Map game key → illustration component (follows ILLUSTRATIONS.md)
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
  architect:  ArchitectIllustration,
  matisse:    MatisseIllustration,
};

const GAMES = [
  {
    key: 'shopper',
    title: 'Little Shopper',
    tag: '\uD83D\uDCB0 Financial Literacy',
    desc: 'They earn coins, choose what to buy, decide what to save, and figure out what things are worth.',
    skills: ['Budgeting', 'Saving', 'Decisions'],
    bgImage: '/backgrounds/background-green.png',
    primary: colors.grassMid,
    dark: colors.grassDark,
    light: colors.grassLight,
    path: '/games/little-shopper',
  },
  {
    key: 'mixer',
    title: 'Little DJ',
    tag: '\uD83C\uDF9B\uFE0F Beat Making',
    desc: 'Tap a cell, hear it loop. Stack drums, bass, melody and more across four beats to build your own groove.',
    skills: ['Layering', 'Rhythm', 'Creativity'],
    bgImage: '/backgrounds/background-red.png',
    primary: colors.coralMid,
    dark: colors.coralDark,
    light: colors.coralLight,
    path: '/games/little-dj',
  },
  {
    key: 'engineer',
    title: 'Little Engineer',
    tag: '\uD83D\uDD27 Electrical Engineering',
    desc: 'Switches to flip, wires to connect, circuits to complete. Binary logic and systems thinking.',
    skills: ['Circuits', 'Logic', 'Systems'],
    bgImage: '/backgrounds/background-blue.png',
    primary: colors.blueberryMid,
    dark: colors.blueberryDark,
    light: colors.blueberryLight,
    path: '/games/little-engineer',
  },
  {
    key: 'chef',
    title: 'Little Chef',
    tag: '\uD83E\uDD58 Cooking & Sequencing',
    desc: 'Crack the egg. Pour the flour. Mix. The order matters. Change a step, change the result.',
    skills: ['Sequencing', 'Planning', 'Process'],
    bgImage: '/backgrounds/background-yellow.png',
    primary: colors.sunMid,
    dark: colors.sunDark,
    light: colors.sunLight,
    path: '/games/little-chef',
  },
  {
    key: 'dj',
    title: 'Little Pianist',
    tag: '\uD83C\uDFB9 Piano & Solfège',
    desc: 'Learn Do Re Mi, then play real songs note by note. Tap the coloured keys in order and hear the melody come alive.',
    skills: ['Solfège', 'Melody', 'Pitch'],
    bgImage: '/backgrounds/background-blue.png',
    primary: colors.blueberryMid,
    dark: colors.blueberryDark,
    light: colors.blueberryLight,
    path: '/games/little-pianist',
  },
  {
    key: 'coder',
    title: 'Little Coder',
    tag: '💻 Coding & Logic',
    desc: 'Tap Up, Down, Left, Right to move a rat to find cheese. A gentle intro to directional thinking.',
    skills: ['Directions', 'Logic', 'Sequencing'],
    bgImage: '/backgrounds/background-yellow.png',
    primary: colors.sunMid,
    dark: colors.sunDark,
    light: colors.sunLight,
    path: '/games/little-coder',
  },
  {
    key: 'chemist',
    title: 'Little Chemist',
    tag: '⚗️ Chemistry',
    desc: 'Balance atoms on a seesaw. Tap to match the left side and discover the elements — Hydrogen, Oxygen, and more.',
    skills: ['Counting', 'Balancing', 'Elements'],
    bgImage: '/backgrounds/background-green.png',
    primary: colors.grassMid,
    dark: colors.grassDark,
    light: colors.grassLight,
    path: '/games/little-chemist',
  },
  {
    key: 'astronomer',
    title: 'Little Astronaut',
    tag: '🪐 Space & Planets',
    desc: 'A mystery planet silhouette appears in the stars. Tap the right planet to match it and light up the sky!',
    skills: ['Planets', 'Shapes', 'Matching'],
    bgImage: '/backgrounds/background-yellow.png',
    primary: colors.sunMid,
    dark: colors.sunDark,
    light: colors.sunLight,
    path: '/games/little-astronomer',
  },
  {
    key: 'pie',
    title: 'Little Analyst',
    tag: '🥧 Data visualisation',
    desc: 'A pie chart appears with pieces missing. Drag the right slice to complete it — discovering how parts fit into a whole and form 100%.',
    skills: ['Percentages', 'Shapes', 'Spatial recognition'],
    bgImage: '/backgrounds/background-red.png',
    primary: colors.coralMid,
    dark: colors.coralDark,
    light: colors.coralLight,
    path: '/games/little-pie',
  },
  {
    key: 'matisse',
    title: 'Little Matisse',
    tag: '🎨 Art & Collage',
    desc: 'Drag colourful Matisse-style cutouts onto a canvas to make your own collage. Every composition is a masterpiece!',
    skills: ['Creativity', 'Shapes', 'Composition'],
    bgImage: '/backgrounds/background-red.png',
    primary: colors.coralMid,
    dark: colors.coralDark,
    light: colors.coralLight,
    path: '/games/little-matisse',
  },
  {
    key: 'architect',
    title: 'Little Architect',
    tag: '🏗️ Spatial building',
    desc: 'A building silhouette appears on screen. Drag the chunky shape pieces from the tray to fill it in and bring the building to life.',
    skills: ['Shapes', 'Spatial reasoning', 'Building'],
    bgImage: '/backgrounds/background-blue.png',
    primary: colors.blueberryMid,
    dark: colors.blueberryDark,
    light: colors.blueberryLight,
    path: '/games/little-architect',
  },
];

const css = `
*{box-sizing:border-box}
.hub-nav{position:sticky;top:0;z-index:100;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;backdrop-filter:blur(20px);background:rgba(255,255,255,0.9);border-bottom:1px solid rgba(0,0,0,0.04)}
.hub-nav-logo{cursor:pointer;display:flex;align-items:center}
.hub-grid{width:100%;max-width:1100px;margin:32px auto 0;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px;padding:0 24px 60px}
.hub-card{display:flex;flex-direction:column;overflow:visible;transition:transform .2s ease;cursor:pointer;background:white;position:relative;border-radius:16px;border:1px solid ${colors.border};width:100%}
.hub-card:hover{transform:translateY(-4px)}
.hub-arch-header{position:relative;height:160px;border-radius:16px 16px 0 0;overflow:hidden;background-size:cover;background-position:center;flex-shrink:0}
.hub-arch-header::after{content:'';position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:160%;height:64px;background:white;border-radius:50% 50% 0 0}
.hub-arch-circle{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);width:110px;height:110px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;z-index:2}
.hub-arch-circle img{width:90px;height:90px;object-fit:contain}
.hub-arch-circle svg{width:90px;height:90px;display:block}
.hub-body{padding:12px 16px 18px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;flex:1}
.hub-title{font-family:'Nunito',sans-serif;font-weight:900;font-size:1.35rem;margin:-10px 0 0;letter-spacing:-0.02em;white-space:nowrap}
.hub-tag{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:9999px;font-family:'Nunito',sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.02em;white-space:nowrap}
.hub-desc{font-size:0.78rem;color:#2D2A26;line-height:1.5;margin:0;font-family:'Nunito',sans-serif}
.hub-skills{display:flex;flex-wrap:nowrap;gap:5px;justify-content:center;margin-top:auto;padding-top:4px;width:100%;overflow:hidden}
.hub-skill{padding:4px 10px;border-radius:9999px;font-size:0.6rem;font-weight:700;font-family:'Nunito',sans-serif;white-space:nowrap}
.hub-play-btn{padding:10px 28px;border-radius:9999px;border:none;font-family:'Nunito',sans-serif;font-size:0.85rem;font-weight:800;cursor:pointer;transition:all .25s;color:#fff;margin-top:auto;width:100%}
.hub-play-btn:hover{filter:brightness(1.1)}
.hub-lock-overlay{position:absolute;inset:0;z-index:10;border-radius:18px;background:rgba(255,255,255,0.7);backdrop-filter:blur(2px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:background .2s}
.hub-lock-overlay:hover{background:rgba(255,255,255,0.6)}
.hub-lock-icon{font-size:2.5rem;opacity:0.8}
.hub-lock-text{font-family:'Nunito',sans-serif;font-size:0.8rem;font-weight:700;color:${colors.text};opacity:0.7}
@media (max-width:600px){
  .hub-nav{padding:12px 16px}
  .hub-grid{grid-template-columns:1fr;padding:0 16px 40px;gap:14px;margin-top:20px}
  .hub-card{flex-direction:row;border-radius:16px;overflow:hidden;min-height:205px;align-items:stretch}
  .hub-arch-header{width:110px;min-height:205px;height:100%!important;border-radius:0;flex-shrink:0;overflow:visible;align-self:stretch;position:relative;z-index:0}
  .hub-arch-header::after{display:none}
  .hub-arch-circle{width:118px;height:118px;bottom:auto;top:50%;left:85%;transform:translate(-50%,-50%)}
  .hub-arch-circle img{width:94px;height:94px}
  .hub-body{flex-direction:column;align-items:flex-start;text-align:left;padding:15px 14px 15px 32px;gap:4px;position:relative;z-index:2}
  .hub-title{font-size:1.25rem;margin:0;white-space:normal}
  .hub-tag{font-size:0.55rem;padding:2px 8px}
  .hub-desc{display:block;font-size:0.72rem;line-height:1.45}
  .hub-skills{justify-content:flex-start;margin-top:2px;padding-top:0}
  .hub-skill{font-size:0.58rem;padding:3px 8px}
  .hub-play-btn{width:auto;padding:7px 18px;font-size:0.78rem;margin-top:auto;align-self:flex-start}
  .hub-intro{padding:32px 16px 8px!important}
  .hub-intro h1{font-size:1.6rem!important}
  .hub-intro p{font-size:0.85rem!important}
}
@keyframes hubDrift{0%,100%{transform:translate(0,0) scale(1)}25%{transform:translate(15px,-20px) scale(1.1)}50%{transform:translate(-10px,-35px) scale(0.95)}75%{transform:translate(20px,-15px) scale(1.05)}}
@keyframes shareEmit{0%{transform:translate(-50%,-50%) scale(0.4);opacity:0.9}100%{transform:translate(-50%,-50%) scale(2.4);opacity:0}}
@keyframes shareDot{0%,100%{transform:translateY(0);opacity:0.5}50%{transform:translateY(-5px);opacity:0.75}}
.hub-dot{position:absolute;border-radius:50%;pointer-events:none;animation:hubDrift 12s ease-in-out infinite}
`;

export default function HubPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleCardClick = (path) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      navigate('/signin');
    }
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{css}</style>

      <nav className="hub-nav">
        <span className="hub-nav-logo">
          <DiditLogo height={36} onNavigate={() => navigate('/')} />
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="hub-nav-links" style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          </div>
          <ShareButton
            label={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            }
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: colors.blueberryDark, border: 'none',
              color: '#fff', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', textDecoration: 'none', padding: 0,
            }}
          />
          {isLoggedIn && (
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: colors.blueberryDark, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              {showUserMenu && (
                <>
                  <div onClick={() => setShowUserMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />
                  <div style={{
                    position: 'absolute', top: '44px', right: 0, zIndex: 99,
                    background: 'white', borderRadius: '16px',
                    border: `1px solid ${colors.border}`,
                    padding: '16px 20px', minWidth: '220px',
                    fontFamily: "'Nunito', sans-serif",
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: colors.text, marginBottom: '4px' }}>
                      {user?.displayName || 'Signed in'}
                    </div>
                    <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '16px', wordBreak: 'break-all' }}>
                      {user?.email}
                    </div>
                    <button
                      onClick={async () => {
                        await signOut(auth);
                        setShowUserMenu(false);
                        navigate('/');
                      }}
                      style={{
                        width: '100%', padding: '10px 16px',
                        background: 'transparent', border: `1px solid ${colors.border}`,
                        borderRadius: '9999px', fontFamily: "'Nunito', sans-serif",
                        fontSize: '13px', fontWeight: 700, color: colors.coralDark,
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      <div style={{ minHeight: '100vh', background: '#FFFFFF', fontFamily: "'Nunito', sans-serif" }}>
        <div className="hub-intro" style={{ textAlign: 'center', padding: '60px 40px 20px' }}>
          <h1 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 'clamp(30px, 4.5vw, 46px)', letterSpacing: '-0.03em', color: colors.text, marginBottom: 16, lineHeight: 1.15 }}>
            Choose a game
          </h1>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 16, lineHeight: 1.65, color: colors.text, maxWidth: 560, margin: '0 auto' }}>
            Each game teaches one big real-world concept through simple, joyful interactions designed for little hands.
          </p>
        </div>

        <div className="hub-grid" style={{ position: 'relative' }}>
          <div className="hub-dot" style={{ width: 14, height: 14, background: colors.blueberryMid, top: '8%', left: '3%', opacity: 0.4, animationDelay: '0s', animationDuration: '14s' }} />
          <div className="hub-dot" style={{ width: 10, height: 10, background: colors.coralMid, top: '40%', right: '4%', opacity: 0.35, animationDelay: '2s', animationDuration: '16s' }} />
          <div className="hub-dot" style={{ width: 12, height: 12, background: colors.grassMid, bottom: '25%', left: '5%', opacity: 0.4, animationDelay: '4s', animationDuration: '13s' }} />
          <div className="hub-dot" style={{ width: 8, height: 8, background: colors.sunMid, top: '20%', right: '10%', opacity: 0.45, animationDelay: '1s', animationDuration: '18s' }} />
          {GAMES.map((game) => (
            <div
              key={game.key}
              className="hub-card"
              onClick={() => handleCardClick(game.path)}
              style={{ position: 'relative' }}
            >
              {!isLoggedIn && (
                <div className="hub-lock-overlay" onClick={(e) => { e.stopPropagation(); navigate('/signin'); }}>
                  <div className="hub-lock-icon">🔒</div>
                  <div className="hub-lock-text">Sign in to play</div>
                </div>
              )}
              <div
                className="hub-arch-header"
                style={{ background: game.primary, backgroundImage: `url('${game.bgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <div className="hub-arch-circle">
                  {(() => { const I = GAME_ILLUSTRATIONS[game.key]; return I ? <I /> : null; })()}
                </div>
              </div>
              <div className="hub-body">
                <div className="hub-title" style={{ color: game.dark }}>{game.title}</div>
                <div className="hub-tag" style={{ background: game.light, color: game.dark }}>{game.tag}</div>
                <div className="hub-desc">{game.desc}</div>
                <div className="hub-skills">
                  {game.skills.map((s) => (
                    <span key={s} className="hub-skill" style={{ background: `color-mix(in srgb, ${game.dark} 15%, transparent)`, border: `1.5px solid color-mix(in srgb, ${game.dark} 40%, transparent)`, color: game.dark }}>{s}</span>
                  ))}
                </div>
                <button
                  className="hub-play-btn"
                  style={{ background: game.dark }}
                  onClick={(e) => { e.stopPropagation(); handleCardClick(game.path); }}
                >
                  Play →
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Share CTA */}
        <div style={{ textAlign: 'center', padding: '0 16px 52px', marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '0.88rem', color: colors.text }}>
            👨‍👩‍👧‍👦 Know a parent who'd love this?
          </div>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Red floating dots around the button */}
            {[
              { top: '-8px',  left: '15%',  size: 5, color: colors.coralMid,     delay: '0s',   dur: '2.4s' },
              { top: '-10px', left: '55%',  size: 4, color: colors.blueberryMid, delay: '0.5s', dur: '2.8s' },
              { top: '-6px',  left: '80%',  size: 4, color: colors.grassMid,     delay: '1s',   dur: '2.2s' },
              { top: '50%',   left: '-10px',size: 4, color: colors.sunMid,       delay: '0.7s', dur: '2.6s' },
              { top: '50%',   left: '106%', size: 5, color: colors.coralMid,     delay: '0.3s', dur: '2.5s' },
              { top: '105%',  left: '30%',  size: 4, color: colors.blueberryMid, delay: '0.9s', dur: '2.3s' },
              { top: '105%',  left: '68%',  size: 4, color: colors.grassMid,     delay: '0.4s', dur: '2.7s' },
            ].map((dot, i) => (
              <div key={i} style={{
                position: 'absolute',
                top: dot.top, left: dot.left,
                width: dot.size, height: dot.size,
                borderRadius: '50%',
                background: dot.color,
                animation: `shareDot ${dot.dur} ease-in-out infinite`,
                animationDelay: dot.delay,
                pointerEvents: 'none',
                zIndex: 0,
              }} />
            ))}
            <ShareButton
              label="Share Did It!"
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '11px 28px',
                borderRadius: '9999px',
                border: 'none',
                background: colors.sun,
                color: '#1A1A1A',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                fontSize: '0.9rem',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
