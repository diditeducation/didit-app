import { fonts, colors } from '../design-system/tokens';
import DiditLogo from './DiditLogo';
import ShareButton from '../design-system/components/ShareButton';

/**
 * Hub-bottom share CTA + site footer.
 *
 * Plain white background — just the heading, the warm-cream pill
 * button (with its halo of pastel dots), then the standard logo +
 * tagline + copyright strip below.
 */

const HALO = [
  { top: '-18%', left: '8%',   size: 8,  color: colors.coral },
  { top: '-22%', left: '46%',  size: 9,  color: colors.blueberry },
  { top: '-12%', left: '88%',  size: 8,  color: colors.grass },
  { top: '38%',  left: '-4%',  size: 10, color: colors.sunMid },
  { top: '110%', left: '32%',  size: 9,  color: colors.blueberry },
  { top: '108%', left: '64%',  size: 8,  color: colors.grass },
  { top: '46%',  left: '102%', size: 10, color: colors.coral },
];

export default function HubStoryFooter() {
  // Full-bleed wrapper so this can sit inside Hub.jsx's max-width
  // content column without inheriting its narrow padding.
  const fullBleed = {
    width: '100vw',
    position: 'relative',
    left: '50%',
    right: '50%',
    marginLeft: '-50vw',
    marginRight: '-50vw',
  };

  return (
    <div style={{ ...fullBleed, marginTop: 60, background: '#FFFFFF' }}>
      {/* ── Share CTA ─────────────────────────────────── */}
      <section style={{ padding: '60px 24px 40px', textAlign: 'center' }}>
        <div style={{
          fontFamily: fonts.display,
          fontSize: 18, fontWeight: 800,
          color: colors.text,
          marginBottom: 22,
          letterSpacing: '-0.01em',
        }}>
          <span style={{ marginRight: 8 }} role="img" aria-hidden="true">👨‍👩‍👧</span>
          Know a parent who&apos;d love this?
        </div>

        <div style={{ position: 'relative', display: 'inline-block', padding: '12px 36px' }}>
          {HALO.map((d, i) => (
            <span
              key={i}
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: d.top, left: d.left,
                width: d.size, height: d.size,
                borderRadius: '50%',
                background: d.color, opacity: 0.85,
                pointerEvents: 'none',
              }}
            />
          ))}
          <ShareButton
            gameId="hub-cta"
            label="Share Did It!"
            style={{
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
            }}
          />
        </div>
      </section>

      {/* ── Site footer ───────────────────────────────── */}
      <footer style={{
        background: '#FFFFFF',
        color: '#2D2A26',
        padding: '32px 40px 40px',
        borderTop: `1px solid ${colors.border}`,
      }}>
        <div style={{
          maxWidth: 1000, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: 20,
        }}>
          <div>
            <DiditLogo height={32} />
            <div style={{
              fontFamily: fonts.body, fontStyle: 'normal',
              fontSize: 14, marginTop: 4, color: '#2D2A26',
            }}>
              Real-world concepts for tiny humans.
            </div>
          </div>
          <div style={{
            fontFamily: fonts.body, fontSize: 13, color: '#2D2A26',
          }}>
            © 2026 did*it. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
