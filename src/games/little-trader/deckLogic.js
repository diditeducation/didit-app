// Little Trader — round generation
//
// Six rounds with weighted tier draws. Treasures escalate through the game
// and round 6 is always a treasure for a peak ending. No card repeats within
// a single playthrough.

import { CARDS, CARDS_BY_TIER } from './cards';

export const ROUNDS = 6;

function shuffle(array) {
  const out = [...array];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Three random food cards form the starter docket. Foods only — gentle
 * onboarding that lets the kid feel ownership before any real choices.
 */
export function getStarterCards() {
  return shuffle(CARDS_BY_TIER.food).slice(0, 3);
}

// Tier weights per round. Rounds get more exciting as we go;
// round 6 forces a treasure.
const ROUND_WEIGHTS = [
  { food: 3, animal: 2, vehicle: 1, music: 0, treasure: 0 }, // round 1
  { food: 2, animal: 2, vehicle: 2, music: 1, treasure: 0 }, // round 2
  { food: 1, animal: 2, vehicle: 2, music: 1, treasure: 1 }, // round 3
  { food: 1, animal: 1, vehicle: 2, music: 1, treasure: 2 }, // round 4
  { food: 0, animal: 1, vehicle: 1, music: 1, treasure: 3 }, // round 5
  { food: 0, animal: 0, vehicle: 0, music: 0, treasure: 1 }, // round 6 — guaranteed treasure
];

function pickWeightedTier(weights, availableTiersSet) {
  // Filter out tiers that have no remaining cards.
  const usable = Object.entries(weights).filter(
    ([tier, w]) => w > 0 && availableTiersSet.has(tier),
  );
  if (usable.length === 0) return null;
  const total = usable.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [tier, w] of usable) {
    roll -= w;
    if (roll <= 0) return tier;
  }
  return usable[usable.length - 1][0];
}

/**
 * Pick the new card for the given round (0-indexed).
 * Excludes any id already in `alreadyDrawn` (Set<string>) and any id
 * currently in the docket so a "swap" doesn't surface a duplicate.
 */
export function getRoundCard(roundIndex, alreadyDrawn) {
  const weights = ROUND_WEIGHTS[roundIndex] || ROUND_WEIGHTS[ROUND_WEIGHTS.length - 1];

  // Available cards per tier, after excluding what's already been seen.
  const remainingByTier = {};
  for (const [tier, list] of Object.entries(CARDS_BY_TIER)) {
    const left = list.filter(c => !alreadyDrawn.has(c.id));
    if (left.length) remainingByTier[tier] = left;
  }

  const availableTiers = new Set(Object.keys(remainingByTier));
  let tier = pickWeightedTier(weights, availableTiers);

  // Fallback: if the weighted set is exhausted (all preferred tiers empty),
  // pick from any remaining tier so the round still gets a card.
  if (!tier) {
    const allKeys = [...availableTiers];
    if (!allKeys.length) return null;
    tier = allKeys[Math.floor(Math.random() * allKeys.length)];
  }

  const pool = remainingByTier[tier];
  return pool[Math.floor(Math.random() * pool.length)];
}
