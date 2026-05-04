import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { trackPageView, trackLandingClick } from '../analytics';
import DiditLogo from '../components/DiditLogo';
import { AstronomerIllustration } from './GameIllustrations';

export default function MarketingPage() {
  const [email, setEmail] = useState('');
  const [navScrolled, setNavScrolled] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGameClick = (gamePath, buttonId) => {
    trackLandingClick(buttonId);
    if (user) {
      navigate(gamePath);
    } else {
      navigate('/signin');
    }
  };

  useEffect(() => { trackPageView('landing'); }, []);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const scrollTo = (id) => {
    trackLandingClick(`nav_${id}`);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/signin');
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --didit-bg:#FFFBF5;--didit-surface:#FFFFFF;--didit-border:#EDE5D8;
  --didit-text:#2D2A26;--didit-muted:#9A8F82;--didit-night:#2D2A26;
  --didit-coral:#E8AAAA;--didit-coral-light:#F2C4BE;--didit-coral-mid:#CF4A4A;--didit-coral-dark:#C23C3C;
  --didit-sky:#4ECDC4;--didit-sky-light:#E0F8F6;--didit-sky-dark:#03B292;
  --didit-sun:#F0DC90;--didit-sun-light:#F0F0A0;--didit-sun-mid:#E8B840;--didit-sun-dark:#EE6A30;
  --didit-grass:#BEE060;--didit-grass-light:#E0F0A8;--didit-grass-mid:#4CC830;--didit-grass-dark:#2EA820;
  --didit-blueberry:#9BB5E8;--didit-blueberry-light:#CFD9F4;--didit-blueberry-mid:#6B8FD8;--didit-blueberry-dark:#3A6CE5;
}
html{scroll-behavior:smooth}
#problem,#games,#how,#ourstory,#signup{scroll-margin-top:80px}
body{font-family:'Nunito',sans-serif;background:#FFFFFF;color:var(--didit-text);overflow-x:hidden;-webkit-font-smoothing:antialiased}

.mp-nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:20px 40px;display:flex;align-items:center;justify-content:space-between;backdrop-filter:blur(20px);background:rgba(255,251,245,0.9);border-bottom:1px solid rgba(0,0,0,0.04);transition:all .3s}
.mp-nav.scrolled{padding:14px 40px;box-shadow:0 4px 30px rgba(0,0,0,0.06)}
.mp-nav-logo{cursor:pointer;display:flex;align-items:center}
.mp-nav-links{display:flex;gap:28px;align-items:center}
.mp-nav-links a{font-size:14px;font-weight:600;color:var(--didit-text);text-decoration:none;opacity:.6;transition:all .2s;cursor:pointer}
.mp-nav-links a:hover{opacity:1}
.mp-nav-cta{background:#D4DB4A!important;color:#1A1A1A!important;opacity:1!important;padding:10px 22px;border-radius:9999px;font-weight:700!important;transition:all .3s!important}
.mp-nav-cta:hover{filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 6px 20px rgba(212,219,74,0.3)}

.mp-hero{position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:140px 40px 60px;overflow:hidden}
.mp-hero-bg{position:absolute;inset:0;z-index:0;background:radial-gradient(ellipse 50% 40% at 15% 80%,rgba(78,205,196,0.1) 0%,transparent 60%),radial-gradient(ellipse 40% 35% at 85% 20%,rgba(255,107,107,0.08) 0%,transparent 60%),radial-gradient(ellipse 35% 30% at 50% 60%,rgba(255,230,109,0.06) 0%,transparent 50%)}
.mp-hero-content{position:relative;z-index:10;max-width:900px;text-align:center}
.mp-hero h1{font-family:'Nunito',sans-serif;font-weight:900;font-size:clamp(42px,6.5vw,76px);letter-spacing:-0.03em;line-height:1.05;color:#3A6CE5;margin-bottom:28px;padding-top:40px;animation:mp-fadeInUp .8s ease .15s forwards;opacity:0}
.mp-hero-sub{font-family:'Nunito',sans-serif;font-size:clamp(17px,2.2vw,21px);line-height:1.65;color:#2D2A26;max-width:640px;margin:0 auto 40px;animation:mp-fadeInUp .8s ease .3s forwards;opacity:0}
.mp-hero-actions{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;animation:mp-fadeInUp .8s ease .45s forwards;opacity:0}
.mp-btn-primary{display:inline-flex;align-items:center;gap:10px;background:#D4DB4A;color:#1A1A1A;padding:14px 36px;border-radius:9999px;font-family:'Nunito',sans-serif;font-size:16px;font-weight:800;border:none;cursor:pointer;transition:all .3s;box-shadow:0 4px 20px rgba(0,0,0,0.15)}
.mp-btn-primary:hover{background:#c5cc3a;transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,0,0,0.2)}

.mp-rotating-wrapper{display:inline-block;position:relative;overflow:hidden;vertical-align:bottom;height:1.1em;min-width:200px}
.mp-rotating-words{display:inline-block;position:relative;animation:mp-rotateWords 14s infinite;top:0}
.mp-rotating-words span{display:block;height:1.1em;font-family:'Nunito',sans-serif;font-weight:800;line-height:1.1}

.mp-hero-blob{position:absolute;border-radius:50% 42% 55% 40%;opacity:0;animation:mp-floatBlob 8s ease-in-out infinite,mp-fadeIn 1s ease forwards}
.mp-hero-blob-1{width:20px;height:20px;background:var(--didit-blueberry-dark);top:18%;left:8%;animation-delay:0s,.5s}
.mp-hero-blob-2{width:14px;height:14px;background:var(--didit-coral-mid);top:22%;right:10%;animation-delay:2s,.7s}
.mp-hero-blob-3{width:18px;height:18px;background:var(--didit-sun-mid);bottom:24%;left:12%;animation-delay:4s,.9s;border-radius:45% 55% 42% 50%}
.mp-hero-blob-4{width:12px;height:12px;background:var(--didit-grass-mid);bottom:32%;right:9%;animation-delay:1s,1.1s}
.mp-hero-blob-5{width:10px;height:10px;background:var(--didit-blueberry);top:40%;left:5%;animation-delay:3s,1.3s;border-radius:40% 55% 45% 50%}
.mp-hero-blob-6{width:14px;height:14px;background:var(--didit-coral-dark);top:15%;right:22%;animation-delay:5s,.6s}

.mp-problem{position:relative;padding:64px 40px;background:#F0F0A0;color:#2D2A26;overflow:visible;text-align:center;margin-top:0px;margin-bottom:40px}
.mp-problem-inner{max-width:1000px;margin:0 auto;position:relative;z-index:2}
.mp-section-label{font-family:'Nunito',sans-serif;font-size:14px;font-weight:700;letter-spacing:1px;margin-bottom:20px}
.mp-section-label-lg{font-family:'Nunito',sans-serif;font-size:16px;font-weight:900;letter-spacing:0;margin-bottom:16px;color:var(--didit-text)}
.mp-problem h2{font-family:'Nunito',sans-serif;font-weight:700;font-size:28px;letter-spacing:-0.03em;line-height:1.15;margin:0 auto 16px;max-width:800px;color:#2D2A26}
.mp-problem h2 em{font-style:italic;color:#C23C3C}

.mp-games-intro{padding:80px 40px 20px;background:#FFFFFF;text-align:center}
.mp-games-intro-inner{max-width:700px;margin:0 auto}
.mp-games-intro h2{font-family:'Nunito',sans-serif;font-weight:700;font-size:clamp(30px,4.5vw,46px);letter-spacing:-0.03em;color:var(--didit-text);margin-bottom:16px;line-height:1.15}
.mp-games-intro h2 em{font-style:italic;color:var(--didit-coral)}
.mp-games-intro p{font-family:'Nunito',sans-serif;font-size:16px;line-height:1.65;color:var(--didit-text);max-width:560px;margin:0 auto}

.mp-games-grid{max-width:728px;margin:40px auto 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px;padding:0 40px 60px;justify-items:center}
.mp-game-card-v{display:flex;flex-direction:column;overflow:visible;transition:transform .2s ease;cursor:pointer;background:white;position:relative;border-radius:18px;border:1px solid var(--didit-border)}
.mp-game-card-v:hover{transform:translateY(-4px)}
.mp-game-arch-header{position:relative;height:200px;border-radius:18px 18px 0 0;overflow:hidden}
.mp-game-arch-header::after{content:'';position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:160%;height:80px;background:white;border-radius:50% 50% 0 0}
.mp-game-arch-circle{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:150px;height:150px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;z-index:2}
.mp-game-arch-circle img{width:128px;height:128px;object-fit:contain}
.mp-game-body{padding:20px 18px 20px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;flex:1}
.mp-game-title{font-family:'Nunito',sans-serif;font-weight:900;font-size:1.6rem;margin:-20px 0 0;letter-spacing:-0.02em;padding:0 4px}
.mp-game-tag{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:9999px;font-family:'Nunito',sans-serif;font-size:0.6rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase}
.mp-game-hook{font-family:'Nunito',sans-serif;font-weight:700;font-size:0.9rem;color:#2D2A26;line-height:1.4;margin:0;min-height:2.8em}
.mp-game-desc{font-size:0.8rem;color:#2D2A26;line-height:1.5;margin:0;min-height:2.25em}
.mp-game-skills{display:flex;flex-wrap:nowrap;gap:6px;justify-content:center;margin-top:auto;margin-bottom:4px;min-height:28px;width:100%;overflow:hidden}
.mp-game-skill{padding:6px 12px;border-radius:9999px;font-size:0.65rem;font-weight:700;font-family:'Nunito',sans-serif}
.mp-game-play-btn{padding:10px 34px;border-radius:9999px;border:none;font-family:'Nunito',sans-serif;font-size:0.8rem;font-weight:800;cursor:pointer;transition:all .25s;color:#fff;margin-top:auto}
.mp-game-play-btn:hover{transform:translateY(-2px);filter:brightness(1.1)}

.mp-game-engineer .mp-game-arch-header{background:#3A6CE5;background-image:url('/backgrounds/background-blue.png');background-size:cover;background-position:center}
.mp-game-engineer .mp-game-title{color:var(--didit-blueberry-dark)}
.mp-game-engineer .mp-game-tag{background:var(--didit-blueberry-light);color:var(--didit-blueberry-dark)}
.mp-game-engineer .mp-game-skill{background:color-mix(in srgb, var(--didit-blueberry-dark) 15%, transparent);border:1.5px solid color-mix(in srgb, var(--didit-blueberry-dark) 40%, transparent);color:var(--didit-blueberry-dark)}
.mp-game-engineer .mp-game-play-btn{background:#3A6CE5}

.mp-game-dj .mp-game-arch-header{background:#CF4A4A;background-image:url('/backgrounds/background-red.png');background-size:cover;background-position:center}
.mp-game-dj .mp-game-title{color:var(--didit-coral-dark)}
.mp-game-dj .mp-game-tag{background:var(--didit-coral-light);color:var(--didit-coral-dark)}
.mp-game-dj .mp-game-skill{background:color-mix(in srgb, var(--didit-coral-dark) 15%, transparent);border:1.5px solid color-mix(in srgb, var(--didit-coral-dark) 40%, transparent);color:var(--didit-coral-dark)}
.mp-game-dj .mp-game-play-btn{background:#CF4A4A}

.mp-game-shopper .mp-game-arch-header{background:#4CC830;background-image:url('/backgrounds/background-green.png');background-size:cover;background-position:center}
.mp-game-shopper .mp-game-title{color:var(--didit-grass-dark)}
.mp-game-shopper .mp-game-tag{background:var(--didit-grass-light);color:var(--didit-grass-dark)}
.mp-game-shopper .mp-game-skill{background:color-mix(in srgb, var(--didit-grass-dark) 15%, transparent);border:1.5px solid color-mix(in srgb, var(--didit-grass-dark) 40%, transparent);color:var(--didit-grass-dark)}
.mp-game-shopper .mp-game-play-btn{background:#2EA820}

.mp-game-chef .mp-game-arch-header{background:#E8B840;background-image:url('/backgrounds/background-yellow.png');background-size:cover;background-position:center}
.mp-game-chef .mp-game-title{color:var(--didit-sun-dark)}
.mp-game-chef .mp-game-tag{background:var(--didit-sun-light);color:var(--didit-sun-dark)}
.mp-game-chef .mp-game-skill{background:color-mix(in srgb, var(--didit-sun-dark) 15%, transparent);border:1.5px solid color-mix(in srgb, var(--didit-sun-dark) 40%, transparent);color:var(--didit-sun-dark)}
.mp-game-chef .mp-game-play-btn{background:#EE6A30}

.mp-game-astronomer .mp-game-arch-header{background:#2D2A26;background-image:url('/backgrounds/background-yellow.png');background-size:cover;background-position:center}
.mp-game-astronomer .mp-game-title{color:var(--didit-sun-dark)}
.mp-game-astronomer .mp-game-tag{background:var(--didit-sun-light);color:var(--didit-sun-dark)}
.mp-game-astronomer .mp-game-skill{background:color-mix(in srgb, var(--didit-sun-dark) 15%, transparent);border:1.5px solid color-mix(in srgb, var(--didit-sun-dark) 40%, transparent);color:var(--didit-sun-dark)}
.mp-game-astronomer .mp-game-play-btn{background:#E8B840;color:#2D2A26}
.mp-game-arch-circle .mp-svg-illus{width:128px;height:128px;display:flex;align-items:center;justify-content:center}

.mp-how{padding:80px 40px 100px;background:#FFFFFF;margin-top:-1px}
.mp-how-inner{max-width:1000px;margin:0 auto;text-align:center}
.mp-how h2{font-family:'Nunito',sans-serif;font-weight:700;font-size:clamp(30px,4.5vw,44px);color:var(--didit-text);margin-bottom:60px}
.mp-how h2 em{font-style:normal;color:var(--didit-coral);font-weight:700}
.mp-principles{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;text-align:center}
.mp-principle-num{font-family:'Nunito',sans-serif;font-weight:900;font-size:36px;line-height:1;margin-bottom:10px}
.mp-principle:nth-child(1) .mp-principle-num{color:var(--didit-coral-mid)}
.mp-principle:nth-child(2) .mp-principle-num{color:var(--didit-blueberry-mid)}
.mp-principle:nth-child(3) .mp-principle-num{color:var(--didit-grass-mid)}
.mp-principle h3{font-family:'Nunito',sans-serif;font-size:clamp(20px,2.5vw,24px);font-weight:800;color:var(--didit-text);margin-bottom:8px}
.mp-principle p{font-family:'Nunito',sans-serif;font-size:14px;line-height:1.65;color:var(--didit-muted)}

.mp-manifesto{padding:80px 40px;background:var(--didit-bg);position:relative;overflow:hidden}
.mp-manifesto-inner{max-width:1000px;margin:0 auto}
.mp-manifesto-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.mp-manifesto-card{background:#FFFFFF;border-radius:24px;padding:36px 28px;position:relative;border:1px solid var(--didit-border)}
.mp-manifesto-card .mp-quote-mark{font-family:'Nunito',sans-serif;font-size:48px;font-weight:900;line-height:1;margin-bottom:12px;color:var(--didit-border)}
.mp-manifesto-card blockquote{font-family:'Nunito',sans-serif;font-weight:600;font-size:15px;line-height:1.65;color:var(--didit-text);margin:0}
.mp-manifesto-card blockquote em{font-style:normal;color:var(--didit-blueberry);font-weight:800}
.mp-manifesto-card .mp-attrib{margin-top:20px;font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;color:var(--didit-muted)}

.mp-cta-section{padding:60px 40px 50px;text-align:center;position:relative;overflow:visible;margin-top:40px;margin-bottom:0;width:100vw;margin-left:calc(-50vw + 50%);box-sizing:border-box}
.mp-cta-inner{max-width:600px;margin:0 auto}
.mp-cta-section h2{font-family:'Nunito',sans-serif;font-weight:700;font-size:clamp(30px,4.5vw,44px);color:var(--didit-text);margin-bottom:16px}
.mp-cta-desc{font-family:'Nunito',sans-serif;font-size:16px;line-height:1.6;color:var(--didit-text);margin-bottom:36px}
.mp-email-form{display:flex;gap:12px;max-width:480px;margin:0 auto}
.mp-email-form input{flex:1;padding:16px 24px;border-radius:9999px;border:2px solid var(--didit-border);font-family:'Nunito',sans-serif;font-size:15px;background:var(--didit-surface);outline:none;transition:all .3s;color:var(--didit-text)}
.mp-email-form input:focus{border-color:var(--didit-coral);box-shadow:0 0 0 4px rgba(255,107,107,0.08)}
.mp-email-form input::placeholder{color:#bbb}
.mp-email-form button{padding:16px 32px;background:var(--didit-text);color:#fff;border:none;border-radius:9999px;font-family:'Nunito',sans-serif;font-size:15px;font-weight:800;cursor:pointer;transition:all .3s;white-space:nowrap}
.mp-email-form button:hover{background:#1a1815;transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,0,0,0.2)}

.mp-footer{padding:50px 40px 40px;background:#FFFFFF;color:#2D2A26}
.mp-footer-inner{max-width:1000px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:20px}
.mp-footer-tagline{font-family:'Nunito',sans-serif;font-style:normal;font-size:14px;opacity:1;margin-top:4px;color:#2D2A26}
.mp-footer-right{font-family:'Nunito',sans-serif;font-size:13px;opacity:1;color:#2D2A26}

@keyframes mp-driftDot{0%,100%{transform:translate(0,0) scale(1)}25%{transform:translate(15px,-20px) scale(1.1)}50%{transform:translate(-10px,-35px) scale(0.95)}75%{transform:translate(20px,-15px) scale(1.05)}}
.mp-float-dot{position:absolute;border-radius:50%;pointer-events:none;animation:mp-driftDot 12s ease-in-out infinite}
@keyframes mp-fadeInUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes mp-fadeIn{to{opacity:1}}
@keyframes mp-floatBlob{0%,100%{transform:translate(0,0) rotate(0deg) scale(1)}25%{transform:translate(8px,-14px) rotate(6deg) scale(1.06)}50%{transform:translate(-5px,-22px) rotate(-4deg) scale(.94)}75%{transform:translate(10px,-8px) rotate(3deg) scale(1.03)}}
@keyframes mp-rotateWords{0%,11%{transform:translateY(0)}14%,25%{transform:translateY(-1.1em)}28%,39%{transform:translateY(-2.2em)}42%,53%{transform:translateY(-3.3em)}56%,67%{transform:translateY(-4.4em)}70%,81%{transform:translateY(-5.5em)}84%,100%{transform:translateY(-6.6em)}}
.reveal{opacity:0;transform:translateY(30px);transition:all .7s cubic-bezier(.16,1,.3,1)}
.reveal.visible{opacity:1;transform:translateY(0)}

@media (max-width: 768px){
  .mp-nav{padding:14px 16px}
  .mp-nav-links a:not(.mp-nav-cta){display:none}
  .mp-nav-cta{padding:8px 18px!important;font-size:13px!important}
  .mp-hero{padding:100px 20px 60px;min-height:92vh}
  .mp-hero h1{font-size:clamp(32px,8vw,48px);margin-bottom:20px}
  .mp-hero-sub{font-size:15px;margin-bottom:28px}
  .mp-btn-primary{padding:12px 28px;font-size:14px}
  .mp-problem{padding:48px 20px;margin-bottom:20px}
  .mp-problem h2{font-size:22px}
  .mp-problem-inner p{font-size:14px!important}
  .mp-games-intro{padding:60px 20px 16px}
  .mp-games-intro h2{font-size:clamp(24px,6vw,36px)}
  .mp-games-intro p{font-size:14px}
  .mp-games-grid{grid-template-columns:1fr;padding:0 20px 40px;gap:16px;max-width:480px}
  .mp-cta-section{padding:48px 20px 40px!important;margin-top:20px}
  .mp-cta-section h2{font-size:clamp(24px,6vw,36px)}
  .mp-cta-desc{font-size:14px;margin-bottom:24px}
  .mp-how{padding:60px 20px 60px}
  .mp-how h2{font-size:clamp(24px,5vw,36px);margin-bottom:40px}
  .mp-principles{grid-template-columns:1fr;gap:28px}
  .mp-principle-num{font-size:28px}
  .mp-principle h3{font-size:18px}
  .mp-principle p{font-size:13px}
  .mp-manifesto-grid{grid-template-columns:1fr}
  .mp-email-form{flex-direction:column}
  .mp-email-form button{width:100%}
  .mp-footer{padding:32px 20px}
  .mp-footer-inner{flex-direction:column;text-align:center}
  .mp-maker-grid{grid-template-columns:1fr!important;gap:32px!important}
  .mp-maker-visual{height:240px!important}
  .mp-maker-visual > div:first-child{width:220px!important;height:220px!important}
  .mp-maker-visual img{width:180px!important;height:180px!important}
}
@media (max-width: 480px){
  .mp-hero{padding:90px 16px 52px;min-height:90vh}
  .mp-hero h1{font-size:clamp(28px,9vw,40px)}
  .mp-hero-sub{font-size:14px}
  .mp-problem{padding:40px 16px}
  .mp-problem h2{font-size:20px}
  .mp-games-grid{padding:0 16px 32px}
  .mp-cta-section{padding:40px 16px 32px!important}
  .mp-how{padding:48px 16px 48px}
  .mp-maker-visual{height:200px!important}
  .mp-maker-visual > div:first-child{width:180px!important;height:180px!important}
  .mp-maker-visual img{width:140px!important;height:140px!important}
}
      `}</style>

      <nav className={`mp-nav${navScrolled ? ' scrolled' : ''}`}>
        <span className="mp-nav-logo"><DiditLogo height={36} onNavigate={() => { trackLandingClick('nav_logo'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} /></span>
        <div className="mp-nav-links">
          <a onClick={() => scrollTo('problem')}>Why</a>
          <a onClick={() => scrollTo('games')}>Our Games</a>
          <a onClick={() => scrollTo('how')}>Our Philosophy</a>
          <a onClick={() => scrollTo('ourstory')}>Our Story</a>
          <a className="mp-nav-cta" onClick={() => { trackLandingClick('nav_login'); navigate('/signin'); }}>Get started</a>
        </div>
      </nav>

      <section className="mp-hero">
        <div className="mp-hero-bg" />
        <div className="mp-hero-blob mp-hero-blob-1" />
        <div className="mp-hero-blob mp-hero-blob-2" />
        <div className="mp-hero-blob mp-hero-blob-3" />
        <div className="mp-hero-blob mp-hero-blob-4" />
        <div className="mp-hero-blob mp-hero-blob-5" />
        <div className="mp-hero-blob mp-hero-blob-6" />

        <div className="mp-hero-content">
          <h1>Kids learning<br /><span className="mp-rotating-wrapper"><span className="mp-rotating-words"><span style={{ color: '#CF4A4A' }}>engineering</span><span style={{ color: '#CF4A4A' }}>finance</span><span style={{ color: '#CF4A4A' }}>music</span><span style={{ color: '#CF4A4A' }}>coding</span><span style={{ color: '#CF4A4A' }}>astronomy</span><span style={{ color: '#CF4A4A' }}>fine art</span><span style={{ color: '#CF4A4A' }}>engineering</span></span></span><br />through <span style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap' }}>play.<svg viewBox="0 0 200 12" preserveAspectRatio="none" style={{ position: 'absolute', bottom: '-6px', left: '-4px', width: 'calc(100% + 8px)', height: '12px', overflow: 'visible', pointerEvents: 'none', transform: 'rotate(-2deg)', transformOrigin: 'left center' }}><path d="M2,9 C8,3 15,13 25,7 C35,1 42,12 55,5 C65,0 72,11 85,6 C95,2 100,13 112,7 C122,3 128,14 140,8 C150,4 155,12 168,6 C178,2 185,11 198,7" fill="none" stroke="#F0DC90" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></svg></span></h1>
          <p className="mp-hero-sub">What if your child could explore the concepts most grown-ups only encounter later in life — just by playing?</p>
          <div className="mp-hero-actions">
            <button className="mp-btn-primary" onClick={() => { trackLandingClick('hero_try_games'); navigate(user ? '/hub' : '/signin'); }}>Try the games{' '}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></button>
          </div>
        </div>
      </section>

      <section className="mp-problem" id="problem">
        <div style={{ position: 'absolute', top: -40, left: 0, right: 0, height: 60, overflow: 'hidden' }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path d="M0,30 C180,60 360,0 540,30 C720,60 900,0 1080,30 C1260,60 1440,20 1440,30 L1440,60 L0,60 Z" fill="#F0F0A0" />
          </svg>
        </div>
        <div style={{ position: 'absolute', bottom: -40, left: 0, right: 0, height: 60, overflow: 'hidden' }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path d="M0,30 C200,0 400,60 600,30 C800,0 1000,60 1200,30 C1350,10 1440,40 1440,30 L1440,0 L0,0 Z" fill="#F0F0A0" />
          </svg>
        </div>
        <div className="mp-problem-inner" style={{ position: 'relative', zIndex: 2 }}>
          <h2 className="reveal" style={{ color: '#2D2A26' }}>Between 2 and 5, their brains are doing the most incredible work they'll ever do, wiring connections for life. <em style={{ color: '#CF4A4A' }}>We thought — why stop at ABCs?</em></h2>
          <p className="reveal" style={{ fontSize: 16, lineHeight: 1.7, color: '#2D2A26', maxWidth: 580, margin: '0 auto' }}>Finance. Logic. Algorithms. Engineering. Skills most people stumble into as adults — imagine your little one getting an early start.</p>
        </div>
      </section>

      <section className="mp-games-intro" id="games" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="mp-float-dot" style={{ width: 14, height: 14, background: 'var(--didit-coral-mid)', top: '15%', left: '8%', opacity: 0.5, animationDelay: '0s', animationDuration: '14s' }} />
        <div className="mp-float-dot" style={{ width: 10, height: 10, background: 'var(--didit-blueberry-mid)', top: '60%', right: '6%', opacity: 0.4, animationDelay: '2s', animationDuration: '16s' }} />
        <div className="mp-float-dot" style={{ width: 12, height: 12, background: 'var(--didit-grass-mid)', bottom: '20%', left: '12%', opacity: 0.45, animationDelay: '4s', animationDuration: '13s' }} />
        <div className="mp-float-dot" style={{ width: 8, height: 8, background: 'var(--didit-sun-mid)', top: '35%', right: '15%', opacity: 0.5, animationDelay: '1s', animationDuration: '11s' }} />
        <div className="mp-games-intro-inner">
          <h2 className="reveal">A few favourites to{' '}<span style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap', color: 'var(--didit-blueberry-dark)' }}>get you started<svg viewBox="0 0 200 12" preserveAspectRatio="none" style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: 'calc(100% + 8px)', height: '12px', overflow: 'visible', pointerEvents: 'none', transform: 'rotate(-1deg)', transformOrigin: 'left center' }}><path d="M2,9 C8,3 15,13 25,7 C35,1 42,12 55,5 C65,0 72,11 85,6 C95,2 100,13 112,7 C122,3 128,14 140,8 C150,4 155,12 168,6 C178,2 185,11 198,7" fill="none" stroke="#F0DC90" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg></span></h2>
          <p className="reveal">Each game teaches one big real-world concept through simple, joyful interactions designed for <strong>kids and parents to play together.</strong></p>
        </div>
      </section>

      <div className="mp-games-grid" style={{ position: 'relative' }}>
        <div className="mp-float-dot" style={{ width: 12, height: 12, background: 'var(--didit-blueberry)', top: '5%', left: '2%', opacity: 0.4, animationDelay: '1s', animationDuration: '16s' }} />
        <div className="mp-float-dot" style={{ width: 10, height: 10, background: 'var(--didit-coral-mid)', top: '25%', right: '3%', opacity: 0.35, animationDelay: '3s', animationDuration: '14s' }} />
        <div className="mp-float-dot" style={{ width: 14, height: 14, background: 'var(--didit-grass)', bottom: '30%', left: '1%', opacity: 0.4, animationDelay: '5s', animationDuration: '18s' }} />
        <div className="mp-float-dot" style={{ width: 8, height: 8, background: 'var(--didit-sun-mid)', bottom: '10%', right: '5%', opacity: 0.45, animationDelay: '2s', animationDuration: '12s' }} />
        {/* Little Shopper */}
        <div className="mp-game-card-v mp-game-shopper reveal" onClick={() => handleGameClick('/games/little-shopper', 'game_card_little-shopper')}>
          <div className="mp-game-arch-header">
            <div className="mp-game-arch-circle"><img src="/game%20illustrations/Bank.png" alt="Little Shopper" /></div>
          </div>
          <div className="mp-game-body">
            <div className="mp-game-title">Little Shopper</div>
            <div className="mp-game-tag">{'\uD83D\uDCB0'} Financial Literacy</div>
            <div className="mp-game-desc" style={{ color: '#2D2A26' }}>They earn coins, choose what to buy, decide what to save, and figure out what things are worth.</div>
            <div className="mp-game-skills"><span className="mp-game-skill">Budgeting</span><span className="mp-game-skill">Saving</span><span className="mp-game-skill">Decisions</span></div>
            <button className="mp-game-play-btn" onClick={(e) => { e.stopPropagation(); handleGameClick('/games/little-shopper', 'game_explore_little-shopper'); }}>Explore {'\u2192'}</button>
          </div>
        </div>

        {/* Little DJ */}
        <div className="mp-game-card-v mp-game-dj reveal" onClick={() => handleGameClick('/games/little-dj', 'game_card_little-dj')}>
          <div className="mp-game-arch-header">
            <div className="mp-game-arch-circle"><img src="/game%20illustrations/Music.png" alt="Little DJ" /></div>
          </div>
          <div className="mp-game-body">
            <div className="mp-game-title">Little DJ</div>
            <div className="mp-game-tag">{'\uD83C\uDF9B\uFE0F'} Beat Making</div>
            <div className="mp-game-desc" style={{ color: '#2D2A26' }}>Tap a cell, hear it loop. Stack drums, bass, melody and more across four beats to build your own groove.</div>
            <div className="mp-game-skills"><span className="mp-game-skill">Layering</span><span className="mp-game-skill">Rhythm</span><span className="mp-game-skill">Creativity</span></div>
            <button className="mp-game-play-btn" onClick={(e) => { e.stopPropagation(); handleGameClick('/games/little-dj', 'game_explore_little-dj'); }}>Explore {'\u2192'}</button>
          </div>
        </div>

        {/* Little Engineer */}
        <div className="mp-game-card-v mp-game-engineer reveal" onClick={() => handleGameClick('/games/little-engineer', 'game_card_little-engineer')}>
          <div className="mp-game-arch-header">
            <div className="mp-game-arch-circle"><img src="/game%20illustrations/Bulb.png" alt="Little Engineer" /></div>
          </div>
          <div className="mp-game-body">
            <div className="mp-game-title">Little Engineer</div>
            <div className="mp-game-tag">{'\uD83D\uDD27'} Electrical Engineering</div>
            <div className="mp-game-desc" style={{ color: '#2D2A26' }}>Switches to flip, wires to connect, circuits to complete. Binary logic and systems thinking.</div>
            <div className="mp-game-skills"><span className="mp-game-skill">Circuits</span><span className="mp-game-skill">Logic</span><span className="mp-game-skill">Systems</span></div>
            <button className="mp-game-play-btn" onClick={(e) => { e.stopPropagation(); handleGameClick('/games/little-engineer', 'game_explore_little-engineer'); }}>Explore {'\u2192'}</button>
          </div>
        </div>

        {/* Little Astronaut */}
        <div className="mp-game-card-v mp-game-astronomer reveal" onClick={() => handleGameClick('/games/little-astronomer', 'game_card_little-astronomer')}>
          <div className="mp-game-arch-header">
            <div className="mp-game-arch-circle">
              <div className="mp-svg-illus"><AstronomerIllustration /></div>
            </div>
          </div>
          <div className="mp-game-body">
            <div className="mp-game-title">Little Astronaut</div>
            <div className="mp-game-tag">🌟 Stars & Constellations</div>
            <div className="mp-game-desc" style={{ color: '#2D2A26' }}>Tap the glowing stars in order to reveal the constellation hiding in the night sky.</div>
            <div className="mp-game-skills"><span className="mp-game-skill">Constellations</span><span className="mp-game-skill">Stars</span><span className="mp-game-skill">Sequences</span></div>
            <button className="mp-game-play-btn" onClick={(e) => { e.stopPropagation(); handleGameClick('/games/little-astronomer', 'game_explore_little-astronomer'); }}>Explore →</button>
          </div>
        </div>
      </div>

      {/* Explore all games CTA */}
      <div style={{ textAlign: 'center', padding: '0 20px 60px', marginTop: -20 }}>
        <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 15, color: '#9A8F82', fontWeight: 600, margin: '0 0 16px' }}>
          Just 4 of our many games — there's a lot more inside.
        </p>
        <button
          className="mp-btn-primary"
          onClick={() => { trackLandingClick('explore_all_games'); navigate(user ? '/hub' : '/signin'); }}
          style={{ gap: 10 }}
        >
          Explore all games →
        </button>
      </div>

      <section className="mp-cta-section" id="signup" style={{ background: '#D4DB4A' }}>
        <div style={{ position: 'absolute', top: -45, left: 0, right: 0, height: 65, overflow: 'hidden' }}>
          <svg viewBox="0 0 1440 65" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <path d="M0,40 C80,20 160,55 240,35 C320,15 400,50 480,30 C560,10 640,55 720,40 C800,25 880,50 960,32 C1040,14 1120,48 1200,35 C1280,22 1360,52 1440,38 L1440,65 L0,65 Z" fill="#D4DB4A" />
          </svg>
        </div>
        <div style={{ position: 'absolute', bottom: -80, left: '-10%', right: '-10%', height: 120, overflow: 'hidden', zIndex: 1 }}>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
            <ellipse cx="720" cy="0" rx="800" ry="120" fill="#D4DB4A" />
          </svg>
        </div>
        <div className="mp-cta-inner" style={{ position: 'relative', zIndex: 2 }}>
          <h2 className="reveal">Get early access and try the games before everyone else</h2>
          <p className="mp-cta-desc reveal">Also connect with a community of parents who are helping their kids unlock extraordinary things</p>
          <div className="reveal"><button style={{ padding: '16px 40px', background: 'var(--didit-text)', color: '#fff', border: 'none', borderRadius: '9999px', fontFamily: "'Nunito', sans-serif", fontSize: '15px', fontWeight: 800, cursor: 'pointer', transition: 'all .3s' }} onClick={() => { trackLandingClick('cta_get_started'); navigate(user ? '/hub' : '/signin'); }}>Get started free →</button></div>
        </div>
      </section>

      <div style={{ background: '#FFFFFF', height: '80px', marginTop: '0', position: 'relative', zIndex: 0 }} />
      <section className="mp-how" id="how" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="mp-float-dot" style={{ width: 16, height: 16, background: 'var(--didit-blueberry-dark)', top: '10%', right: '5%', opacity: 0.35, animationDelay: '0.5s', animationDuration: '15s' }} />
        <div className="mp-float-dot" style={{ width: 12, height: 12, background: 'var(--didit-coral-mid)', top: '50%', left: '4%', opacity: 0.4, animationDelay: '3s', animationDuration: '18s' }} />
        <div className="mp-float-dot" style={{ width: 10, height: 10, background: 'var(--didit-grass-mid)', bottom: '15%', right: '10%', opacity: 0.45, animationDelay: '5s', animationDuration: '13s' }} />
        <div className="mp-float-dot" style={{ width: 8, height: 8, background: 'var(--didit-sun-mid)', top: '30%', left: '15%', opacity: 0.35, animationDelay: '2s', animationDuration: '17s' }} />
        <div className="mp-float-dot" style={{ width: 14, height: 14, background: 'var(--didit-coral)', bottom: '40%', right: '3%', opacity: 0.3, animationDelay: '7s', animationDuration: '20s' }} />
        <div className="mp-how-inner">
          <p className="mp-section-label-lg reveal">Our Design Philosophy</p>
          <h2 className="reveal">Thoughtfully made for little hands and{' '}<span style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap', color: 'var(--didit-blueberry-dark)' }}>big a-ha moments.<svg viewBox="0 0 200 12" preserveAspectRatio="none" style={{ position: 'absolute', bottom: '-6px', left: '-4px', width: 'calc(100% + 8px)', height: '12px', overflow: 'visible', pointerEvents: 'none', transform: 'rotate(-2deg)', transformOrigin: 'left center' }}><path d="M2,9 C8,3 15,13 25,7 C35,1 42,12 55,5 C65,0 72,11 85,6 C95,2 100,13 112,7 C122,3 128,14 140,8 C150,4 155,12 168,6 C178,2 185,11 198,7" fill="none" stroke="#F0DC90" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></svg></span></h2>
          <div className="mp-principles">
            <div className="mp-principle reveal"><div className="mp-principle-num">01</div><h3>Play Together.<br />That's the Magic.</h3><p>The games are a tool in your parenting toolkit, for you and your child to explore together. Your encouragement and coaching makes the learning moment more magical.</p></div>
            <div className="mp-principle reveal"><div className="mp-principle-num">02</div><h3>Big Concepts.<br />Made Simple.</h3><p>The ideas may be big, but the games are simple. Designed for tiny fingers, they are intuitive and tactile, without being overwhelming.</p></div>
            <div className="mp-principle reveal"><div className="mp-principle-num">03</div><h3>No Clutter.<br />No Surprises.</h3><p>A clean, safe, distraction-free space. Designed for your child to explore and for you to feel at ease. Zero ads, ever.</p></div>
          </div>
        </div>
      </section>

      <div style={{ background: '#FFFFFF', height: '40px', position: 'relative', zIndex: 0 }} />
      <section id="ourstory" style={{ background: 'var(--didit-sun-light)', padding: '80px 40px 60px', position: 'relative', overflow: 'visible', marginTop: '0', marginBottom: '40px' }}>
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
            {/* Main white blob with lightbulb centered inside */}
            <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50% 40% 55% 45%', background: '#FFFFFF', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/game%20illustrations/Bulb.png" alt="Lightbulb" style={{ width: '240px', height: '240px', objectFit: 'contain' }} />
            </div>
            {/* Smaller decorative white blobs */}
            <div style={{ position: 'absolute', width: '100px', height: '100px', borderRadius: '45% 55% 50% 50%', background: '#FFFFFF', top: '2%', right: '15%', opacity: 0.7 }} />
            <div style={{ position: 'absolute', width: '70px', height: '70px', borderRadius: '50% 42% 55% 48%', background: '#FFFFFF', bottom: '10%', left: '8%', opacity: 0.6 }} />
            <div style={{ position: 'absolute', width: '50px', height: '50px', borderRadius: '50%', background: '#FFFFFF', bottom: '20%', right: '10%', opacity: 0.5 }} />
          </div>
          {/* Right — text content */}
          <div>
            <p className="reveal" style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.85rem', fontWeight: 800, color: '#2D2A26', letterSpacing: '0.05em', marginBottom: '8px', textTransform: 'uppercase' }}>How it started</p>
            <div className="reveal" style={{ fontFamily: "'Nunito', sans-serif", fontSize: '1.4rem', fontWeight: 900, color: '#2D2A26', marginBottom: '8px' }}>Our Story</div>
            <p className="reveal" style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.95rem', lineHeight: 1.4, color: '#2D2A26', fontStyle: 'normal', margin: '0 0 16px' }}>We're parents from Sydney, Australia who have a wonderfully energetic and curious toddler. {'\uD83E\uDDE1'}</p>
            <p className="reveal" style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.95rem', lineHeight: 1.4, color: '#2D2A26', fontStyle: 'normal', margin: '0 0 16px' }}>Teaching our child is one of our favourite things to do together. But when we went looking for games to play with him, we kept running into the same two problems.</p>
            <div className="reveal" style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.95rem', lineHeight: 1.4, color: '#2D2A26', margin: '0 0 16px', paddingLeft: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}><span style={{ color: 'var(--didit-coral-mid)', fontWeight: 800, flexShrink: 0 }}>1.</span><span>Most kids' games are loud, busy, and designed to keep little eyes glued to the screen.</span></div>
              <div style={{ display: 'flex', gap: '10px' }}><span style={{ color: 'var(--didit-blueberry-dark)', fontWeight: 800, flexShrink: 0 }}>2.</span><span>The educational ones, while great for letters and numbers — rarely go beyond the basics. We were looking for something that could start introducing them to real world bigger ideas.</span></div>
            </div>
            <p className="reveal" style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.95rem', lineHeight: 1.4, color: '#2D2A26', fontStyle: 'normal', margin: '0 0 16px' }}>So we built some games. The more we played, the more we realised how capable kids really are. Their minds can stretch so much further than we give them credit for.</p>
            <p className="reveal" style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.95rem', lineHeight: 1.4, color: '#2D2A26', fontStyle: 'normal', fontWeight: 700, margin: '0' }}><span style={{ fontWeight: 800 }}>We hope your family gets to discover that too as you play along!</span></p>
          </div>
        </div>
      </section>

      <footer className="mp-footer">
        <div className="mp-footer-inner">
          <div>
            <DiditLogo height={32} tone="light" />
            <div className="mp-footer-tagline">Real-world concepts for tiny humans.</div>
          </div>
          <div className="mp-footer-right">&copy; 2026 did*it. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}
