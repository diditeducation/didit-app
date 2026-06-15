import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DiditLogo from '../components/DiditLogo';

/**
 * About / philosophy page.
 *
 * The "Our Design Philosophy" and "Our Story" sections are lifted directly
 * from the production marketing landing (MarketingPage) so the content,
 * layout, and design elements stay consistent. Linked from the conversion
 * landing footer via /about#design-philosophy and /about#our-story.
 */
export default function AboutPage() {
  const nav = useNavigate();
  const { hash } = useLocation();

  // Scroll-reveal animation (mirrors MarketingPage).
  useEffect(() => {
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
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Deep-link support: scroll to the section named in the URL hash
  // (e.g. /about#our-story from the landing footer). Deferred a tick so the
  // target's final position is known (fonts/content above can shift it).
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => {
      const el = document.getElementById(hash.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => clearTimeout(t);
  }, [hash]);

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
html{scroll-behavior:smooth}
.ap-page{font-family:'Nunito',sans-serif;background:#FFFFFF;color:var(--didit-text);overflow-x:hidden;-webkit-font-smoothing:antialiased;min-height:100vh}
#design-philosophy,#our-story{scroll-margin-top:84px}

.ap-bar{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:rgba(255,251,245,0.9);backdrop-filter:blur(20px);border-bottom:1px solid rgba(0,0,0,0.04)}
.ap-back{background:none;border:none;font-family:'Nunito',sans-serif;font-size:14px;font-weight:700;color:var(--didit-text);opacity:.7;cursor:pointer;transition:opacity .2s}
.ap-back:hover{opacity:1}

.mp-section-label-lg{font-family:'Nunito',sans-serif;font-size:16px;font-weight:900;letter-spacing:0;margin-bottom:16px;color:var(--didit-text)}
.mp-how{padding:80px 40px 100px;background:#FFFFFF}
.mp-how-inner{max-width:1000px;margin:0 auto;text-align:center}
.mp-how h2{font-family:'Nunito',sans-serif;font-weight:700;font-size:clamp(30px,4.5vw,44px);color:var(--didit-text);margin-bottom:60px}
.mp-principles{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;text-align:center}
.mp-principle-num{font-family:'Nunito',sans-serif;font-weight:900;font-size:36px;line-height:1;margin-bottom:10px}
.mp-principle:nth-child(1) .mp-principle-num{color:var(--didit-coral-mid)}
.mp-principle:nth-child(2) .mp-principle-num{color:var(--didit-blueberry-mid)}
.mp-principle:nth-child(3) .mp-principle-num{color:var(--didit-grass-mid)}
.mp-principle h3{font-family:'Nunito',sans-serif;font-size:clamp(20px,2.5vw,24px);font-weight:800;color:var(--didit-text);margin-bottom:8px}
.mp-principle p{font-family:'Nunito',sans-serif;font-size:14px;line-height:1.65;color:var(--didit-muted)}

.mp-float-dot{position:absolute;border-radius:50%;pointer-events:none;animation:mp-driftDot 12s ease-in-out infinite}
@keyframes mp-driftDot{0%,100%{transform:translate(0,0) scale(1)}25%{transform:translate(15px,-20px) scale(1.1)}50%{transform:translate(-10px,-35px) scale(0.95)}75%{transform:translate(20px,-15px) scale(1.05)}}

.reveal{opacity:0;transform:translateY(30px);transition:all .7s cubic-bezier(.16,1,.3,1)}
.reveal.visible{opacity:1;transform:translateY(0)}

@media(max-width:768px){
  .ap-bar{padding:14px 20px}
  .mp-how{padding:60px 20px 60px}
  .mp-how h2{font-size:clamp(24px,5vw,36px);margin-bottom:40px}
  .mp-principles{grid-template-columns:1fr;gap:28px}
  .mp-principle-num{font-size:28px}
  .mp-principle h3{font-size:18px}
  .mp-principle p{font-size:13px}
  .mp-maker-grid{grid-template-columns:1fr!important;gap:32px!important}
  .mp-maker-visual{height:240px!important}
  .mp-maker-visual > div:first-child{width:220px!important;height:220px!important}
  .mp-maker-visual img{width:180px!important;height:180px!important}
}
@media(max-width:480px){
  .mp-how{padding:48px 16px 48px}
  .mp-maker-visual{height:200px!important}
  .mp-maker-visual > div:first-child{width:180px!important;height:180px!important}
  .mp-maker-visual img{width:140px!important;height:140px!important}
}
      `}</style>

      <div className="ap-page">
        <div className="ap-bar">
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => nav('/')}>
            <DiditLogo height={28} hideBeta />
          </div>
          <button className="ap-back" onClick={() => nav('/')}>← Back</button>
        </div>

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

        {/* ── Our Story ── */}
        <section id="our-story" style={{ background: 'var(--didit-sun-light)', padding: '80px 40px 60px', position: 'relative', overflow: 'visible', marginTop: '0', marginBottom: '40px' }}>
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
          <div className="mp-maker-grid" style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            {/* Left — visual with decorative blobs */}
            <div className="reveal mp-maker-visual" style={{ position: 'relative', height: '400px' }}>
              <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50% 40% 55% 45%', background: '#FFFFFF', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/game%20illustrations/Bulb.png" alt="Lightbulb" style={{ width: '240px', height: '240px', objectFit: 'contain' }} />
              </div>
              <div style={{ position: 'absolute', width: '100px', height: '100px', borderRadius: '45% 55% 50% 50%', background: '#FFFFFF', top: '2%', right: '15%', opacity: 0.7 }} />
              <div style={{ position: 'absolute', width: '70px', height: '70px', borderRadius: '50% 42% 55% 48%', background: '#FFFFFF', bottom: '10%', left: '8%', opacity: 0.6 }} />
              <div style={{ position: 'absolute', width: '50px', height: '50px', borderRadius: '50%', background: '#FFFFFF', bottom: '20%', right: '10%', opacity: 0.5 }} />
            </div>
            {/* Right — text content */}
            <div>
              <p className="reveal" style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.85rem', fontWeight: 800, color: '#2D2A26', letterSpacing: '0.05em', marginBottom: '8px', textTransform: 'uppercase' }}>How it started</p>
              <div className="reveal" style={{ fontFamily: "'Nunito', sans-serif", fontSize: '1.4rem', fontWeight: 900, color: '#2D2A26', marginBottom: '8px' }}>Our Story</div>
              <p className="reveal" style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.95rem', lineHeight: 1.4, color: '#2D2A26', fontStyle: 'normal', margin: '0 0 16px' }}>We&apos;re parents from Sydney, Australia who have a wonderfully energetic and curious toddler. {'🧡'}</p>
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
      </div>
    </>
  );
}
