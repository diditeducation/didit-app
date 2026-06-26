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

// Region the firestore-stripe-payments extension is installed in — must match,
// or the customer-portal callable won't be found. Default is the extension's
// default (us-central1); override with VITE_STRIPE_FUNCTIONS_REGION if needed.
export const STRIPE_FUNCTIONS_REGION = import.meta.env.VITE_STRIPE_FUNCTIONS_REGION || 'us-central1';

// ── Paywall enforcement ─────────────────────────────────────────────────────
// Master switch for the in-product paywall. When OFF (default), every signed-in
// user can play all 12 games (current behaviour). When ON, non-members are held
// to the free set (TRIAL_GAME_IDS / canPlay) and locked games route to /checkout.
//
// Set VITE_PAYWALL_ENFORCED=true in Vercel to switch it on — do this only AFTER
// Stripe is live (STRIPE_ENABLED), otherwise you lock users out with no way to
// pay. Test/dev accounts always keep full access via the SubscriptionContext
// override, so you can QA the locked state on the live site before flipping it.
export const PAYWALL_ENFORCED = import.meta.env.VITE_PAYWALL_ENFORCED === 'true';
