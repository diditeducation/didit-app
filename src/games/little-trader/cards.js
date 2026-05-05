// Little Trader — card catalogue
//
// Cards are organised into THREE THEMES (Animals, Food, Toys). Each
// playthrough randomly picks one theme; every card surfaced that game
// comes from that theme. Within a theme, cards are split across three
// RARITY TIERS (common / medium / rare) which drive the round-by-round
// difficulty ramp and the visual border treatment.

export const THEMES = ['animals', 'food', 'toys'];

// Per-theme UI colour scheme. The whole stage tints itself to match
// the theme: docket panel bg, "New Card" label, and progress bar.
export const THEME_TINT = {
  animals: { primary: '#3FA985', bg: '#D1F0E4', label: 'Animals' },
  food:    { primary: '#E8780C', bg: '#FBE0CB', label: 'Food'    },
  toys:    { primary: '#2E70C8', bg: '#CFE0F4', label: 'Toys'    },
};

// Tier border on the card itself. Common cards have no special ring;
// medium cards get a teal ring; rare cards get a gold ring + sparkles.
export const TIER_BORDERS = {
  common: null,
  medium: '#5DCAA5',
  rare:   '#EF9F27',
};

export const CARDS = [
  // ── Animals ──────────────────────────────────────────────
  { id: 'cat',      emoji: '🐱', label: 'Cat',      theme: 'animals', tier: 'common', bg: '#FAEEDA', sound: 'pop' },
  { id: 'dog',      emoji: '🐶', label: 'Dog',      theme: 'animals', tier: 'common', bg: '#F1EFE8', sound: 'pop' },
  { id: 'rabbit',   emoji: '🐰', label: 'Rabbit',   theme: 'animals', tier: 'common', bg: '#FBEAF0', sound: 'pop' },
  { id: 'frog',     emoji: '🐸', label: 'Frog',     theme: 'animals', tier: 'common', bg: '#E1F5EE', sound: 'pop' },
  { id: 'monkey',   emoji: '🐵', label: 'Monkey',   theme: 'animals', tier: 'medium', bg: '#FAEEDA', sound: 'monkey' },
  { id: 'panda',    emoji: '🐼', label: 'Panda',    theme: 'animals', tier: 'medium', bg: '#F1EFE8', sound: 'pop' },
  { id: 'octopus',  emoji: '🐙', label: 'Octopus',  theme: 'animals', tier: 'medium', bg: '#FAECE7', sound: 'splash' },
  { id: 'penguin',  emoji: '🐧', label: 'Penguin',  theme: 'animals', tier: 'medium', bg: '#E6F1FB', sound: 'pop' },
  { id: 'lion',     emoji: '🦁', label: 'Lion',     theme: 'animals', tier: 'rare',   bg: '#FAEEDA', sound: 'roar' },
  { id: 'elephant', emoji: '🐘', label: 'Elephant', theme: 'animals', tier: 'rare',   bg: '#F1EFE8', sound: 'trumpet' },
  { id: 'giraffe',  emoji: '🦒', label: 'Giraffe',  theme: 'animals', tier: 'rare',   bg: '#FAEEDA', sound: 'sparkle' },
  { id: 'unicorn',  emoji: '🦄', label: 'Unicorn',  theme: 'animals', tier: 'rare',   bg: '#FBEAF0', sound: 'sparkle' },

  // ── Food ─────────────────────────────────────────────────
  { id: 'apple',      emoji: '🍎', label: 'Apple',      theme: 'food', tier: 'common', bg: '#FCEBEB', sound: 'munch' },
  { id: 'banana',     emoji: '🍌', label: 'Banana',     theme: 'food', tier: 'common', bg: '#FAEEDA', sound: 'munch' },
  { id: 'bread',      emoji: '🍞', label: 'Bread',      theme: 'food', tier: 'common', bg: '#FAECE7', sound: 'munch' },
  { id: 'carrot',     emoji: '🥕', label: 'Carrot',     theme: 'food', tier: 'common', bg: '#FAEEDA', sound: 'munch' },
  { id: 'strawberry', emoji: '🍓', label: 'Strawberry', theme: 'food', tier: 'medium', bg: '#FBEAF0', sound: 'munch' },
  { id: 'pizza',      emoji: '🍕', label: 'Pizza',      theme: 'food', tier: 'medium', bg: '#FCEBEB', sound: 'munch' },
  { id: 'sandwich',   emoji: '🥪', label: 'Sandwich',   theme: 'food', tier: 'medium', bg: '#FAEEDA', sound: 'munch' },
  { id: 'cookie',     emoji: '🍪', label: 'Cookie',     theme: 'food', tier: 'medium', bg: '#FAEEDA', sound: 'munch' },
  { id: 'cake',       emoji: '🎂', label: 'Cake',       theme: 'food', tier: 'rare',   bg: '#FAEEDA', sound: 'sparkle' },
  { id: 'cupcake',    emoji: '🧁', label: 'Cupcake',    theme: 'food', tier: 'rare',   bg: '#FBEAF0', sound: 'sparkle' },
  { id: 'icecream',   emoji: '🍦', label: 'Ice Cream',  theme: 'food', tier: 'rare',   bg: '#FBEAF0', sound: 'sparkle' },
  { id: 'lollipop',   emoji: '🍭', label: 'Lollipop',   theme: 'food', tier: 'rare',   bg: '#FCEBEB', sound: 'sparkle' },

  // ── Toys ─────────────────────────────────────────────────
  { id: 'ball',     emoji: '⚽',  label: 'Ball',     theme: 'toys', tier: 'common', bg: '#E6F1FB', sound: 'pop' },
  { id: 'teddy',    emoji: '🧸', label: 'Teddy',     theme: 'toys', tier: 'common', bg: '#FAEEDA', sound: 'pop' },
  { id: 'blocks',   emoji: '🧱', label: 'Chocolate', theme: 'toys', tier: 'common', bg: '#FCEBEB', sound: 'pop' },
  { id: 'crayon',   emoji: '🖍️', label: 'Crayon',   theme: 'toys', tier: 'common', bg: '#FAEEDA', sound: 'pop' },
  { id: 'drums',    emoji: '🥁', label: 'Drums',     theme: 'toys', tier: 'medium', bg: '#EEEDFE', sound: 'drum' },
  { id: 'guitar',   emoji: '🎸', label: 'Guitar',    theme: 'toys', tier: 'medium', bg: '#EEEDFE', sound: 'guitar' },
  { id: 'scooter',  emoji: '🛴', label: 'Scooter',   theme: 'toys', tier: 'medium', bg: '#FAEEDA', sound: 'zoom' },
  { id: 'train',    emoji: '🚂', label: 'Train',     theme: 'toys', tier: 'medium', bg: '#FAEEDA', sound: 'choochoo' },
  { id: 'racecar',  emoji: '🏎️', label: 'Race Car', theme: 'toys', tier: 'rare',   bg: '#FCEBEB', sound: 'vroom' },
  { id: 'airplane', emoji: '✈️',  label: 'Airplane', theme: 'toys', tier: 'rare',   bg: '#E6F1FB', sound: 'whoosh' },
  { id: 'rocket',   emoji: '🚀', label: 'Rocket',    theme: 'toys', tier: 'rare',   bg: '#FAEEDA', sound: 'sparkle' },
  { id: 'balloon',  emoji: '🎈', label: 'Balloon',   theme: 'toys', tier: 'rare',   bg: '#FCEBEB', sound: 'sparkle' },
];

export const CARDS_BY_ID = Object.fromEntries(CARDS.map(c => [c.id, c]));

// Group: { animals: { common: [...], medium: [...], rare: [...] }, ... }
export const CARDS_BY_THEME_TIER = CARDS.reduce((acc, c) => {
  acc[c.theme] ||= {};
  (acc[c.theme][c.tier] ||= []).push(c);
  return acc;
}, {});

export const DOCKET_CAP = 5;
