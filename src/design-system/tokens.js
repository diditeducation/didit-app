// Did*It Design Tokens

export const colors = {
  coralLight: '#F2C4BE',
  coral: '#E8AAAA',
  coralMid: '#CF4A4A',
  coralDark: '#C23C3C',

  skyLight: '#E0F8F6',
  sky: '#4ECDC4',
  skyDark: '#03B292',

  sunLight: '#F0F0A0',
  sun: '#F0DC90',
  sunMid: '#E8B840',
  sunDark: '#EE6A30',

  grassLight: '#E0F0A8',
  grass: '#BEE060',
  grassMid: '#4CC830',
  grassDark: '#2EA820',

  // Primary CTA / action accent (lime). Used by the main action buttons
  // (SignIn, Checkout, WelcomeModal, SuccessScreen) and the landing.
  lime: '#D4DB4A',

  blueberryLight: '#CFD9F4',
  blueberry: '#9BB5E8',
  blueberryMid: '#6B8FD8',
  blueberryDark: '#3A6CE5',

  night: '#1A1040',

  bg: '#FFFBF5',
  surface: '#FFFFFF',
  border: '#EDE5D8',
  text: '#2D2A26',
  muted: '#9A8F82',
};

export const fonts = {
  display: "'Nunito', sans-serif",
  body: "'Nunito Sans', sans-serif",
};

export const spacing = {
  space1: '4px',
  space2: '8px',
  space3: '12px',
  space4: '16px',
  space5: '20px',
  space6: '24px',
  space7: '28px',
  space8: '32px',
  space9: '36px',
  space10: '40px',
  space11: '44px',
  space12: '48px',
  space13: '52px',
  space14: '56px',
  space15: '60px',
  space16: '64px',
  space17: '68px',
  space18: '72px',
  space19: '76px',
  space20: '80px',
};

export const radii = {
  sm: '8px',
  md: '16px',
  card: '18px',
  lg: '24px',
  xl: '32px',
  pill: '9999px',
};

export const targets = {
  tapMin: '48px',
  tapIdeal: '64px',
  tapHero: '96px',
};

export const shadows = {
  sm: '0 2px 6px rgba(0,0,0,0.08)',
  md: '0 4px 16px rgba(0,0,0,0.10)',
  lg: '0 8px 32px rgba(0,0,0,0.12)',
  pop: '0 6px 0 rgba(0,0,0,0.15)',
};

export const easing = {
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  out: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};

export const alphaWhite = {
  5: 'rgba(255,255,255,0.05)',
  6: 'rgba(255,255,255,0.06)',
  8: 'rgba(255,255,255,0.08)',
  10: 'rgba(255,255,255,0.10)',
  15: 'rgba(255,255,255,0.15)',
  40: 'rgba(255,255,255,0.40)',
  45: 'rgba(255,255,255,0.45)',
  50: 'rgba(255,255,255,0.50)',
  55: 'rgba(255,255,255,0.55)',
  60: 'rgba(255,255,255,0.60)',
};

export const alphaBlack = {
  35: 'rgba(0,0,0,0.35)',
};

export const white = '#FFFFFF';

// Build cssVars mapping: every token → CSS custom property name
function buildCssVars(categories) {
  const vars = {};
  for (const [category, values] of Object.entries(categories)) {
    for (const key of Object.keys(values)) {
      vars[`${category}_${key}`] = `--${category}-${key}`;
    }
  }
  return vars;
}

export const cssVars = {
  ...buildCssVars({
    colors,
    fonts,
    spacing,
    radii,
    targets,
    shadows,
    easing,
    alphaWhite,
    alphaBlack,
  }),
  white: '--white',
};

const tokens = {
  colors,
  fonts,
  spacing,
  radii,
  targets,
  shadows,
  easing,
  alphaWhite,
  alphaBlack,
  white,
  cssVars,
};

export default tokens;
