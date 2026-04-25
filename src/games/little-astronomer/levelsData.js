// Adapts constellation data into the format used by Game.jsx and ConstellationCanvas.
// Each playthrough picks 1 random constellation from each of the 6 level groups.

import { LEVELS, ALL_CONSTELLATIONS, CANVAS_DIMS } from './constellations';

export const LEVEL_COUNT = LEVELS.length;

// Emoji assigned per constellation for the completion reveal
const EMOJI_MAP = {
  'southern-cross': '✨',
  'triangulum':     '🔺',
  'aries':          '🐏',
  'cassiopeia':     '👑',
  'corvus':         '🐦‍⬛',
  'sagitta':        '🏹',
  'cancer':         '🦀',
  'delphinus':      '🐬',
  'equuleus':       '🐴',
  'libra':          '⚖️',
  'corona-borealis':'👑',
  'little-dipper':  '⭐',
  'big-dipper':     '🐻',
  'orion':          '🏹',
};

/**
 * Build the tap sequence from constellation data.
 * If connectOrder is defined, use it. Otherwise default to 0→1→2→…
 * If close is true and no connectOrder, append index 0 at the end.
 * If extras is defined, append those indices at the end.
 */
function buildSequence(constellation) {
  let seq;
  if (constellation.connectOrder) {
    seq = [...constellation.connectOrder];
  } else {
    seq = constellation.stars.map((_, i) => i);
    if (constellation.close) seq.push(0);
  }
  if (constellation.extras) {
    seq.push(...constellation.extras);
  }
  return seq;
}

/**
 * Convert a raw constellation object into the game format expected by
 * ConstellationCanvas and Game.
 *
 * Stars get x/y as percentages of the 390×700 canvas dimensions,
 * then normalised so every constellation fills the same padded area.
 */
function adaptConstellation(c) {
  const rawStars = c.stars.map((s, i) => ({
    index: i,
    name: s.name,
    x: (s.x / CANVAS_DIMS.w) * 100,
    y: (s.y / CANVAS_DIMS.h) * 100,
    size: s.size || 'md',
    color: s.color || '#ffffff',
  }));

  // Normalize so every constellation fills a consistent padded region.
  // Uniform 12% padding on all sides — pill is now outside the canvas.
  const PAD_X  = 12;
  const PAD_YT = 12;
  const PAD_YB = 12;

  const xs = rawStars.map(s => s.x);
  const ys = rawStars.map(s => s.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const availW = 100 - 2 * PAD_X;
  const availH = 100 - PAD_YT - PAD_YB;

  // Keep constellation's aspect ratio — fit inside the available box
  const scale = Math.min(availW / rangeX, availH / rangeY);
  const scaledW = rangeX * scale;
  const scaledH = rangeY * scale;

  // Centre horizontally; centre vertically within the top region
  const offsetX = (100 - scaledW) / 2;
  const offsetY = PAD_YT + (availH - scaledH) / 2;

  const stars = rawStars.map(s => ({
    ...s,
    x: offsetX + (s.x - minX) * scale,
    y: offsetY + (s.y - minY) * scale,
  }));

  return {
    id: c.id,
    animal: EMOJI_MAP[c.id] || '⭐',
    animalName: c.name,
    toast: c.funFact,
    stars,
    sequence: buildSequence(c),
  };
}

/**
 * Pick one random constellation from each difficulty bucket so every
 * playthrough has 5 levels that ramp up smoothly.
 */
export function pickLevels() {
  return LEVELS.map(group => {
    const pool = group.constellations;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return adaptConstellation(pick);
  });
}
