import { useEffect, useRef } from 'react';

/**
 * About Did·It content — the hero statement, "Our Story", and "Our Design
 * Philosophy" sections, plus the styles they need. Shared between the
 * standalone /about page (AboutPage) and the "About Did·It" expandable area
 * on the conversion landing.
 *
 * Pass `embedded` when rendering inside a constrained container (e.g. the
 * landing accordion): it forces the single-column layout, trims the section
 * padding, and shows all content immediately instead of animating on scroll
 * (the scroll observer can't fire while the accordion is collapsed).
 */
export default function AboutContent({ embedded = false, showHero = true }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Embedded: reveal everything up front (content starts collapsed, so an
    // IntersectionObserver would never fire and leave it invisible).
    if (embedded) {
      root.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
      return;
    }

    // Standalone: animate sections in as they scroll into view.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    root.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [embedded]);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
:root{
  --didit-bg:#FFFBF5;--didit-surface:#FFFFFF;--didit-border:#EDE5D8;
  --didit-text:#2D2A26;--didit-muted:#9A8F82;
  --didit-coral:#E8AAAA;--didit-coral-mid:#CF4A4A;
  --didit-sun:#F0DC90;--didit-sun-light:#F0F0A0;--didit-sun-mid:#E8B840;
  --didit-grass-mid:#4CC830;--didit-grass-dark:#2EA820;
  --didit-blueberry:#9BB5E8;--didit-blueberry-mid:#6B8FD8;--didit-blueberry-dark:#3A6CE5;
}
.ap-content{font-family:'Nunito',sans-serif;color:var(--didit-text);overflow-x:hidden;-webkit-font-smoothing:antialiased}
.ap-content--embedded{border-radius:22px;overflow:hidden}
.ap-page{background:var(--didit-bg);min-height:100vh}
#design-philosophy,#our-story{scroll-margin-top:84px}

.ap-bar{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:rgba(255,251,245,0.9);backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,0.04)}
.ap-back{background:none;border:none;font-family:'Nunito',sans-serif;font-size:14px;font-weight:700;color:var(--didit-text);opacity:.7;cursor:pointer;transition:opacity .2s}
.ap-back:hover{opacity:1}

/* ── Hero ── */
.ap-hero{position:relative;overflow:hidden;padding:72px 40px 64px;background:var(--didit-bg);text-align:center}
.ap-hero-inner{max-width:840px;margin:0 auto;position:relative;z-index:2}
.ap-eyebrow{display:inline-block;font-size:13px;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;color:var(--didit-coral-mid);background:#FFFFFF;border:2px solid var(--didit-border);padding:7px 16px;border-radius:9999px;margin-bottom:22px}
.ap-hero h1{font-family:'Nunito',sans-serif;font-weight:600;font-size:clamp(16px,1.9vw,20px);line-height:1.6;letter-spacing:0;color:var(--didit-text);max-width:620px;margin:0 auto 20px}
.ap-hero-sub{font-size:clamp(16px,2vw,19px);line-height:1.55;color:var(--didit-muted);max-width:560px;margin:0 auto 8px;font-weight:600}

/* Floating decorative element images */
.ap-float-el{position:absolute;pointer-events:none;z-index:1;animation:ap-floatEl 9s ease-in-out infinite}
@keyframes ap-floatEl{0%,100%{transform:translateY(0) rotate(var(--r,0deg))}50%{transform:translateY(-16px) rotate(calc(var(--r,0deg) + 6deg))}}

.mp-section-label-lg{font-family:'Nunito',sans-serif;font-size:16px;font-weight:900;letter-spacing:0;margin-bottom:16px;color:var(--didit-text)}
.mp-how{padding:90px 40px 110px;background:var(--didit-sun-light)}
.mp-how-inner{max-width:1040px;margin:0 auto;text-align:center}
.mp-how h2{font-family:'Nunito',sans-serif;font-weight:700;font-size:clamp(30px,4.5vw,44px);color:var(--didit-text);margin-bottom:64px}

/* Philosophy cards (tilted, coloured) */
.mp-principles{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;text-align:left}
.mp-principle{position:relative;background:#FFFFFF;border:2px solid var(--didit-border);border-radius:26px;padding:48px 28px 32px;box-shadow:0 10px 26px rgba(0,0,0,0.05);transition:transform .3s cubic-bezier(.16,1,.3,1),box-shadow .3s}
.mp-principle:hover{transform:translateY(-8px) rotate(0deg)!important;box-shadow:0 22px 44px rgba(0,0,0,0.10)}
.mp-principle:nth-child(1){transform:rotate(-1.5deg);background:linear-gradient(180deg,#FDEDED 0%,#FFFFFF 70%)}
.mp-principle:nth-child(2){transform:rotate(1deg);background:linear-gradient(180deg,#EAF0FC 0%,#FFFFFF 70%)}
.mp-principle:nth-child(3){transform:rotate(-1deg);background:linear-gradient(180deg,#E9F8E5 0%,#FFFFFF 70%)}
.mp-principle-num{position:absolute;top:-22px;left:24px;width:54px;height:54px;display:flex;align-items:center;justify-content:center;font-family:'Nunito',sans-serif;font-weight:900;font-size:22px;line-height:1;color:#FFFFFF;border-radius:16px;box-shadow:0 8px 18px rgba(0,0,0,0.14);transform:rotate(-8deg)}
.mp-principle:nth-child(1) .mp-principle-num{background:var(--didit-coral-mid)}
.mp-principle:nth-child(2) .mp-principle-num{background:var(--didit-blueberry-dark)}
.mp-principle:nth-child(3) .mp-principle-num{background:var(--didit-grass-dark)}
.mp-principle h3{font-family:'Nunito',sans-serif;font-size:clamp(19px,2.5vw,23px);font-weight:800;color:var(--didit-text);margin-bottom:12px;line-height:1.15}
.mp-principle p{font-family:'Nunito',sans-serif;font-size:14.5px;line-height:1.65;color:var(--didit-muted)}

.mp-float-dot{position:absolute;border-radius:50%;pointer-events:none;animation:mp-driftDot 12s ease-in-out infinite}
@keyframes mp-driftDot{0%,100%{transform:translate(0,0) scale(1)}25%{transform:translate(15px,-20px) scale(1.1)}50%{transform:translate(-10px,-35px) scale(0.95)}75%{transform:translate(20px,-15px) scale(1.05)}}

.reveal{opacity:0;transform:translateY(30px);transition:all .7s cubic-bezier(.16,1,.3,1)}
.reveal.visible{opacity:1;transform:translateY(0)}

/* ── Embedded (inside the landing accordion): force single column, trim padding ── */
.ap-content--embedded .ap-hero{padding:48px 24px 40px}
.ap-content--embedded .ap-hero h1{font-size:clamp(15px,3.6vw,18px)}
.ap-content--embedded .mp-how{padding:56px 24px 60px}
.ap-content--embedded .mp-how h2{font-size:clamp(22px,5vw,32px);margin-bottom:44px}
.ap-content--embedded .mp-principles{gap:16px}
.ap-content--embedded .mp-principle{transform:none!important;padding:36px 18px 22px;border-radius:20px}
.ap-content--embedded .mp-principle h3{font-size:16px;margin-bottom:8px}
.ap-content--embedded .mp-principle p{font-size:13px;line-height:1.5}
.ap-content--embedded .mp-principle-num{width:42px;height:42px;font-size:17px;top:-17px;left:16px}
.ap-content--embedded .mp-maker-grid{grid-template-columns:1fr!important;gap:12px!important}
.ap-content--embedded .mp-maker-visual{height:150px!important}
.ap-content--embedded .mp-maker-visual > div:first-child{width:132px!important;height:132px!important}
.ap-content--embedded .mp-maker-visual img{width:100px!important;height:100px!important}
.ap-content--embedded .mp-maker-visual > div:not(:first-child){display:none!important}
/* Phones: stack the philosophy cards (3-up is too tight) */
@media(max-width:600px){.ap-content--embedded .mp-principles{grid-template-columns:1fr;gap:30px}}

@media(max-width:768px){
  .ap-bar{padding:14px 20px}
  .ap-hero{padding:56px 20px 64px}
  .mp-how{padding:64px 20px 64px}
  .mp-how h2{font-size:clamp(24px,5vw,36px);margin-bottom:48px}
  .mp-principles{grid-template-columns:1fr;gap:34px}
  .mp-principle{transform:none!important}
  .mp-maker-grid{grid-template-columns:1fr!important;gap:32px!important}
  .mp-maker-visual{height:240px!important}
  .mp-maker-visual > div:first-child{width:220px!important;height:220px!important}
  .mp-maker-visual img{width:180px!important;height:180px!important}
}
@media(max-width:480px){
  .ap-hero{padding:44px 16px 52px}
  .mp-how{padding:48px 16px 48px}
  .mp-maker-visual{height:200px!important}
  .mp-maker-visual > div:first-child{width:180px!important;height:180px!important}
  .mp-maker-visual img{width:140px!important;height:140px!important}
}
      `}</style>

      <div ref={rootRef} className={`ap-content${embedded ? ' ap-content--embedded' : ''}`}>
        {showHero && (
        /* ── Hero ── */
        <section className="ap-hero">
          {/* Floating decorative element shapes */}
          <img className="ap-float-el" src="/elements/element-diamond.png" alt="" style={{ width: 70, top: '16%', left: '7%', '--r': '-12deg', opacity: 0.9, animationDelay: '0s' }} />
          <img className="ap-float-el" src="/elements/element-wave.png" alt="" style={{ width: 96, bottom: '12%', left: '4%', '--r': '8deg', opacity: 0.85, animationDelay: '2.5s' }} />
          <img className="ap-float-el" src="/elements/element-exclamation.png" alt="" style={{ width: 52, top: '22%', right: '8%', '--r': '14deg', opacity: 0.9, animationDelay: '1.2s' }} />

          <div className="ap-hero-inner">
            <span className="ap-eyebrow">About Did·It</span>
            <h1>We&apos;re parents in Sydney who believe the world our kids are growing into will keep changing, so we don&apos;t want to stop at the basics. We want to open them up to more ideas. We believe their attention isn&apos;t for sale, so no ads, ever. And that the best learning happens side by side — not by simply handing them the screen.</h1>
          </div>
        </section>
        )}

        {/* ── Our Story ── */}
        <section id="our-story" style={{ background: 'var(--didit-sun-light)', padding: '80px 40px 60px', position: 'relative', overflow: 'visible', marginTop: '0', marginBottom: '0' }}>
          <div style={{ position: 'absolute', top: -40, left: 0, right: 0, height: 60, overflow: 'hidden' }}>
            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <path d="M0,30 C120,55 240,5 360,30 C480,55 600,10 720,35 C840,60 960,5 1080,30 C1200,55 1320,10 1440,30 L1440,60 L0,60 Z" fill="var(--didit-sun-light)" />
            </svg>
          </div>
          <div style={{ position: 'absolute', bottom: -40, left: 0, right: 0, height: 60, overflow: 'hidden' }}>
            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <path d="M0,30 C160,5 320,55 480,30 C640,5 800,55 960,30 C1120,5 1280,55 1440,30 L1440,0 L0,0 Z" fill="var(--didit-sun-light)" />
            </svg>
          </div>
          <div className="mp-maker-grid" style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
            {/* Text content */}
            <div>
              <p className="reveal" style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.85rem', fontWeight: 800, color: '#2D2A26', letterSpacing: '0.05em', marginBottom: '8px', textTransform: 'uppercase' }}>How it started</p>
              <div className="reveal" style={{ fontFamily: "'Nunito', sans-serif", fontSize: '1.4rem', fontWeight: 900, color: '#2D2A26', marginBottom: '8px' }}>Our Story</div>
              <p className="reveal" style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.95rem', lineHeight: 1.4, color: '#2D2A26', fontStyle: 'normal', margin: '0 0 16px' }}>We&apos;re Nigel and Danne, parents from Sydney, Australia who have a wonderfully energetic and curious toddler. {'🧡'}</p>
              <p className="reveal" style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.95rem', lineHeight: 1.4, color: '#2D2A26', fontStyle: 'normal', margin: '0 0 16px' }}>Teaching our child is one of our favourite things to do together. But when we went looking for games to play with him, we kept running into the same two problems.</p>
              <div className="reveal" style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.95rem', lineHeight: 1.4, color: '#2D2A26', margin: '0 0 16px', paddingLeft: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}><span style={{ color: 'var(--didit-coral-mid)', fontWeight: 800, flexShrink: 0 }}>1.</span><span>Most kids&apos; games are loud, busy, and designed to keep little eyes glued to the screen.</span></div>
                <div style={{ display: 'flex', gap: '10px' }}><span style={{ color: 'var(--didit-blueberry-dark)', fontWeight: 800, flexShrink: 0 }}>2.</span><span>The educational ones, while great for letters and numbers — rarely go beyond the basics. We were looking for something that could start introducing them to real world bigger ideas.</span></div>
              </div>
              <p className="reveal" style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.95rem', lineHeight: 1.4, color: '#2D2A26', fontStyle: 'normal', margin: '0 0 16px' }}>So we built some games. The more we played, the more we realised how capable kids really are. Their minds can stretch so much further than we give them credit for.</p>
              <p className="reveal" style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.95rem', lineHeight: 1.4, color: '#2D2A26', fontStyle: 'normal', fontWeight: 700, margin: '0' }}><span style={{ fontWeight: 800 }}>We hope your family gets to discover that too as you play along!</span></p>
            </div>
          </div>
        </section>

        {/* ── Our Design Philosophy ── */}
        <section className="mp-how" id="design-philosophy" style={{ position: 'relative', overflow: 'hidden' }}>
          <div className="mp-float-dot" style={{ width: 16, height: 16, background: 'var(--didit-blueberry-dark)', top: '10%', right: '5%', opacity: 0.35, animationDelay: '0.5s', animationDuration: '15s' }} />
          <div className="mp-float-dot" style={{ width: 12, height: 12, background: 'var(--didit-coral-mid)', top: '50%', left: '4%', opacity: 0.4, animationDelay: '3s', animationDuration: '18s' }} />
          <div className="mp-float-dot" style={{ width: 10, height: 10, background: 'var(--didit-grass-mid)', bottom: '15%', right: '10%', opacity: 0.45, animationDelay: '5s', animationDuration: '13s' }} />
          <div className="mp-float-dot" style={{ width: 8, height: 8, background: 'var(--didit-sun-mid)', top: '30%', left: '15%', opacity: 0.35, animationDelay: '2s', animationDuration: '17s' }} />
          <div className="mp-how-inner">
            <p className="mp-section-label-lg reveal">Our Design Philosophy</p>
            <h2 className="reveal">Thoughtfully made for little hands and{' '}<span style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap', color: 'var(--didit-blueberry-dark)' }}>big a-ha moments.<svg viewBox="0 0 200 12" preserveAspectRatio="none" style={{ position: 'absolute', bottom: '-6px', left: '-4px', width: 'calc(100% + 8px)', height: '12px', overflow: 'visible', pointerEvents: 'none', transform: 'rotate(-2deg)', transformOrigin: 'left center' }}><path d="M2,9 C8,3 15,13 25,7 C35,1 42,12 55,5 C65,0 72,11 85,6 C95,2 100,13 112,7 C122,3 128,14 140,8 C150,4 155,12 168,6 C178,2 185,11 198,7" fill="none" stroke="#F0DC90" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></svg></span></h2>
            <div className="mp-principles">
              <div className="mp-principle reveal"><div className="mp-principle-num">01</div><h3>Play Together.<br />That&apos;s the Magic.</h3><p>The games are a tool in your parenting toolkit, for you and your child to explore together. Your encouragement and coaching makes the learning moment more magical.</p></div>
              <div className="mp-principle reveal"><div className="mp-principle-num">02</div><h3>Big Concepts.<br />Made Simple.</h3><p>The ideas may be big, but the games are simple. Designed for tiny fingers, they are intuitive and tactile, without being overwhelming.</p></div>
              <div className="mp-principle reveal"><div className="mp-principle-num">03</div><h3>No Clutter.<br />No Surprises.</h3><p>A clean, safe, distraction-free space. Designed for your child to explore and for you to feel at ease. Zero ads, ever.</p></div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
