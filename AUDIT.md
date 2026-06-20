# Did·It — Project Audit

_Living reference for project structure, component roles, content sync points, and cleanup. Last updated 2026-06-21._

## 1. Big picture

```
src/
├─ App.jsx ............... all routes + auth gating (the routing brain)
├─ main.jsx ............. React entry
├─ firebase.js / analytics.js  ... infra (auth, event tracking)
├─ context/ ............. AuthContext, DemoContext, SubscriptionContext (global state)
├─ data/
│   ├─ games.js ......... ⭐ SINGLE SOURCE for game metadata (12 games)
│   └─ trialGames.js .... ⭐ SINGLE SOURCE for what's free + canPlay()
├─ design-system/ ....... shared UI kit for GAMES + HUB (tokens, components, layouts)
├─ components/ .......... app-level components (hub, modals, banners, logo)
├─ pages/ .............. route screens (+ GameIllustrations, a misfiled shared util)
└─ games/ .............. 12 live game folders
```

Two visual worlds:
- **Games + Hub** → `design-system/tokens.js` + design-system components.
- **Marketing pages** (ConversionLanding, MarketingPage, AboutContent) → each defines its own inline CSS vars (`--didit-*`, `--coral`…), NOT from tokens.js. This split is the main source of "keep in sync" effort.

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
| MarketingPage | `/home` | 🟡 Legacy (superseded by ConversionLanding) |
| HubPage | `/hub/classic` | 🟡 Legacy (superseded by Hub) |
| GameIllustrations | — | ⚠️ Misfiled — shared SVG library, not a page |

### Lost paths / dead ends
- `/home` reachable by URL, but its only inbound link was `HubFooter` (dead code) → effectively unlinked.
- `/hub/classic` has no inbound links — URL-only.
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
| AboutContent | ⭐ Shared About hero/story/philosophy | AboutPage + ConversionLanding |
| GameGrid / TodayCard / SurpriseSheet / ParentGuide / WelcomeModal / AboutModal / HubStoryFooter | Hub building blocks | Hub |
| WishModal | "wish" survey | GameGrid |
| QuickFeedbackModal | quick survey | BetaBanner |

### src/design-system/components/
Live: SuccessScreen, Confetti, Toast, Button, ShareButton, ParentStrip, SkillPill.

## 4. Games
- 12 games in `games.js`, routed in App.jsx, each `games/<name>/{HomePage,Game,theme,audio}.jsx`. Lazy-loaded.
- Inconsistent impl pattern: some games keep a `Game.jsx` wrapper + named impl (`ChefGame.jsx`, `ShopGame.jsx`, `LittlePieGame.jsx`); others implement directly in `Game.jsx`. Worth standardizing (not urgent).

## 5. ⭐ Sync map — "if you edit X, also update Y"

| Edit… | Source of truth | Also duplicated in (update manually) |
|---|---|---|
| About / Our Story / Design Philosophy copy | `components/AboutContent.jsx` (→ /about + landing expandable) | ⚠️ ConversionLanding "About us" intro paragraph repeats hero text; **MarketingPage (/home) has its OWN independent copies** |
| Game title / color / icon / tagline | `data/games.js` | clean ✅ |
| What's free (trial set) | `data/trialGames.js` | clean ✅ |
| Game illustrations (SVGs) | `pages/GameIllustrations.jsx` | clean ✅ (misfiled location) |
| Brand colors | `design-system/tokens.js` (games + hub) | ⚠️ Marketing pages define their own `--didit-*` / `--coral` vars inline |
| Logo | `components/DiditLogo.jsx` | clean ✅ |
| Price ($15/mo) | `PRICE` in ConversionLanding | ⚠️ verify Checkout/SignIn don't hardcode separately |

Biggest content-sync risk: About/Story/Philosophy text lives in **three** places (AboutContent, ConversionLanding intro line, MarketingPage). `/home` silently drifts when the other two are edited.

## 6. Cleanup status

### Done (pure dead code removed 2026-06-21)
- `pages/LandingPage.jsx`
- `components/GameGate.jsx`, `HubFooter.jsx`, `HubShareCTA.jsx`
- `design-system/components/CelebrationOverlay.jsx`, `GameTile.jsx`, `TrustChips.jsx`, duplicate `FeedbackModal.jsx` (+ removed their index.js exports)
- `games/little-astronomer/LittleAstronomerGame.jsx`

### Pending decision (retire when truly done with the legacy flow)
- `pages/MarketingPage.jsx` + `/home` route
- `pages/HubPage.jsx` + `/hub/classic` route
- `games/little-architect/` (only referenced by legacy HubPage)
- `archive/2026-06-14_pre-monetization/`

### Housekeeping
- Move `pages/GameIllustrations.jsx` → `design-system/` or `components/` (shared library, not a page)
- `../didit-app-backup-v1-2026-06-10/` (210 MB, not in git) + root one-off HTML files — delete to declutter

## 7. Optimization opportunities
- Main JS chunk ~888 KB (build warns >500 KB). Games are lazy-loaded; `GameIllustrations` (all SVGs) is pulled into the main bundle via the landing carousel + MarketingPage static import. Lazy-load illustrations / split marketing pages to shrink first load.
- Unify the two color systems (feed marketing pages from tokens.js).
- Consolidate About content to one source (have MarketingPage import AboutContent, or retire /home).
- De-dupe FeedbackModal to one canonical location.
