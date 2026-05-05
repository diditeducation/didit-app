import { fonts, colors } from '../design-system/tokens';
import DiditLogo from './DiditLogo';
import ShareButton from '../design-system/components/ShareButton';

/**
 * Hub-bottom share CTA + site footer.
 *
 * Pale-green wavy section hosting the share CTA, then the standard
 * white logo + tagline + copyright strip below.
 */

const GRASS_LIGHT = colors.grassLight; // '#E0F0A8'

// Halo dots use the Did·It primary palette tokens. Positions are
// pulled in tight so the halo hugs the pill. Each dot has its own
// duration + delay so the floating animation feels organic instead of
// metronome-synchronised.
const HALO = [
  { top: '-10%', left: '18%',  size: 7, color: colors.coralDark,     dur: 3.2, delay: 0.0 },
  { top: '-14%', left: '50%',  size: 8, color: colors.blueberryDark, dur: 4.1, delay: 0.7 },
  { top: '-8%',  left: '78%',  size: 7, color: colors.grassDark,     dur: 3.6, delay: 1.2 },
  { top: '40%',  left: '4%',   size: 8, color: colors.sunMid,        dur: 4.5, delay: 0.4 },
  { top: '40%',  left: '94%',  size: 8, color: colors.coralDark,     dur: 3.8, delay: 1.6 },
  { top: '92%',  left: '38%',  size: 7, color: colors.blueberryDark, dur: 4.2, delay: 0.2 },
  { top: '92%',  left: '64%',  size: 7, color: colors.grassDark,     dur: 3.4, delay: 1.0 },
];

const HALO_KEYFRAMES_ID = 'didit-halo-float-keyframes';
function injectHaloKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(HALO_KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = HALO_KEYFRAMES_ID;
  // Two staggered drift paths so neighbouring dots don't move in
  // lockstep. Each dot picks one based on its index parity.
  style.textContent = `
    @keyframes diditHaloFloatA {
      0%   { transform: translate(0, 0); }
      33%  { transform: translate(3px, -6px); }
      66%  { transform: translate(-4px, -3px); }
      100% { transform: translate(0, 0); }
    }
    @keyframes diditHaloFloatB {
      0%   { transform: translate(0, 0); }
      33%  { transform: translate(-5px, 4px); }
      66%  { transform: translate(2px, 6px); }
      100% { transform: translate(0, 0); }
    }
  `;
  document.head.appendChild(style);
}

export default function HubStoryFooter() {
  // Inject the halo float keyframes lazily — safe to call on every
  // render because the function bails when the <style> already exists.
  injectHaloKeyframes();
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
      {/* ── Share CTA on pale-green wavy section ──────── */}
      <section style={{
        background: GRASS_LIGHT,
        padding: '80px 24px 60px',
        position: 'relative',
        textAlign: 'center',
        overflow: 'visible',
      }}>
        {/* Top wave */}
        <div style={{
          position: 'absolute', top: -40, left: 0, right: 0, height: 60,
          overflow: 'hidden', pointerEvents: 'none',
        }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path
              d="M0,30 C120,55 240,5 360,30 C480,55 600,10 720,35 C840,60 960,5 1080,30 C1200,55 1320,10 1440,30 L1440,60 L0,60 Z"
              fill={GRASS_LIGHT}
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
              fill={GRASS_LIGHT}
            />
          </svg>
        </div>
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
                animation: `${i % 2 === 0 ? 'diditHaloFloatA' : 'diditHaloFloatB'} ${d.dur}s ease-in-out ${d.delay}s infinite`,
                willChange: 'transform',
              }}
            />
          ))}
          <ShareButton
            gameId="hub-cta"
            label="Share Did It!"
            style={{
              background: colors.blueberryDark,
              color: '#FFFFFF',
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

      {/* ── Site footer (mirrors MarketingPage .mp-footer exactly) ── */}
      <footer style={{
        background: '#FFFFFF',
        color: '#2D2A26',
        padding: '50px 40px 40px',
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
            <DiditLogo height={32} />
            <div style={{
              fontFamily: "'Nunito', sans-serif",
              fontStyle: 'normal',
              fontSize: 14,
              opacity: 1,
              marginTop: 4,
              color: '#2D2A26',
            }}>
              Real-world concepts for tiny humans.
            </div>
          </div>
          <div style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: 13,
            opacity: 1,
            color: '#2D2A26',
          }}>
            © 2026 did*it. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
