// Little Consultant — data model
//
// One shared shape set. Three levels, each sorted by a different dimension
// (colour → shape → pattern). Every level produces a 3 + 3 + 2 distribution:
// three shapes in each named home, two in Others.

import { colors } from '../../design-system/tokens';

// 6 shapes, 2+2+2 distribution across every dimension.
// Each named home gets 2 shapes; Others gets 2 shapes.
export const SHAPES = [
  // L1 Others (yellow circle) — also a Circle on L2 and Dots on L3.
  { id: 1, colour: 'yellow', shape: 'circle',   pattern: 'dots'    },
  { id: 2, colour: 'red',    shape: 'square',   pattern: 'stripes' },
  { id: 3, colour: 'blue',   shape: 'circle',   pattern: 'stripes' },
  { id: 4, colour: 'blue',   shape: 'square',   pattern: 'dots'    },
  // Red triangle — a Red on L1, an Other shape on L2, a Plain on L3.
  { id: 5, colour: 'red',    shape: 'triangle', pattern: 'plain'   },
  // L1 Others (teal star).
  { id: 6, colour: 'teal',   shape: 'star',     pattern: 'plain'   },
];

export const LEVELS = [
  { id: 1, dimension: 'colour',  homes: ['Red',    'Blue',    'Others'] },
  { id: 2, dimension: 'shape',   homes: ['Circle', 'Square',  'Others'] },
  { id: 3, dimension: 'pattern', homes: ['Dots',   'Stripes', 'Others'] },
];

// Map (dimension, value) → home label. Anything not in the named map
// belongs in 'Others'.
const VALUE_TO_HOME = {
  colour:  { red: 'Red', blue: 'Blue' },                              // yellow → Others
  shape:   { circle: 'Circle', square: 'Square' },                    // triangle/star → Others
  pattern: { dots: 'Dots', stripes: 'Stripes' },                      // plain → Others
};

export function getCorrectHome(shape, dimension /* , homes */) {
  const value = shape[dimension];
  return VALUE_TO_HOME[dimension]?.[value] || 'Others';
}

// Palette — pulled from existing tokens only.
export const SHAPE_COLOURS = {
  red:    colors.coralMid,     // #CF4A4A
  blue:   colors.blueberryDark, // #3A6CE5
  yellow: colors.sunMid,       // #E8B840  (kept for flexibility)
  orange: colors.sunDark,      // #EE6A30
  teal:   colors.sky,          // #4ECDC4
};

// Neutral surfaces — light cream homes, slightly cooler "Others" tone.
export const NEUTRAL = {
  homeBody:        '#FCF1D9',
  othersBody:      '#EDE5D2',
  bannerNeutral:   '#F0EBDF',
  bannerOthers:    '#E5DDC8',
  bannerRedTint:   '#FAE0E0',
  bannerBlueTint:  '#E0E8FA',
  outline:         '#9A8F82',
  textMuted:       '#9A8F82',
  shadow:          'rgba(60,40,15,0.10)',
  pulseGold:       '#E8B840',
};
