// Little Trader — round generation
//
// Each playthrough picks ONE theme (Animals, Food, or Toys). All cards
// surfaced that game come from the chosen theme. Within the theme, cards
// are bucketed by RARITY (common / medium / rare); the round-by-round
// weights ramp difficulty so the kid sees rarer cards toward the end and
// always closes on a guaranteed rare card. Cards never repeat within a
// playthrough (starters included).

import { CARDS_BY_THEME_TIER, THEMES } from './cards';

export const ROUNDS = 8;

function shuffle(array) {
  const out = [...array];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Pick a random theme for this playthrough. */
export function pickTheme() {
  return THEMES[Math.floor(Math.random() * THEMES.length)];
}

/**
 * Three random commons from the chosen theme — gentle onboarding.
 */
export function getStarterCards(theme) {
  const pool = CARDS_BY_THEME_TIER[theme]?.common || [];
  return shuffle(pool).slice(0, 3);
}

// Rarity weights per round (8 rounds). Ramps from "mostly common" to
// "guaranteed rare" so the player feels growing excitement.
const ROUND_WEIGHTS = [
  { common: 3, medium: 1, rare: 0 }, // 1
  { common: 2, medium: 2, rare: 0 }, // 2
  { common: 2, medium: 2, rare: 1 }, // 3
  { common: 1, medium: 2, rare: 1 }, // 4
  { common: 1, medium: 2, rare: 2 }, // 5
  { common: 0, medium: 2, rare: 2 }, // 6
  { common: 0, medium: 1, rare: 3 }, // 7
  { common: 0, medium: 0, rare: 1 }, // 8 — guaranteed rare for the peak
];

function pickWeightedTier(weights, availableTiersSet) {
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
 * Draw the new card for the given round (0-indexed) within `theme`.
 * Excludes any id already in `alreadyDrawn` (Set<string>) so cards never
 * repeat in a playthrough.
 */
export function getRoundCard(roundIndex, theme, alreadyDrawn) {
  const weights = ROUND_WEIGHTS[roundIndex] || ROUND_WEIGHTS[ROUND_WEIGHTS.length - 1];
  const themePools = CARDS_BY_THEME_TIER[theme] || {};

  const remainingByTier = {};
  for (const [tier, list] of Object.entries(themePools)) {
    const left = list.filter(c => !alreadyDrawn.has(c.id));
    if (left.length) remainingByTier[tier] = left;
  }

  const availableTiers = new Set(Object.keys(remainingByTier));
  let tier = pickWeightedTier(weights, availableTiers);

  // Fallback: if every preferred tier is exhausted, pick from any tier
  // that still has cards — round still gets a card.
  if (!tier) {
    const allKeys = [...availableTiers];
    if (!allKeys.length) return null;
    tier = allKeys[Math.floor(Math.random() * allKeys.length)];
  }

  const pool = remainingByTier[tier];
  return pool[Math.floor(Math.random() * pool.length)];
}
