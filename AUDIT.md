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
| DemoGamePage | `/demo/*` (6 trial games) | ✅ Live (trial wrapper). Provides `DemoContext` with `onAdvance` → on completing a trial game, auto-jumps to a random other trial game. Same auto-advance powers the landing tablet sampler. |
| GameScreen | `/games/:id` | ✅ Live (generic) |
| AboutPage | `/about` | ✅ Live (linked from game pages + hub) |
| MarketingLanding | `/go/:source` | ✅ Live — identical to `/` but tags first-touch `src` from the path (e.g. `/go/instagram`). One page, per-channel links. |
| FeedbackAdminPage | `/admin/feedback` | 🔧 Internal (no public link) |
| AnalyticsAdminPage | `/admin/analytics` | 🔧 Internal (no public link) — funnel, sources, conversions, plays-by-tier, user table, raw events + CSV/JSON export. |

`components/GameIllustrations.jsx` = shared SVG illustration library (not a page). Moved out of `pages/` 2026-06-21.

**SEO / social-share metadata (added 2026-06-24):** `index.html` carries default title + description + Open Graph + Twitter tags **served before JS** — this is what fixes the homepage's social share previews for non-JS bots (WhatsApp/iMessage/Facebook/Google). Per-route tags live in `src/seo.js` (`ROUTE_META` + dynamic game/demo handling) and are applied client-side by `components/RouteMeta.jsx` on each navigation — this updates browser-tab titles and helps JS-running crawlers (Google), and marks private surfaces (`/hub`, `/check-email`, `/auth/callback`, `/checkout`-adjacent, `/admin`) `noindex`. ⚠️ **Known limitation:** non-JS social scrapers only see the static `index.html` tags, so per-route previews for `/about`, `/games/*` etc. are NOT yet correct for those bots — that needs build-time pre-rendering (deferred). ✅ **Share image:** `public/og-image.jpg` (1200×630, 70 KB) — wired into `SITE.image` in `src/seo.js` + the `og:image`/`twitter:image` tags in `index.html` (2026-06-24). To change it, update both files. ✅ **`public/robots.txt` + `public/sitemap.xml`** (added 2026-06-24): robots allows crawl, disallows private surfaces (`/hub`, `/checkout`, `/check-email`, `/auth/`, `/admin/`), points to the sitemap. Sitemap lists the 8 public URLs (`/`, `/about`, 6 `/demo/*`). ⚠️ **Keep the sitemap's `/demo/*` list in sync with `TRIAL_GAME_IDS`** when trial games change.

**Monetization — one-time Family Pass (pivoted from subscription 2026-06-25):** Did·It sells a **one-time "Founding Family Pass"** — `$29` founding price (`PRICE` in config.js), lifetime access to the games library, **no subscription, nothing to cancel.** All conversion copy is centralized in config.js — `PRICE_HEADLINE` ("Everything in our library, yours to play"), `PRICE_CTA` ("Unlock the full games library"), `PRICE_NOTE` ("Be a founding member… Early supporters get perks as we grow") — so every funnel surface (landing CTA, tablet unlock, demo SuccessScreen, /checkout) reads identically. ⚠️ **Deliberately signals a *growing* library WITHOUT promising specific future games are free/included** — "founding member · perks as we grow" rewards early buyers without over-committing. Don't reintroduce "future games included"–style copy. Set `PRICE_NOTE=''` + bump `PRICE` to end founding pricing. `/checkout` → "Get the Family Pass" calls `startCheckout(uid)` in `src/stripe.js`, using the **firestore-stripe-payments Firebase extension** with **`mode: 'payment'`**: write `customers/{uid}/checkout_sessions` → extension fills in `url` → redirect to Stripe's hosted page. After a successful payment the extension writes `customers/{uid}/payments/{id}` (status `succeeded`), which `SubscriptionContext` listens to → `isMember` flips true **permanently**. `allow_promotion_codes: true` → Stripe-native promo codes work (100%-off coupon = paywall bypass). **Gated by `STRIPE_ENABLED`** = `!!VITE_STRIPE_PRICE_ID` (config.js): while unset, the flow is inert and Checkout falls back to dev-simulate (localhost) / "coming soon". **To go live:** (1) install the extension, (2) create a **one-time** ($29) product+price in Stripe, (3) set `VITE_STRIPE_PRICE_ID` in Vercel, (4) Firestore rules: let a user CREATE `customers/{uid}/checkout_sessions` (read-own currently — see §8). **No manage/cancel UI by design** — a one-time purchase has nothing to cancel: Stripe emails the receipt, refunds are issued manually from the Stripe Dashboard, and "lost access" = just sign in with the purchase email. (The pivot **removed** the subscription customer-portal flow, `openCustomerPortal`, the hub "Manage subscription" item, the public footer "Manage subscription" link, and the `VITE_STRIPE_PORTAL_LOGIN_URL` / `VITE_STRIPE_FUNCTIONS_REGION` env vars.) **Paywall enforcement (OFF by default):** gated by `PAYWALL_ENFORCED` = `VITE_PAYWALL_ENFORCED === 'true'`. When ON, non-members are held to the 6 free trial games (`canPlay`/`TRIAL_GAME_IDS`) and locked games route to `/checkout`; enforced at `components/GameRoute.jsx` (route guard) + `GameGrid` (lock badge → checkout). Members & dev/test accounts always pass (`isMember`). ⚠️ **Only flip `VITE_PAYWALL_ENFORCED=true` AFTER Stripe is live** (`STRIPE_ENABLED`), else users lock with no way to pay. While OFF (now), every signed-in user plays all 12.

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
| Price | One-time Family Pass price (`$29`) from `config.js` — `<Price />` → "$29", `<Price suffix />` → "$29 one-time" (`PRICE`/`PRICE_MODEL`) | ConversionLanding, Checkout |
| FeedbackModalBase | Shared modal shell — overlay, open/confirm animations (single injected keyframe set), `CloseX`, `SuccessCard`, `SubmitButton`, `submitFeedback()` helper + `FONT`/`SPRING` consts | FeedbackModal, QuickFeedbackModal, WishModal |
| FeedbackModal | In-game feedback prompt (vibe + likes + wish); thin wrapper over FeedbackModalBase | every game ⭐ |
| ProtectedRoute | Auth gate (signed-in?) — used by `/hub` | App.jsx |
| GameRoute | Auth gate **+ Family Pass paywall** for `/games/*`. Derives gameId from the URL; when `PAYWALL_ENFORCED`, non-members on a non-trial game → `/checkout?from=<id>`. Off-flag = behaves like ProtectedRoute. | App.jsx (all game routes) |
| BetaBanner | "test mode" bar | App.jsx |
| RouteMeta | Syncs `<head>` (title/description/canonical/OG/Twitter) to the current route on navigation; renders nothing. Reads `src/seo.js` | App.jsx (inside `<BrowserRouter>`) |
| DevSubscriptionToggle | Dev-only sub toggle | App.jsx |
| AboutContent | About hero/story/philosophy layout (text from `data/aboutCopy.js`) | AboutPage + ConversionLanding |
| GameGrid / TodayCard / SurpriseSheet / ParentGuide / WelcomeModal / AboutModal / HubStoryFooter | Hub building blocks | Hub |
| WishModal | "wish" / game-request survey; wrapper over FeedbackModalBase | GameGrid |
| QuickFeedbackModal | quick bug-report survey; wrapper over FeedbackModalBase | BetaBanner |

**Feedback modal family:** `FeedbackModal` (full vibe survey), `QuickFeedbackModal` (bug report) and `WishModal` (game request) are three distinct surfaces that all share `FeedbackModalBase` for their shell/animation/submit and all `addDoc` into the **same Firestore `feedback` collection**, tagged by `kind` (`fix-request` / `wish`) + `source` so `/admin/feedback` can tell them apart. Edit shell/animation/submit once in `FeedbackModalBase`; edit each modal's own header/fields/copy in its file.

### src/design-system/components/
Live: SuccessScreen, Confetti, Toast, Button, ShareButton, ParentStrip, SkillPill, SiteFooter, LevelPips.
- **SiteFooter** — shared site footer (logo + tagline + copyright). Used by ConversionLanding (`/`), HubStoryFooter (hub, below its share CTA), and AboutPage (`/about`). `hideBeta` prop follows the per-surface beta convention.
- **LevelPips** — ⭐ the shared level-progress marker (pip row, theme-coloured via `--game-primary`/`--game-accent`) passed to `GameShell`'s `topSlot`. **Every multi-level game with a passive progress marker uses this** — Coder, Chemist, Chef, Analyst, Matisse — so new games should `import LevelPips` and pass `<LevelPips current={activeLevel} total={N} />` rather than re-rolling dots. Coder/Chemist/Chef are capped at **4 levels** for the trial (Analyst/Matisse keep their full 6); Chef lifts recipe progress out of `ChefBoard` via an `onProgress` callback. **Two marker systems exist:** (1) `LevelPips` = passive pip progress; (2) `GameShell`'s built-in `levels`/`activeLevel`/`unlockedUpTo` = interactive *labeled, clickable* level tabs (Little DJ, Pianist; Engineer passes `levels={[]}`). Single-level demos (Shopper, Astronaut, Consultant, Trader) have no marker.

## 4. Games
- 12 games in `games.js`, routed in App.jsx, each `games/<name>/{HomePage,Game,theme,audio}.jsx`. Lazy-loaded.
- **Naming convention:** a game's `id` / folder / route slug **and its `illustrationKey`** are always the bare `<name>` matching its display title (id `little-<name>`, illustrationKey `<name>`). Aligned 2026-06-22: ids `little-pie`→`little-analyst`, `little-astronomer`→`little-astronaut`; illustrationKeys `mixer`→`dj`, `dj`→`pianist`, `pie`→`analyst`, `astronomer`→`astronaut` (keys had drifted from old game names). The `GAME_ILLUSTRATIONS` map keys in `GameIllustrations.jsx` must stay in sync with these. (The one residual: the SVG component for Little Astronaut is still named `AstronomerIllustration` — internal function name, not a key; left as-is since the art depicts a night sky.)
- **Impl pattern (standardized 2026-06-22):** every game's entry is `Game.jsx` — the container that wires up `GameShell`, `SuccessScreen`, `Confetti`, `Toast`, `FeedbackModal`, and analytics. Simple games implement mechanics inline in `Game.jsx`; games with a large play surface extract it into `Board.jsx` (component `<Name>Board`, e.g. `ChefBoard`, `ShopBoard`, `PieBoard`). `Board.jsx` may also export game data (e.g. `little-analyst/Board.jsx` exports `LEVEL_DEFS`). Other per-game helpers keep descriptive names (`Canvas.jsx`, `Tray.jsx`, `GridLevel.jsx`, `Waveform.jsx`, etc.).

## 5. ⭐ Sync map — "if you edit X, also update Y"

| Edit… | Source of truth | Also duplicated in (update manually) |
|---|---|---|
| About / Our Story / Design Philosophy copy | `data/aboutCopy.js` (`ABOUT_HERO`, `ABOUT_STORY`, `ABOUT_PRINCIPLES`) | clean ✅ — imported by AboutContent (/about + landing), AboutModal (hub sheet), and the ConversionLanding "About us" intro. Edit copy in one place. (AboutModal keeps its OWN subjects-list hero inline, by design.) |
| Game title / color / icon / tagline | `data/games.js` | clean ✅ |
| What's free (trial set) | `data/trialGames.js` → `TRIAL_GAME_IDS` (6 games: shopper, engineer, dj, coder, chemist, chef) | ⚠️ 3-way mirror — adding/removing a trial game means updating ALL: (1) `TRIAL_GAME_IDS`, (2) `DEMO_GAMES` lazy-import map in `pages/ConversionLanding.jsx`, (3) the `/demo/<id>` routes in `App.jsx`. The carousel's free/locked badge derives from `TRIAL_GAME_IDS` automatically. |
| Game illustration SVGs | `components/GameIllustrations.jsx` | clean ✅ (one definition) |
| Illustration **map** (illustrationKey → component) | `components/GameIllustrations.jsx` → `export const GAME_ILLUSTRATIONS` | clean ✅ — imported by GameGrid (hub), ConversionLanding (landing), TodayCard, SuccessScreen. Adding a new game's icon = one edit. |
| Brand colors | `design-system/tokens.js` (games, hub, AND marketing) | clean ✅ — ConversionLanding & AboutContent derive their `--*` / `--didit-*` CSS vars from tokens.js (interpolated into the `<style>` block); the lime CTA is `colors.lime` everywhere (SignIn, Checkout, WelcomeModal, SuccessScreen, landing). Remaining hardcoded hex = one-off pastel tints (AboutModal) + rgba shadows, not core palette hues. |
| Logo | `components/DiditLogo.jsx` | clean ✅ |
| Per-route SEO / OG meta | `src/seo.js` (`SITE` + `ROUTE_META`); applied by `components/RouteMeta.jsx` | ⚠️ the **homepage defaults are duplicated in `index.html`** (must be static for non-JS bots) — if you change the site title/description/og:image, update BOTH `index.html` and `SITE`/`ROUTE_META['/']` in `src/seo.js`. |
| Feedback modal shell / animation / submit | `components/FeedbackModalBase.jsx` | clean ✅ — shared by FeedbackModal, QuickFeedbackModal, WishModal (all write to the `feedback` collection). Edit the shell here once; only headers/fields/copy live in each modal. |
| Site footer (logo + tagline + copyright) | `design-system/components/SiteFooter.jsx` | clean ✅ — used by ConversionLanding, HubStoryFooter, AboutPage. Beta pill per-surface via `hideBeta`. |
| Beta on/off (logo "BETA" pill **+** the "test mode" top banner) | master switch `SHOW_BETA` in `src/config.js` — flip to false to remove both everywhere | **Per-surface convention (both pill + banner follow it): hidden on public/marketing/sign-up funnel — `/`, `/demo`, `/signin`, `/check-email`, `/auth/callback`, `/checkout`, `/about`; shown inside the product — hub, games, admin.** Pill via `<DiditLogo hideBeta>` per page; banner via the route list in `App.jsx` → `BetaBannerConditional`. Keep the two lists in agreement. |
| Price + all conversion copy (one-time $29) | `PRICE` / `PRICE_MODEL` / `PRICE_HEADLINE` / `PRICE_CTA` / `PRICE_NOTE` in `src/config.js` | clean ✅ — render the amount via `<Price>` (`<Price />` → "$29", `<Price suffix />` → "$29 one-time"); headline/button/founding-note strings are shared by ConversionLanding (main CTA + tablet), Checkout, and the demo SuccessScreen. Edit copy once here. Never hardcode "$29" or the CTA text. Don't promise future games (see §2 monetization). |

About copy is no longer a sync risk: as of 2026-06-22 the hero, Our Story, and Design Philosophy text are centralized in `data/aboutCopy.js` and imported by all three surfaces (`AboutContent` → /about + landing accordion, `AboutModal` → hub sheet, `ConversionLanding` "About us" intro). The three components still own their distinct layouts/styling; only the strings are shared. `AboutModal` keeps its own subjects-list hero inline. (MarketingPage's old copies are archived, so no longer a drift source.)

## 6. Cleanup status

### Done (pure dead code removed 2026-06-21)
- `pages/LandingPage.jsx`
- `components/GameGate.jsx`, `HubFooter.jsx`, `HubShareCTA.jsx`
- `design-system/components/CelebrationOverlay.jsx`, `GameTile.jsx`, `TrustChips.jsx`, duplicate `FeedbackModal.jsx` (+ removed their index.js exports)
- `games/little-astronaut/LittleAstronomerGame.jsx` (folder was `little-astronomer` at the time; renamed 2026-06-22)

### Done — retired to archive 2026-06-21
- `pages/HubPage.jsx` + `/hub/classic` route → `archive/2026-06-21_retired/HubPage.jsx`
- `pages/MarketingPage.jsx` + `/home` route → `archive/2026-06-21_retired/MarketingPage.jsx`
- `games/little-architect/` → `archive/2026-06-21_retired/little-architect/`
- Moved `pages/GameIllustrations.jsx` → `components/GameIllustrations.jsx` (all imports updated)

Legacy marketing/hub flow fully retired. `archive/2026-06-14_pre-monetization/` (older snapshot) kept as history.

### Housekeeping
- ✅ Resolved (verified 2026-06-22): the `../didit-app-backup-v1-2026-06-10/` 210 MB backup and the root one-off HTML files (`export-sounds.html`, `little-coder.html`) are no longer on disk anywhere under the project root. Nothing to do.

> **Archives live in `archive/` (git-tracked, in the private repo).** Reference snapshots only — never imported or bundled (outside `src/`).

## 7. Optimization opportunities
- ✅ Done (2026-06-22): split the bundle via `manualChunks` in `vite.config.js` — `firebase` (~105 KB gz) and `react` (~17 KB gz) are now separate cached vendor chunks, app code is the `index` chunk (~123 KB gz). The >500 KB build warning is resolved and vendor code is cached across deploys + fetched in parallel. Total first-load bytes (~244 KB gz) are unchanged — that's expected; the win is caching + parallelism.
- Won't do (low ROI): lazy-loading `GameIllustrations` SVGs. The `/` landing carousel renders several game illustrations above the fold, so they're first-paint-critical — deferring them adds Suspense complexity for little gain.
- ✅ Done (2026-06-22): unified the colour systems — marketing pages (ConversionLanding, AboutContent) now derive their CSS vars from tokens.js, and the lime CTA colour is the new `colors.lime` token. (One-off pastel tints in AboutModal left as-is: cosmetic only, not worth a sweep.)
- ✅ Done (2026-06-22): About copy consolidated to `data/aboutCopy.js`, imported by AboutContent, AboutModal, and the ConversionLanding intro.
- ✅ Already done (2026-06-21): FeedbackModal de-dup. Only `FeedbackModalBase.jsx` (shared shell) + `FeedbackModal.jsx` (in-game wrapper) remain — these are the intended split, not duplicates. The old duplicate was removed (see §6).
- ✅ Done (2026-06-24): shrank oversized **served** images (~39 MB saved). `public/favicon.png` 4200² 27 MB → 256² 54 KB; `public/logo.png` 4200×1800 6 MB → 1200×514 408 KB (renders at ~28–51px, doubles as og:image stopgap); the 3 About-page decorations (`element-wave/diamond/exclamation`) 3508×2481 → 320px wide (~6.5 MB → 59 KB). Originals recoverable from git history; paths unchanged.
- Known clutter, intentionally left (2026-06-24, no user impact — these files are **never served**, so zero page-load cost; repo-size only): ~63 MB of orphaned PNGs — 4 unused element variants (`public/elements/element-{blue,teal,red,lime}.png`) referenced nowhere, and 4 design-reference renders in `public/game illustrations/` (Bank/Bulb/Music/Pizza, the source the SVGs follow; see `ILLUSTRATIONS.md`). Remove from `public/` if repo size ever matters.

## 8. Security
- **Firestore rules are the real access control** — `firestore.rules` (version-controlled here). The admin-email check in `FeedbackAdminPage` is only a UI gate, not a boundary. ⚠️ Editing `firestore.rules` does NOT deploy it — publish via Firebase console or `firebase deploy --only firestore:rules`.
- **Admin identity:** `firestore.rules` → `isAdmin()` checks `ADMIN_UIDS`; the page checks `ADMIN_EMAILS`. **Keep both lists pointing at the same people.**
- **Collections:** `feedback` (create-any, read-admin), `events` analytics (create-any, read-admin), `users/{uid}` profiles (create/update-own, read-own+admin, delete-admin), `customers/{uid}/**` Stripe (read-own only), `products/prices` (public read), everything else denied.
- **`users/{uid}` is analytics, NOT entitlement:** a user can write their own profile (incl. `convertedAt`/`paid`), so those fields are self-reportable and must never gate access. Real paywall truth = `customers/{uid}/payments` (Admin-SDK written, read-own). The dashboard treats `users` as lifecycle reporting only.
- **Secrets:** `serviceAccount.json` is gitignored and never imported in `src/` (not bundled) — keep it that way. Firebase web `apiKey`/config in the bundle is public by design (not a secret).
- **Data sensitivity:** `feedback` is anonymous (no emails/UIDs). `events` DO carry `userId` + `userEmail` + `anonId` (behaviour tied to identity) → reads are locked to admin, which matters more here. Subscription data is per-user and locked to the owner.
- Future hardening: swap the email/UID lists for a Firebase custom claim (`request.auth.token.admin`), used by both the rules and the page.

## 9. Analytics
- **Single module:** `src/analytics.js` → flat Firestore `events` collection. One `track*()` per event; never throws (fire-and-forget). **Read via the `/admin/analytics` dashboard** (`AnalyticsAdminPage`) — funnel, marketing sources, conversions by `via`, plays by tier, top clicks, user lifecycle table, recent raw events, and CSV/JSON export. Env filter defaults to `prod` (excludes local/dev noise). Reads the most-recent `EVENTS_LIMIT` (5000) events live.
- **Marketing source (`src`):** captured first-touch and kept. Three ways in, first wins: `?utm_source=` → external referrer host → `/go/:source` path (`MarketingLanding` calls `captureMarketingSource` during render) → else `direct`. So "which channel sent them" = group anything by `src`. Per-channel campaign links: give each channel a different `/go/<name>` (or `?utm_source=<name>`); they render the identical landing.
- **User database (`users/{uid}`):** per-account lifecycle doc, separate from the event log. Written by `upsertUserProfile`/`recordSignIn` on sign-in (`SignIn`/`AuthCallback`) and `markConverted` on first confirmed payment (`SubscriptionContext`). Fields: `email`, `displayName`, `anonId`, `firstTouchSrc`, `createdAt` (≈ when they became a free user, stamped once), `lastSeenAt`, `lastSignInMethod`, and `convertedAt`/`paidVia`/`paid` once they buy. Answers "#4 — when each user was first free vs converted to paying" directly, no event scan. (Self-reportable → analytics only, see §8.)
- **Every event carries:** `event`, event-specific payload, `userId`/`userEmail` (null when logged-out), **`tier`** (`anon`/`free`/`paid` **at the moment the event fired** — kept in sync by `SubscriptionContext.setAnalyticsTier`, uses real `hasPaid` so dev/test overrides don't show as `paid`; lets you split *any* event by free vs paying users, e.g. "game plays while free" vs "game plays as a payer"), **`anonId`** (stable per-browser id — stitches a logged-out visit to the same person after sign-in), **`src`** (first-touch source: `utm_source` / referrer host / `direct`), `env` (`local`/`staging`/`prod`), `date`, `timestamp`.
- **"When did they pay" vs "is a paid user":** the *moment* of payment is the timestamped `purchase_success` event (fired once/account, one-time Family Pass — no churn); the *status* is the `hasPaid` state in `SubscriptionContext`. Paid-at-signup vs paid-later = compare `purchase_success.timestamp` to that account's `signin_success.timestamp`. Free-play vs paid-play = group `game_open` by `tier`.
- **Conversion placement (`via`) — which flow drove the sale:** `checkout_view` / `checkout_start` / **`purchase_success`** all carry `via` = where checkout was entered: `landing` (landing CTA), `demo_success` (demo SuccessScreen unlock), `hub_grid` (in-hub locked-game tap), `game_locked` (locked-game route guard), or `direct`. Set via a `?via=` query param at each entry point; `trackCheckoutView` persists it to `localStorage['didit:checkout-via']` so it survives the Stripe redirect and still tags `purchase_success` (which fires later from `SubscriptionContext`). This is distinct from `src` (first-touch *acquisition* channel): `src` = how they first found Did·It, `via` = which surface converted them.
- **Conversion funnel (landing → paying)** — the ordered events: `page_view{page:'landing'}` → `landing_click{demo_play_*}` → `unlock_click`/`success_click{demo_unlock}` → `signin_view` → `signin_method_click{method}` → (`magic_link_sent`) → `signin_success{method,isNewUser}` → `session_start{isReturn}` (hub) → `checkout_view` → `checkout_start` → `purchase_success`. `purchase_success` fires once/account from `SubscriptionContext` the first time a `succeeded` payment is seen (one-time Family Pass — permanent, no cancel/churn event); `checkout_*` from `Checkout.jsx`; `signin_*` from `SignIn`/`AuthCallback`.
- **Engagement / "what they play & click":** `game_open` / `level_complete` / `game_complete` (per game), `game_home_view`, `share_click`, `filter_select`, `wish_submit`, and `landing_click{buttonId}` (catch-all for click *intents* on landing AND hub — filter by `buttonId`).
- **`landing_click{buttonId}` taxonomy** — *Landing:* `nav_login`, `demo_play_<id>` (sample a free game inline), `grid_<id>` (select a locked game card), `demo_autoadvance`, `unlock_main` / `tablet_unlock_<id>` (checkout CTAs), `footer_about`. *Hub:* `about-icon`, `filter` via `filter_select{category}`, `wish-card` (→ `wish_submit`), `surprise-card`, `today_play_<id>` (Today/featured card play), `locked_<id>` (locked-game tap → checkout), `sign_out`. Carousel arrows/swipe aren't tracked as gestures but each lands on a card → fires the `demo_play_*`/`grid_*` select, so browsing is captured.
- **Journey stitching — yes, fully supported.** Every event carries **`anonId`** (stable per-browser id, present even when logged-out) + **`userId`** (once signed in) + a server **`timestamp`** + `date`. Reconstruct one person's flow = filter by `anonId`, order by `timestamp`. The anon→identified handoff: the same `anonId` persists across `signin_success`, so pre-login landing/demo events and post-login hub/purchase events share one `anonId` (and gain `userId`). Limits: `anonId` is per-browser (cross-device only reunites once they sign in — join on `userId`); cleared storage / private mode starts a fresh `anonId`.
- **Known gaps (Phase 2+, not yet built):** concept-card flips untracked; game-start `placement` (today/grid/surprise) not on `game_open` itself — inferable from the preceding `landing_click` in the same `anonId` sequence; no `locked_game_tap` distinct event (covered by `locked_<id>`); no time-on-task. The `/admin/analytics` dashboard caps at the most-recent 5000 events (`EVENTS_LIMIT`) — raise it or add date-range paging when volume grows. *(Fixed: TodayCard no longer double-fires `game_open` as `"<id>-featured"` — now a clean `landing_click{today_play_<id>}` intent, with the real `game_open{<id>}` still firing on game mount.)*
