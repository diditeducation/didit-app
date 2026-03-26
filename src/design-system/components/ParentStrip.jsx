import { fonts } from '../tokens';
import { BOTTOM_STRIP_HEIGHT, PAGE_MAX_WIDTH, PAGE_PADDING_X } from '../layout';

export default function ParentStrip({ showTagline = true }) {
  const stripStyle = {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: `${PAGE_MAX_WIDTH}px`,
    height: `${BOTTOM_STRIP_HEIGHT}px`,
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `0 ${PAGE_PADDING_X}px`,
    zIndex: 200,
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontFamily: fonts.body,
    fontSize: '0.72rem',
    color: 'var(--game-text-muted)',
    textAlign: 'center',
    flex: 1,
    padding: '0 8px',
    lineHeight: 1.4,
  };

  return (
    <div style={stripStyle}>
      {showTagline && (
        <div style={labelStyle}>
          No ads, no in-app purchases.<br />
          Just simple and fun games you can feel safe about.
        </div>
      )}
    </div>
  );
}
