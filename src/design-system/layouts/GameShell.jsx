import { useRef, useLayoutEffect } from 'react';
import { fonts, easing } from '../tokens';
import { PAGE_MAX_WIDTH, BOTTOM_STRIP_HEIGHT } from '../layout';
import ParentStrip from '../components/ParentStrip';
import DiditLogo from '../../components/DiditLogo';
import { useSoundManager } from '../useSoundManager';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '../../context/DemoContext';

export default function GameShell({
  title,
  levels = [],
  activeLevel,
  onLevelChange,
  unlockedUpTo = 1,
  hideTabs = false,
  instructions,
  children,
  topSlot,
  bottomSlot,
}) {
  const { muted, toggleMute } = useSoundManager();
  const nav = useNavigate();
  const { isDemo } = useDemo();

  // In the landing sampler the game is squeezed into a small iPad frame.
  // Rather than scroll, render the game at its natural size and scale it
  // down to fit the available height — works for every game regardless of
  // how tall its content is.
  const gameAreaRef = useRef(null);
  const contentRef = useRef(null);
  useLayoutEffect(() => {
    if (!isDemo) return;
    const area = gameAreaRef.current;
    const content = contentRef.current;
    if (!area || !content) return;
    const fit = () => {
      content.style.transform = 'none';
      const needed = content.scrollHeight;
      const avail = area.clientHeight;
      const s = needed > avail && needed > 0 ? avail / needed : 1;
      content.style.transform = `scale(${s})`;
      content.style.transformOrigin = 'top center';
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(area);
    ro.observe(content);
    return () => ro.disconnect();
  }, [isDemo]);

  // Use 100dvh (dynamic viewport height) instead of 100vh so the layout
  // tracks the iOS Safari URL bar. Subtracting --app-banner-h means
  // the BetaBanner doesn't push the game's bottom strip off-screen.
  const viewportH = 'calc(100dvh - var(--app-banner-h, 0px))';
  const outerStyle = {
    height: viewportH,
    overflow: 'hidden',
    background: 'var(--game-bg)',
    color: 'var(--game-text)',
    maxWidth: `${PAGE_MAX_WIDTH}px`,
    margin: '0 auto',
  };

  const innerStyle = {
    maxWidth: `${PAGE_MAX_WIDTH}px`,
    margin: '0 auto',
    height: viewportH,
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: `${BOTTOM_STRIP_HEIGHT}px`,
    boxSizing: 'border-box',
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
    minHeight: 0,
    padding: isDemo ? '4px 14px 12px' : '8px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflowY: isDemo ? 'hidden' : 'auto',
  };

  return (
    <div style={outerStyle}>
    <div style={innerStyle}>
      {/* Hide scrollbar via injected style */}
      <style>{`
        .didit-tabs::-webkit-scrollbar { display: none; }
      `}</style>

      {(() => {
        const soundBtn = (
          <button style={iconBtnStyle} onClick={toggleMute} aria-label="Toggle sound">
            {muted
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            }
          </button>
        );

        // Sampler / demo header: centred logo + title, trial pill + sound top-right.
        if (isDemo) {
          return (
            <div style={{ position: 'relative', padding: 'clamp(10px,3vw,28px) 18px 0', flexShrink: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(3px,1vw,8px)' }}>
                <DiditLogo height={36} hideBeta />
                <span style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 'clamp(1.15rem,4.8vw,1.85rem)', letterSpacing: '-0.01em', color: 'var(--game-primary)', whiteSpace: 'nowrap' }}>{title}</span>
                <span style={{ display: 'inline-block', padding: 'clamp(5px,1.5vw,8px) clamp(11px,3vw,16px)', borderRadius: '9999px', background: 'var(--game-primary)', color: '#FFFFFF', fontFamily: fonts.display, fontWeight: 800, fontSize: 'clamp(0.68rem,2vw,0.85rem)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Trial version
                </span>
              </div>
              <div style={{ position: 'absolute', top: 'clamp(10px,3vw,28px)', right: 18 }}>
                <div style={{ transform: 'scale(1.2)' }}>{soundBtn}</div>
              </div>
            </div>
          );
        }

        return (
          <div style={{ padding: '8px 16px 0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <DiditLogo height={28} />
                <span style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: '0.9rem', color: 'var(--game-primary)', whiteSpace: 'nowrap' }}>{title}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button style={iconBtnStyle} onClick={() => nav('/hub')} aria-label="Games hub">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </button>
                {soundBtn}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Instructions (sampler) OR level tabs */}
      {isDemo ? (
        instructions && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'clamp(6px,1.8vw,12px) 24px 4px', flexShrink: 0 }}>
            <p style={{ margin: 0, fontFamily: fonts.display, fontSize: 'clamp(0.95rem,3.3vw,1.2rem)', fontWeight: 800, color: 'var(--game-text)', textAlign: 'center', maxWidth: '440px', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
              {instructions}
            </p>
          </div>
        )
      ) : (!hideTabs && levels.length > 0 && (
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
      ))}

      {/* Top Slot — between tabs and game area */}
      {topSlot && (
        <div style={{ background: 'var(--game-bg)', flexShrink: 0 }}>
          {topSlot}
        </div>
      )}

      {/* Game Area */}
      <div style={gameAreaStyle} ref={gameAreaRef}>
        {isDemo ? (
          <div ref={contentRef} style={{ width: '100%' }}>{children}</div>
        ) : (
          children
        )}
      </div>

      {/* Bottom Slot — between game area and parent strip */}
      {bottomSlot && (
        <div style={{ background: 'var(--game-bg)', flexShrink: 0 }}>
          {bottomSlot}
        </div>
      )}

      {/* Parent Strip — hidden in the landing sampler to give the game full room */}
      {!isDemo && <ParentStrip showTagline={false} />}
    </div>
    </div>
  );
}
