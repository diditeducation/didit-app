import DiditLogo from './DiditLogo';
import {
  ChefIllustration,
  EngineerIllustration,
  ConsultantIllustration,
} from './GameIllustrations';
import { ABOUT_STORY, ABOUT_PRINCIPLES } from '../data/aboutCopy';

const FONT = "'Nunito', sans-serif";

const CSS = `
@keyframes am-overlay-in { from { opacity: 0 } to { opacity: 1 } }
@keyframes am-sheet-in   { from { transform: translateY(100%) } to { transform: translateY(0) } }
`;

// Per-card presentation (colours + illustration); copy comes from aboutCopy.js.
const PRINCIPLE_STYLES = [
  { bg: '#FFF3E8', accent: '#EE6A30', Illustration: ChefIllustration },
  { bg: '#EEF3FD', accent: '#3A6CE5', Illustration: EngineerIllustration },
  { bg: '#EEF3FD', accent: '#3A6CE5', Illustration: ConsultantIllustration },
];
const PRINCIPLES = ABOUT_PRINCIPLES.map((p, i) => ({
  n: p.n,
  title: p.title.join(' '),
  body: p.body,
  ...PRINCIPLE_STYLES[i],
}));

function PrincipleCard({ n, bg, accent, title, body, Illustration }) {
  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 20,
      overflow: 'hidden',
      border: '1px solid #EDE5D8',
    }}>
      {/* Coloured header with illustration */}
      <div style={{
        background: bg,
        height: 140,
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* Number badge */}
        <div style={{
          position: 'absolute', top: 14, left: 16,
          fontFamily: FONT, fontWeight: 900, fontSize: 13,
          color: accent,
          background: '#FFFFFF',
          borderRadius: 9999,
          padding: '3px 10px',
          letterSpacing: '0.02em',
        }}>
          {n}
        </div>
        {/* White dome arch */}
        <div style={{
          position: 'absolute', bottom: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: '160%', height: 60,
          background: '#FFFFFF',
          borderRadius: '50% 50% 0 0',
        }} />
        {/* Illustration circle */}
        <div style={{
          position: 'absolute', bottom: 6,
          width: 96, height: 96,
          borderRadius: '50%',
          background: '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2,
        }}>
          <div style={{ width: 74, height: 74 }}>
            <Illustration />
          </div>
        </div>
      </div>

      {/* Text body */}
      <div style={{ padding: '16px 20px 20px', textAlign: 'center' }}>
        <div style={{
          fontFamily: FONT, fontWeight: 900, fontSize: 15,
          color: accent, marginBottom: 6, lineHeight: 1.3,
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: FONT, fontSize: 13, lineHeight: 1.65, color: '#9A8F82',
        }}>
          {body}
        </div>
      </div>
    </div>
  );
}

export default function AboutModal({ onClose }) {
  return (
    <>
      <style>{CSS}</style>

      {/* Overlay */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 600,
          background: 'rgba(0,0,0,0.5)',
          animation: 'am-overlay-in 0.2s ease both',
        }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 601,
          background: '#FFFBF5',
          borderRadius: '24px 24px 0 0',
          maxHeight: '90dvh',
          overflowY: 'auto',
          animation: 'am-sheet-in 0.35s cubic-bezier(0.32,0.72,0,1) both',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Sticky handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 8px', position: 'sticky', top: 0, background: '#FFFBF5', zIndex: 1 }}>
          <div style={{ width: 40, height: 4, borderRadius: 9999, background: '#E0DCD6' }} />
        </div>

        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 24px 48px', boxSizing: 'border-box' }}>

          {/* Logo + tagline */}
          <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
            <DiditLogo height={32} hideBeta />
            <p style={{ fontFamily: FONT, fontSize: 14, color: '#9A8F82', fontWeight: 600, margin: '8px 0 0' }}>
              Real-world concepts for tiny humans.
            </p>
          </div>

          {/* ── Hero ── */}
          <div style={{ background: '#EEF3FD', borderRadius: 20, padding: '24px', marginBottom: 16, textAlign: 'center' }}>
            <p style={{ fontFamily: FONT, fontWeight: 900, fontSize: 'clamp(18px,5vw,24px)', color: '#3A6CE5', margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
              Kids learning engineering, finance, music, coding, astronomy &amp; fine art — through play.
            </p>
            <p style={{ fontFamily: FONT, fontSize: 14, lineHeight: 1.65, color: '#2D2A26', margin: 0, fontWeight: 500 }}>
              What if your child could explore the concepts most grown-ups only encounter later in life — just by playing?
            </p>
          </div>

          {/* ── Why ── */}
          <div style={{ background: '#F0F0A0', borderRadius: 20, padding: '20px 24px', marginBottom: 24 }}>
            <p style={{ fontFamily: FONT, fontWeight: 800, fontSize: 15, color: '#2D2A26', margin: '0 0 8px', lineHeight: 1.4 }}>
              Between 2 and 5, their brains are doing the most incredible work they'll ever do.{' '}
              <em style={{ fontStyle: 'italic', color: '#C23C3C' }}>We thought — why stop at ABCs?</em>
            </p>
            <p style={{ fontFamily: FONT, fontSize: 13, lineHeight: 1.65, color: '#2D2A26', margin: 0, fontWeight: 500 }}>
              Finance. Logic. Algorithms. Engineering. Skills most people stumble into as adults — imagine your little one getting an early start.
            </p>
          </div>

          {/* ── Design principles ── */}
          <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A8F82', margin: '0 0 14px' }}>
            Our Design Philosophy
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
            {PRINCIPLES.map(p => <PrincipleCard key={p.n} {...p} />)}
          </div>

          {/* ── Our story ── */}
          <div style={{ background: '#FFF7EB', borderRadius: 20, padding: '20px 24px', marginBottom: 24 }}>
            <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9A8F82', margin: '0 0 10px' }}>
              How it started
            </p>
            <p style={{ fontFamily: FONT, fontSize: 14, lineHeight: 1.7, color: '#2D2A26', margin: '0 0 10px', fontWeight: 500 }}>
              {ABOUT_STORY.intro[0]}
            </p>
            <p style={{ fontFamily: FONT, fontSize: 14, lineHeight: 1.7, color: '#2D2A26', margin: '0 0 10px', fontWeight: 500 }}>
              {ABOUT_STORY.intro[1]}
            </p>
            <div style={{ paddingLeft: 4, marginBottom: 12 }}>
              {[{ color: '#CF4A4A' }, { color: '#3A6CE5' }].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontFamily: FONT, fontSize: 13, lineHeight: 1.6, color: '#2D2A26' }}>
                  <span style={{ color: item.color, fontWeight: 800, flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ fontWeight: 500 }}>{ABOUT_STORY.problems[i]}</span>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: FONT, fontSize: 14, lineHeight: 1.7, color: '#2D2A26', margin: 0, fontWeight: 700 }}>
              {ABOUT_STORY.close.join(' ')}
            </p>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '16px 0',
              background: '#2D2A26',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 9999,
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Back to playing →
          </button>
        </div>
      </div>
    </>
  );
}
