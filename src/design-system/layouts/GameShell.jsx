import { fonts, easing } from '../tokens';
import { PAGE_MAX_WIDTH, BOTTOM_STRIP_HEIGHT } from '../layout';
import ParentStrip from '../components/ParentStrip';
import { useSoundManager } from '../useSoundManager';

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

  const outerStyle = {
    minHeight: '100vh',
    background: 'var(--game-bg)',
    color: 'var(--game-text)',
  };

  const innerStyle = {
    maxWidth: `${PAGE_MAX_WIDTH}px`,
    margin: '0 auto',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: `${BOTTOM_STRIP_HEIGHT}px`,
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
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.04)',
    border: '1px solid rgba(0,0,0,0.08)',
    color: 'var(--game-text)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1.1rem',
    padding: 0,
  };

  const iconBtnStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.04)',
    border: '1px solid rgba(0,0,0,0.08)',
    color: 'var(--game-text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '0.9rem',
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
      <div style={topBarStyle}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button style={backBtnStyle} onClick={onBack} aria-label="Go back">
              ←
            </button>
            <button style={iconBtnStyle} onClick={toggleMute} aria-label="Toggle sound">
              {muted ? '🔇' : '🔊'}
            </button>
          </div>
          <span style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: '1rem', color: 'var(--game-text)', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>{title}</span>
          <div style={{ width: '84px' }} />
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
