// Matisse cutout vocabulary — all paths in 0 0 100 100 viewBox.
// Derived from observation of Matisse's actual cutouts
// (The Snail, Vegetaux, Memory of Oceania).
// Every path is hand-torn: no parallel edges, no perfect geometry.

export const SHAPES = {
  // Torn rectangles — The Snail vocabulary
  tornSquare: 'M14,16 L86,12 L90,84 L12,88 Z',
  tornColumn: 'M38,8 L64,12 L62,90 L36,92 Z',
  tornBrick:  'M10,34 L92,30 L88,66 L12,70 Z',
  tornSlab:   'M20,22 L78,14 L82,78 L24,86 Z',

  // Graphic patterns — Vegetaux vocabulary
  zigzag:     'M10,38 L22,20 L34,38 L46,20 L58,38 L70,20 L82,38 L90,38 L82,58 L70,76 L58,58 L46,76 L34,58 L22,76 L10,58 Z',
  diamond:    'M50,14 L80,50 L50,86 L20,50 Z',
  triangle:   'M50,16 L86,84 L14,84 Z',

  // Botanical — Vegetaux + Oceania vocabulary
  algae:      'M48,6 C46,14 52,20 50,30 C40,28 32,22 26,28 C30,36 40,36 46,42 C36,44 26,42 22,52 C32,56 44,52 50,58 C42,66 30,68 28,78 C38,80 48,72 52,80 C54,72 62,72 70,76 C70,66 60,62 54,58 C62,54 72,56 78,50 C70,44 60,48 54,42 C62,38 72,36 74,28 C66,24 58,30 52,30 C52,20 56,14 54,6 C52,4 50,4 48,6 Z',
  flame:      'M50,92 C46,80 38,74 36,60 C34,46 42,40 44,28 C40,22 34,24 32,18 C38,14 46,18 48,12 C48,6 54,6 54,14 C58,10 66,14 62,22 C58,28 50,26 50,34 C54,40 62,40 62,50 C58,56 50,52 50,60 C54,66 62,64 64,72 C58,78 52,72 52,80 C54,86 58,92 50,92 Z',
  blade:      'M48,6 C58,20 62,40 58,60 C56,78 54,88 50,94 C46,88 44,78 42,60 C38,40 42,20 48,6 Z',
  coral:      'M50,92 L46,60 C40,56 32,58 28,50 C34,46 42,48 46,42 L44,22 C40,18 34,20 32,12 C40,8 46,14 48,18 L50,6 L52,18 C54,14 60,8 68,12 C66,20 60,18 56,22 L54,42 C58,48 66,46 72,50 C68,58 60,56 54,60 L50,92 Z',
  wavyStrip:  'M38,6 C44,20 32,34 40,48 C46,62 34,74 42,88 L62,92 C56,78 66,66 60,52 C54,38 64,24 58,10 Z',
};

export const SHAPE_KEYS = Object.keys(SHAPES);
