import { useNavigate } from 'react-router-dom';
import { colors, fonts } from '../design-system/tokens';
import DiditLogo from '../components/DiditLogo';
import SiteFooter from '../design-system/components/SiteFooter';

/**
 * Shared chrome for the legal pages (/terms, /privacy): top logo, a readable
 * centred column, title + "last updated" line, the document body (children),
 * and the shared SiteFooter. Typography for the body lives in the scoped
 * `.legal-doc` style block so each page just supplies plain headings/paragraphs.
 */
export default function LegalPage({ title, updated, children }) {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: fonts.display }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        .legal-doc{font-size:16px;line-height:1.65;color:${colors.text}}
        .legal-doc h2{font-size:1.15rem;font-weight:900;margin:30px 0 8px;letter-spacing:-0.01em}
        .legal-doc p{margin:10px 0}
        .legal-doc ul{margin:10px 0;padding-left:22px}
        .legal-doc li{margin:6px 0}
        .legal-doc a{color:${colors.blueberryDark};font-weight:700}
        .legal-doc strong{font-weight:800}
      `}</style>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 24px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: 28 }} onClick={() => navigate('/')}>
          <DiditLogo height={30} hideBeta />
        </div>

        <h1 style={{ fontSize: 'clamp(28px,4vw,38px)', fontWeight: 900, letterSpacing: '-0.02em', color: colors.text, margin: '0 0 6px' }}>
          {title}
        </h1>
        {updated && (
          <p style={{ fontSize: 13, fontWeight: 700, color: colors.muted, margin: '0 0 8px' }}>
            Last updated: {updated}
          </p>
        )}

        <div className="legal-doc">{children}</div>
      </div>

      <SiteFooter hideBeta />
    </div>
  );
}
