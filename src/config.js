// Global feature flags.
//
// SHOW_BETA — master switch for the small "BETA" pill under the Did·It logo.
//   true  → each <DiditLogo> decides via its `hideBeta` prop (pill is hidden on
//           the marketing/sign-up funnel, shown inside the product).
//   false → the BETA pill is removed everywhere in one move (e.g. when we
//           leave beta). No need to touch any individual call site.
export const SHOW_BETA = true;
