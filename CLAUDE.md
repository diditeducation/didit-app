# Did*It — Claude Code Instructions

## Project
Vite + React toddler learning game suite.
Design system lives in src/design-system/.

## Keep ANALYTICS.md current — always
ANALYTICS.md (repo root) is the owner-facing analytics guide
(what's tracked, the database, the dashboard, the verify
steps). Whenever analytics change — a new tracked event or
event field, a new collection, a dashboard section, a
firestore.rules change, or a new /go marketing convention —
update ANALYTICS.md in the SAME change (and bump its "Last
updated" date) alongside AUDIT.md §9.

## Keep AUDIT.md current — always
AUDIT.md (repo root) is the living map: project structure,
component roles, the content "sync map", and dead-code
status. Whenever you add / remove / move / rename a page,
component, route, or game — or change a shared/synced piece
(games.js, trialGames.js, tokens.js, AboutContent, etc.) —
update AUDIT.md in the SAME change: its routes/components
tables, the sync map, and the cleanup status. Treat a change
as incomplete until AUDIT.md reflects it.

## Rules — always follow these
- Import ALL shared components from src/design-system/
  Never recreate Button, ParentStrip, SkillPill,
  SuccessScreen, Confetti, Toast, GameHomeLayout
- Never hardcode hex values — always use tokens.js
- Never build a game home page from scratch —
  always use GameHomeLayout
- Never use external CSS files for components —
  inline styles only, driven by tokens.js

## Per-game theming
Each game folder has theme.js that exports a style
object setting these CSS variables:
  --game-bg, --game-primary, --game-accent,
  --game-warm, --game-shadow
The root div of each game applies this object as
inline style. All shared components inherit it.

## Game structure
Each game lives in src/games/[game-name]/
  theme.js — colour theme
  HomePage.jsx — uses GameHomeLayout
  Game.jsx — game mechanics, no design constraints

## Design rules
- No text instructions visible to toddlers
- No fail states — wrong answers animate and reset
- All tap targets minimum 64px
- Celebrate every correct action
- SuccessScreen for all win/complete states
- Fonts: Nunito (display) Nunito Sans (body)
