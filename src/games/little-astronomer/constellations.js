/**
 * constellations.js — Little Astronomer, Did·It
 *
 * Canvas: 390 × 700 (mobile portrait)
 * Each constellation is centred and scaled to fill roughly 60–75% of the canvas
 * so stars are large, well-spaced tap targets for toddlers.
 *
 * Star object:
 *   id       — Greek letter / common name identifier
 *   name     — full star name (shown to parents, not on canvas)
 *   x, y     — canvas coordinates (origin top-left)
 *   size     — relative radius hint: 'lg' | 'md' | 'sm' (renderer maps to px)
 *   color    — optional hex override for famous coloured stars; defaults to white
 *
 * Connection order follows the `stars` array index (0→1→2→…).
 * Lines are drawn in sequence; close=true adds a final line back to index 0.
 *
 * Silhouette: SVG path string keyed to the constellation, used for the
 * celebratory overlay. Paths are in a 390×700 coordinate space.
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CANVAS_W = 390;
const CANVAS_H = 700;
const CX = CANVAS_W / 2;   // 195
const CY = CANVAS_H / 2;   // 350

// ─── Level 1 — Cross shapes ──────────────────────────────────────────────────

export const southernCross = {
  id: 'southern-cross',
  name: 'Southern Cross',
  level: 1,
  starCount: 5,
  close: false,
  stars: [
    // Gacrux — top (γ Crucis)
    { id: 'gamma', name: 'Gacrux',   x: CX,       y: 170,  size: 'md', color: '#ffddcc' },
    // Mimosa — right (β Crucis, brightest)
    { id: 'beta',  name: 'Mimosa',   x: CX + 130, y: 345,  size: 'lg', color: '#cce0ff' },
    // Acrux — bottom (α Crucis)
    { id: 'alpha', name: 'Acrux',    x: CX,       y: 530,  size: 'lg', color: '#ffffff' },
    // Imai — left (δ Crucis)
    { id: 'delta', name: 'Imai',     x: CX - 110, y: 355,  size: 'sm', color: '#d0e8ff' },
    // Ginan — small 5th star, offset upper-right of centre
    { id: 'eps',   name: 'Ginan',    x: CX + 65,  y: 240,  size: 'sm', color: '#b0c8e8' },
  ],
  // Connection: γ→β→α→δ (cross), then ε as optional pointer star
  connectOrder: [0, 1, 2, 3],   // main cross
  extras: [4],                   // Ginan tapped last but not part of main lines
  funFact: 'Four bright stars make a cross in the sky — and it\'s on Australia\'s flag!',
};

export const triangulum = {
  id: 'triangulum',
  name: 'Triangulum',
  level: 1,
  starCount: 3,
  close: true,
  stars: [
    // α Trianguli — right tip (brightest)
    { id: 'alpha', name: 'Alpha Tri',  x: 295, y: 460,  size: 'md', color: '#ffffff' },
    // β Trianguli — left base (slightly brighter)
    { id: 'beta',  name: 'Beta Tri',   x:  95, y: 460,  size: 'lg', color: '#fff9c4' },
    // γ Trianguli — top
    { id: 'gamma', name: 'Gamma Tri',  x: 130, y: 240,  size: 'sm', color: '#d0e4ff' },
  ],
  funFact: 'Three stars, three lines — the simplest shape in the sky!',
};

export const aries = {
  id: 'aries',
  name: 'Aries',
  level: 1,
  starCount: 4,
  close: false,
  stars: [
    // α Arietis (Hamal) — brightest, left
    { id: 'alpha', name: 'Hamal',      x:  80, y: 330,  size: 'lg', color: '#fff9c4' },
    // β Arietis (Sheratan)
    { id: 'beta',  name: 'Sheratan',   x: 190, y: 360,  size: 'md', color: '#d0e4ff' },
    // γ Arietis (Mesarthim)
    { id: 'gamma', name: 'Mesarthim',  x: 280, y: 340,  size: 'sm', color: '#b0c8e8' },
    // δ Arietis (Botein) — faintest, slight drop
    { id: 'delta', name: 'Botein',     x: 345, y: 400,  size: 'sm', color: '#8aadcc' },
  ],
  funFact: 'Aries is the ram — these four stars are its head, gently nodding!',
};

// ─── Level 2 — Zigzag shapes ─────────────────────────────────────────────────

export const cassiopeia = {
  id: 'cassiopeia',
  name: 'Cassiopeia',
  level: 2,
  starCount: 5,
  close: false,
  stars: [
    // β Cassiopeiae (Caph) — far left, high
    { id: 'beta',  name: 'Caph',    x:  50, y: 240,  size: 'md', color: '#d0e4ff' },
    // α Cassiopeiae (Schedar) — dips down
    { id: 'alpha', name: 'Schedar', x: 130, y: 380,  size: 'lg', color: '#fff9c4' },
    // γ Cassiopeiae (Gamma) — rises to centre
    { id: 'gamma', name: 'Gamma',   x: 195, y: 210,  size: 'lg', color: '#ffffff' },
    // δ Cassiopeiae (Ruchbah) — dips again
    { id: 'delta', name: 'Ruchbah', x: 270, y: 370,  size: 'md', color: '#d0e4ff' },
    // ε Cassiopeiae (Segin) — far right, high
    { id: 'eps',   name: 'Segin',   x: 345, y: 235,  size: 'sm', color: '#b0c8e8' },
  ],
  funFact: 'Queen Cassiopeia sits in her throne making a big letter W in the sky!',
};

export const corvus = {
  id: 'corvus',
  name: 'Corvus',
  level: 2,
  starCount: 4,
  close: true,
  stars: [
    // β Corvi — bottom-left (brightest)
    { id: 'beta',  name: 'Kraz',    x: 110, y: 510,  size: 'lg', color: '#fff9c4' },
    // γ Corvi — bottom-right
    { id: 'gamma', name: 'Gienah',  x: 290, y: 500,  size: 'md', color: '#d0e4ff' },
    // δ Corvi — top-right (second brightest)
    { id: 'delta', name: 'Algorab', x: 310, y: 250,  size: 'lg', color: '#ffffff' },
    // ε Corvi — top-left
    { id: 'eps',   name: 'Minkar',  x: 135, y: 235,  size: 'md', color: '#d0e4ff' },
  ],
  funFact: 'Corvus the crow — four stars make its little body flying through the sky!',
};

export const sagitta = {
  id: 'sagitta',
  name: 'Sagitta',
  level: 2,
  starCount: 5,
  close: false,
  stars: [
    // α Sagittae — tail (leftmost)
    { id: 'alpha', name: 'Alpha Sge',  x:  60, y: 350,  size: 'sm', color: '#b0c8e8' },
    // β Sagittae — shaft
    { id: 'beta',  name: 'Beta Sge',   x: 160, y: 350,  size: 'md', color: '#d0e4ff' },
    // γ Sagittae — upper barb
    { id: 'gamma', name: 'Gamma Sge',  x: 235, y: 250,  size: 'sm', color: '#b0c8e8' },
    // δ Sagittae — lower barb / tip (brightest)
    { id: 'delta', name: 'Delta Sge',  x: 235, y: 450,  size: 'sm', color: '#b0c8e8' },
    // Tip — rightmost
    { id: 'tip',   name: 'Tip',        x: 330, y: 350,  size: 'lg', color: '#fff9c4' },
  ],
  // Connection: tail→shaft, shaft→upper barb, shaft→lower barb, both barbs→tip
  connectOrder: [0, 1, 2, 4, 3, 1],  // draw arrow shape
  funFact: 'Sagitta is a tiny arrow flying across the sky — can you draw it?',
};

// ─── Level 3 — Diamond & kite shapes ─────────────────────────────────────────

export const delphinus = {
  id: 'delphinus',
  name: 'Delphinus',
  level: 3,
  starCount: 5,
  close: false,
  stars: [
    // β Delphini (Rotanev) — top of diamond (brightest)
    { id: 'beta',  name: 'Rotanev',   x: CX,       y: 175,  size: 'lg', color: '#fff9c4' },
    // α Delphini (Sualocin) — right
    { id: 'alpha', name: 'Sualocin',  x: CX + 120, y: 320,  size: 'md', color: '#d0e4ff' },
    // ε Delphini — bottom of diamond
    { id: 'eps',   name: 'Eps Del',   x: CX + 30,  y: 460,  size: 'md', color: '#d0e4ff' },
    // δ Delphini — left
    { id: 'delta', name: 'Delta Del', x: CX - 95,  y: 310,  size: 'lg', color: '#ffffff' },
    // γ Delphini — tail star (below-left of diamond)
    { id: 'gamma', name: 'Gamma Del', x: CX - 50,  y: 545,  size: 'sm', color: '#b0c8e8' },
  ],
  // Diamond: β→α→ε→δ→β, then tail: ε→γ
  connectOrder: [0, 1, 2, 3, 0, 2, 4],
  funFact: 'Delphinus is a dolphin leaping out of the sea — spot its little tail!',
};

export const lyra = {
  id: 'lyra',
  name: 'Lyra',
  level: 3,
  starCount: 5,
  close: false,
  stars: [
    // α Lyrae (Vega) — top, very bright yellow-white
    { id: 'alpha', name: 'Vega',      x: CX,       y: 155,  size: 'lg', color: '#ffe080' },
    // β Lyrae — upper-left of parallelogram
    { id: 'beta',  name: 'Sheliak',   x: CX - 100, y: 340,  size: 'sm', color: '#b0c8e8' },
    // γ Lyrae — lower-left
    { id: 'gamma', name: 'Sulafat',   x: CX - 115, y: 510,  size: 'sm', color: '#b0c8e8' },
    // δ Lyrae — lower-right
    { id: 'delta', name: 'Delta Lyr', x: CX + 110, y: 530,  size: 'sm', color: '#b0c8e8' },
    // ζ Lyrae — upper-right of parallelogram
    { id: 'zeta',  name: 'Zeta Lyr',  x: CX + 100, y: 345,  size: 'sm', color: '#b0c8e8' },
  ],
  // Vega at top, two lines down to parallelogram, parallelogram closed
  connectOrder: [0, 1, 2, 3, 4, 0, 1, 4], // Vega→β→γ→δ→ζ→Vega, then close parallelogram
  funFact: 'Lyra is a tiny harp! Vega is one of the brightest stars in the whole sky.',
};

export const equuleus = {
  id: 'equuleus',
  name: 'Equuleus',
  level: 3,
  starCount: 4,
  close: true,
  stars: [
    // α Equulei (Kitalpha) — top
    { id: 'alpha', name: 'Kitalpha',   x: CX,       y: 200,  size: 'md', color: '#d0e4ff' },
    // β Equulei — right
    { id: 'beta',  name: 'Beta Equ',   x: CX + 110, y: 350,  size: 'sm', color: '#b0c8e8' },
    // γ Equulei — bottom (brightest)
    { id: 'gamma', name: 'Gamma Equ',  x: CX,       y: 500,  size: 'lg', color: '#fff9c4' },
    // δ Equulei — left
    { id: 'delta', name: 'Delta Equ',  x: CX - 110, y: 350,  size: 'sm', color: '#8aadcc' },
  ],
  funFact: 'Equuleus is the little horse — the second smallest constellation in the sky!',
};

// ─── Level 4 — Curved & arc shapes ───────────────────────────────────────────

export const coronaBorealis = {
  id: 'corona-borealis',
  name: 'Corona Borealis',
  level: 4,
  starCount: 6,
  close: false,
  stars: [
    // β CrB — far left of arc (start)
    { id: 'beta',  name: 'Nusakan',   x:  50, y: 490,  size: 'sm', color: '#8aadcc' },
    // θ CrB
    { id: 'theta', name: 'Theta CrB', x: 105, y: 330,  size: 'sm', color: '#b0c8e8' },
    // γ CrB
    { id: 'gamma', name: 'Gamma CrB', x: 165, y: 215,  size: 'sm', color: '#b0c8e8' },
    // α CrB (Alphecca) — top-centre, brightest
    { id: 'alpha', name: 'Alphecca',  x: 255, y: 195,  size: 'lg', color: '#ffe080' },
    // δ CrB
    { id: 'delta', name: 'Delta CrB', x: 315, y: 285,  size: 'sm', color: '#b0c8e8' },
    // ε CrB — far right of arc
    { id: 'eps',   name: 'Eps CrB',   x: 355, y: 420,  size: 'sm', color: '#8aadcc' },
  ],
  funFact: 'Corona Borealis is a crown made of stars — a halo in the night sky!',
};

export const aquila = {
  id: 'aquila',
  name: 'Aquila',
  level: 4,
  starCount: 5,
  close: false,
  stars: [
    // α Aquilae (Altair) — centre, very bright, yellow-white
    { id: 'alpha', name: 'Altair',    x: CX,       y: 335,  size: 'lg', color: '#ffe090' },
    // β Aquilae (Alshain) — above-left
    { id: 'beta',  name: 'Alshain',   x: CX - 80,  y: 220,  size: 'sm', color: '#b0c8e8' },
    // γ Aquilae (Tarazed) — below-left
    { id: 'gamma', name: 'Tarazed',   x: CX - 70,  y: 460,  size: 'md', color: '#ffddaa' },
    // δ Aquilae — left wing
    { id: 'delta', name: 'Delta Aql', x: CX - 170, y: 335,  size: 'sm', color: '#b0c8e8' },
    // ζ Aquilae — right wing
    { id: 'zeta',  name: 'Zeta Aql',  x: CX + 160, y: 310,  size: 'sm', color: '#b0c8e8' },
  ],
  // Altair centre: connect wings and body line
  connectOrder: [3, 0, 4, 0, 1, 0, 2],
  funFact: 'Aquila is an eagle soaring through the sky, with bright Altair as its heart!',
};

export const crater = {
  id: 'crater',
  name: 'Crater',
  level: 4,
  starCount: 5,
  close: false,
  stars: [
    // α Crateris — lower-left
    { id: 'alpha', name: 'Alpha Crt', x: 105, y: 510,  size: 'md', color: '#d0e4ff' },
    // β Crateris — lower-right (brightest)
    { id: 'beta',  name: 'Beta Crt',  x: 295, y: 500,  size: 'lg', color: '#fff9c4' },
    // γ Crateris — upper-right
    { id: 'gamma', name: 'Gamma Crt', x: 315, y: 290,  size: 'md', color: '#d0e4ff' },
    // δ Crateris — upper-left
    { id: 'delta', name: 'Delta Crt', x: 160, y: 255,  size: 'md', color: '#d0e4ff' },
    // ε Crateris — far upper-left handle
    { id: 'eps',   name: 'Eps Crt',   x:  70, y: 175,  size: 'sm', color: '#8aadcc' },
  ],
  // Cup shape: α→β→γ→δ→α, handle out to ε
  connectOrder: [0, 1, 2, 3, 0, 3, 4],
  funFact: 'Crater is a cup! The ancient Greeks saw it as the goblet of the god Apollo.',
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
    { id: 'beta',  name: 'Kochab',   x:  80, y: 360,  size: 'lg', color: '#fff9c4' },
    // γ UMi — inner bowl
    { id: 'gamma', name: 'Pherkad',  x:  80, y: 530,  size: 'md', color: '#d0e4ff' },
    // η UMi — bowl bottom-right
    { id: 'eta',   name: 'Eta UMi',  x: 210, y: 540,  size: 'md', color: '#d0e4ff' },
    // ζ UMi — bowl top-right / handle junction
    { id: 'zeta',  name: 'Zeta UMi', x: 215, y: 370,  size: 'sm', color: '#b0c8e8' },
    // ε UMi — handle
    { id: 'eps',   name: 'Eps UMi',  x: 280, y: 265,  size: 'sm', color: '#b0c8e8' },
    // δ UMi — handle
    { id: 'delta', name: 'Yildun',   x: 310, y: 175,  size: 'sm', color: '#b0c8e8' },
    // α UMi (Polaris) — tip of handle, North Star
    { id: 'alpha', name: 'Polaris',  x: 345, y:  95,  size: 'lg', color: '#ffe090' },
  ],
  // Bowl: β→γ→η→ζ→β, then handle: ζ→ε→δ→Polaris
  connectOrder: [0, 1, 2, 3, 0, 3, 4, 5, 6],
  funFact: 'The Little Dipper ends at Polaris — the North Star that never moves!',
};

export const gemini = {
  id: 'gemini',
  name: 'Gemini',
  level: 5,
  starCount: 6,
  close: false,
  stars: [
    // α Geminorum (Castor) — top of left twin
    { id: 'alpha', name: 'Castor',    x: 130, y: 120,  size: 'md', color: '#d0e4ff' },
    // β Geminorum (Pollux) — top of right twin, brightest
    { id: 'beta',  name: 'Pollux',    x: 260, y: 135,  size: 'lg', color: '#ffe090' },
    // μ Geminorum — body of Castor twin (left)
    { id: 'mu',    name: 'Tejat',     x: 115, y: 340,  size: 'sm', color: '#b0c8e8' },
    // δ Geminorum — body of Pollux twin (right)
    { id: 'delta', name: 'Wasat',     x: 245, y: 345,  size: 'sm', color: '#b0c8e8' },
    // η Geminorum — foot of Castor
    { id: 'eta',   name: 'Propus',    x: 110, y: 560,  size: 'sm', color: '#ffddaa' },
    // ξ Geminorum — foot of Pollux
    { id: 'xi',    name: 'Alzirr',    x: 255, y: 570,  size: 'sm', color: '#b0c8e8' },
  ],
  // Two parallel lines (twins) joined at head: Castor line + Pollux line + crossbar at heads
  connectOrder: [0, 2, 4, 2, 0, 1, 3, 5, 3, 1],
  funFact: 'Gemini are the twins! Castor and Pollux are two bright stars right next to each other.',
};

export const perseus = {
  id: 'perseus',
  name: 'Perseus',
  level: 5,
  starCount: 6,
  close: false,
  stars: [
    // α Persei (Mirfak) — centre, brightest
    { id: 'alpha', name: 'Mirfak',   x: CX,       y: 350,  size: 'lg', color: '#fff9c4' },
    // γ Persei — upper-left arm
    { id: 'gamma', name: 'Gamma Per', x: CX - 155, y: 155,  size: 'md', color: '#d0e4ff' },
    // η Persei — upper-right arm
    { id: 'eta',   name: 'Eta Per',   x: CX + 145, y: 175,  size: 'md', color: '#d0e4ff' },
    // β Persei (Algol) — lower body, famous variable star
    { id: 'beta',  name: 'Algol',     x: CX,       y: 530,  size: 'md', color: '#d0e4ff' },
    // δ Persei — upper-left branch off γ
    { id: 'delta', name: 'Delta Per', x: CX - 165, y: 250,  size: 'sm', color: '#b0c8e8' },
    // ε Persei — upper-right branch
    { id: 'eps',   name: 'Eps Per',   x: CX + 158, y: 268,  size: 'sm', color: '#b0c8e8' },
  ],
  // Y-shape: Algol→Mirfak, then arms out, δ on left, ε on right
  connectOrder: [3, 0, 1, 4, 1, 0, 2, 5],
  funFact: 'Perseus the hero! Algol is a star that winks — it\'s actually two stars spinning together.',
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
    { id: 'alpha', name: 'Dubhe',   x: 305, y: 135,  size: 'lg', color: '#fff9c4' },
    // β UMa (Merak) — outer bowl rim bottom-right
    { id: 'beta',  name: 'Merak',   x: 300, y: 320,  size: 'md', color: '#d0e4ff' },
    // γ UMa (Phecda) — inner bowl bottom-left
    { id: 'gamma', name: 'Phecda',  x: 160, y: 340,  size: 'md', color: '#d0e4ff' },
    // δ UMa (Megrez) — inner bowl top-left / handle junction
    { id: 'delta', name: 'Megrez',  x: 155, y: 165,  size: 'sm', color: '#b0c8e8' },
    // ε UMa (Alioth) — handle near
    { id: 'eps',   name: 'Alioth',  x:  95, y: 275,  size: 'lg', color: '#d0e4ff' },
    // ζ UMa (Mizar) — handle mid
    { id: 'zeta',  name: 'Mizar',   x:  60, y: 385,  size: 'md', color: '#b0c8e8' },
    // η UMa (Alkaid) — handle tip
    { id: 'eta',   name: 'Alkaid',  x:  50, y: 520,  size: 'md', color: '#d0e4ff' },
  ],
  // Bowl: α→β→γ→δ→α, handle: δ→ε→ζ→η
  connectOrder: [0, 1, 2, 3, 0, 3, 4, 5, 6],
  funFact: 'The Big Dipper is a giant ladle! The two outer stars always point to the North Star.',
};

export const orion = {
  id: 'orion',
  name: 'Orion',
  level: 6,
  starCount: 7,
  close: false,
  stars: [
    // α Orionis (Betelgeuse) — upper-left shoulder, red-orange
    { id: 'alpha', name: 'Betelgeuse', x: 110, y: 175,  size: 'lg', color: '#ffaa60' },
    // γ Orionis (Bellatrix) — upper-right shoulder
    { id: 'gamma', name: 'Bellatrix',  x: 290, y: 190,  size: 'md', color: '#cce0ff' },
    // δ Orionis (Mintaka) — belt left
    { id: 'delta', name: 'Mintaka',    x: 110, y: 365,  size: 'md', color: '#d0e4ff' },
    // ε Orionis (Alnilam) — belt centre, brightest belt star
    { id: 'eps',   name: 'Alnilam',    x: CX,  y: 355,  size: 'lg', color: '#cce0ff' },
    // ζ Orionis (Alnitak) — belt right
    { id: 'zeta',  name: 'Alnitak',    x: 285, y: 370,  size: 'md', color: '#d0e4ff' },
    // β Orionis (Rigel) — lower-right foot, blue-white, very bright
    { id: 'beta',  name: 'Rigel',      x: 310, y: 560,  size: 'lg', color: '#b0ccff' },
    // κ Orionis (Saiph) — lower-left foot
    { id: 'kappa', name: 'Saiph',      x: 105, y: 545,  size: 'md', color: '#d0e4ff' },
  ],
  // Shoulders→belt→feet, with shoulders cross-connected
  connectOrder: [0, 1, 4, 3, 2, 0, 2, 6, 3, 4, 5],
  funFact: 'Orion the hunter has a belt of three stars — the most famous pattern in the sky!',
};

export const scorpius = {
  id: 'scorpius',
  name: 'Scorpius',
  level: 6,
  starCount: 8,
  close: false,
  stars: [
    // α Scorpii (Antares) — heart, huge red supergiant
    { id: 'alpha', name: 'Antares',  x: CX,       y: 215,  size: 'lg', color: '#ff7040' },
    // σ Scorpii — head/left claw upper
    { id: 'sigma', name: 'Alniyat',  x: CX - 90,  y: 145,  size: 'sm', color: '#b0c8e8' },
    // δ Scorpii (Dschubba) — head/forehead
    { id: 'delta', name: 'Dschubba', x: CX - 20,  y:  95,  size: 'md', color: '#d0e4ff' },
    // β Scorpii (Graffias) — head/right claw
    { id: 'beta',  name: 'Graffias', x: CX + 80,  y: 115,  size: 'md', color: '#d0e4ff' },
    // τ Scorpii — upper body
    { id: 'tau',   name: 'Tau Sco',  x: CX,       y: 310,  size: 'sm', color: '#b0c8e8' },
    // ε Scorpii — tail segment 1
    { id: 'eps',   name: 'Wei',      x: CX - 55,  y: 415,  size: 'md', color: '#d0e4ff' },
    // θ Scorpii — tail segment 2
    { id: 'theta', name: 'Sargas',   x: CX - 120, y: 525,  size: 'md', color: '#fff9c4' },
    // λ Scorpii (Shaula) — stinger tip
    { id: 'lambda', name: 'Shaula',  x: CX - 55,  y: 615,  size: 'lg', color: '#cce0ff' },
  ],
  // Head cluster → Antares → tail curling down
  connectOrder: [1, 2, 3, 2, 0, 4, 5, 6, 7],
  funFact: 'Scorpius is a scorpion with a curling tail — Antares its red heart glows like Mars!',
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
    constellations: [coronaBorealis, aquila, crater],
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
