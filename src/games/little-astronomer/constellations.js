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
  level: 1,
  starCount: 5,
  close: false,
  stars: [
    // Gacrux (γ Cru) — top of long axis, upper-right
    { id: 'gamma', name: 'Gacrux', x: 300, y:  60, size: 'md', color: '#ffddcc' },
    // Mimosa (β Cru) — left arm
    { id: 'beta',  name: 'Mimosa', x:   0, y: 300, size: 'lg', color: '#cce0ff' },
    // Acrux (α Cru) — bottom of long axis, lower-left
    { id: 'alpha', name: 'Acrux',  x:  80, y: 700, size: 'lg', color: '#ffffff' },
    // Imai (δ Cru) — right arm
    { id: 'delta', name: 'Imai',   x: 320, y: 280, size: 'sm', color: '#d0e8ff' },
    // Ginan (ε Cru) — intersection centre
    { id: 'eps',   name: 'Ginan',  x: 222, y: 286, size: 'sm', color: '#b0c8e8' },
  ],
  // Draw cross: right-arm → centre → left-arm, then centre → top-right → bottom-left
  connectOrder: [3, 4, 1, 4, 0, 2],
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
  level: 1,
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
  level: 2,
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

export const corvus = {
  id: 'corvus',
  name: 'Corvus',
  level: 2,
  starCount: 4,
  close: false,
  stars: [
    // β Crv (Kraz) — bottom-left
    { id: 'beta',  name: 'Kraz',    x:   0, y: 700, size: 'lg', color: '#fff9c4' },
    // γ Crv (Gienah) — upper-right
    { id: 'gamma', name: 'Gienah',  x: 248, y: 104, size: 'md', color: '#d0e4ff' },
    // δ Crv (Algorab) — upper-left
    { id: 'delta', name: 'Algorab', x:  61, y:   0, size: 'lg', color: '#ffffff' },
    // ε Crv (Minkar) — bottom-right
    { id: 'eps',   name: 'Minkar',  x: 324, y: 621, size: 'md', color: '#d0e4ff' },
  ],
  // Quadrilateral: Kraz→Minkar→Gienah→Algorab→Kraz, then diagonal Kraz→Minkar
  connectOrder: [0, 3, 1, 2, 0, 3],
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

export const lyra = {
  id: 'lyra',
  name: 'Lyra',
  level: 3,
  starCount: 5,
  close: false,
  stars: [
    // α Lyr (Vega) — top, brilliant yellow-white
    { id: 'alpha', name: 'Vega',      x: 285, y:   0, size: 'lg', color: '#ffe080' },
    // β Lyr (Sheliak) — lower-left of parallelogram
    { id: 'beta',  name: 'Sheliak',   x: 115, y: 622, size: 'sm', color: '#b0c8e8' },
    // γ Lyr (Sulafat) — bottom-left
    { id: 'gamma', name: 'Sulafat',   x:   0, y: 700, size: 'sm', color: '#b0c8e8' },
    // δ Lyr — upper-left of parallelogram
    { id: 'delta', name: 'Delta Lyr', x:  58, y: 216, size: 'sm', color: '#b0c8e8' },
    // ζ Lyr — upper-right of parallelogram
    { id: 'zeta',  name: 'Zeta Lyr',  x: 184, y: 135, size: 'sm', color: '#b0c8e8' },
  ],
  // Vega (handle) → Zeta → parallelogram: Delta→Sulafat→Sheliak→Zeta (closes the body)
  connectOrder: [0, 4, 3, 2, 1, 4],
  funFact: 'A magical harp made of stars! Vega is super bright — one of the shiniest in the sky.',
};

export const equuleus = {
  id: 'equuleus',
  name: 'Equuleus',
  level: 3,
  starCount: 4,
  close: false,
  stars: [
    // α Equ (Kitalpha) — bottom
    { id: 'alpha', name: 'Kitalpha',  x: 139, y: 700, size: 'md', color: '#d0e4ff' },
    // β Equ — left
    { id: 'beta',  name: 'Beta Equ',  x:   0, y: 476, size: 'sm', color: '#b0c8e8' },
    // γ Equ — top-left
    { id: 'gamma', name: 'Gamma Equ', x: 247, y:   0, size: 'lg', color: '#fff9c4' },
    // δ Equ — top-right
    { id: 'delta', name: 'Delta Equ', x: 166, y:  18, size: 'sm', color: '#8aadcc' },
  ],
  // Small quad: Gamma→Delta→Kitalpha→Beta→Gamma
  connectOrder: [2, 3, 0, 1, 2],
  funFact: 'A teeny tiny horse! It\'s one of the smallest constellations of them all.',
};

// ─── Level 4 — Curved & arc shapes ───────────────────────────────────────────

export const coronaBorealis = {
  id: 'corona-borealis',
  name: 'Corona Borealis',
  level: 4,
  starCount: 6,
  close: false,
  stars: [
    // β CrB (Nusakan) — far left of arc (West = left orientation)
    { id: 'beta',  name: 'Nusakan',     x:   0, y: 242, size: 'sm', color: '#8aadcc' },
    // θ CrB — left, peak of crown
    { id: 'theta', name: 'Theta CrB',   x:  67, y:   0, size: 'sm', color: '#b0c8e8' },
    // γ CrB — lower-centre
    { id: 'gamma', name: 'Gamma CrB',   x: 184, y: 543, size: 'sm', color: '#b0c8e8' },
    // α CrB (Alphecca) — brightest, centre-left
    { id: 'alpha', name: 'Alphecca',    x:  90, y: 498, size: 'lg', color: '#ffe080' },
    // δ CrB — lower-right
    { id: 'delta', name: 'Delta CrB',   x: 285, y: 568, size: 'sm', color: '#b0c8e8' },
    // ε CrB — far right
    { id: 'eps',   name: 'Eps CrB',     x: 390, y: 481, size: 'sm', color: '#8aadcc' },
  ],
  // Arc left → right: Nusakan→Theta→Alphecca→Gamma→Delta→Epsilon
  connectOrder: [0, 1, 3, 2, 4, 5],
  funFact: 'A sparkly crown floating in the sky! Like a tiara for the whole universe.',
};

export const cygnus = {
  id: 'cygnus',
  name: 'Cygnus',
  level: 4,
  starCount: 5,
  close: false,
  stars: [
    // α Cyg (Deneb) — top of cross, one of the farthest naked-eye stars
    { id: 'alpha',   name: 'Deneb',       x:  25, y:   0, size: 'lg', color: '#d0e4ff' },
    // γ Cyg (Sadr) — centre of cross
    { id: 'gamma',   name: 'Sadr',        x: 124, y: 203, size: 'lg', color: '#ffffff' },
    // β Cyg (Albireo) — bottom of cross, famous golden double star
    { id: 'beta',    name: 'Albireo',     x: 390, y: 700, size: 'md', color: '#ffd080' },
    // δ Cyg — right wing
    { id: 'delta',   name: 'Delta Cyg',   x: 318, y:   6, size: 'sm', color: '#b0c8e8' },
    // ε Cyg (Gienah) — left wing
    { id: 'eps',     name: 'Gienah',      x:   0, y: 457, size: 'sm', color: '#8aadcc' },
  ],
  // Northern Cross: left-wing→centre→right-wing→centre→top→bottom
  connectOrder: [4, 1, 3, 1, 0, 2],
  funFact: 'A swan flying through the Milky Way! It\'s also called the Northern Cross. Bright Deneb is one of the farthest stars you can see!',
};

export const crater = {
  id: 'crater',
  name: 'Crater',
  level: 4,
  starCount: 5,
  close: false,
  stars: [
    // α Crt — right side of cup
    { id: 'alpha', name: 'Alpha Crt',   x: 196, y: 435, size: 'md', color: '#d0e4ff' },
    // β Crt — bottom of cup (brightest)
    { id: 'beta',  name: 'Beta Crt',    x: 103, y: 700, size: 'lg', color: '#fff9c4' },
    // γ Crt — left side of cup
    { id: 'gamma', name: 'Gamma Crt',   x:   0, y: 399, size: 'md', color: '#d0e4ff' },
    // δ Crt — upper rim
    { id: 'delta', name: 'Delta Crt',   x:  44, y: 230, size: 'md', color: '#d0e4ff' },
    // ε Crt — handle tip (topmost)
    { id: 'eps',   name: 'Eps Crt',     x:   2, y:   0, size: 'sm', color: '#8aadcc' },
  ],
  // Cup: handle→rim→right→bottom→left→rim (bracing Delta)
  connectOrder: [4, 3, 0, 1, 2, 3],
  funFact: 'A magic cup floating in space! Long ago people imagined a god drinking from it.',
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

export const gemini = {
  id: 'gemini',
  name: 'Gemini',
  level: 5,
  starCount: 6,
  close: false,
  stars: [
    // α Gem (Castor) — head of left twin
    { id: 'alpha', name: 'Castor',  x:  46, y:   0, size: 'md', color: '#d0e4ff' },
    // β Gem (Pollux) — head of right twin, brightest
    { id: 'beta',  name: 'Pollux',  x:   0, y: 130, size: 'lg', color: '#ffe090' },
    // μ Gem (Tejat) — foot of Castor twin, far right
    { id: 'mu',    name: 'Tejat',   x: 354, y: 315, size: 'sm', color: '#b0c8e8' },
    // δ Gem (Wasat) — body / waist centre
    { id: 'delta', name: 'Wasat',   x: 108, y: 329, size: 'sm', color: '#b0c8e8' },
    // η Gem (Propus) — foot far right
    { id: 'eta',   name: 'Propus',  x: 390, y: 315, size: 'sm', color: '#ffddaa' },
    // ξ Gem (Alzirr) — foot of Pollux twin
    { id: 'xi',    name: 'Alzirr',  x: 258, y: 637, size: 'sm', color: '#b0c8e8' },
  ],
  // Two parallel twin chains joined at head:
  // Castor→Wasat→Tejat→Propus (left chain), Propus→Wasat→Alzirr→Pollux→Castor (right chain)
  connectOrder: [0, 3, 2, 4, 3, 5, 1, 0],
  funFact: 'Two best friends standing side by side! Castor and Pollux are twin stars.',
};

export const perseus = {
  id: 'perseus',
  name: 'Perseus',
  level: 5,
  starCount: 6,
  close: false,
  stars: [
    // α Per (Mirfak) — centre, brightest
    { id: 'alpha', name: 'Mirfak',    x: 137, y: 266, size: 'lg', color: '#fff9c4' },
    // γ Per — upper arm
    { id: 'gamma', name: 'Gamma Per', x: 218, y: 105, size: 'md', color: '#d0e4ff' },
    // η Per — upper tip
    { id: 'eta',   name: 'Eta Per',   x: 276, y:   0, size: 'md', color: '#d0e4ff' },
    // β Per (Algol) — lower body, famous variable star
    { id: 'beta',  name: 'Algol',     x: 204, y: 658, size: 'md', color: '#d0e4ff' },
    // δ Per — lower-left arm
    { id: 'delta', name: 'Delta Per', x:  61, y: 358, size: 'sm', color: '#b0c8e8' },
    // ε Per — foot / lower-left tip
    { id: 'eps',   name: 'Eps Per',   x:   0, y: 700, size: 'sm', color: '#b0c8e8' },
  ],
  // Y-shape: Eta→Gamma→Mirfak→Algol (spine), Mirfak→Delta→Eps (arm)
  connectOrder: [2, 1, 0, 3, 0, 4, 5],
  funFact: 'A brave hero in the sky! Algol is a winking star — it\'s really two stars hugging each other.',
};

// ─── Level 6 — Big shapes ─────────────────────────────────────────────────────

export const bigDipper = {
  id: 'big-dipper',
  name: 'Big Dipper',
  level: 6,
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
  level: 6,
  starCount: 7,
  close: false,
  stars: [
    // α Ori (Betelgeuse) — upper-left shoulder, red supergiant
    { id: 'alpha', name: 'Betelgeuse', x:   0, y:   0, size: 'lg', color: '#ffaa60' },
    // γ Ori (Bellatrix) — upper-right shoulder
    { id: 'gamma', name: 'Bellatrix',  x: 172, y:  43, size: 'md', color: '#cce0ff' },
    // δ Ori (Mintaka) — belt left
    { id: 'delta', name: 'Mintaka',    x: 132, y: 315, size: 'md', color: '#d0e4ff' },
    // ε Ori (Alnilam) — belt centre, brightest belt star
    { id: 'eps',   name: 'Alnilam',    x: 108, y: 353, size: 'lg', color: '#cce0ff' },
    // ζ Ori (Alnitak) — belt right
    { id: 'zeta',  name: 'Alnitak',    x:  82, y: 383, size: 'md', color: '#d0e4ff' },
    // β Ori (Rigel) — lower-right foot, blue-white, very bright
    { id: 'beta',  name: 'Rigel',      x: 232, y: 640, size: 'lg', color: '#b0ccff' },
    // κ Ori (Saiph) — lower-left foot
    { id: 'kappa', name: 'Saiph',      x:  42, y: 700, size: 'md', color: '#d0e4ff' },
  ],
  // Left closed triangle (Alnitak→Betelgeuse→Saiph→Alnitak) + belt + right closed quad (Alnilam→Mintaka→Bellatrix→Rigel→Alnilam)
  connectOrder: [4, 0, 6, 4, 3, 2, 1, 5, 3],
  funFact: 'A giant hunter with a sparkly belt! His three belt stars are the easiest to spot at night.',
};

export const scorpius = {
  id: 'scorpius',
  name: 'Scorpius',
  level: 6,
  starCount: 8,
  close: false,
  stars: [
    // α Sco (Antares) — heart, red supergiant
    { id: 'alpha',  name: 'Antares',  x: 246, y: 200, size: 'lg', color: '#ff7040' },
    // σ Sco (Alniyat) — upper body
    { id: 'sigma',  name: 'Alniyat',  x: 273, y: 175, size: 'sm', color: '#b0c8e8' },
    // δ Sco (Dschubba) — forehead / head
    { id: 'delta',  name: 'Dschubba', x: 348, y:  84, size: 'md', color: '#d0e4ff' },
    // β Sco (Graffias) — upper claw
    { id: 'beta',   name: 'Graffias', x: 330, y:   0, size: 'md', color: '#d0e4ff' },
    // τ Sco — lower body
    { id: 'tau',    name: 'Tau Sco',  x: 221, y: 254, size: 'sm', color: '#b0c8e8' },
    // ε Sco (Wei) — tail segment 1
    { id: 'eps',    name: 'Wei',      x: 169, y: 438, size: 'md', color: '#d0e4ff' },
    // θ Sco (Sargas) — tail tip
    { id: 'theta',  name: 'Sargas',   x:   0, y: 700, size: 'md', color: '#fff9c4' },
    // λ Sco (Shaula) — stinger
    { id: 'lambda', name: 'Shaula',   x:  13, y: 522, size: 'lg', color: '#cce0ff' },
  ],
  // Head cluster → Antares → curling tail
  connectOrder: [3, 2, 1, 0, 4, 5, 7, 6],
  funFact: 'A scorpion curling its tail in the sky! Red Antares glows like a little fire.',
};

// ─── Master export ────────────────────────────────────────────────────────────

export const LEVELS = [
  {
    level: 1,
    title: 'Cross shapes',
    description: 'Tap each star in order — they snap into place!',
    constellations: [southernCross, triangulum, aries],
  },
  {
    level: 2,
    title: 'Zigzag shapes',
    description: 'Tap from star to star to draw the lines.',
    constellations: [cassiopeia, corvus, sagitta],
  },
  {
    level: 3,
    title: 'Diamond & kite shapes',
    description: 'Tap from star to star to draw the lines.',
    constellations: [delphinus, lyra, equuleus],
  },
  {
    level: 4,
    title: 'Curved & arc shapes',
    description: 'Follow the curve of stars across the sky.',
    constellations: [coronaBorealis, cygnus, crater],
  },
  {
    level: 5,
    title: 'Complex shapes',
    description: 'More stars, bigger shapes — you can do it!',
    constellations: [littleDipper, gemini, perseus],
  },
  {
    level: 6,
    title: 'Big shapes',
    description: 'The biggest constellations in the sky!',
    constellations: [bigDipper, orion, scorpius],
  },
];

export const ALL_CONSTELLATIONS = LEVELS.flatMap(l => l.constellations);

export const CANVAS_DIMS = { w: CANVAS_W, h: CANVAS_H };

export default LEVELS;
