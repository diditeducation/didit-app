// The 3 games anyone can play without paying — the "trial" set.
// These are the same games already exposed publicly at /demo/*.
// Trial users AND lapsed (cancelled) members fall back to exactly this set.
//
// This is the SINGLE source of truth for what's free. The landing page,
// the hub locks, and the route gate all read from here so they can never
// disagree about what a user is allowed to play.
export const TRIAL_GAME_IDS = [
  'little-shopper',
  'little-engineer',
  'little-dj',
];

// The one rule every screen uses.
//   - active members can play everything
//   - everyone else can only play the 3 trial games
export function canPlay(gameId, isMember) {
  if (isMember) return true;
  return TRIAL_GAME_IDS.includes(gameId);
}
