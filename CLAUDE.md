# Did*It — Claude Code Instructions

## Project
Vite + React toddler learning game suite.
Design system lives in src/design-system/.

## Rules — always follow these
- Import ALL shared components from src/design-system/
  Never recreate Button, ParentStrip, TrustChips,
  SkillPill, GameTile, CelebrationOverlay,
  GameHomeLayout
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
- CelebrationOverlay for all win/complete states
- Fonts: Nunito (display) Nunito Sans (body)
