import { colors } from '../../design-system/tokens';

// Cream stage with amber primary and coral accent. Matches the spec's
// "amber pill button" and "wooden tan docket bar" intent while staying
// within the Did·It token palette.
const theme = {
  '--game-bg':         '#FFFFFF',
  '--game-primary':    colors.sunMid,    // amber #E8B840
  '--game-accent':     colors.coralMid,  // coral #CF4A4A — used on "new!" badge + progress
  '--game-warm':       colors.sunDark,
  '--game-shadow':     'rgba(232,184,64,0.3)',
  '--game-text':       colors.text,
  '--game-text-muted': colors.muted,
  // Docket panel — soft amber to match the game's yellow scheme.
  '--trader-docket':      '#FCE8BA',
  '--trader-docket-text': colors.sunDark,    // deep amber for headings on the cream panel
};

export default theme;
