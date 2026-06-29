# Did·It Analytics — Owner's Guide

_Plain-English guide to your data: what's collected, where it lives, how to read
it, and how to verify it. For the developer-level taxonomy, see **AUDIT.md §9**.
Keep this file current whenever analytics change (see "Keeping this current")._

_Last updated: 2026-06-29._

---

## The big picture

```
People use your site
        │  (your site writes a row automatically, every action)
        ▼
   Firestore  ←── your database, inside YOUR Firebase account
   (collections: events, users, feedback)
        │  (read by)
        ▼
 /admin/analytics  ──►  live charts  +  Download CSV/JSON (raw data)
```

- **Firestore** = the filing cabinet. Real, permanent, owned by you (in Firebase).
- **The dashboard** (`/admin/analytics`) = the pre-made charts.
- **The export buttons** = the raw rows, for your own analysis in Excel/Sheets.

Data is captured **from now on only** — it can't see activity from before the
tracking existed.

---

## What's in the database (3 collections)

| Collection | One row = | Filled by |
|---|---|---|
| **`events`** | a single action (page view, click, game open, purchase) | automatically, as people use the site |
| **`users`** | a signed-in person + their lifecycle | on sign-in and on payment |
| **`feedback`** | a survey / bug / wish submission | the in-game feedback form |

> A collection only appears in the Firestore console **after it has at least one
> document.** `users` stays invisible until the first sign-in *after the rules
> are published* — that's normal, not a bug.

### `events` — the full field shape

Every current event carries these. The three **bold** ones are the important
additions; if a row is missing them it's an **old/legacy row** (pre-tracking) —
those are written from `env: "local"` and filtered out of the dashboard by the
"Prod only" default.

| Field | Example | Meaning |
|---|---|---|
| `event` | `game_open` | what happened |
| `gameId` / `page` / `buttonId` / `via` / `category` / `method` / `level` … | `little-engineer` | event-specific detail |
| **`tier`** | `anon` / `free` / `paid` | their paying state **at that moment** |
| **`anonId`** | `a7f3…` | per-browser ID — stitches one person's journey across the login boundary |
| **`src`** | `instagram` / `direct` | first-touch marketing source |
| `userId` / `userEmail` | `null` when logged-out | who, once signed in |
| `env` | `prod` / `local` | environment (dashboard defaults to prod) |
| `date` / `timestamp` | `2026-06-27` | when |

**Minimum needed for the dashboard:** `event`, `tier`, `anonId`, `src`,
`timestamp` (plus `via` on purchases).

### `users` — the lifecycle row

| Field | Meaning |
|---|---|
| `email`, `displayName`, `uid` | who |
| `anonId` | links them back to their pre-signup anonymous events |
| `firstTouchSrc` | where they first came from |
| `createdAt` | ≈ when they became a **free** user (stamped once) |
| `lastSeenAt`, `lastSignInMethod` | recency + google/email |
| `convertedAt` / `paidVia` / `paid` | when/how they became **paying** |
| `marketingOptIn` / `marketingOptInAt` | opted in to marketing emails (set from the optional, unticked opt-in checkbox on sign-in) + when consent was given |

> `users` is **analytics only, never entitlement.** A user can write their own
> row, so `paid`/`convertedAt` are self-reportable. The real paywall truth is
> `customers/{uid}/payments` (written by Stripe via the Admin SDK). See AUDIT §8.

---

## The six questions this answers

1. **Which marketing source sent them?** → `src` on every event. Give each
   channel its own link: `yoursite.com/go/instagram`, `/go/facebook`,
   `/go/newsletter` — all render the identical landing, each tags its source.
   (`?utm_source=...` also works.)
2. **At what point / flow did they pay?** → `via` on `purchase_success`
   (`landing` / `demo_success` / `hub_grid` / `game_locked`).
3. **Were they paying or free at any interaction?** → `tier` on every event.
4. **User history — first free vs converted?** → `users` collection
   (`createdAt` vs `convertedAt`).
5. **Full log of all clicks/games?** → the `events` collection.
6. **Broad funnel landing → conversion → play?** → the dashboard funnel.

---

## The dashboard — `/admin/analytics`

- A page **inside your own site**. Add `/admin/analytics` to your live URL.
- **You must be signed in as the admin account** (`did.it.education@gmail.com`);
  anyone else sees "Not authorised."
- Updates itself live. Reads the most-recent **5000** events (`EVENTS_LIMIT`).
- **Time-frame toggle:** **Day** (24h) / **Week** (7d) / **Month** (30d) / **All**.
  Filters every section — funnels, user counts, recent events, and exports — to
  events (and `users` createdAt/convertedAt) inside that window. Defaults to Week.
- **"From" date picker:** pick a start date to consider only events on/after it
  (local start of day). It **overrides** the Day/Week/Month toggle while set;
  clicking a toggle button (or the ✕) clears it. Applies to every section + exports.
- **Env filter** defaults to **Prod only** (hides localhost/dev noise).
- **"Exclude admin/test"** toggle (on by default) removes your own and the test
  account's activity — and not just their signed-in rows: it drops their *whole
  session* (matched by the `anonId` tied to their account), so pre-login
  browsing by internal accounts doesn't skew the numbers either. The internal
  list lives in `AnalyticsAdminPage.jsx` (`INTERNAL_EMAILS` / `INTERNAL_UIDS`) —
  keep it in sync with the admin UID in `firestore.rules` and
  `TEST_MEMBER_EMAILS` in `SubscriptionContext`.
- **Three sections:**
  - **1 · Users** — Active users (logged in **and** played a game), New sign-ups
    (`users.createdAt` in window), New paying users (`users.convertedAt` in window),
    Successful payments (count of `purchase_success` events in window — a
    cross-check on "new paying users", which is derived from the `users` table).
  - **2 · Funnel & Interaction** — two funnels, each bar = share of its universe:
    - **Funnel A — Landing visitors** (universe = anyone who viewed the landing;
      keyed by `anonId` so it follows them through sign-in): Visited landing
      (+ top sources) → Played a demo / Other landing interactions (top 5) →
      Signed in → Reached checkout (+ split by `via`) → Purchased.
    - **Funnel B — Logged-in hub visitors** (universe = signed-in users who
      opened the hub; keyed by `userId`): Visited hub → Paying players (+ by
      game) → Free players (+ by game) → Free users reached checkout (+ by
      `via`) → Purchased.
  - **3 · Others** — recent raw events (latest 100 in window).
- **Download buttons:** Events CSV · Events JSON · Users CSV — exports the
  currently-filtered set (time-frame + env + exclude-internal all apply).

---

## One-time setup — publish the security rules

The `users` table stays empty until the Firestore rules are published (editing
the repo file does NOT deploy it).

1. **console.firebase.google.com** → your Did·It project.
2. **Build → Firestore Database → Rules** tab.
3. Select all, delete, paste the full contents of **`firestore.rules`**.
4. Click **Publish**.

The rule that matters for analytics is the `users/{uid}` block (admin reads all;
each user writes only their own). `events` is already admin-readable, so the
funnel/sources work the moment you're signed in as admin.

---

## How to verify it's working (with your own eyes)

1. Open your **live** site (not localhost) in a private/incognito window.
2. Click around — view the landing, tap a game — then sign in.
3. In Firebase → **Firestore → Data**, open **`events`**.
4. **Sort by newest:** click the **`timestamp`** column header / use the sort
   control and choose descending, so the latest row is on top.
5. The newest row should show **`tier`, `anonId`, `src`** (and `env: "prod"`).
   If it does, the full pipe works: site → database → dashboard.
6. Check **`users`** — your account should now be a row there too.

If the dashboard says "Not authorised" while signed in as admin, the cause is
almost always the admin **UID** in `firestore.rules` (`isAdmin()`) not matching
the signed-in account. The comment next to it is cosmetic; the UID is what's
enforced.

---

## Reading the dashboard correctly

- **The "funnel" is milestones, NOT a strict drop-off.** Each bar is that
  milestone's share of **unique visitors**. The steps are *not* nested subsets:
  demo plays are anonymous and happen *before* sign-in, so "Played a game" can
  (and does) exceed "Signed in". Don't read it as a clean top-to-bottom
  conversion rate — read each bar as "X% of visitors did this".
- **Bot filtering is active, in two layers:**
  1. **Capture-time** (`analytics.js` `isBot()`): events from known crawler /
     preview / automation user-agents and `navigator.webdriver` are **not
     written** at all — keeps the database clean going forward. Only catches
     JS-running bots (non-JS crawlers never fire analytics anyway).
  2. **Dashboard-time:** the headline **"Visitors" = *engaged* visitors** —
     `anonId`s that fired at least one *interaction* (click / play / sign-in /
     checkout), not just a passive `page_view`. A bot or drive-by that only
     loads a page doesn't count. The card's hint shows the raw total
     (`N incl. passive/bots`) for comparison, and the funnel is a share of
     engaged visitors.
- **Still, treat absolute counts as approximate** — a determined headless
  scraper with a real browser UA that also clicks could slip through. Trends
  over time remain more reliable than any single absolute number.
- **"Signed in" counts distinct accounts (`userId`)** in both the summary card
  and the funnel, so they agree.

## Limits worth knowing

- **`anonId` is per-browser.** A phone-then-laptop journey only reunites after
  sign-in (join on `userId`). Cleared storage / private mode starts a fresh id.
- **Legacy `local` rows** lack `tier/anonId/src` — filtered out by "Prod only".
- **5000-event cap** on the dashboard/export — raise `EVENTS_LIMIT` or add
  date-range paging when volume grows.
- **Not real-time-perfect for tier on cold loads:** the very first events after
  a deep-link load may inherit the prior tier until payment state resolves
  (sub-second; doesn't affect aggregates).

---

## Keeping this current

This file is the owner-facing companion to the technical taxonomy in
**AUDIT.md §9**. Whenever analytics change — a new tracked event or field, a new
collection, a dashboard section, a rules change, or a new `/go` convention —
**update both this file and AUDIT.md §9 in the same change**, and bump the
"Last updated" date above.
