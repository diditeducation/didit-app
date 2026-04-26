import { fonts, easing } from '../tokens';
import { PAGE_MAX_WIDTH, BOTTOM_STRIP_HEIGHT } from '../layout';
import ParentStrip from '../components/ParentStrip';
import { useSoundManager } from '../useSoundManager';
import { useNavigate } from 'react-router-dom';

export default function GameShell({
  title,
  levels = [],
  activeLevel,
  onLevelChange,
  onBack,
  unlockedUpTo = 1,
  hideTabs = false,
  children,
  topSlot,
  bottomSlot,
}) {
  const { muted, toggleMute } = useSoundManager();
  const nav = useNavigate();

  // Use 100dvh (dynamic viewport height) instead of 100vh so the layout
  // tracks the iOS Safari URL bar instead of being clipped when it
  // collapses or expands.
  const outerStyle = {
    height: '100dvh',
    overflow: 'hidden',
    background: 'var(--game-bg)',
    color: 'var(--game-text)',
    maxWidth: `${PAGE_MAX_WIDTH}px`,
    margin: '0 auto',
  };

  const innerStyle = {
    maxWidth: `${PAGE_MAX_WIDTH}px`,
    margin: '0 auto',
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: `${BOTTOM_STRIP_HEIGHT}px`,
    boxSizing: 'border-box',
  };

  const topBarStyle = {
    height: '56px',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  };

  const backBtnStyle = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.04)',
    border: '1px solid rgba(0,0,0,0.08)',
    color: 'var(--game-text)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: 0,
  };

  const iconBtnStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.06)',
    border: 'none',
    color: 'var(--game-text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '0.8rem',
    padding: 0,
  };

  const tabsContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    padding: '12px 24px',
    overflowX: 'auto',
    flexShrink: 0,
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  };

  const segmentedWrapperStyle = {
    display: 'flex',
    borderRadius: '9999px',
    overflow: 'hidden',
    border: 'none',
    background: 'rgba(0,0,0,0.04)',
  };

  const tabStyle = (isActive, isLocked, index, total) => ({
    minHeight: '40px',
    minWidth: '80px',
    padding: '8px 16px',
    borderRadius: 0,
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: '0.8rem',
    cursor: isLocked ? 'default' : 'pointer',
    transition: `all 0.2s ${easing.bounce}`,
    border: 'none',
    borderRight: index < total - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none',
    background: isActive ? 'var(--game-primary)' : 'rgba(0,0,0,0.04)',
    color: isActive ? '#FFFFFF' : 'var(--game-text-muted)',
    whiteSpace: 'nowrap',
    WebkitTapHighlightColor: 'transparent',
    opacity: isLocked ? 0.4 : 1,
    pointerEvents: isLocked ? 'none' : 'auto',
  });

  const gameAreaStyle = {
    flex: 1,
    padding: '8px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflowY: 'auto',
  };

  return (
    <div style={outerStyle}>
    <div style={innerStyle}>
      {/* Hide scrollbar via injected style */}
      <style>{`
        .didit-tabs::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Top Bar */}
      <div style={{ padding: '8px 16px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/logo.png" alt="Did It!" style={{ height: 28, objectFit: 'contain', cursor: 'pointer' }} onClick={() => nav('/hub')} />
            <span style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: '0.9rem', color: 'var(--game-primary)', whiteSpace: 'nowrap' }}>{title}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button style={iconBtnStyle} onClick={() => nav('/hub')} aria-label="Games hub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </button>
            <button style={iconBtnStyle} onClick={toggleMute} aria-label="Toggle sound">
              {muted
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              }
            </button>
          </div>
        </div>
      </div>

      {/* Level Tabs */}
      {!hideTabs && levels.length > 0 && (
        <div className="didit-tabs" style={tabsContainerStyle}>
          <div style={segmentedWrapperStyle}>
            {levels.map((level, index) => {
              const isLocked = level.id > unlockedUpTo;
              return (
                <button
                  key={level.id}
                  style={tabStyle(level.id === activeLevel, isLocked, index, levels.length)}
                  onClick={() => onLevelChange(level.id)}
                >
                  {isLocked ? `🔒 ${level.label}` : level.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Slot — between tabs and game area */}
      {topSlot && (
        <div style={{ background: 'var(--game-bg)', flexShrink: 0 }}>
          {topSlot}
        </div>
      )}

      {/* Game Area */}
      <div style={gameAreaStyle}>
        {children}
      </div>

      {/* Bottom Slot — between game area and parent strip */}
      {bottomSlot && (
        <div style={{ background: 'var(--game-bg)', flexShrink: 0 }}>
          {bottomSlot}
        </div>
      )}

      {/* Parent Strip */}
      <ParentStrip showTagline={false} />
    </div>
    </div>
  );
}
