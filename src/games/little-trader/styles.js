// Little Trader — shared sizing tokens
//
// Every card uses the same render dimensions so the new top card and the
// docket cards read as the same object. The three keys remain only for
// component clarity (Card.jsx still accepts a `size` prop), but they all
// resolve to the same numbers.

const DOCKET_CARD = { w: 96,  h: 122, emoji: 50, label: 12, radius: 12, padding: 8 };
// New card is ~50% bigger than the docket cards — clearly the focal point
// of the round.
const NEW_CARD    = { w: 144, h: 184, emoji: 76, label: 14, radius: 14, padding: 10 };

export const CARD_SIZES = {
  intro:  DOCKET_CARD,
  new:    NEW_CARD,
  docket: DOCKET_CARD,
};

export const DOCKET_HEIGHT = 148;

// Single shared font face for emoji, so the new card and the docket card
// don't accidentally render in two different fonts on Android.
export const EMOJI_FONT_STACK =
  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
