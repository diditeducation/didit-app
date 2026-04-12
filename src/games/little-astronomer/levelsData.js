// All constellation definitions.
// Star coordinates are percentages (0–100) of the canvas width/height.
// Sequences are single-stroke (no repeated stars) for toddler simplicity.

export const ALL_CONSTELLATIONS = [
  // ── Original 6 ─────────────────────────────────────────────────────────────
  {
    id: 'leo',
    animal: '🦁',
    animalName: 'Leo the Lion',
    toast: 'Roar! A lion! 🦁',
    stars: [
      { index: 0, name: 'Regulus',    x: 50, y: 70 },
      { index: 1, name: 'Eta Leonis', x: 47, y: 57 },
      { index: 2, name: 'Algieba',    x: 37, y: 50 },
      { index: 3, name: 'Adhafera',   x: 45, y: 38 },
      { index: 4, name: 'Rasalas',    x: 60, y: 30 },
    ],
    sequence: [0, 1, 2, 3, 4],
  },
  {
    id: 'canis-major',
    animal: '🐕',
    animalName: 'Canis Major the Dog',
    toast: 'Woof! A dog! 🐕',
    stars: [
      { index: 0, name: 'Sirius',  x: 50, y: 28 },
      { index: 1, name: 'Mirzam', x: 30, y: 47 },
      { index: 2, name: 'Wezen',  x: 48, y: 60 },
      { index: 3, name: 'Adhara', x: 64, y: 55 },
      { index: 4, name: 'Aludra', x: 73, y: 38 },
    ],
    sequence: [0, 1, 2, 3, 4],
  },
  {
    id: 'cygnus',
    animal: '🦢',
    animalName: 'Cygnus the Swan',
    toast: 'A beautiful swan! 🦢',
    stars: [
      { index: 0, name: 'Deneb',   x: 50, y: 20 },
      { index: 1, name: 'Gienah',  x: 18, y: 48 },
      { index: 2, name: 'Sadr',    x: 50, y: 48 },
      { index: 3, name: 'Fawaris', x: 82, y: 48 },
      { index: 4, name: 'Albireo', x: 50, y: 78 },
    ],
    // left-wing → tail → right-wing → body → beak (flying V + neck)
    sequence: [1, 0, 3, 2, 4],
  },
  {
    id: 'ursa-major',
    animal: '🐻',
    animalName: 'Ursa Major the Bear',
    toast: 'The Big Dipper! 🐻',
    stars: [
      { index: 0, name: 'Dubhe',  x: 22, y: 30 },
      { index: 1, name: 'Merak',  x: 22, y: 58 },
      { index: 2, name: 'Phecda', x: 50, y: 58 },
      { index: 3, name: 'Megrez', x: 50, y: 30 },
      { index: 4, name: 'Alioth', x: 63, y: 23 },
      { index: 5, name: 'Mizar',  x: 76, y: 17 },
    ],
    // U-shaped dipper bowl then handle
    sequence: [0, 1, 2, 3, 4, 5],
  },
  {
    id: 'scorpius',
    animal: '🦂',
    animalName: 'Scorpius the Scorpion',
    toast: 'A scorpion! 🦂',
    stars: [
      { index: 0, name: 'Antares',  x: 45, y: 22 },
      { index: 1, name: 'Dschubba', x: 52, y: 35 },
      { index: 2, name: 'Graffias', x: 55, y: 50 },
      { index: 3, name: 'Lesath',   x: 52, y: 63 },
      { index: 4, name: 'Shaula',   x: 41, y: 74 },
      { index: 5, name: 'Girtab',   x: 30, y: 68 },
    ],
    sequence: [0, 1, 2, 3, 4, 5],
  },
  {
    id: 'taurus',
    animal: '🐂',
    animalName: 'Taurus the Bull',
    toast: 'Moo! A bull! 🐂',
    stars: [
      { index: 0, name: 'Horn A',    x: 26, y: 33 },
      { index: 1, name: 'Elnath',    x: 37, y: 50 },
      { index: 2, name: 'Aldebaran', x: 50, y: 60 },
      { index: 3, name: 'Taygeta',   x: 63, y: 50 },
      { index: 4, name: 'Horn B',    x: 74, y: 33 },
    ],
    sequence: [0, 1, 2, 3, 4],
  },

  // ── 18 additional famous constellations ─────────────────────────────────────
  {
    id: 'orion',
    animal: '🏹',
    animalName: 'Orion the Hunter',
    toast: 'The great hunter! 🏹',
    stars: [
      { index: 0, name: 'Betelgeuse', x: 35, y: 28 },
      { index: 1, name: 'Bellatrix',  x: 65, y: 28 },
      { index: 2, name: 'Alnitak',    x: 40, y: 52 },
      { index: 3, name: 'Alnilam',    x: 50, y: 52 },
      { index: 4, name: 'Mintaka',    x: 60, y: 52 },
      { index: 5, name: 'Rigel',      x: 65, y: 74 },
    ],
    // left-shoulder → belt-left → belt-mid → belt-right → right-shoulder → knee
    sequence: [0, 2, 3, 4, 1, 5],
  },
  {
    id: 'gemini',
    animal: '👯',
    animalName: 'Gemini the Twins',
    toast: 'The twins! 👯',
    stars: [
      { index: 0, name: 'Castor',  x: 32, y: 22 },
      { index: 1, name: 'Pollux',  x: 62, y: 22 },
      { index: 2, name: 'Alhena',  x: 38, y: 45 },
      { index: 3, name: 'Mebsuda', x: 57, y: 45 },
      { index: 4, name: 'Propus',  x: 32, y: 68 },
      { index: 5, name: 'Tejat',   x: 62, y: 68 },
    ],
    // U shape: left-head → left-body → left-feet → right-feet → right-body → right-head
    sequence: [0, 2, 4, 5, 3, 1],
  },
  {
    id: 'aquila',
    animal: '🦅',
    animalName: 'Aquila the Eagle',
    toast: 'The mighty eagle! 🦅',
    stars: [
      { index: 0, name: 'Tarazed', x: 35, y: 32 },
      { index: 1, name: 'Altair',  x: 50, y: 45 },
      { index: 2, name: 'Alshain', x: 65, y: 32 },
      { index: 3, name: 'Lambda',  x: 30, y: 62 },
      { index: 4, name: 'Deneb Okab', x: 70, y: 62 },
    ],
    // V wings through body center
    sequence: [3, 0, 1, 2, 4],
  },
  {
    id: 'lyra',
    animal: '🎵',
    animalName: 'Lyra the Harp',
    toast: 'A harp in the sky! 🎵',
    stars: [
      { index: 0, name: 'Vega',    x: 50, y: 18 },
      { index: 1, name: 'Sheliak', x: 30, y: 50 },
      { index: 2, name: 'Sulafat', x: 70, y: 50 },
      { index: 3, name: 'Delta',   x: 35, y: 74 },
      { index: 4, name: 'Zeta',    x: 65, y: 74 },
    ],
    // pentagon from top: head → left → bottom-left → bottom-right → right → back to start omitted
    // single stroke: top → left → bottom-left → bottom-right → right
    sequence: [0, 1, 3, 4, 2],
  },
  {
    id: 'cassiopeia',
    animal: '👑',
    animalName: 'Cassiopeia the Queen',
    toast: 'The queen! 👑',
    stars: [
      { index: 0, name: 'Schedar', x: 18, y: 60 },
      { index: 1, name: 'Caph',    x: 33, y: 28 },
      { index: 2, name: 'Gamma',   x: 50, y: 55 },
      { index: 3, name: 'Ruchbah', x: 67, y: 28 },
      { index: 4, name: 'Segin',   x: 82, y: 60 },
    ],
    // W shape
    sequence: [0, 1, 2, 3, 4],
  },
  {
    id: 'perseus',
    animal: '⚔️',
    animalName: 'Perseus the Hero',
    toast: 'A hero! ⚔️',
    stars: [
      { index: 0, name: 'Zeta',    x: 22, y: 62 },
      { index: 1, name: 'Algol',   x: 33, y: 45 },
      { index: 2, name: 'Mirfak',  x: 50, y: 25 },
      { index: 3, name: 'Epsilon', x: 65, y: 42 },
      { index: 4, name: 'Delta',   x: 74, y: 60 },
    ],
    // zigzag = sword shape
    sequence: [0, 1, 2, 3, 4],
  },
  {
    id: 'andromeda',
    animal: '🌌',
    animalName: 'Andromeda the Galaxy',
    toast: 'A whole galaxy! 🌌',
    stars: [
      { index: 0, name: 'Alpheratz', x: 22, y: 38 },
      { index: 1, name: 'Delta',     x: 35, y: 52 },
      { index: 2, name: 'Mirach',    x: 50, y: 45 },
      { index: 3, name: 'Mu',        x: 65, y: 38 },
      { index: 4, name: 'Almach',    x: 78, y: 55 },
    ],
    // gentle sweeping arc
    sequence: [0, 1, 2, 3, 4],
  },
  {
    id: 'pisces',
    animal: '🐟',
    animalName: 'Pisces the Fish',
    toast: 'Two little fish! 🐟',
    stars: [
      { index: 0, name: 'Eta',       x: 28, y: 28 },
      { index: 1, name: 'Lambda',    x: 42, y: 48 },
      { index: 2, name: 'Al Rischa', x: 50, y: 62 },
      { index: 3, name: 'Gamma',     x: 62, y: 48 },
      { index: 4, name: 'Delta',     x: 74, y: 28 },
    ],
    // V shape = two fish tails joining at knot
    sequence: [0, 1, 2, 3, 4],
  },
  {
    id: 'aries',
    animal: '🐏',
    animalName: 'Aries the Ram',
    toast: 'The brave ram! 🐏',
    stars: [
      { index: 0, name: 'Hamal',    x: 25, y: 48 },
      { index: 1, name: 'Sheratan', x: 44, y: 44 },
      { index: 2, name: 'Mesarthim', x: 56, y: 42 },
      { index: 3, name: 'Bharani',  x: 72, y: 36 },
    ],
    // curved line = ram's horn
    sequence: [0, 1, 2, 3],
  },
  {
    id: 'virgo',
    animal: '🌾',
    animalName: 'Virgo the Maiden',
    toast: 'The harvest maiden! 🌾',
    stars: [
      { index: 0, name: 'Zaniah',       x: 22, y: 35 },
      { index: 1, name: 'Vindemiatrix', x: 40, y: 50 },
      { index: 2, name: 'Eta',          x: 62, y: 38 },
      { index: 3, name: 'Spica',        x: 52, y: 72 },
    ],
    // gentle zigzag arc
    sequence: [0, 1, 2, 3],
  },
  {
    id: 'libra',
    animal: '⚖️',
    animalName: 'Libra the Scales',
    toast: 'The scales of balance! ⚖️',
    stars: [
      { index: 0, name: 'Zubenelgenubi',  x: 25, y: 62 },
      { index: 1, name: 'Beta',           x: 48, y: 48 },
      { index: 2, name: 'Zubeneschamali', x: 72, y: 62 },
      { index: 3, name: 'Sigma',          x: 48, y: 25 },
    ],
    // kite / diamond = scales
    sequence: [0, 1, 2, 3],
  },
  {
    id: 'capricornus',
    animal: '🐐',
    animalName: 'Capricornus the Sea-Goat',
    toast: 'A sea-goat! 🐐',
    stars: [
      { index: 0, name: 'Algedi',       x: 22, y: 32 },
      { index: 1, name: 'Dabih',        x: 35, y: 28 },
      { index: 2, name: 'Nashira',      x: 65, y: 38 },
      { index: 3, name: 'Deneb Algedi', x: 78, y: 45 },
      { index: 4, name: 'Omega',        x: 62, y: 68 },
      { index: 5, name: 'Psi',          x: 38, y: 68 },
    ],
    // wide V = goat horns, then U body
    sequence: [1, 0, 5, 4, 3, 2],
  },
  {
    id: 'aquarius',
    animal: '🏺',
    animalName: 'Aquarius the Water-Bearer',
    toast: 'Water flows! 🏺',
    stars: [
      { index: 0, name: 'Sadalsuud',  x: 35, y: 25 },
      { index: 1, name: 'Sadalmelik', x: 62, y: 32 },
      { index: 2, name: 'Sadachbia',  x: 50, y: 50 },
      { index: 3, name: 'Albali',     x: 30, y: 68 },
      { index: 4, name: 'Eta',        x: 65, y: 72 },
    ],
    // flowing Z curve = water pouring
    sequence: [0, 2, 1, 3, 4],
  },
  {
    id: 'draco',
    animal: '🐉',
    animalName: 'Draco the Dragon',
    toast: 'A dragon! 🐉',
    stars: [
      { index: 0, name: 'Grumium', x: 72, y: 28 },
      { index: 1, name: 'Eltanin', x: 58, y: 20 },
      { index: 2, name: 'Delta',   x: 45, y: 32 },
      { index: 3, name: 'Chi',     x: 32, y: 48 },
      { index: 4, name: 'Phi',     x: 25, y: 64 },
      { index: 5, name: 'Thuban',  x: 50, y: 78 },
    ],
    // sweeping S-curve = dragon tail
    sequence: [0, 1, 2, 3, 4, 5],
  },
  {
    id: 'hercules',
    animal: '💪',
    animalName: 'Hercules the Hero',
    toast: 'The strongest hero! 💪',
    stars: [
      { index: 0, name: 'Ras Algethi', x: 50, y: 22 },
      { index: 1, name: 'Beta',        x: 30, y: 40 },
      { index: 2, name: 'Zeta',        x: 70, y: 40 },
      { index: 3, name: 'Pi',          x: 22, y: 62 },
      { index: 4, name: 'Epsilon',     x: 78, y: 62 },
    ],
    // stickman shape: head → left arm → left leg skip to right: left-leg → left-arm → head → right-arm → right-leg
    sequence: [3, 1, 0, 2, 4],
  },
  {
    id: 'bootes',
    animal: '🪁',
    animalName: 'Boötes the Herdsman',
    toast: 'The herdsman! 🪁',
    stars: [
      { index: 0, name: 'Arcturus', x: 50, y: 75 },
      { index: 1, name: 'Izar',     x: 50, y: 52 },
      { index: 2, name: 'Muphrid',  x: 28, y: 62 },
      { index: 3, name: 'Seginus',  x: 32, y: 28 },
      { index: 4, name: 'Rho',      x: 68, y: 28 },
    ],
    // kite shape: top-left → top-right → bottom-right-body → bottom → left-body
    sequence: [3, 4, 1, 0, 2],
  },
  {
    id: 'corvus',
    animal: '🐦‍⬛',
    animalName: 'Corvus the Crow',
    toast: 'A crow! 🐦‍⬛',
    stars: [
      { index: 0, name: 'Algorab', x: 28, y: 38 },
      { index: 1, name: 'Gienah',  x: 62, y: 28 },
      { index: 2, name: 'Delta',   x: 72, y: 60 },
      { index: 3, name: 'Beta',    x: 38, y: 70 },
    ],
    // quadrilateral = crow body
    sequence: [0, 1, 2, 3],
  },
  {
    id: 'centaurus',
    animal: '🐴',
    animalName: 'Centaurus the Centaur',
    toast: 'Half man, half horse! 🐴',
    stars: [
      { index: 0, name: 'Alpha Cen', x: 68, y: 65 },
      { index: 1, name: 'Beta Cen',  x: 45, y: 65 },
      { index: 2, name: 'Epsilon',   x: 28, y: 50 },
      { index: 3, name: 'Gamma',     x: 48, y: 32 },
      { index: 4, name: 'Eta',       x: 72, y: 28 },
    ],
    // horseshoe / galloping shape
    sequence: [0, 1, 2, 3, 4],
  },
];

export const LEVEL_COUNT = 6;

// Pick 6 random constellations each play-through (Fisher-Yates shuffle).
export function pickLevels() {
  const pool = [...ALL_CONSTELLATIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, LEVEL_COUNT);
}
