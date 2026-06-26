import { fonts, colors } from '../tokens';
import DiditLogo from '../../components/DiditLogo';
import { STRIPE_PORTAL_LOGIN_URL } from '../../config';

/**
 * Shared site footer — logo + tagline + copyright strip.
 *
 * Single source for the footer used on the landing (/), the hub (below
 * its share CTA), and the /about page. Background is transparent so it
 * inherits whatever surface it sits on; each caller owns the surrounding bg.
 *
 * `hideBeta` follows the per-surface beta convention (see AUDIT.md): the
 * logo's BETA pill is hidden on public/marketing/funnel surfaces and shown
 * inside the product (hub). Callers pass it to match their surface.
 */
export default function SiteFooter({ hideBeta = false }) {
  return (
    <footer
      style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: '36px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 14,
        fontFamily: fonts.display,
        fontSize: 13,
        color: colors.muted,
      }}
    >
      <div>
        <DiditLogo height={30} hideBeta={hideBeta} />
        <div style={{ marginTop: 4 }}>Real-world concepts for tiny humans.</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        {STRIPE_PORTAL_LOGIN_URL && (
          <a
            href={STRIPE_PORTAL_LOGIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: colors.muted, textDecoration: 'underline', display: 'block', marginBottom: 4, fontWeight: 700 }}
          >
            Manage subscription
          </a>
        )}
        <div>© 2026 did·it. All rights reserved.</div>
      </div>
    </footer>
  );
}
