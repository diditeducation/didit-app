import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, fonts, radii, shadows } from '../design-system/tokens';
import { GAMES, TODAY_GAME_ID } from '../data/games';
import { trackHubView, trackLandingClick } from '../analytics';
import TodayCard from '../components/TodayCard';
import ParentGuide from '../components/ParentGuide';
import SurpriseSheet from '../components/SurpriseSheet';
import GameGrid from '../components/GameGrid';
import HubStoryFooter from '../components/HubStoryFooter';
import DiditLogo from '../components/DiditLogo';
import WelcomeModal from '../components/WelcomeModal';
import AboutModal from '../components/AboutModal';
import ShareButton from '../design-system/components/ShareButton';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { STRIPE_ENABLED } from '../config';
import { openCustomerPortal } from '../stripe';

export default function Hub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMember } = useSubscription();
  const isLoggedIn = !!user;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [portalBusy, setPortalBusy] = useState(false);
  const [portalError, setPortalError] = useState('');

  // Open the Stripe customer portal (manage / cancel). Reachable by any
  // signed-in member from the hub — never gated behind a paid game, so a
  // lapsed member can always get back here to manage billing.
  const manageSubscription = async () => {
    if (portalBusy) return;
    setPortalBusy(true);
    setPortalError('');
    try {
      await openCustomerPortal(); // redirects to Stripe on success
    } catch {
      setPortalBusy(false);
      setPortalError('Could not open billing. Please try again.');
    }
  };

  // Wait for auth to resolve before tracking so userId/userEmail are populated
  const hubTracked = useRef(false);
  useEffect(() => {
    if (user !== undefined && !hubTracked.current) {
      hubTracked.current = true;
      trackHubView();
    }
  }, [user]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
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
        // Bottom padding zeroed out so the full-bleed HubStoryFooter
        // sits flush against the bottom of the viewport — no awkward
        // empty white strip below the © line.
        padding: '0 24px 0',
        maxWidth: 680,
        margin: '0 auto',
      }}>

        {/* ── Top nav ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 0 18px',
        }}>
          <DiditLogo height={36} onNavigate={() => navigate('/')} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* About us */}
            <button
              onClick={() => { setAboutOpen(true); trackLandingClick('about-icon'); }}
              aria-label="About Did·It"
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: colors.blueberryDark, border: 'none',
                color: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', padding: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="8" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="12" y1="12" x2="12" y2="16"/>
              </svg>
            </button>

            <ShareButton
              gameId="hub-nav"
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
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => isLoggedIn ? setShowUserMenu(!showUserMenu) : navigate('/signin')}
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
              {showUserMenu && isLoggedIn && (
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
                    {STRIPE_ENABLED && isMember && (
                      <>
                        <button
                          onClick={manageSubscription}
                          disabled={portalBusy}
                          style={{
                            width: '100%', padding: '10px 16px', marginBottom: 10,
                            background: 'transparent', border: `1px solid ${colors.border}`,
                            borderRadius: 9999, fontFamily: fonts.display,
                            fontSize: 13, fontWeight: 700, color: colors.text,
                            cursor: portalBusy ? 'wait' : 'pointer', opacity: portalBusy ? 0.7 : 1,
                          }}
                        >
                          {portalBusy ? 'Opening billing…' : 'Manage subscription'}
                        </button>
                        {portalError && (
                          <div style={{ fontSize: 11, color: colors.coralDark, fontWeight: 700, marginBottom: 10 }}>
                            {portalError}
                          </div>
                        )}
                      </>
                    )}
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
          </div>
        </div>

        {/* ── Today + Surprise Me ── */}
        <div style={{ marginBottom: 36 }}>
          {/* ── Today heading ── */}
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <div style={{
              fontSize: 24,
              fontWeight: 900,
              fontFamily: fonts.display,
              letterSpacing: '-0.02em',
              marginBottom: 6,
            }}>
              <span style={{ color: colors.coralDark }}>Ready </span>
              <span style={{ color: colors.blueberryDark }}>to </span>
              <span style={{ color: colors.sunMid }}>play?</span>
            </div>
            <div style={{
              fontSize: 13,
              fontWeight: 600,
              fontFamily: fonts.display,
              color: colors.muted,
              letterSpacing: '0.01em',
            }}>
              Science agrees: play is how children develop best.
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
        <div>
          <GameGrid
            games={GAMES}
            todayId={TODAY_GAME_ID}
            onNavigate={path => navigate(path)}
            onSurprise={() => setSheetOpen(true)}
          />
        </div>

        <HubStoryFooter />
      </div>


      {/* ── Welcome modal (first 3 visits) ── */}
      <WelcomeModal />

      {/* ── About modal ── */}
      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}

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
