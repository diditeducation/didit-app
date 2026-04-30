import { useRef, useState } from 'react';
import { fonts, colors } from '../design-system/tokens';
import { trackShareClick } from '../analytics';

// Re-uses the share text + URL convention from design-system/ShareButton —
// keeping iMessage's single-bubble behaviour by passing text and url
// as separate fields to navigator.share rather than concatenating them.
const SHARE_TEXT =
  "Hey! Just discovered Did·It. These games pack in real life concepts such as finance, engineering, music production into simple games little kids enjoy. Give it a go! ✨";
const SHARE_URL = 'https://didit.games';

/**
 * Hub-bottom share CTA — sits above the HubFooter on /hub.
 *
 * Visual: small "Know a parent who'd love this?" heading with a 👨‍👩‍👧
 * emoji, a warm-cream pill button "Share Did It!", and a halo of
 * pastel dots scattered around the pill for cut-paper energy.
 */
export default function HubShareCTA() {
  const [copied, setCopied] = useState(false);
  const busy = useRef(false);

  const handleShare = async (e) => {
    e.stopPropagation();
    if (busy.current) return;
    busy.current = true;
    trackShareClick('hub-cta');
    try {
      if (navigator.share) {
        await navigator.share({ text: SHARE_TEXT, url: SHARE_URL });
      } else {
        await navigator.clipboard.writeText(`${SHARE_TEXT} → ${SHARE_URL}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // user cancelled — silent
    } finally {
      busy.current = false;
    }
  };

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

        <button
          type="button"
          onClick={handleShare}
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
            WebkitTapHighlightColor: 'transparent',
            transition: 'transform 0.15s ease',
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
          onMouseUp={(e)   => { e.currentTarget.style.transform = 'scale(1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
          onTouchEnd={(e)   => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {copied ? 'Link copied! ✓' : 'Share Did It!'}
        </button>
      </div>
    </section>
  );
}
