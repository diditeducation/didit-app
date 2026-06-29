/**
 * SEO / social-share metadata — single source of truth for per-route
 * <head> tags (title, description, canonical, Open Graph, Twitter card).
 *
 * How it works:
 *   - index.html carries the DEFAULT tags, served before any JS runs. That
 *     is what non-JS crawlers / social link bots read on the homepage.
 *   - <RouteMeta /> (mounted in App.jsx) calls applyMeta() on every route
 *     change, updating the tags client-side. This gives correct browser-tab
 *     titles + helps JS-running crawlers (e.g. Google) per route.
 *
 * NOTE: client-side updates are NOT seen by non-JS social scrapers on routes
 * other than `/` — that needs build-time pre-rendering (a later, larger step).
 * The homepage (the most-shared page) is fully covered by index.html.
 */

import { GAMES } from './data/games';

export const SITE = {
  name: 'Did·It',
  url: 'https://didit.games',
  // 1200×630 social share image (public/og-image.jpg).
  image: 'https://didit.games/og-image.jpg',
  defaultTitle: 'Did·It — Real-world learning games for curious kids aged 2–5',
  defaultDescription:
    'Real-world learning games for curious kids aged 2–5 — finance, engineering, music and more, explored through play. No ads, ever. Made by two parents.',
};

// Static, public-facing routes. Game/demo routes are derived dynamically below.
const ROUTE_META = {
  '/': {
    title: SITE.defaultTitle,
    description: SITE.defaultDescription,
  },
  '/about': {
    title: 'About Did·It — Why we built it',
    description:
      "We're Nigel and Danne, parents from Sydney building ad-free games that open kids up to bigger real-world ideas. Here's the story behind Did·It.",
  },
  '/signin': {
    title: 'Sign in — Did·It',
    description: 'Sign in to Did·It to play real-world learning games with your child.',
  },
  '/checkout': {
    title: 'Unlock the full games library — Did·It',
    description: 'Unlock every Did·It game for your family — real-world learning through play, with no ads. One-time founding price.',
  },
  '/terms': {
    title: 'Terms of Use — Did·It',
    description: 'The terms for using Did·It and the one-time Founding Membership Pass.',
  },
  '/privacy': {
    title: 'Privacy Policy — Did·It',
    description: 'How Did·It handles your information.',
  },
  // Private / transactional surfaces — keep out of search results.
  '/check-email': { title: 'Check your email — Did·It', noindex: true },
  '/auth/callback': { title: 'Signing you in… — Did·It', noindex: true },
  '/hub': { title: 'Your games — Did·It', noindex: true },
  '/admin/feedback': { title: 'Feedback admin — Did·It', noindex: true },
};

function gameForSlug(slug) {
  return GAMES.find((g) => g.id === slug || g.id === `little-${slug}`);
}

/** Resolve the metadata object for a given pathname. */
export function metaForPath(pathname) {
  if (ROUTE_META[pathname]) return ROUTE_META[pathname];

  // Public demo games: /demo/<id>
  if (pathname.startsWith('/demo/')) {
    const game = gameForSlug(pathname.replace('/demo/', ''));
    if (game) {
      return {
        title: `Try ${game.title} free — Did·It`,
        description: game.hook || game.desc || SITE.defaultDescription,
      };
    }
  }

  // Auth-gated game pages: /games/<id>[/play] — not crawlable, but give a
  // correct browser-tab title anyway.
  if (pathname.startsWith('/games/')) {
    const slug = pathname.replace('/games/', '').replace(/\/play$/, '');
    const game = gameForSlug(slug);
    if (game) {
      return {
        title: `${game.title} — Did·It`,
        description: game.hook || game.desc || SITE.defaultDescription,
        noindex: true,
      };
    }
  }

  // Fallback: site defaults.
  return { title: SITE.defaultTitle, description: SITE.defaultDescription };
}

// ── DOM helpers ──────────────────────────────────────────────────────────
function upsertMeta(attr, key, content) {
  if (content == null) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Apply a metadata object (from metaForPath) to the document <head>. */
export function applyMeta(pathname) {
  const meta = metaForPath(pathname);
  const title = meta.title || SITE.defaultTitle;
  const description = meta.description || SITE.defaultDescription;
  const url = `${SITE.url}${pathname === '/' ? '/' : pathname}`;
  const robots = meta.noindex ? 'noindex, nofollow' : 'index, follow';

  document.title = title;
  upsertMeta('name', 'description', description);
  upsertMeta('name', 'robots', robots);
  upsertLink('canonical', url);

  // Open Graph
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:site_name', SITE.name);
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:url', url);
  upsertMeta('property', 'og:image', SITE.image);

  // Twitter / X
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', description);
  upsertMeta('name', 'twitter:image', SITE.image);
}
