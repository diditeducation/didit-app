// Global feature flags.
//
// SHOW_BETA — master switch for the small "BETA" pill under the Did·It logo.
//   true  → each <DiditLogo> decides via its `hideBeta` prop (pill is hidden on
//           the marketing/sign-up funnel, shown inside the product).
//   false → the BETA pill is removed everywhere in one move (e.g. when we
//           leave beta). No need to touch any individual call site.
export const SHOW_BETA = true;

// Subscription pricing — single source of truth. Render via the <Price>
// component (src/components/Price.jsx) rather than hardcoding "$15" anywhere.
export const PRICE = '$15';
export const BILLING_PERIOD = 'month';

// ── Stripe checkout ────────────────────────────────────────────────────────
// The Stripe Price ID for the subscription (e.g. "price_1AbC..."). Set it in
// Vercel as VITE_STRIPE_PRICE_ID once the firestore-stripe-payments Firebase
// extension is installed and the product/price exist in Stripe.
//
// While this is empty, STRIPE_ENABLED is false and Checkout falls back to the
// dev "simulate payment" path (localhost) or a "coming soon" notice — so the
// real flow stays inert until you flip it on by setting the env var. No code
// change needed to go live.
export const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID || '';
export const STRIPE_ENABLED = !!STRIPE_PRICE_ID;
