import { useState, useEffect } from 'react';
import DiditLogo from './DiditLogo';

const STORAGE_KEY = 'didit:welcome-seen';
const MAX_VISITS = 3;

function getVisitCount() {
  try { return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10); } catch { return 0; }
}
function incrementVisitCount() {
  try { localStorage.setItem(STORAGE_KEY, String(getVisitCount() + 1)); } catch { /* noop */ }
}

const FONT = "'Nunito', sans-serif";

// Dots spread across the full card — denser near the edges, a few
// scattered in the mid-zones, all clear of the central text column.
const DOTS = [
  // ── Far left ──
  { w: 7, h: 7, bg: '#3A6CE5', top:  '5%', left:  '3%', delay: '0s',   dur: '8s'  },
  { w: 5, h: 5, bg: '#E8B840', top: '22%', left:  '5%', delay: '2.1s', dur: '11s' },
  { w: 8, h: 8, bg: '#CF4A4A', top: '40%', left:  '2%', delay: '0.8s', dur: '9s'  },
  { w: 6, h: 6, bg: '#4CC830', top: '58%', left:  '6%', delay: '3.4s', dur: '12s' },
  { w: 7, h: 7, bg: '#C77DFF', top: '75%', left:  '3%', delay: '1.5s', dur: '10s' },
  { w: 5, h: 5, bg: '#3A6CE5', top: '90%', left:  '7%', delay: '4.0s', dur: '8s'  },
  // ── Mid-left ──
  { w: 6, h: 6, bg: '#E8B840', top: '12%', left: '14%', delay: '1.0s', dur: '13s' },
  { w: 5, h: 5, bg: '#CF4A4A', top: '33%', left: '17%', delay: '2.8s', dur: '9s'  },
  { w: 7, h: 7, bg: '#4CC830', top: '52%', left: '13%', delay: '0.4s', dur: '11s' },
  { w: 5, h: 5, bg: '#C77DFF', top: '70%', left: '18%', delay: '3.2s', dur: '10s' },
  { w: 6, h: 6, bg: '#3A6CE5', top: '85%', left: '15%', delay: '1.6s', dur: '8s'  },
  // ── Mid-right ──
  { w: 6, h: 6, bg: '#CF4A4A', top:  '9%', left: '82%', delay: '1.3s', dur: '10s' },
  { w: 5, h: 5, bg: '#E8B840', top: '28%', left: '85%', delay: '0.6s', dur: '12s' },
  { w: 7, h: 7, bg: '#4CC830', top: '47%', left: '80%', delay: '3.8s', dur: '9s'  },
  { w: 5, h: 5, bg: '#3A6CE5', top: '65%', left: '83%', delay: '2.3s', dur: '11s' },
  { w: 6, h: 6, bg: '#C77DFF', top: '82%', left: '87%', delay: '0.7s', dur: '8s'  },
  // ── Far right ──
  { w: 8, h: 8, bg: '#C23C3C', top:  '4%', left: '93%', delay: '2.0s', dur: '9s'  },
  { w: 6, h: 6, bg: '#4CC830', top: '19%', left: '96%', delay: '3.5s', dur: '13s' },
  { w: 7, h: 7, bg: '#E8B840', top: '37%', left: '92%', delay: '1.1s', dur: '10s' },
  { w: 5, h: 5, bg: '#CF4A4A', top: '55%', left: '95%', delay: '4.1s', dur: '8s'  },
  { w: 8, h: 8, bg: '#3A6CE5', top: '72%', left: '91%', delay: '0.3s', dur: '12s' },
  { w: 6, h: 6, bg: '#C77DFF', top: '88%', left: '94%', delay: '2.6s', dur: '9s'  },
];

const CSS = `
@keyframes wm-overlay-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes wm-card-in    {
  from { opacity: 0; transform: scale(0.94) }
  to   { opacity: 1; transform: scale(1) }
}
@keyframes wm-dot-drift  {
  0%,100% { transform: translate(0, 0) }
  25%     { transform: translate(10px, -16px) }
  50%     { transform: translate(-8px, -28px) }
  75%     { transform: translate(14px, -10px) }
}
@keyframes wm-rotate-words {
  0%,11%  { transform: translateY(0) }
  14%,25% { transform: translateY(-1.1em) }
  28%,39% { transform: translateY(-2.2em) }
  42%,53% { transform: translateY(-3.3em) }
  56%,67% { transform: translateY(-4.4em) }
  70%,81% { transform: translateY(-5.5em) }
  84%,100%{ transform: translateY(-6.6em) }
}
.wm-rotating-wrapper {
  display: inline-block;
  position: relative;
  overflow: hidden;
  vertical-align: bottom;
  height: 1.1em;
}
.wm-rotating-words {
  display: inline-block;
  animation: wm-rotate-words 14s infinite;
}
.wm-rotating-words span {
  display: block;
  height: 1.1em;
  font-family: ${FONT};
  font-weight: 900;
  line-height: 1.1;
  color: #CF4A4A;
}
`;

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getVisitCount() < MAX_VISITS) {
      incrementVisitCount();
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{CSS}</style>

      {/* Full-screen overlay — tap outside to dismiss */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px 20px',
          animation: 'wm-overlay-in 0.22s ease both',
          background: 'rgba(0,0,0,0.5)',
        }}
        onClick={() => setVisible(false)}
      >
        {/* Card — 3/4 of the viewport */}
        <div
          style={{
            position: 'relative', zIndex: 1,
            background: '#FFFBF5',
            borderRadius: 28,
            width: '88vw', height: '75dvh',
            maxWidth: 640,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '40px 36px',
            boxSizing: 'border-box',
            textAlign: 'center',
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.22)',
            animation: 'wm-card-in 0.3s cubic-bezier(0.34,1.3,0.64,1) both',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Floating dots live inside the card */}
          {DOTS.map((d, i) => (
            <div
              key={i}
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: d.top, left: d.left,
                width: d.w, height: d.h,
                borderRadius: '50%',
                background: d.bg,
                opacity: 0.55,
                pointerEvents: 'none',
                animation: `wm-dot-drift ${d.dur} ease-in-out ${d.delay} infinite`,
                willChange: 'transform',
              }}
            />
          ))}
          {/* Welcome + logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 24 }}>
            <div style={{
              fontFamily: FONT,
              fontSize: 13,
              fontWeight: 700,
              color: '#9A8F82',
            }}>
              Welcome to
            </div>
            <DiditLogo height={32} hideBeta />
          </div>

          {/* Headline with carousel */}
          <h1 style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 'clamp(28px, 8vw, 38px)',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            color: '#3A6CE5',
            margin: '0 0 20px',
          }}>
            Kids learning<br />
            <span className="wm-rotating-wrapper">
              <span className="wm-rotating-words">
                <span>engineering</span>
                <span>finance</span>
                <span>music</span>
                <span>coding</span>
                <span>astronomy</span>
                <span>fine art</span>
                <span>engineering</span>
              </span>
            </span>
            <br />
            through{' '}
            <span style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap' }}>
              play.
              <svg viewBox="0 0 200 12" preserveAspectRatio="none" style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: 'calc(100% + 8px)', height: '10px', overflow: 'visible', pointerEvents: 'none' }}>
                <path d="M2,9 C8,3 15,13 25,7 C35,1 42,12 55,5 C65,0 72,11 85,6 C95,2 100,13 112,7 C122,3 128,14 140,8 C150,4 155,12 168,6 C178,2 185,11 198,7" fill="none" stroke="#F0DC90" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </h1>

          {/* Subline */}
          <p style={{
            fontFamily: FONT,
            fontSize: 15,
            fontWeight: 600,
            lineHeight: 1.6,
            color: '#2D2A26',
            margin: '0 0 28px',
          }}>
            Real-world concepts for tiny humans — made into simple, joyful games.
          </p>

          {/* CTA */}
          <button
            onClick={() => setVisible(false)}
            style={{
              width: '100%',
              maxWidth: 280,
              padding: '16px 0',
              background: '#D4DB4A',
              color: '#1A1A1A',
              border: 'none',
              borderRadius: 9999,
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              boxShadow: '0 4px 20px rgba(212,219,74,0.4)',
            }}
          >
            Let's play →
          </button>
        </div>
      </div>
    </>
  );
}
