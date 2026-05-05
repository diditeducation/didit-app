import { fonts, colors } from '../design-system/tokens';
import ShareButton from '../design-system/components/ShareButton';

/**
 * Hub-bottom share CTA — sits above the HubFooter on /hub.
 *
 * Wraps the shared design-system ShareButton (so the share text, URL,
 * native share sheet and clipboard fallback are 100 % identical to
 * every other share point in the app) and dresses it up as a warm
 * pill with a halo of pastel dots.
 */
export default function HubShareCTA() {
  // Decorative halo dots positioned around the pill button. Coords are
  // percentages of the pill wrapper so the halo scales naturally with
  // the button. Each dot uses one of the brand-palette accents.
  const HALO = [
    { top: '-18%', left: '8%',  size: 8,  color: colors.coral },
    { top: '-22%', left: '46%', size: 9,  color: colors.blueberry },
    { top: '-12%', left: '88%', size: 8,  color: colors.grass },
    { top: '38%',  left: '-4%', size: 10, color: colors.sunMid },
    { top: '110%', left: '32%', size: 9,  color: colors.blueberry },
    { top: '108%', left: '64%', size: 8,  color: colors.grass },
    { top: '46%',  left: '102%',size: 10, color: colors.coral },
  ];

  const pillStyle = {
    background: '#FFE9A8',
    color: colors.text,
    border: 'none',
    borderRadius: 9999,
    padding: '14px 36px',
    minHeight: 56,
    fontFamily: fonts.display,
    fontWeight: 900,
    fontSize: '1.05rem',
    cursor: 'pointer',
    boxShadow: 'none',
    letterSpacing: '0.01em',
    textDecoration: 'none',
    WebkitTapHighlightColor: 'transparent',
    transition: 'transform 0.15s ease',
  };

  return (
    <section
      style={{
        marginTop: 28,
        marginBottom: 28,
        textAlign: 'center',
        fontFamily: fonts.display,
      }}
      aria-label="Share Did·It with a friend"
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: colors.text,
          marginBottom: 22,
          letterSpacing: '-0.01em',
        }}
      >
        <span style={{ marginRight: 8 }} role="img" aria-hidden="true">👨‍👩‍👧</span>
        Know a parent who&apos;d love this?
      </div>

      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          // Pad enough for the halo dots not to clip on small screens.
          padding: '12px 36px',
        }}
      >
        {HALO.map((d, i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: d.top,
              left: d.left,
              width: d.size,
              height: d.size,
              borderRadius: '50%',
              background: d.color,
              opacity: 0.85,
              pointerEvents: 'none',
            }}
          />
        ))}

        <ShareButton
          gameId="hub-cta"
          label="Share Did It!"
          style={pillStyle}
        />
      </div>
    </section>
  );
}
