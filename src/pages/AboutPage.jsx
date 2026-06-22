import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DiditLogo from '../components/DiditLogo';
import AboutContent from '../components/AboutContent';
import { SiteFooter } from '../design-system';

/**
 * About / philosophy page.
 *
 * Renders the shared <AboutContent /> (hero, "Our Story", "Our Design
 * Philosophy") with a back bar. The same content is embedded in the
 * conversion landing's "About Did·It" expandable area. Deep links
 * (/about#our-story, /about#design-philosophy) scroll to the matching section.
 */
export default function AboutPage() {
  const nav = useNavigate();
  const { hash } = useLocation();

  // Deep-link support: scroll to the section named in the URL hash. Deferred a
  // tick so the target's final position is known (fonts/content can shift it).
  useEffect(() => {
    // No hash → open at the very top.
    if (!hash) { window.scrollTo(0, 0); return; }
    const t = setTimeout(() => {
      const el = document.getElementById(hash.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <div className="ap-page">
      <div className="ap-bar">
        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => nav('/')}>
          <DiditLogo height={28} hideBeta />
        </div>
        <button className="ap-back" onClick={() => nav('/')}>← Back</button>
      </div>
      <AboutContent />
      <SiteFooter hideBeta />
    </div>
  );
}
