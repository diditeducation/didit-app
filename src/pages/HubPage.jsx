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
.hub-grid{max-width:728px;margin:40px auto 0;display:grid;grid-template-columns:1fr 1fr;gap:18px;padding:0 40px 60px;justify-items:center}
.hub-card{display:flex;flex-direction:column;overflow:visible;transition:transform .2s ease;cursor:pointer;background:white;position:relative;border-radius:18px;border:1px solid ${colors.border};aspect-ratio:54/86;width:100%}
.hub-card:hover{transform:translateY(-4px)}
.hub-arch-header{position:relative;height:45%;border-radius:18px 18px 0 0;overflow:hidden;background-size:cover;background-position:center}
.hub-arch-header::after{content:'';position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:160%;height:80px;background:white;border-radius:50% 50% 0 0}
.hub-arch-circle{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:150px;height:150px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;z-index:2}
.hub-arch-circle img{width:128px;height:128px;object-fit:contain}
.hub-body{padding:20px 18px 20px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;flex:1}
.hub-title{font-family:'Nunito',sans-serif;font-weight:900;font-size:1.8rem;margin:-20px 0 0;letter-spacing:-0.02em}
.hub-tag{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:9999px;font-family:'Nunito',sans-serif;font-size:0.6rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase}
.hub-desc{font-size:0.8rem;color:#2D2A26;line-height:1.5;margin:0;min-height:2.25em;font-family:'Nunito',sans-serif}
.hub-skills{display:flex;flex-wrap:nowrap;gap:6px;justify-content:center;margin-top:auto;margin-bottom:4px;min-height:28px;width:100%;overflow:hidden}
.hub-skill{padding:6px 12px;border-radius:9999px;font-size:0.65rem;font-weight:700;font-family:'Nunito',sans-serif;border:none}
.hub-play-btn{padding:10px 34px;border-radius:9999px;border:none;font-family:'Nunito',sans-serif;font-size:0.8rem;font-weight:800;cursor:pointer;transition:all .25s;color:#fff;margin-top:auto}
.hub-play-btn:hover{transform:translateY(-2px);filter:brightness(1.1)}
.hub-lock-overlay{position:absolute;inset:0;z-index:10;border-radius:18px;background:rgba(255,255,255,0.7);backdrop-filter:blur(2px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:background .2s}
.hub-lock-overlay:hover{background:rgba(255,255,255,0.6)}
.hub-lock-icon{font-size:2.5rem;opacity:0.8}
.hub-lock-text{font-family:'Nunito',sans-serif;font-size:0.8rem;font-weight:700;color:${colors.text};opacity:0.7}
@media(max-width:768px){
  .hub-nav{padding:14px 16px}
  .hub-nav-links a:not(.hub-nav-cta){display:none}
  .hub-grid{grid-template-columns:1fr;padding:0 20px 40px;max-width:400px;gap:16px}
  .hub-card-v{aspect-ratio:auto!important}
  .hub-arch-header{height:180px}
  .hub-body{padding:16px 16px 20px!important}
  .hub-title{font-size:1.5rem!important}
  .hub-intro{padding:60px 20px 16px!important}
  .hub-intro h2{font-size:clamp(24px,6vw,36px)!important}
  .hub-intro p{font-size:14px!important}
}
@media(max-width:480px){
  .hub-grid{padding:0 16px 32px}
  .hub-arch-header{height:160px}
  .hub-intro{padding:48px 16px 12px!important}
}
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
          <a onClick={() => navigate('/')} style={{ fontFamily: "'Nunito', sans-serif", fontSize: '14px', fontWeight: 600, color: colors.text, textDecoration: 'none', opacity: 0.6, cursor: 'pointer' }}>Home</a>
          <a onClick={() => navigate('/#problem')} style={{ fontFamily: "'Nunito', sans-serif", fontSize: '14px', fontWeight: 600, color: colors.text, textDecoration: 'none', opacity: 0.6, cursor: 'pointer' }}>Why</a>
          <a onClick={() => navigate('/#how')} style={{ fontFamily: "'Nunito', sans-serif", fontSize: '14px', fontWeight: 600, color: colors.text, textDecoration: 'none', opacity: 0.6, cursor: 'pointer' }}>Our Philosophy</a>
          <a onClick={() => navigate('/#ourstory')} style={{ fontFamily: "'Nunito', sans-serif", fontSize: '14px', fontWeight: 600, color: colors.text, textDecoration: 'none', opacity: 0.6, cursor: 'pointer' }}>Our Story</a>
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
        <div style={{ textAlign: 'center', padding: '60px 40px 20px' }}>
          <h1 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 'clamp(30px, 4.5vw, 46px)', letterSpacing: '-0.03em', color: colors.text, marginBottom: 16, lineHeight: 1.15 }}>
            Choose a game
          </h1>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 16, lineHeight: 1.65, color: colors.text, maxWidth: 560, margin: '0 auto' }}>
            Each game teaches one big real-world concept through simple, joyful interactions designed for little hands.
          </p>
        </div>

        <div className="hub-grid">
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
                <div className="hub-tag" style={{ background: game.light, color: game.primary }}>{game.tag}</div>
                <div className="hub-desc">{game.desc}</div>
                <div className="hub-skills">
                  {game.skills.map((s) => (
                    <span key={s} className="hub-skill" style={{ background: game.light, color: game.primary }}>{s}</span>
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
