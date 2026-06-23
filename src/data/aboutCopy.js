/**
 * About Did·It copy — single source of truth for the text shared across the
 * About surfaces. Presentation lives in each consumer; only the words live here.
 *
 * Consumers:
 *   components/AboutContent.jsx  → /about page + landing "Our story" accordion
 *   components/AboutModal.jsx    → hub About sheet (keeps its OWN distinct hero)
 *   pages/ConversionLanding.jsx  → "About us" intro <h2> (uses ABOUT_HERO)
 *
 * Edit copy here once — do NOT re-type these strings in the components.
 * (AboutModal's subjects-list hero is intentionally modal-only and stays inline.)
 */

// Mission statement. Hero on /about + the landing "About us" intro paragraph.
export const ABOUT_HERO =
  "We're Nigel and Danne, parents from Sydney, Australia. We believe the world our kids are growing into will keep changing, so we don't want to stop at the basics. We want to open them up to more ideas. We believe their attention isn't for sale, so no ads, ever. And that the best learning happens side by side — not by simply handing them the screen.";

// "Our Story" / "How it started".
export const ABOUT_STORY = {
  intro: [
    "We're Nigel and Danne, parents from Sydney, Australia who have a wonderfully energetic and curious toddler. 🧡",
    "Teaching our child is one of our favourite things to do together. But when we went looking for games to play with him, we kept running into the same two problems.",
  ],
  problems: [
    "Most kids' games are loud, busy, and designed to keep little eyes glued to the screen.",
    "The educational ones, while great for letters and numbers — rarely go beyond the basics. We were looking for something that could start introducing them to real world bigger ideas.",
  ],
  close: [
    "So we built some games. The more we played, the more we realised how capable kids really are. Their minds can stretch so much further than we give them credit for.",
    "We hope your family gets to discover that too as you play along!",
  ],
};

// "Our Design Philosophy" principles. `title` is two lines: AboutContent breaks
// between them (<br/>), AboutModal joins them with a space.
export const ABOUT_PRINCIPLES = [
  {
    n: '01',
    title: ['Play Together.', "That's the Magic."],
    body: 'The games are a tool in your parenting toolkit, for you and your child to explore together. Your encouragement and coaching makes the learning moment more magical.',
  },
  {
    n: '02',
    title: ['Big Concepts.', 'Made Simple.'],
    body: 'The ideas may be big, but the games are simple. Designed for tiny fingers, they are intuitive and tactile, without being overwhelming.',
  },
  {
    n: '03',
    title: ['No Clutter.', 'No Surprises.'],
    body: 'A clean, safe, distraction-free space. Designed for your child to explore and for you to feel at ease. Zero ads, ever.',
  },
];
