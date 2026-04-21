// Adapts constellation data into the format used by Game.jsx and ConstellationCanvas.
// Each playthrough picks 1 random constellation from each of the 6 level groups.

import { LEVELS, CANVAS_DIMS } from './constellations';

export const LEVEL_COUNT = 6;

// Emoji assigned per constellation for the completion reveal
const EMOJI_MAP = {
  'southern-cross': '✨',
  'triangulum':     '🔺',
  'aries':          '🐏',
  'cassiopeia':     '👑',
  'corvus':         '🐦‍⬛',
  'sagitta':        '🏹',
  'delphinus':      '🐬',
  'lyra':           '🎵',
  'equuleus':       '🐴',
  'corona-borealis':'👑',
  'aquila':         '🦅',
  'crater':         '🏆',
  'little-dipper':  '⭐',
  'gemini':         '👯',
  'perseus':        '🦸',
  'big-dipper':     '🐻',
  'orion':          '🏹',
  'scorpius':       '🦂',
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
 * Stars get x/y as percentages of the 390×700 canvas dimensions.
 */
function adaptConstellation(c) {
  return {
    id: c.id,
    animal: EMOJI_MAP[c.id] || '⭐',
    animalName: c.name,
    toast: c.funFact,
    stars: c.stars.map((s, i) => ({
      index: i,
      name: s.name,
      x: (s.x / CANVAS_DIMS.w) * 100,
      y: (s.y / CANVAS_DIMS.h) * 100,
      size: s.size || 'md',
      color: s.color || '#ffffff',
    })),
    sequence: buildSequence(c),
  };
}

/**
 * Pick 6 constellations — one random pick from each level group.
 * Returns adapted game-format objects.
 */
export function pickLevels() {
  return LEVELS.map(levelGroup => {
    const pool = levelGroup.constellations;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return adaptConstellation(pick);
  });
}
