import { colors } from '../../design-system/tokens';

// Clean white stage. Primary blue (matches the "consultant" / analyst tone),
// coral accent for celebration moments.
const theme = {
  '--game-bg':         '#FFFFFF',
  '--game-primary':    colors.blueberryDark,
  '--game-accent':     colors.coralMid,
  '--game-warm':       colors.sunMid,
  '--game-shadow':     'rgba(58,108,229,0.20)',
  '--game-text':       colors.text,
  '--game-text-muted': colors.muted,
};

export default theme;
