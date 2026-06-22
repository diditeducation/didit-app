# Did·It — Project Audit

_Living reference for project structure, component roles, content sync points, and cleanup. Last updated 2026-06-22._

## 1. Big picture

```
src/
├─ App.jsx ............... all routes + auth gating (the routing brain)
├─ main.jsx ............. React entry
├─ firebase.js / analytics.js  ... infra (auth, event tracking)
├─ context/ ............. AuthContext, DemoContext, SubscriptionContext (global state)
├─ data/
│   ├─ games.js ......... ⭐ SINGLE SOURCE for game metadata (12 games)
│   ├─ trialGames.js .... ⭐ SINGLE SOURCE for what's free + canPlay()
│   └─ aboutCopy.js ..... ⭐ SINGLE SOURCE for About hero/story/philosophy text
├─ design-system/ ....... shared UI kit for GAMES + HUB (tokens, components, layouts)
├─ components/ .......... app-level components (hub, modals, banners, logo, GameIllustrations)
├─ pages/ .............. route screens
└─ games/ .............. 12 live game folders
```

One palette, one source: **`design-system/tokens.js`** drives colours everywhere.
- **Games + Hub** consume tokens directly (theme.js + design-system components).
- **Marketing pages** (ConversionLanding, AboutContent) still keep their own local CSS-var *names* (`--coral`, `--didit-*`…) for their `<style>` blocks, but the **values are now interpolated from tokens.js** — so there's no second palette to keep in sync. Change a brand colour in tokens.js and it propagates to games, hub, and marketing.

## 2. Pages & routes

| Page | Route | Status |
|---|---|---|
| ConversionLanding | `/` (logged-out) | ✅ Live — primary landing |
| Hub | `/` (logged-in), `/hub` | ✅ Live — primary hub |
| SignIn | `/signin` | ✅ Live |
| CheckEmail | `/check-email` | ✅ Live (magic link) |
| AuthCallback | `/auth/callback` | ✅ Live |
| Checkout | `/checkout` | ✅ Live |
| DemoGamePage | `/demo/*` | ✅ Live (trial wrapper) |
| GameScreen | `/games/:id` | ✅ Live (generic) |
| AboutPage | `/about` | ✅ Live (linked from game pages + hub) |
| FeedbackAdminPage | `/admin/feedback` | 🔧 Internal (no public link) |

`components/GameIllustrations.jsx` = shared SVG illustration library (not a page). Moved out of `pages/` 2026-06-21.

The legacy marketing/hub flow is fully retired — `ConversionLanding` (`/`) and `Hub` (`/hub`) are the only landing/hub. No `*` catch-all route exists, so unknown URLs render blank (consider adding a redirect to `/` if that ever matters).

### Lost paths / dead ends
- `/home` (MarketingPage) — **retired 2026-06-21**, archived.
- `/hub/classic` (HubPage) — **retired 2026-06-21**, archived.
- `LandingPage.jsx` was a true orphan (removed in cleanup).

## 3. Components

### src/components/
| Component | Role | Used by |
|---|---|---|
| DiditLogo | Brand logo | 11 places |
| FeedbackModal | In-game feedback prompt | every game ⭐ |
| ProtectedRoute | Auth gate | App.jsx |
| BetaBanner | "test mode" bar | App.jsx |
| DevSubscriptionToggle | Dev-only sub toggle | App.jsx |
| AboutContent | About hero/story/philosophy layout (text from `data/aboutCopy.js`) | AboutPage + ConversionLanding |
| GameGrid / TodayCard / SurpriseSheet / ParentGuide / WelcomeModal / AboutModal / HubStoryFooter | Hub building blocks | Hub |
| WishModal | "wish" survey | GameGrid |
| QuickFeedbackModal | quick survey | BetaBanner |

### src/design-system/components/
Live: SuccessScreen, Confetti, Toast, Button, ShareButton, ParentStrip, SkillPill, SiteFooter.
- **SiteFooter** — shared site footer (logo + tagline + copyright). Used by ConversionLanding (`/`), HubStoryFooter (hub, below its share CTA), and AboutPage (`/about`). `hideBeta` prop follows the per-surface beta convention.

## 4. Games
- 12 games in `games.js`, routed in App.jsx, each `games/<name>/{HomePage,Game,theme,audio}.jsx`. Lazy-loaded.
- Inconsistent impl pattern: some games keep a `Game.jsx` wrapper + named impl (`ChefGame.jsx`, `ShopGame.jsx`, `LittlePieGame.jsx`); others implement directly in `Game.jsx`. Worth standardizing (not urgent).

## 5. ⭐ Sync map — "if you edit X, also update Y"

| Edit… | Source of truth | Also duplicated in (update manually) |
|---|---|---|
| About / Our Story / Design Philosophy copy | `data/aboutCopy.js` (`ABOUT_HERO`, `ABOUT_STORY`, `ABOUT_PRINCIPLES`) | clean ✅ — imported by AboutContent (/about + landing), AboutModal (hub sheet), and the ConversionLanding "About us" intro. Edit copy in one place. (AboutModal keeps its OWN subjects-list hero inline, by design.) |
| Game title / color / icon / tagline | `data/games.js` | clean ✅ |
| What's free (trial set) | `data/trialGames.js` | clean ✅ |
| Game illustration SVGs | `components/GameIllustrations.jsx` | clean ✅ (one definition) |
| Illustration **map** (illustrationKey → component) | — no single source | ⚠️ duplicated in `components/GameGrid.jsx` (hub) **and** `pages/ConversionLanding.jsx` (landing) — adding a new game's icon means updating BOTH |
| Brand colors | `design-system/tokens.js` (games, hub, AND marketing) | clean ✅ — ConversionLanding & AboutContent derive their `--*` / `--didit-*` CSS vars from tokens.js (interpolated into the `<style>` block); the lime CTA is `colors.lime` everywhere (SignIn, Checkout, WelcomeModal, SuccessScreen, landing). Remaining hardcoded hex = one-off pastel tints (AboutModal) + rgba shadows, not core palette hues. |
| Logo | `components/DiditLogo.jsx` | clean ✅ |
| Site footer (logo + tagline + copyright) | `design-system/components/SiteFooter.jsx` | clean ✅ — used by ConversionLanding, HubStoryFooter, AboutPage. Beta pill per-surface via `hideBeta`. |
| Beta on/off (logo "BETA" pill **+** the "test mode" top banner) | master switch `SHOW_BETA` in `src/config.js` — flip to false to remove both everywhere | **Per-surface convention (both pill + banner follow it): hidden on public/marketing/sign-up funnel — `/`, `/demo`, `/signin`, `/check-email`, `/auth/callback`, `/checkout`, `/about`; shown inside the product — hub, games, admin.** Pill via `<DiditLogo hideBeta>` per page; banner via the route list in `App.jsx` → `BetaBannerConditional`. Keep the two lists in agreement. |
| Price ($15/mo) | `PRICE` in ConversionLanding | ⚠️ verify Checkout/SignIn don't hardcode separately |

About copy is no longer a sync risk: as of 2026-06-22 the hero, Our Story, and Design Philosophy text are centralized in `data/aboutCopy.js` and imported by all three surfaces (`AboutContent` → /about + landing accordion, `AboutModal` → hub sheet, `ConversionLanding` "About us" intro). The three components still own their distinct layouts/styling; only the strings are shared. `AboutModal` keeps its own subjects-list hero inline. (MarketingPage's old copies are archived, so no longer a drift source.)

## 6. Cleanup status

### Done (pure dead code removed 2026-06-21)
- `pages/LandingPage.jsx`
- `components/GameGate.jsx`, `HubFooter.jsx`, `HubShareCTA.jsx`
- `design-system/components/CelebrationOverlay.jsx`, `GameTile.jsx`, `TrustChips.jsx`, duplicate `FeedbackModal.jsx` (+ removed their index.js exports)
- `games/little-astronomer/LittleAstronomerGame.jsx`

### Done — retired to archive 2026-06-21
- `pages/HubPage.jsx` + `/hub/classic` route → `archive/2026-06-21_retired/HubPage.jsx`
- `pages/MarketingPage.jsx` + `/home` route → `archive/2026-06-21_retired/MarketingPage.jsx`
- `games/little-architect/` → `archive/2026-06-21_retired/little-architect/`
- Moved `pages/GameIllustrations.jsx` → `components/GameIllustrations.jsx` (all imports updated)

Legacy marketing/hub flow fully retired. `archive/2026-06-14_pre-monetization/` (older snapshot) kept as history.

### Housekeeping (not in git — your call)
- `../didit-app-backup-v1-2026-06-10/` (210 MB full backup, outside repo). Do NOT fold into the git-tracked `archive/` (would bloat repo history). Leave outside git or delete.
- Root one-off HTML files (`export-sounds.html`, `little-coder.html`) — delete or move into `archive/` if worth keeping.

> **Archives live in `archive/` (git-tracked, in the private repo).** Reference snapshots only — never imported or bundled (outside `src/`).

## 7. Optimization opportunities
- Main JS chunk ~888 KB (build warns >500 KB). Games are lazy-loaded; `GameIllustrations` (all SVGs) is pulled into the main bundle via the landing carousel + MarketingPage static import. Lazy-load illustrations / split marketing pages to shrink first load.
- ✅ Done (2026-06-22): unified the colour systems — marketing pages (ConversionLanding, AboutContent) now derive their CSS vars from tokens.js, and the lime CTA colour is the new `colors.lime` token. Remaining: optional sweep of one-off pastel tints in AboutModal.
- ✅ Done (2026-06-22): About copy consolidated to `data/aboutCopy.js`, imported by AboutContent, AboutModal, and the ConversionLanding intro.
- De-dupe FeedbackModal to one canonical location.

## 8. Security
- **Firestore rules are the real access control** — `firestore.rules` (version-controlled here). The admin-email check in `FeedbackAdminPage` is only a UI gate, not a boundary. ⚠️ Editing `firestore.rules` does NOT deploy it — publish via Firebase console or `firebase deploy --only firestore:rules`.
- **Admin identity:** `firestore.rules` → `isAdmin()` checks `ADMIN_UIDS`; the page checks `ADMIN_EMAILS`. **Keep both lists pointing at the same people.**
- **Collections:** `feedback` (create-any, read-admin), `events` analytics (create-any, read-admin), `customers/{uid}/**` Stripe (read-own only), `products/prices` (public read), everything else denied.
- **Secrets:** `serviceAccount.json` is gitignored and never imported in `src/` (not bundled) — keep it that way. Firebase web `apiKey`/config in the bundle is public by design (not a secret).
- **Data sensitivity:** feedback/events contain no emails/UIDs by design — low blast radius. Subscription data is per-user and locked to the owner.
- Future hardening: swap the email/UID lists for a Firebase custom claim (`request.auth.token.admin`), used by both the rules and the page.
