# Did·It — Toddler Learning Games

## Project map / audit
See **[AUDIT.md](AUDIT.md)** for the living map of the project: structure,
component roles, the content "sync map" (what to update together), dead-code
status, and optimisation opportunities. **Keep AUDIT.md up to date with every
structural change or optimisation** (this is also enforced in `CLAUDE.md`).

## Game Card Illustrations

Every game card in the hub requires a custom SVG illustration.
All illustrations **must follow `public/game illustrations/ILLUSTRATIONS.md`** exactly.

Key rules (non-negotiable):
- Derive objects from the **game mechanic** — not the theme name (Section 0)
- Flat solid fills only — no opacity, no gradients, no `rgba()`
- Only palette hex values from Section 2
- Chunky, bold silhouettes with rounded corners everywhere
- Objects overlap slightly and are large (fill 50–60% of canvas)
- Exactly **two** 4-point rounded sparkles in `#F5C842` per illustration
- `viewBox="0 0 680 500"` for full-card illustrations (hub icons use 500×500 square variant)

To add an illustration for a new game:
1. Read the game's mechanic description
2. Follow the prompt template in `ILLUSTRATIONS.md` Section 11
3. Add the component to `src/components/GameIllustrations.jsx`
4. Register it once in the `GAME_ILLUSTRATIONS` map at the bottom of `src/components/GameIllustrations.jsx` (single source — the hub, landing, today card, and success screen all import it)
5. Run the QA checklist from `ILLUSTRATIONS.md` Section 12

---

# React + Vite (original)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
