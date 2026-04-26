// Little Trader — card catalogue
//
// 25 cards across 5 tiers. The tier controls draw weight (see deckLogic.js)
// and visual treatment (see TIER_BORDERS + Card.jsx). Background colours are
// kept light/pastel so the central emoji reads cleanly at every size.

export const CARDS = [
  // Foods — common, no special border
  { id: 'apple',      emoji: '🍎', label: 'apple',      tier: 'food',     bg: '#FCEBEB', sound: 'munch' },
  { id: 'banana',     emoji: '🍌', label: 'banana',     tier: 'food',     bg: '#FAEEDA', sound: 'munch' },
  { id: 'bread',      emoji: '🍞', label: 'bread',      tier: 'food',     bg: '#FAECE7', sound: 'munch' },
  { id: 'strawberry', emoji: '🍓', label: 'strawberry', tier: 'food',     bg: '#FBEAF0', sound: 'munch' },
  { id: 'carrot',     emoji: '🥕', label: 'carrot',     tier: 'food',     bg: '#FAEEDA', sound: 'munch' },

  // Animals — teal border, iconic sound on tap
  { id: 'lion',     emoji: '🦁', label: 'lion',     tier: 'animal',   bg: '#FAEEDA', sound: 'roar' },
  { id: 'elephant', emoji: '🐘', label: 'elephant', tier: 'animal',   bg: '#F1EFE8', sound: 'trumpet' },
  { id: 'monkey',   emoji: '🐵', label: 'monkey',   tier: 'animal',   bg: '#FAEEDA', sound: 'monkey' },
  { id: 'croc',     emoji: '🐊', label: 'croc',     tier: 'animal',   bg: '#E1F5EE', sound: 'snap' },
  { id: 'giraffe',  emoji: '🦒', label: 'giraffe',  tier: 'animal',   bg: '#FAEEDA', sound: 'pop' },
  { id: 'octopus',  emoji: '🐙', label: 'octopus',  tier: 'animal',   bg: '#FAECE7', sound: 'splash' },

  // Vehicles — blue border, motion sound on tap
  { id: 'racecar',  emoji: '🏎️', label: 'race car', tier: 'vehicle',  bg: '#FCEBEB', sound: 'vroom' },
  { id: 'airplane', emoji: '✈️',  label: 'airplane', tier: 'vehicle',  bg: '#E6F1FB', sound: 'whoosh' },
  { id: 'boat',     emoji: '⛵',  label: 'boat',     tier: 'vehicle',  bg: '#E1F5EE', sound: 'horn' },
  { id: 'scooter',  emoji: '🛴',  label: 'scooter',  tier: 'vehicle',  bg: '#FAEEDA', sound: 'zoom' },
  { id: 'train',    emoji: '🚂',  label: 'train',    tier: 'vehicle',  bg: '#FAEEDA', sound: 'choochoo' },

  // Music — purple border, instrument note on tap
  { id: 'drums',   emoji: '🥁', label: 'drums',   tier: 'music',    bg: '#EEEDFE', sound: 'drum' },
  { id: 'guitar',  emoji: '🎸', label: 'guitar',  tier: 'music',    bg: '#EEEDFE', sound: 'guitar' },
  { id: 'trumpet', emoji: '🎺', label: 'trumpet', tier: 'music',    bg: '#EEEDFE', sound: 'trumpetnote' },

  // Treasures — gold border + sparkles, fanfare sound
  { id: 'cake',     emoji: '🎂', label: 'cake',      tier: 'treasure', bg: '#FAEEDA', sound: 'sparkle' },
  { id: 'cupcake',  emoji: '🧁', label: 'cupcake',   tier: 'treasure', bg: '#FBEAF0', sound: 'sparkle' },
  { id: 'icecream', emoji: '🍦', label: 'ice cream', tier: 'treasure', bg: '#FBEAF0', sound: 'sparkle' },
  { id: 'lollipop', emoji: '🍭', label: 'lollipop',  tier: 'treasure', bg: '#FCEBEB', sound: 'sparkle' },
  { id: 'balloon',  emoji: '🎈', label: 'balloon',   tier: 'treasure', bg: '#FCEBEB', sound: 'sparkle' },
  { id: 'rocket',   emoji: '🚀', label: 'rocket',    tier: 'treasure', bg: '#FAEEDA', sound: 'sparkle' },
];

// Tier border colours. `null` means no special border (food).
// The hex values come straight from the design spec; they don't map cleanly
// to existing tokens but they're tier-semantic — kept as is.
export const TIER_BORDERS = {
  food:     null,
  animal:   '#5DCAA5',
  vehicle:  '#378ADD',
  music:    '#7F77DD',
  treasure: '#EF9F27',
};

export const CARDS_BY_ID = Object.fromEntries(CARDS.map(c => [c.id, c]));
export const CARDS_BY_TIER = CARDS.reduce((acc, c) => {
  (acc[c.tier] ||= []).push(c);
  return acc;
}, {});

export const DOCKET_CAP = 5;
