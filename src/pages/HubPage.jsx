import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../design-system/tokens';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const GAMES = [
  {
    key: 'shopper',
    title: 'Little Shopper',
    tag: '\uD83D\uDCB0 Financial Literacy',
    desc: 'They earn coins, choose what to buy, decide what to save, and figure out what things are worth.',
    skills: ['Budgeting', 'Saving', 'Decisions'],
    img: '/game%20illustrations/Bank.png',
    bgImage: '/backgrounds/background-green.png',
    primary: colors.grassMid,
    dark: colors.grassDark,
    light: colors.grassLight,
    path: '/games/little-shopper',
  },
  {
    key: 'dj',
    title: 'Little DJ',
    tag: '\uD83C\uDFB5 Music Fundamentals',
    desc: 'Sliders for tempo, notes to stretch, and tracks to play with. Rhythm, pitch, and composition.',
    skills: ['Pitch', 'Rhythm', 'Mixing'],
    img: '/game%20illustrations/Music.png',
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
    img: '/game%20illustrations/Bulb.png',
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
    img: '/game%20illustrations/Pizza.png',
    bgImage: '/backgrounds/background-yellow.png',
    primary: colors.sunMid,
    dark: colors.sunDark,
    light: colors.sunLight,
    path: '/games/little-chef',
  },
];

const css = `
.hub-nav{position:sticky;top:0;z-index:100;padding:20px 40px;display:flex;align-items:center;justify-content:space-between;backdrop-filter:blur(20px);background:rgba(255,255,255,0.9);border-bottom:1px solid rgba(0,0,0,0.04)}
.hub-nav-logo{cursor:pointer;display:flex;align-items:center}
.hub-grid{max-width:1100px;margin:40px auto 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;padding:0 40px 60px;justify-items:center}
.hub-card{display:flex;flex-direction:column;overflow:visible;transition:transform .2s ease;cursor:pointer;background:white;position:relative;border-radius:16px;border:1px solid ${colors.border};aspect-ratio:54/86;width:100%}
.hub-card:hover{transform:translateY(-4px)}
.hub-arch-header{position:relative;height:45%;border-radius:16px 16px 0 0;overflow:hidden;background-size:cover;background-position:center}
.hub-arch-header::after{content:'';position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:160%;height:72px;background:white;border-radius:50% 50% 0 0}
.hub-arch-circle{position:absolute;bottom:6px;left:50%;transform:translateX(-50%);width:130px;height:130px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;z-index:2}
.hub-arch-circle img{width:108px;height:108px;object-fit:contain}
.hub-body{padding:14px 14px 18px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:7px;flex:1}
.hub-title{font-family:'Nunito',sans-serif;font-weight:900;font-size:1.6rem;margin:-16px 0 0;letter-spacing:-0.02em}
.hub-tag{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:9999px;font-family:'Nunito',sans-serif;font-size:0.6rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase}
.hub-desc{font-size:0.75rem;color:#2D2A26;line-height:1.5;margin:0;min-height:2.2em;font-family:'Nunito',sans-serif}
.hub-skills{display:flex;flex-wrap:nowrap;gap:5px;justify-content:center;margin-top:auto;margin-bottom:3px;min-height:24px;width:100%;overflow:hidden}
.hub-skill{padding:5px 10px;border-radius:9999px;font-size:0.6rem;font-weight:700;font-family:'Nunito',sans-serif}
.hub-play-btn{padding:10px 28px;border-radius:9999px;border:none;font-family:'Nunito',sans-serif;font-size:0.8rem;font-weight:800;cursor:pointer;transition:all .25s;color:#fff;margin-top:auto}
.hub-play-btn:hover{transform:translateY(-2px);filter:brightness(1.1)}
.hub-lock-overlay{position:absolute;inset:0;z-index:10;border-radius:18px;background:rgba(255,255,255,0.7);backdrop-filter:blur(2px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:background .2s}
.hub-lock-overlay:hover{background:rgba(255,255,255,0.6)}
.hub-lock-icon{font-size:2.5rem;opacity:0.8}
.hub-lock-text{font-family:'Nunito',sans-serif;font-size:0.8rem;font-weight:700;color:${colors.text};opacity:0.7}
@media (max-width: 768px){
  .hub-nav{padding:14px 16px}
  .hub-nav-links{gap:12px}
  .hub-nav-links a{display:none}
  .hub-grid{grid-template-columns:1fr 1fr;padding:0 20px 40px;max-width:500px;gap:12px}
  .hub-card{aspect-ratio:auto}
  .hub-arch-header{height:140px}
  .hub-body{padding:10px 10px 14px!important}
  .hub-title{font-size:1rem!important}
  .hub-intro{padding:60px 20px 16px!important}
  .hub-intro h2{font-size:clamp(24px,6vw,36px)!important}
  .hub-intro p{font-size:14px!important}
}
@media (max-width: 480px){
  .hub-grid{padding:0 16px 32px}
  .hub-arch-header{height:160px}
  .hub-intro{padding:48px 16px 12px!important}
}
@keyframes hubDrift{0%,100%{transform:translate(0,0) scale(1)}25%{transform:translate(15px,-20px) scale(1.1)}50%{transform:translate(-10px,-35px) scale(0.95)}75%{transform:translate(20px,-15px) scale(1.05)}}
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
        <span className="hub-nav-logo" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="did it!" style={{ height: '36px', width: 'auto' }} />
        </span>
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          <div className="hub-nav-links" style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          </div>
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
                  <img src={game.img} alt={game.title} />
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
      </div>
    </>
  );
}
