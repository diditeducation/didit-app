import { useNavigate } from 'react-router-dom';
import { fonts, colors } from '../design-system/tokens';

/**
 * Discreet hub footer — links to /about so signed-in parents can find
 * Did·It's philosophy without competing with the games grid.
 */
export default function HubFooter() {
  const nav = useNavigate();
  const linkStyle = {
    background: 'transparent',
    border: 'none',
    padding: 0,
    margin: 0,
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 12,
    color: colors.muted,
    cursor: 'pointer',
    textDecoration: 'underline',
    textDecorationStyle: 'dashed',
    textUnderlineOffset: '3px',
  };

  return (
    <footer style={{
      marginTop: 28,
      padding: '20px 0 4px',
      borderTop: `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
    }}>
      <button type="button" onClick={() => nav('/home')} style={linkStyle}>
        About Did·It
      </button>
      <span style={{
        fontFamily: fonts.display,
        fontWeight: 500,
        fontSize: 11,
        color: colors.muted,
        opacity: 0.65,
      }}>
        Made with care for toddlers and their grown-ups.
      </span>
    </footer>
  );
}
