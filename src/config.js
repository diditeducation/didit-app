// Global feature flags.
//
// SHOW_BETA — master switch for the small "BETA" pill under the Did·It logo.
//   true  → each <DiditLogo> decides via its `hideBeta` prop (pill is hidden on
//           the marketing/sign-up funnel, shown inside the product).
//   false → the BETA pill is removed everywhere in one move (e.g. when we
//           leave beta). No need to touch any individual call site.
export const SHOW_BETA = true;

// Pricing — single source of truth. Did·It sells a ONE-TIME "Founding Family
// Pass" (lifetime access incl. future games), NOT a subscription. Render the
// amount via the <Price> component (src/components/Price.jsx); never hardcode "$29".
export const PRICE = '$29';
// Label appended by <Price suffix /> — reads "one-time", not "/month".
export const PRICE_MODEL = 'one-time';

// Workshopped conversion copy — single source so every funnel surface matches.
// NOTE: intentionally signals a growing library WITHOUT promising specific
// future games are included — "founding member · perks as we grow" rewards
// early buyers without over-committing to give away all future content.
export const PRICE_HEADLINE = 'Everything in our library, yours to play';
export const PRICE_CTA = 'Unlock the full games library'; // price appended at call sites
export const PRICE_NOTE =
  'Be a founding member and get this limited time price · One payment only · Early supporters get perks as we grow';

// ── Business / legal details (shown on /terms and /privacy) ─────────────────
// ⚠️ FILL THESE IN before publishing the legal pages / charging real money.
export const LEGAL = {
  entity: 'Did·It',                  // TODO: registered legal name / ABN if you have one
  location: 'Sydney, Australia',
  contactEmail: 'hello@didit.games', // TODO: confirm a real, monitored inbox
  effectiveDate: '29 June 2026',     // TODO: set to the date you publish
};

// ── Stripe checkout ────────────────────────────────────────────────────────
// The Stripe Price ID for the one-time Family Pass (a `mode: payment` price,
// e.g. "price_1AbC..."). Set it in Vercel as VITE_STRIPE_PRICE_ID once the
// firestore-stripe-payments Firebase extension is installed and the product/
// price exist in Stripe.
//
// While this is empty, STRIPE_ENABLED is false and Checkout falls back to the
// dev "simulate payment" path (localhost) or a "coming soon" notice — so the
// real flow stays inert until you flip it on by setting the env var. No code
// change needed to go live.
export const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID || '';
export const STRIPE_ENABLED = !!STRIPE_PRICE_ID;

// ── Paywall enforcement ─────────────────────────────────────────────────────
// In-product paywall. When ON, non-members are held to the free set
// (TRIAL_GAME_IDS / canPlay = the 6 games with demos on the landing) and locked
// games route to /checkout; members + dev/test accounts always pass.
//
// Default: **tied to Stripe** — enforcement turns on automatically the moment
// payments are live (STRIPE_ENABLED), and never before, so users are never
// locked with no way to pay. No separate switch to remember.
//
// Manual overrides (VITE_PAYWALL_ENFORCED in Vercel):
//   'true'  → force ON even without Stripe (e.g. to test the funnel pre-launch;
//             checkout shows the "coming soon" notice).
//   'false' → force OFF even when Stripe is live (kill switch).
//   unset   → follow STRIPE_ENABLED (the default above).
const PAYWALL_OVERRIDE = import.meta.env.VITE_PAYWALL_ENFORCED;
export const PAYWALL_ENFORCED =
  PAYWALL_OVERRIDE === 'true' ? true
  : PAYWALL_OVERRIDE === 'false' ? false
  : STRIPE_ENABLED;
