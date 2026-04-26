import { useState, useEffect } from 'react';
import { fonts, colors, easing } from '../tokens';
import { PAGE_MAX_WIDTH } from '../layout';
import Button from '../components/Button';
import SkillPill from '../components/SkillPill';
import ParentStrip from '../components/ParentStrip';
import ShareButton from '../components/ShareButton';
import Confetti from '../components/Confetti';
import { useSoundManager } from '../useSoundManager';
import { playWelcomeChime } from '../sharedSounds';
import { useNavigate } from 'react-router-dom';
import { GAMES } from '../../data/games';

const KEYFRAMES_ID = 'didit-home-layout-keyframes';

/* ── Rich parent guide bottom-sheet ── */
function AccordionSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderTop: `1px solid ${colors.border}`, marginTop: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '12px 0', background: 'transparent', border: 'none',
          fontFamily: fonts.display, fontWeight: 800, fontSize: 13,
          color: colors.text, cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span>{title}</span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 22, height: 22, borderRadius: '50%', background: colors.border,
          fontSize: 9, fontWeight: 800, flexShrink: 0,
          transition: 'transform 0.25s ease',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>↓</span>
      </button>
      <div style={{
        maxHeight: open ? '600px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.4s ease',
      }}>
        <div style={{ paddingBottom: 16 }}>{children}</div>
      </div>
    </div>
  );
}

function RichGuideSheet({ guide, onClose, closeBtnStyle }) {
  return (
    <div
      style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:400,display:'flex',alignItems:'flex-end',justifyContent:'center' }}
      onClick={onClose}
    >
      {/* Injected keyframes for sheet slide-up */}
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
      <div
        style={{
          background:'#FFFFFF', borderRadius:'20px 20px 0 0',
          width:'100%', maxWidth:`${PAGE_MAX_WIDTH}px`,
          maxHeight:'85vh', overflowY:'auto',
          padding:'0 20px 32px',
          boxSizing:'border-box',
          animation:'slideUp 0.35s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 8px' }}>
          <div style={{ width:40, height:4, borderRadius:9999, background:colors.border }} />
        </div>

        {/* Header */}
        <div style={{ fontFamily:fonts.display, fontWeight:900, fontSize:17, color:colors.text, marginBottom:4 }}>
          💡 Grown-up Guide
        </div>
        <div style={{ fontFamily:fonts.display, fontSize:12, color:colors.muted, fontWeight:600, marginBottom:8 }}>
          What your child is learning — and how to make the most of it.
        </div>

        {/* ── What they're learning ── */}
        <AccordionSection title="✏️ What they're learning" defaultOpen={true}>
          <div style={{
            display:'inline-flex', alignItems:'center',
            padding:'4px 12px', borderRadius:9999,
            background:`color-mix(in srgb, ${guide.conceptColor} 12%, transparent)`,
            color:guide.conceptColor, fontSize:12, fontWeight:800,
            fontFamily:fonts.display, marginBottom:10,
          }}>{guide.concept}</div>
          <p style={{ fontSize:13, lineHeight:1.65, color:colors.text, margin:0, fontFamily:fonts.display, fontWeight:500 }}>
            {guide.explanation}
          </p>
        </AccordionSection>

        {/* ── The science ── */}
        <AccordionSection title="🔬 The science">
          <div style={{ background:'#F3F0FA', borderRadius:12, padding:'12px 14px', borderLeft:'3px solid #9B8DD4' }}>
            <p style={{ fontSize:12, lineHeight:1.65, color:'#3D2E72', margin:0, fontFamily:fonts.display, fontWeight:500 }}>
              {guide.science.text}
            </p>
          </div>
        </AccordionSection>

        {/* ── Skill ladder ── */}
        <AccordionSection title="🪜 Skill building blocks">
          <div style={{ position:'relative', paddingLeft:28 }}>
            <div style={{
              position:'absolute', left:7, top:14, bottom:14, width:2,
              background:`linear-gradient(to bottom, ${guide.ladder[0].color}, ${guide.ladder[2].color})`,
              borderRadius:9999, opacity:0.4,
            }} />
            {guide.ladder.map((step, i) => (
              <div key={i} style={{ position:'relative', marginBottom: i < guide.ladder.length - 1 ? 18 : 0 }}>
                <div style={{
                  position:'absolute', left:-28, top:1,
                  width:16, height:16, borderRadius:'50%',
                  background:step.color, display:'flex',
                  alignItems:'center', justifyContent:'center',
                  fontSize: i === 2 ? 9 : 0, zIndex:1,
                  boxShadow:`0 0 0 2px white, 0 0 0 3px ${step.color}33`,
                }}>
                  {i === 2 ? '🏆' : ''}
                </div>
                <div style={{ fontSize:9, fontWeight:800, color:step.color, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:2, fontFamily:fonts.display }}>{step.label}</div>
                <div style={{ fontSize:13, fontWeight:800, color:colors.text, marginBottom:2, fontFamily:fonts.display }}>{step.title}</div>
                <div style={{ fontSize:11, color:colors.muted, lineHeight:1.5, fontFamily:fonts.display }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </AccordionSection>

        {/* ── How to play together ── */}
        <AccordionSection title="🤝 How to play together">
          <div style={{ background:'#FFF7EB', borderRadius:12, padding:'12px 14px', borderLeft:'3px solid #F5A623' }}>
            <p style={{ fontSize:12, lineHeight:1.65, color:'#5C3D08', margin:'0 0 10px', fontFamily:fonts.display, fontWeight:500 }}>
              {guide.tip.text}
            </p>
            <div style={{ background:'white', borderRadius:8, padding:'9px 12px', fontSize:12, fontWeight:700, color:'#7A5010', fontFamily:fonts.display, borderLeft:'2px solid #F5A623' }}>
              Ask: {guide.tip.question}
            </div>
          </div>
        </AccordionSection>

        {/* Close button */}
        <div style={{ marginTop:20 }}>
          <button style={closeBtnStyle} onClick={onClose}>Got it! ✓</button>
        </div>
      </div>
    </div>
  );
}

const keyframesCSS = `
@keyframes fadeUp {
  from { transform: translateY(24px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes playFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001s !important;
    transition-duration: 0.001s !important;
  }
}
`;

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = keyframesCSS;
  document.head.appendChild(style);
}

const slotAnimation = (delayIndex) => ({
  animation: `fadeUp 0.6s ${easing.bounce} ${delayIndex * 0.1}s both`,
});

export default function GameHomeLayout({
  heroVisual,
  illustrationComponent,
  title,
  tagline,
  tag,
  hookLine,
  description,
  skillPills = [],
  onPlay,
  parentTipBody,
  onBack,
  illustration,
  onFeedback,
  shareButton = false,
  gameId = null,
}) {
  const { muted, toggleMute } = useSoundManager();
  const nav = useNavigate();
  const [guideOpen, setGuideOpen] = useState(false);
  const [playConfetti, setPlayConfetti] = useState(false);

  const handlePlay = () => {
    playWelcomeChime();
    setPlayConfetti(true);
    setTimeout(() => onPlay(), 550);
  };

  useEffect(() => {
    injectKeyframes();
  }, []);

  /* ── Outer container ── */
  const outerStyle = {
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: '#FFFFFF',
    color: 'var(--game-text)',
    position: 'relative',
    maxWidth: `${PAGE_MAX_WIDTH}px`,
    margin: '0 auto',
  };

  const pageStyle = {
    maxWidth: `${PAGE_MAX_WIDTH}px`,
    margin: '0 auto',
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    fontFamily: fonts.body,
    position: 'relative',
  };

  /* ── TopBar ── */
  const topBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px 0',
    flexShrink: 0,
    ...slotAnimation(0),
  };

  const iconBtnStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'color-mix(in srgb, var(--game-primary) 12%, transparent)',
    border: 'none',
    color: 'var(--game-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1.1rem',
    padding: 0,
  };

  /* ── Colored header with arch ── */
  const archHeaderStyle = {
    position: 'relative',
    height: '220px',
    background: 'var(--game-accent)',
    overflow: 'hidden',
    flexShrink: 0,
    ...slotAnimation(1),
  };

  /* White dome at bottom of colored header */
  const archDomeStyle = {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '160%',
    height: '80px',
    background: 'var(--game-bg)',
    borderRadius: '50% 50% 0 0',
  };

  /* White circle for illustration */
  const archCircleStyle = {
    position: 'absolute',
    bottom: '8px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  };

  const archCircleImgStyle = {
    width: '120px',
    height: '120px',
    objectFit: 'contain',
  };

  /* ── Card body ── */
  const bodyStyle = {
    padding: '12px 24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '10px',
    flex: 1,
  };

  const titleStyle = {
    fontFamily: fonts.display,
    fontWeight: 900,
    fontSize: 'clamp(1.8rem, 5vw, 2.2rem)',
    color: 'var(--game-primary)',
    margin: '-16px 0 0',
    letterSpacing: '-0.02em',
    ...slotAnimation(2),
  };

  const tagStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 14px',
    borderRadius: '9999px',
    fontFamily: fonts.display,
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    background: 'color-mix(in srgb, var(--game-primary) 12%, transparent)',
    color: 'var(--game-primary)',
    ...slotAnimation(3),
  };

  const hookStyle = {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
    color: colors.text,
    lineHeight: 1.5,
    maxWidth: '340px',
    ...slotAnimation(3),
  };

  const descStyle = {
    fontFamily: fonts.display,
    fontSize: 'clamp(0.88rem, 2vw, 0.95rem)',
    color: colors.text,
    lineHeight: 1.65,
    maxWidth: '340px',
    fontWeight: 600,
    ...slotAnimation(4),
  };

  const skillPillsStyle = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '8px',
    ...slotAnimation(4),
  };

  const pillOverride = {
    background: 'color-mix(in srgb, var(--game-primary) 15%, transparent)',
    border: '1.5px solid color-mix(in srgb, var(--game-primary) 40%, transparent)',
    color: 'var(--game-primary)',
    whiteSpace: 'nowrap',
    padding: '6px 14px',
    fontSize: '0.72rem',
    fontWeight: 700,
    borderRadius: '9999px',
    fontFamily: fonts.display,
  };

  const playBtnWrapperStyle = {
    display: 'flex',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '16px',
    ...slotAnimation(5),
  };

  const playBtnOverride = {
    padding: '14px 48px',
    minHeight: 'unset',
    borderRadius: '9999px',
    background: 'var(--game-primary)',
    fontSize: '1.2rem',
  };

  const guideLinkStyle = {
    textAlign: 'center',
    marginTop: '6px',
    flexShrink: 0,
    ...slotAnimation(6),
  };

  const guideLinkTextStyle = {
    fontFamily: fonts.body,
    fontSize: '0.9rem',
    color: 'var(--game-primary)',
    opacity: 0.6,
    textDecoration: 'underline',
    textDecorationStyle: 'dotted',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
  };

  const stripWrapperStyle = {
    flexShrink: 0,
    marginTop: '6px',
    paddingBottom: 'env(safe-area-inset-bottom, 8px)',
  };

  // Rich parent guide from games.js (looked up by gameId)
  const richGuide = gameId ? GAMES.find(g => g.id === gameId)?.parentGuide : null;

  const modalCloseBtnStyle = {
    width: '100%',
    background: 'var(--game-primary)',
    color: '#FFFFFF',
    borderRadius: '9999px',
    padding: '12px',
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: '0.9rem',
    border: 'none',
    cursor: 'pointer',
  };

  const visiblePills = skillPills.slice(0, 3);

  return (
    <div style={outerStyle}>
      <Confetti active={playConfetti} originX={50} originY={70} onComplete={() => setPlayConfetti(false)} />
      {/* Floating dots */}
      <div style={{ position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: 'var(--game-accent)', top: '8%', left: '6%', opacity: 0.4, pointerEvents: 'none', animation: 'fadeUp 0.6s ease both, playFloat 8s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 10, height: 10, borderRadius: '50%', background: 'var(--game-primary)', top: '15%', right: '8%', opacity: 0.35, pointerEvents: 'none', animation: 'fadeUp 0.6s ease 0.3s both, playFloat 11s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 12, height: 12, borderRadius: '50%', background: 'var(--game-warm)', bottom: '25%', left: '10%', opacity: 0.4, pointerEvents: 'none', animation: 'fadeUp 0.6s ease 0.6s both, playFloat 9s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: 'var(--game-accent)', bottom: '18%', right: '12%', opacity: 0.45, pointerEvents: 'none', animation: 'fadeUp 0.6s ease 0.9s both, playFloat 13s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: 'var(--game-warm)', top: '45%', left: '4%', opacity: 0.3, pointerEvents: 'none', animation: 'fadeUp 0.6s ease 1.2s both, playFloat 10s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 10, height: 10, borderRadius: '50%', background: 'var(--game-primary)', top: '55%', right: '5%', opacity: 0.35, pointerEvents: 'none', animation: 'fadeUp 0.6s ease 1.5s both, playFloat 14s ease-in-out infinite' }} />
      <div style={pageStyle}>
        {/* TopBar */}
        <div style={topBarStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.png" alt="Did It!" style={{ height: 28, objectFit: 'contain', cursor: 'pointer' }} onClick={() => nav('/hub')} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={iconBtnStyle} onClick={() => nav('/hub')} aria-label="Games hub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </button>
            <button style={iconBtnStyle} onClick={toggleMute} aria-label="Toggle sound">
              {muted ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              )}
            </button>
          </div>
        </div>

        {/* Illustration */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0 0', flexShrink: 0, ...slotAnimation(1) }}>
          {illustrationComponent ? (
            <div style={{
              width: 160, height: 160, borderRadius: '50%',
              background: 'white',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '3px solid color-mix(in srgb, var(--game-primary) 14%, transparent)',
            }}>
              <div style={{ width: 124, height: 124, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {illustrationComponent}
              </div>
            </div>
          ) : illustration ? (
            <img src={illustration} alt={title} style={{ width: '180px', height: '180px', objectFit: 'contain' }} />
          ) : heroVisual ? (
            <div style={{ width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {heroVisual}
            </div>
          ) : null}
        </div>

        {/* Card body content */}
        <div style={bodyStyle}>
          {/* Title */}
          <div style={titleStyle}>
            Little {title}
          </div>

          {/* Tag badge */}
          {tag && <div style={tagStyle}>{tag}</div>}

          {/* Hook line */}
          {hookLine && <div style={hookStyle}>{hookLine}</div>}

          {/* Description */}
          {(description || tagline) && (
            <div style={descStyle}>{description || tagline}</div>
          )}

          {/* Skill Pills */}
          {visiblePills.length > 0 && (
            <div style={skillPillsStyle}>
              {visiblePills.map((pill, i) => (
                typeof pill === 'string' ? (
                  <span key={i} style={pillOverride}>{pill}</span>
                ) : (
                  <SkillPill key={i} label={pill.label} variant={pill.variant} style={pillOverride} />
                )
              ))}
            </div>
          )}

          {/* Play Button */}
          <div style={playBtnWrapperStyle}>
            <Button variant="primary" size="lg" onClick={handlePlay} style={playBtnOverride}>
              Let's play ▶
            </Button>
          </div>

          {/* Parent Guide Link */}
          {parentTipBody && (
            <div style={guideLinkStyle}>
              <button style={guideLinkTextStyle} onClick={() => setGuideOpen(true)}>
                💡 Grown-up Guide
              </button>
            </div>
          )}

          {/* Feedback link */}
          {onFeedback && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...slotAnimation(7) }}>
              <button
                onClick={onFeedback}
                style={{ ...guideLinkTextStyle, textDecorationStyle: 'dotted', fontSize: '0.8rem', opacity: 0.6 }}
              >
                💬 Feedback
              </button>
            </div>
          )}

        </div>

        {/* ParentStrip */}
        <div style={stripWrapperStyle}>
          <ParentStrip />
        </div>

        {/* Parent Guide — rich bottom sheet or simple modal */}
        {guideOpen && (
          richGuide
            ? <RichGuideSheet guide={richGuide} onClose={() => setGuideOpen(false)} closeBtnStyle={modalCloseBtnStyle} />
            : (
              <div
                style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:400,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px' }}
                onClick={() => setGuideOpen(false)}
              >
                <div style={{ background:'#FFFFFF',borderRadius:'18px',padding:'2rem',maxWidth:'340px',width:'100%',boxSizing:'border-box' }} onClick={e => e.stopPropagation()}>
                  <div style={{ fontFamily:fonts.display,fontWeight:800,fontSize:'1.1rem',color:colors.text,marginBottom:'1rem' }}>👋 Hey grown-up!</div>
                  <div style={{ fontFamily:fonts.body,fontSize:'0.88rem',color:colors.muted,lineHeight:1.7,marginBottom:'1.5rem' }}>{parentTipBody}</div>
                  <button style={modalCloseBtnStyle} onClick={() => setGuideOpen(false)}>Got it! ✓</button>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
}
