/**
 * constellations.js — Little Astronomer, Did·It
 *
 * Canvas: 390 × 700 (mobile portrait)
 * All star x/y coordinates are derived from J2000 RA/Dec catalogue data
 * (Yale Bright Star Catalogue / Hipparcos) and projected into the 390×700
 * pixel space. Relative positions match the true appearance in the night sky:
 *   · North = up, East = left (standard star-chart orientation)
 *   · X = (RA_max − RA_star) / RA_range × width_scale
 *   · Y = (Dec_max − Dec_star) / Dec_range × height_scale
 * Aspect ratio is preserved per-constellation via the cos(Dec) correction
 * for RA extent. The Little Dipper uses a polar azimuthal projection because
 * Polaris sits ~14h away in RA from the bowl stars.
 *
 * At runtime, adaptConstellation() in levelsData.js normalises each set of
 * coordinates to fill the visible canvas uniformly, so absolute scale here
 * only needs to preserve relative proportions.
 *
 * Star object:
 *   id    — Greek letter / common-name identifier
 *   name  — full star name
 *   x, y  — catalogue-derived canvas coordinates
 *   size  — 'lg' | 'md' | 'sm'  (tap-target and visual radius hint)
 *   color — optional hex for famous coloured stars; defaults to white
 *
 * connectOrder: index array defining the tap sequence.
 * Lines are drawn between consecutive entries.
 * A star index may appear more than once to create branching shapes.
 * close:true appends index 0 to close a loop.
 * extras: additional indices appended after connectOrder.
 */

// ─── Canvas reference dimensions ─────────────────────────────────────────────

const CANVAS_W = 390;
const CANVAS_H = 700;

// ─── Level 1 — Cross & arc shapes ────────────────────────────────────────────

export const southernCross = {
  id: 'southern-cross',
  name: 'Southern Cross',
  level: 2,
  starCount: 4,
  close: false,
  stars: [
    // γ Cru (Gacrux) — upper-right
    { id: 'gamma', name: 'Gacrux', x: 225, y:  60, size: 'md', color: '#ffddcc' },
    // β Cru (Mimosa) — upper-left
    { id: 'beta',  name: 'Mimosa', x:  95, y:  80, size: 'lg', color: '#cce0ff' },
    // α Cru (Acrux) — lower-left, bottom of long axis
    { id: 'alpha', name: 'Acrux',  x: 105, y: 270, size: 'lg', color: '#ffffff' },
    // δ Cru (Imai) — right arm
    { id: 'delta', name: 'Imai',   x: 235, y: 175, size: 'sm', color: '#d0e8ff' },
  ],
  // Two crossing lines (no centre star):
  //   Mimosa → Imai (short axis), then Gacrux → Acrux (long axis).
  // `null` lifts the pen so no line is drawn between the two segments.
  connectOrder: [1, 3, null, 0, 2],
  funFact: 'These stars make a giant cross! You can find it on Australia\'s flag! 🇦🇺',
};

export const triangulum = {
  id: 'triangulum',
  name: 'Triangulum',
  level: 1,
  starCount: 3,
  close: true,
  stars: [
    // α Tri (Mothallah) — right tip, lowest
    { id: 'alpha', name: 'Alpha Tri', x: 366, y: 700, size: 'md', color: '#ffffff' },
    // β Tri — left, top
    { id: 'beta',  name: 'Beta Tri',  x: 118, y:   0, size: 'lg', color: '#fff9c4' },
    // γ Tri — left, upper-mid
    { id: 'gamma', name: 'Gamma Tri', x:   0, y: 148, size: 'sm', color: '#d0e4ff' },
  ],
  funFact: 'Just three stars make a triangle — the easiest shape in the whole sky!',
};

export const aries = {
  id: 'aries',
  name: 'Aries',
  level: 2,
  starCount: 4,
  close: false,
  stars: [
    // α Ari (Hamal) — brightest, upper-right cluster
    { id: 'alpha', name: 'Hamal',     x: 321, y:   0, size: 'lg', color: '#fff9c4' },
    // β Ari (Sheratan)
    { id: 'beta',  name: 'Sheratan',  x: 382, y: 102, size: 'md', color: '#d0e4ff' },
    // γ Ari (Mesarthim)
    { id: 'gamma', name: 'Mesarthim', x: 390, y: 160, size: 'sm', color: '#b0c8e8' },
    // δ Ari (Botein) — far left
    { id: 'delta', name: 'Botein',    x:   0, y: 144, size: 'sm', color: '#8aadcc' },
  ],
  // Tap left-to-right: Botein → Hamal → Sheratan → Mesarthim
  connectOrder: [3, 0, 1, 2],
  funFact: 'Aries is a fluffy ram! These stars draw its head looking right at you.',
};

// ─── Level 2 — Zigzag shapes ─────────────────────────────────────────────────

export const cassiopeia = {
  id: 'cassiopeia',
  name: 'Cassiopeia',
  level: 3,
  starCount: 5,
  close: false,
  stars: [
    // β Cas (Caph) — far right
    { id: 'beta',  name: 'Caph',    x: 390, y: 241, size: 'md', color: '#d0e4ff' },
    // α Cas (Schedar) — dips down-right
    { id: 'alpha', name: 'Schedar', x: 274, y: 380, size: 'lg', color: '#fff9c4' },
    // γ Cas — rises to centre peak
    { id: 'gamma', name: 'Gamma',   x: 214, y: 158, size: 'lg', color: '#ffffff' },
    // δ Cas (Ruchbah) — dips again
    { id: 'delta', name: 'Ruchbah', x: 106, y: 183, size: 'md', color: '#d0e4ff' },
    // ε Cas (Segin) — far left, top
    { id: 'eps',   name: 'Segin',   x:   0, y:   0, size: 'sm', color: '#b0c8e8' },
  ],
  // W shape right → left
  connectOrder: [0, 1, 2, 3, 4],
  funFact: 'A queen sitting on her throne! Can you see the big W she draws in the sky?',
};

export const cancer = {
  id: 'cancer',
  name: 'Cancer',
  level: 3,
  starCount: 5,
  close: false,
  stars: [
    // ι Cnc — top star (head)
    { id: 'iota',  name: 'Iota Cnc', x:  70, y:  25, size: 'lg', color: '#fff9c4' },
    // γ Cnc (Asellus Borealis) — neck, upper-middle
    { id: 'gamma', name: 'Asellus Borealis', x: 92, y: 140, size: 'md', color: '#d0e4ff' },
    // δ Cnc (Asellus Australis) — body junction
    { id: 'delta', name: 'Asellus Australis', x: 82, y: 200, size: 'md', color: '#d0e4ff' },
    // β Cnc (Altarf) — bottom-left leg tip (brightest)
    { id: 'beta',  name: 'Altarf',  x:  28, y: 320, size: 'lg', color: '#ffe080' },
    // α Cnc (Acubens) — bottom-right leg tip
    { id: 'alpha', name: 'Acubens', x: 195, y: 330, size: 'md', color: '#d0e4ff' },
  ],
  // Y-shape: head → neck → junction → left leg, then junction → right leg
  connectOrder: [0, 1, 2, 3, 2, 4],
  funFact: 'A friendly crab doing a happy wave! His cute pincers stretch down below.',
};

export const corvus = {
  id: 'corvus',
  name: 'Corvus',
  level: 3,
  starCount: 5,
  close: false,
  stars: [
    // δ Crv (Algorab) — upper-left of quadrilateral
    { id: 'delta', name: 'Algorab', x: 140, y:  80, size: 'md', color: '#d0e4ff' },
    // γ Crv (Gienah) — upper-right, brightest
    { id: 'gamma', name: 'Gienah',  x: 245, y:  90, size: 'lg', color: '#fff9c4' },
    // β Crv (Kraz) — lower-right
    { id: 'beta',  name: 'Kraz',    x: 250, y: 200, size: 'md', color: '#d0e4ff' },
    // ε Crv (Minkar) — lower-left
    { id: 'eps',   name: 'Minkar',  x: 125, y: 200, size: 'md', color: '#d0e4ff' },
    // α Crv (Alchiba) — extra star, below-right of quad
    { id: 'alpha', name: 'Alchiba', x: 270, y: 240, size: 'sm', color: '#b0c8e8' },
  ],
  // Closed quad: Algorab→Gienah→Kraz→Minkar→Algorab.
  // Then pen-lift and extension: Kraz→Alchiba.
  connectOrder: [0, 1, 2, 3, 0, null, 2, 4],
  funFact: 'A crow flapping its wings! Four stars draw its tiny flying body.',
};

export const sagitta = {
  id: 'sagitta',
  name: 'Sagitta',
  level: 2,
  starCount: 4,
  close: false,
  stars: [
    // η Sge — tip (far left)
    { id: 'eta',   name: 'Eta Sge',   x:   0, y:   0, size: 'lg', color: '#fff9c4' },
    // δ Sge — junction (centre, where shaft meets fork)
    { id: 'delta', name: 'Delta Sge', x: 274, y: 165, size: 'md', color: '#d0e4ff' },
    // α Sge — upper fork tip (rightmost)
    { id: 'alpha', name: 'Alpha Sge', x: 390, y: 223, size: 'sm', color: '#b0c8e8' },
    // β Sge — lower fork tip
    { id: 'beta',  name: 'Beta Sge',  x: 370, y: 284, size: 'md', color: '#d0e4ff' },
  ],
  // Arrow: tip(η) → junction(δ) → upper-fork(α), back to junction → lower-fork(β)
  connectOrder: [0, 1, 2, 1, 3],
  funFact: 'A tiny arrow zooming across the sky! Can you draw it star by star?',
};

// ─── Level 3 — Diamond & kite shapes ─────────────────────────────────────────

export const delphinus = {
  id: 'delphinus',
  name: 'Delphinus',
  level: 3,
  starCount: 5,
  close: false,
  stars: [
    // β Del (Rotanev) — right side of diamond
    { id: 'beta',  name: 'Rotanev',    x: 179, y: 222, size: 'lg', color: '#fff9c4' },
    // α Del (Sualocin) — top of diamond
    { id: 'alpha', name: 'Sualocin',   x: 139, y:  31, size: 'md', color: '#d0e4ff' },
    // ε Del — tail (below diamond)
    { id: 'eps',   name: 'Eps Del',    x: 265, y: 700, size: 'md', color: '#d0e4ff' },
    // δ Del — bottom-left of diamond
    { id: 'delta', name: 'Delta Del',  x:  64, y: 153, size: 'lg', color: '#ffffff' },
    // γ Del — left of diamond
    { id: 'gamma', name: 'Gamma Del',  x:   0, y:   0, size: 'sm', color: '#b0c8e8' },
  ],
  // Tail first, then closed quad: EpsDel→Rotanev→Sualocin→Gamma→DeltaDel→Rotanev
  connectOrder: [2, 0, 1, 4, 3, 0],
  funFact: 'A dolphin jumping out of the sea! Look for its cute little tail star.',
};

export const libra = {
  id: 'libra',
  name: 'Libra',
  level: 4,
  starCount: 6,
  close: false,
  stars: [
    // β Lib (Zubeneschamali) — top apex of triangle
    { id: 'beta',  name: 'Zubeneschamali', x: 215, y:  50, size: 'lg', color: '#fff9c4' },
    // α² Lib (Zubenelgenubi) — mid-left of triangle
    { id: 'alpha', name: 'Zubenelgenubi',  x: 135, y: 150, size: 'md', color: '#d0e4ff' },
    // γ Lib (Zubenelhakrabi) — mid-right of triangle
    { id: 'gamma', name: 'Zubenelhakrabi', x: 290, y: 165, size: 'md', color: '#d0e4ff' },
    // upper-pair star — hanging below α²
    { id: 'ups',   name: 'Upsilon Lib',    x: 115, y: 310, size: 'sm', color: '#b0c8e8' },
    // lower-pair star — just below upper pair
    { id: 'tau',   name: 'Tau Lib',        x: 122, y: 345, size: 'sm', color: '#b0c8e8' },
    // σ Lib (Brachium) — hanging below γ
    { id: 'sigma', name: 'Brachium',       x: 245, y: 295, size: 'md', color: '#d0e4ff' },
  ],
  // Bottom-left pair → up to left corner → bottom of triangle → right-stem → back → close triangle via top
  connectOrder: [4, 3, 1, 2, 5, 2, 0, 1],
  funFact: 'A magical balance scale weighing up the stars! Everything stays perfectly fair.',
};

export const equuleus = {
  id: 'equuleus',
  name: 'Equuleus',
  level: 1,
  starCount: 3,
  close: false,
  stars: [
    // γ Equ — top-right tip, rightmost of top pair
    { id: 'gamma', name: 'Gamma Equ', x: 310, y:  70, size: 'md', color: '#d0e4ff' },
    // δ Equ — top, just left of γ
    { id: 'delta', name: 'Delta Equ', x: 275, y:  85, size: 'md', color: '#d0e4ff' },
    // α Equ (Kitalpha) — bottom, brightest
    { id: 'alpha', name: 'Kitalpha',  x: 280, y: 260, size: 'lg', color: '#ffe080' },
  ],
  // Horizontal pair then vertical drop: γ → δ → Kitalpha
  connectOrder: [0, 1, 2],
  funFact: 'A teeny tiny horse! It\'s one of the smallest constellations of them all.',
};

// ─── Level 4 — Curved & arc shapes ───────────────────────────────────────────

export const coronaBorealis = {
  id: 'corona-borealis',
  name: 'Corona Borealis',
  level: 4,
  starCount: 7,
  close: false,
  stars: [
    // θ CrB — upper-left tip
    { id: 'theta', name: 'Theta CrB',  x:  75, y:  95, size: 'md', color: '#b0c8e8' },
    // β CrB (Nusakan) — descending
    { id: 'beta',  name: 'Nusakan',    x: 115, y: 145, size: 'md', color: '#d0e4ff' },
    // α CrB (Alphecca) — brightest, bottom-left of bowl
    { id: 'alpha', name: 'Alphecca',   x: 135, y: 200, size: 'lg', color: '#ffe080' },
    // γ CrB — bottom of curve, just right of Alphecca
    { id: 'gamma', name: 'Gamma CrB',  x: 168, y: 215, size: 'md', color: '#d0e4ff' },
    // δ CrB — bottom-centre
    { id: 'delta', name: 'Delta CrB',  x: 200, y: 215, size: 'md', color: '#d0e4ff' },
    // ε CrB — rising on right side of bowl
    { id: 'eps',   name: 'Eps CrB',    x: 228, y: 195, size: 'md', color: '#d0e4ff' },
    // ι CrB — upper-right tip (highest of the arc)
    { id: 'iota',  name: 'Iota CrB',   x: 255, y:  75, size: 'md', color: '#b0c8e8' },
  ],
  // Arc left → right following the smile curve
  connectOrder: [0, 1, 2, 3, 4, 5, 6],
  funFact: 'A sparkly crown floating in the sky! Like a tiara for the whole universe.',
};

// ─── Level 5 — Complex shapes ─────────────────────────────────────────────────

export const littleDipper = {
  id: 'little-dipper',
  name: 'Little Dipper',
  level: 5,
  starCount: 7,
  close: false,
  stars: [
    // β UMi (Kochab) — outer bowl rim, brightest after Polaris
    { id: 'beta',  name: 'Kochab',      x:  86, y: 595, size: 'lg', color: '#fff9c4' },
    // γ UMi (Pherkad) — inner bowl rim
    { id: 'gamma', name: 'Pherkad',     x:   0, y: 596, size: 'md', color: '#d0e4ff' },
    // η UMi — bowl bottom
    { id: 'eta',   name: 'Eta UMi',     x:  30, y: 327, size: 'md', color: '#d0e4ff' },
    // ζ UMi — bowl top / handle junction
    { id: 'zeta',  name: 'Zeta UMi',   x: 103, y: 361, size: 'sm', color: '#b0c8e8' },
    // ε UMi — handle
    { id: 'eps',   name: 'Eps UMi',    x: 173, y: 151, size: 'sm', color: '#b0c8e8' },
    // δ UMi (Yildun) — handle
    { id: 'delta', name: 'Yildun',     x: 286, y:  48, size: 'sm', color: '#b0c8e8' },
    // α UMi (Polaris) — tip of handle, North Star
    { id: 'alpha', name: 'Polaris',    x: 390, y:   0, size: 'lg', color: '#ffe090' },
  ],
  // Bowl: Kochab→Pherkad→Eta→Zeta→Kochab, then handle: Zeta→Eps→Yildun→Polaris
  connectOrder: [0, 1, 2, 3, 0, 3, 4, 5, 6],
  funFact: 'A tiny ladle scooping stardust! Its handle points to Polaris — the star that never moves.',
};

// ─── Level 6 — Big shapes ─────────────────────────────────────────────────────

export const bigDipper = {
  id: 'big-dipper',
  name: 'Big Dipper',
  level: 5,
  starCount: 7,
  close: false,
  stars: [
    // α UMa (Dubhe) — outer bowl rim top-right
    { id: 'alpha', name: 'Dubhe',  x: 386, y:   0, size: 'lg', color: '#fff9c4' },
    // β UMa (Merak) — outer bowl rim bottom-right
    { id: 'beta',  name: 'Merak',  x: 390, y: 160, size: 'md', color: '#d0e4ff' },
    // γ UMa (Phecda) — inner bowl bottom-left
    { id: 'gamma', name: 'Phecda', x: 268, y: 240, size: 'md', color: '#d0e4ff' },
    // δ UMa (Megrez) — inner bowl top-left / handle junction
    { id: 'delta', name: 'Megrez', x: 217, y: 141, size: 'sm', color: '#b0c8e8' },
    // ε UMa (Alioth) — handle near
    { id: 'eps',   name: 'Alioth', x: 126, y: 173, size: 'lg', color: '#d0e4ff' },
    // ζ UMa (Mizar) — handle mid
    { id: 'zeta',  name: 'Mizar',  x:  55, y: 204, size: 'md', color: '#b0c8e8' },
    // η UMa (Alkaid) — handle tip
    { id: 'eta',   name: 'Alkaid', x:   0, y: 371, size: 'md', color: '#d0e4ff' },
  ],
  // Bowl: Dubhe→Merak→Phecda→Megrez→Dubhe, handle: Megrez→Alioth→Mizar→Alkaid
  connectOrder: [0, 1, 2, 3, 0, 3, 4, 5, 6],
  funFact: 'A giant spoon scooping up the sky! The two end stars always point to the North Star.',
};

export const orion = {
  id: 'orion',
  name: 'Orion',
  level: 5,
  starCount: 7,
  close: false,
  stars: [
    // α Ori (Betelgeuse) — upper-left shoulder, red supergiant
    { id: 'alpha', name: 'Betelgeuse', x:  60, y:  50, size: 'lg', color: '#ffaa60' },
    // γ Ori (Bellatrix) — upper-right shoulder
    { id: 'gamma', name: 'Bellatrix',  x: 320, y:  60, size: 'lg', color: '#cce0ff' },
    // δ Ori (Mintaka) — belt-left
    { id: 'delta', name: 'Mintaka',    x: 175, y: 340, size: 'sm', color: '#d0e4ff' },
    // ε Ori (Alnilam) — belt centre
    { id: 'eps',   name: 'Alnilam',    x: 210, y: 345, size: 'sm', color: '#cce0ff' },
    // ζ Ori (Alnitak) — belt-right
    { id: 'zeta',  name: 'Alnitak',    x: 245, y: 340, size: 'sm', color: '#d0e4ff' },
    // β Ori (Rigel) — bottom-right foot, blue-white
    { id: 'beta',  name: 'Rigel',      x: 340, y: 620, size: 'lg', color: '#b0ccff' },
    // κ Ori (Saiph) — bottom-left foot
    { id: 'kappa', name: 'Saiph',      x: 180, y: 680, size: 'md', color: '#d0e4ff' },
  ],
  // Hourglass: shoulders linked across the top, feet linked across the bottom,
  // and a trapezoid side from each shoulder down through belt to the same-side
  // foot. Eulerian path Mintaka→Betelgeuse→Bellatrix→Alnitak→Alnilam→Mintaka
  // →Saiph→Rigel→Alnitak draws every edge once with no pen-lift.
  connectOrder: [2, 0, 1, 4, 3, 2, 6, 5, 4],
  funFact: 'A giant hunter with a sparkly belt! His three belt stars are the easiest to spot at night.',
};

// ─── Master export ────────────────────────────────────────────────────────────

// Ordered from simplest to most complex; each playthrough walks the full list.
export const ALL_CONSTELLATIONS = [
  triangulum,
  aries,
  equuleus,
  southernCross,
  cassiopeia,
  corvus,
  sagitta,
  cancer,
  delphinus,
  libra,
  coronaBorealis,
  littleDipper,
  bigDipper,
  orion,
];

// Difficulty buckets — each playthrough picks one constellation from every
// bucket, giving 5 levels per session that ramp up smoothly.
export const LEVELS = [
  {
    level: 1,
    title: 'Tiny shapes',
    description: 'Just three stars — easy to start!',
    constellations: [triangulum, equuleus],
  },
  {
    level: 2,
    title: 'Simple shapes',
    description: 'Four stars in a neat little figure.',
    constellations: [aries, sagitta, southernCross],
  },
  {
    level: 3,
    title: 'Five-star shapes',
    description: 'A few more stars — follow the lines!',
    constellations: [cassiopeia, cancer, corvus, delphinus],
  },
  {
    level: 4,
    title: 'Curves & crowns',
    description: 'Six or seven stars — keep going!',
    constellations: [libra, coronaBorealis],
  },
  {
    level: 5,
    title: 'Big constellations',
    description: 'The most famous shapes in the sky!',
    constellations: [littleDipper, bigDipper, orion],
  },
];

export const CANVAS_DIMS = { w: CANVAS_W, h: CANVAS_H };

export default LEVELS;
