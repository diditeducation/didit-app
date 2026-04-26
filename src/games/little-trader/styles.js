// Little Trader — shared sizing tokens
// Card render dimensions for the three contexts the same Card.jsx renders in.

export const CARD_SIZES = {
  intro:  { w: 96,  h: 124, emoji: 44, label: 11, radius: 12, padding: 8 },
  new:    { w: 180, h: 220, emoji: 110, label: 15, radius: 14, padding: 10 },
  docket: { w: 88,  h: 110, emoji: 44, label: 11, radius: 12, padding: 8 },
};

export const DOCKET_HEIGHT = 148;

// Single shared font face for emoji, so the new card and the docket card
// don't accidentally render in two different fonts on Android.
export const EMOJI_FONT_STACK =
  '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
