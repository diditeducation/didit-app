import { fonts, colors } from '../design-system/tokens';
import DiditLogo from './DiditLogo';
import ShareButton from '../design-system/components/ShareButton';

/**
 * Hub-bottom story + share + copyright block.
 *
 * Visual is an exact copy of the MarketingPage "Our Story" section
 * (sun-light yellow background with wavy SVG edges + "How it started"
 * text on the right) and the white site footer (logo + tagline + ©).
 *
 * The only swap vs. MarketingPage: the lightbulb illustration on the
 * left is replaced with the Share Did·It CTA — the hub already shows
 * the games, so what we want from a returning parent here is a
 * referral, not another "what is Did·It" pitch.
 *
 * The block is rendered at full viewport width (100 vw) so it can
 * break out of Hub.jsx's max-width content wrapper without that file
 * needing structural changes.
 */
const SUN_LIGHT = '#F0F0A0';

// Halo dot palette (re-uses brand tokens for consistency with the
// share CTA we shipped earlier in HubShareCTA).
const HALO = [
  { top: '-18%', left: '8%',  size: 8,  color: colors.coral },
  { top: '-22%', left: '46%', size: 9,  color: colors.blueberry },
  { top: '-12%', left: '88%', size: 8,  color: colors.grass },
  { top: '38%',  left: '-4%', size: 10, color: colors.sunMid },
  { top: '110%', left: '32%', size: 9,  color: colors.blueberry },
  { top: '108%', left: '64%', size: 8,  color: colors.grass },
  { top: '46%',  left: '102%',size: 10, color: colors.coral },
];

export default function HubStoryFooter() {
  // Inline styles so this component is self-contained — no external
  // CSS file needed.
  const fullBleed = {
    width: '100vw',
    position: 'relative',
    left: '50%',
    right: '50%',
    marginLeft: '-50vw',
    marginRight: '-50vw',
  };

  return (
    <div style={{ ...fullBleed, marginTop: 60 }}>
      {/* ── Yellow wavy section ─────────────────────────── */}
      <section
        style={{
          background: SUN_LIGHT,
          padding: '80px 40px 60px',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {/* Top wave */}
        <div style={{
          position: 'absolute', top: -40, left: 0, right: 0, height: 60,
          overflow: 'hidden', pointerEvents: 'none',
        }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path
              d="M0,30 C120,55 240,5 360,30 C480,55 600,10 720,35 C840,60 960,5 1080,30 C1200,55 1320,10 1440,30 L1440,60 L0,60 Z"
              fill={SUN_LIGHT}
            />
          </svg>
        </div>
        {/* Bottom wave */}
        <div style={{
          position: 'absolute', bottom: -40, left: 0, right: 0, height: 60,
          overflow: 'hidden', pointerEvents: 'none',
        }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path
              d="M0,30 C160,5 320,55 480,30 C640,5 800,55 960,30 C1120,5 1280,55 1440,30 L1440,0 L0,0 Z"
              fill={SUN_LIGHT}
            />
          </svg>
        </div>

        <StoryGrid />
      </section>

      {/* spacer matches MarketingPage's 40px gap */}
      <div style={{ height: 40, background: '#FFFFFF' }} />

      {/* ── White site footer ───────────────────────────── */}
      <footer style={{
        background: '#FFFFFF',
        color: '#2D2A26',
        padding: '50px 40px 40px',
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

/**
 * Two-column grid (stacks on mobile via the `--story-cols` CSS
 * variable trick — flips to 1 column at <720 px via the wrapping
 * <style> tag below).
 */
function StoryGrid() {
  return (
    <>
      <style>{`
        .didit-story-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          max-width: 1000px;
          margin: 0 auto;
        }
        @media (max-width: 760px) {
          .didit-story-grid {
            grid-template-columns: 1fr;
            gap: 40px;
            text-align: center;
          }
          .didit-story-share { justify-self: center; }
        }
      `}</style>
      <div className="didit-story-grid">
        {/* Left — Share CTA replaces the lightbulb illustration */}
        <div
          className="didit-story-share"
          style={{
            position: 'relative', height: 400,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Decorative white blobs from MarketingPage — keeps the
              cut-paper feel even though the centre piece changed. */}
          <div style={{
            position: 'absolute', width: 100, height: 100,
            borderRadius: '45% 55% 50% 50%',
            background: '#FFFFFF', top: '2%', right: '15%', opacity: 0.7,
          }} />
          <div style={{
            position: 'absolute', width: 70, height: 70,
            borderRadius: '50% 42% 55% 48%',
            background: '#FFFFFF', bottom: '10%', left: '8%', opacity: 0.6,
          }} />
          <div style={{
            position: 'absolute', width: 50, height: 50,
            borderRadius: '50%',
            background: '#FFFFFF', bottom: '20%', right: '10%', opacity: 0.5,
          }} />

          {/* The CTA itself */}
          <ShareCTA />
        </div>

        {/* Right — Our Story */}
        <div>
          <p style={{
            fontFamily: fonts.body, fontSize: '0.85rem', fontWeight: 800,
            color: '#2D2A26', letterSpacing: '0.05em',
            marginBottom: 8, textTransform: 'uppercase', margin: 0,
          }}>
            How it started
          </p>
          <div style={{
            fontFamily: fonts.body, fontSize: '1.4rem', fontWeight: 900,
            color: '#2D2A26', marginBottom: 8, marginTop: 4,
          }}>
            Our Story
          </div>
          <p style={paraStyle}>
            We&apos;re parents from Sydney, Australia who have a wonderfully
            energetic and curious toddler. 🧡
          </p>
          <p style={paraStyle}>
            Teaching our child is one of our favourite things to do together.
            But when we went looking for games to play with him, we kept
            running into the same two problems.
          </p>
          <div style={{
            fontFamily: fonts.body, fontSize: '0.95rem', lineHeight: 1.4,
            color: '#2D2A26', margin: '0 0 16px', paddingLeft: 20,
          }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <span style={{ color: colors.coralMid, fontWeight: 800, flexShrink: 0 }}>1.</span>
              <span>Most kids&apos; games are loud, busy, and designed to keep little eyes glued to the screen.</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ color: colors.blueberryDark, fontWeight: 800, flexShrink: 0 }}>2.</span>
              <span>The educational ones, while great for letters and numbers — rarely go beyond the basics. We were looking for something that could start introducing them to real world bigger ideas.</span>
            </div>
          </div>
          <p style={paraStyle}>
            So we built some games. The more we played, the more we realised
            how capable kids really are. Their minds can stretch so much
            further than we give them credit for.
          </p>
          <p style={{ ...paraStyle, fontWeight: 800, margin: 0 }}>
            We hope your family gets to discover that too as you play along!
          </p>
        </div>
      </div>
    </>
  );
}

const paraStyle = {
  fontFamily: fonts.body,
  fontSize: '0.95rem',
  lineHeight: 1.4,
  color: '#2D2A26',
  margin: '0 0 16px',
};

function ShareCTA() {
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
    <div style={{
      position: 'relative', textAlign: 'center', zIndex: 2,
    }}>
      <div style={{
        fontSize: 18, fontWeight: 800, fontFamily: fonts.display,
        color: colors.text, marginBottom: 22, letterSpacing: '-0.01em',
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
        <ShareButton gameId="hub-cta" label="Share Did It!" style={pillStyle} />
      </div>
    </div>
  );
}
