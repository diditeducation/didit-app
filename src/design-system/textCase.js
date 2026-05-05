// Did·It text-case rules.
//
// `toTitleCase` is the canonical title-case transform applied to every
// SkillPill label and every game-tag pill. The rule across every game,
// existing and new:
//
//   • Capitalise the first letter of every word.
//   • Preserve already-uppercase letters in the rest of each word, so
//     acronyms like "MECE" survive intact.
//   • Leave non-word characters (emoji, "&", "vs", punctuation) alone.
//
// This is enforced at the render layer (SkillPill + GameHomeLayout tag),
// so per-game data files don't need to manually case their strings.

export function toTitleCase(input) {
  if (typeof input !== 'string') return input;
  return input.replace(/(^|\s|[(\-/])(\p{L})/gu, (_, lead, ch) => lead + ch.toUpperCase());
}
