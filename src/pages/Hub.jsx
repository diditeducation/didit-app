import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, fonts, radii, shadows } from '../design-system/tokens';
import { GAMES, TODAY_GAME_ID } from '../data/games';
import TodayCard from '../components/TodayCard';
import ParentGuide from '../components/ParentGuide';
import SurpriseSheet from '../components/SurpriseSheet';
import GameGrid from '../components/GameGrid';
import ShareButton from '../design-system/components/ShareButton';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function Hub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const today = GAMES.find(g => g.id === TODAY_GAME_ID);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <div style={{
        background: 'transparent',
        minHeight: '100vh',
        fontFamily: fonts.display,
        padding: '0 24px 88px',
      }}>

        {/* ── Top nav ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0 18px',
        }}>
          <img
            src="/logo.png"
            alt="Did It!"
            onClick={() => navigate('/')}
            style={{ height: 36, width: 'auto', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <ShareButton
              label={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
              }
              style={{
                width: 36, height: 36, borderRadius: '50%',
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
                    width: 36, height: 36, borderRadius: '50%',
                    background: colors.blueberryDark, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
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
                      position: 'absolute', top: 44, right: 0, zIndex: 99,
                      background: 'white', borderRadius: 16,
                      border: `1px solid ${colors.border}`,
                      padding: '16px 20px', minWidth: 220,
                      fontFamily: fonts.display,
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                        {user?.displayName || 'Signed in'}
                      </div>
                      <div style={{ fontSize: 12, color: colors.muted, marginBottom: 16, wordBreak: 'break-all' }}>
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
                          borderRadius: 9999, fontFamily: fonts.display,
                          fontSize: 13, fontWeight: 700, color: colors.coralDark,
                          cursor: 'pointer',
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
        </div>

        {/* ── Today + Surprise Me — constrained column ── */}
        <div style={{ width: '75%', margin: '0 auto 36px' }}>
          {/* ── Today heading ── */}
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <div style={{
              fontSize: 24,
              fontWeight: 900,
              fontFamily: fonts.display,
              letterSpacing: '-0.02em',
            }}>
              <span style={{ color: colors.coralDark }}>Ready </span>
              <span style={{ color: colors.blueberryDark }}>to </span>
              <span style={{ color: colors.sunMid }}>play?</span>
            </div>
          </div>

          {/* ── Hero card + parent guide (single visual unit) ── */}
          <div style={{
            borderRadius: radii.lg,
            overflow: 'hidden',
            boxShadow: shadows.lg,
            marginBottom: 14,
          }}>
            <TodayCard
              game={today}
              onPlay={() => navigate(today.path)}
            />
            <ParentGuide guide={today.parentGuide} />
          </div>

        </div>

        {/* ── All Games catalog ── */}
        <div style={{ width: '75%', margin: '0 auto' }}>
          <GameGrid
            games={GAMES}
            todayId={TODAY_GAME_ID}
            onNavigate={path => navigate(path)}
            onSurprise={() => setSheetOpen(true)}
          />
        </div>
      </div>

      {/* ── Footer with wavy green separator ── */}
      <div style={{ background: 'transparent', marginTop: 40 }}>
        {/* Wavy SVG separator */}
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: 60 }}
        >
          <path
            d="M0,40 C240,100 480,0 720,50 C960,100 1200,10 1440,60 L1440,120 L0,120 Z"
            fill={colors.grassLight}
          />
        </svg>
        <div style={{ background: colors.grassLight, padding: '0 24px 20px' }}>
          {/* Second wave into white */}
          <svg
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            style={{ display: 'block', width: '100%', height: 50 }}
          >
            <path
              d="M0,30 C360,80 720,-10 1080,40 C1260,60 1380,20 1440,30 L1440,100 L0,100 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
        <footer style={{
          background: '#FFFFFF',
          padding: '20px 40px 40px',
          fontFamily: fonts.display,
        }}>
          <div style={{
            maxWidth: 1000,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 20,
          }}>
            <div>
              <img src="/logo.png" alt="did it!" style={{ height: 32, width: 'auto' }} />
              <div style={{
                fontFamily: fonts.display,
                fontSize: 14,
                color: colors.text,
                marginTop: 4,
              }}>
                Real-world concepts for tiny humans.
              </div>
            </div>
            <div style={{
              fontFamily: fonts.display,
              fontSize: 13,
              color: colors.text,
            }}>
              &copy; 2026 did*it. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      {/* ── Surprise bottom sheet ── */}
      <SurpriseSheet
        games={GAMES}
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onPlay={path => navigate(path)}
      />
    </>
  );
}
