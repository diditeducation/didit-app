# ILLUSTRATIONS.md
## Did·It — Game Card Illustration Style Guide

> This document is the source of truth for all Did·It game card illustrations.
> Any renderer (human, Claude, Claude Code) must follow these rules exactly to maintain visual consistency.

---

## 0. Mechanic-First Rule — Read This First

Before choosing any objects to illustrate, you must read and understand the game's core mechanic. The illustration must feature the 2–3 objects that are most central to how the game is actually played — not generic objects associated with the theme.

**The process:**
1. Read the game mechanic description
2. Identify the key objects the child physically interacts with in the game
3. Illustrate those objects — nothing else

**Example:**
> Little Analyst: "A pie chart appears with pieces missing. Drag the right slice to complete it — discovering how parts fit into a whole and form 100%."

The correct objects to illustrate are: **pie chart + missing slice**. Not a magnifying glass, not a bar chart, not a calculator.

**Wrong approach:** Pick objects that feel thematically related (magnifying glass = analyst)
**Right approach:** Pick objects the child actually touches and plays with (pie chart, slice)

If you do not have the game mechanic description, ask for it before generating the illustration.

---

## 0.1 Simplicity First — Non-Negotiable

Every illustration must have **one clear hero visual** — a single subject that is instantly recognisable at 90×90 px thumbnail size.

**Rules:**
- **One hero, one story.** Pick the single most iconic object for the game. Do not compose a scene with multiple competing subjects.
- **Maximum 6 core shapes** for the subject. Count every SVG element except accent dots and sparkles — if you exceed 6, remove shapes, not add them.
- **One dominant palette colour.** The hero should read as primarily one colour at a glance.
- **No busy compositions.** Fewer, larger shapes beat many small shapes every time.
- **Reference standard:** Little Analyst (pie chart) and Little Architect (house) are the visual benchmark. Every new illustration must match their clarity and simplicity before shipping.

| ✅ Good | ❌ Bad |
|---|---|
| One large lightbulb, 5 shapes | Lightbulb + battery + plug + bolt + rays = cluttered |
| One pizza slice with 3 pepperoni | Pizza + pan + spatula + egg = scene, not icon |
| Piano keyboard, 5 colourful keys | Full 88-key piano + music stand + note + pedals |

If in doubt, simplify further. Ship the simpler version.

---

## 1. Style Reference

**Name:** Cut-paper collage
**Inspiration:** Matisse paper cut-outs, Google emoji flat illustration
**Feel:** Bold, joyful, tactile — like chunky shapes cut from coloured card and layered by hand. Objects are large and confident, filling the frame generously.

The style is defined by:
- Flat solid filled shapes only — no gradients, no blur, no shadows
- **No opacity anywhere** — every shape is fully opaque. Depth comes from layering order, not transparency
- Clean hard edges — no wobbly paths, no hand-drawn texture
- Deliberate tilt/rotation on elements to feel playful and hand-placed
- **Chunky, bold silhouettes** — shapes should be large, simple, and readable at small sizes. If in doubt, make it bigger
- **Rounded corners and soft joins everywhere** — no sharp points on any element including bolts, stars, arrows, or stems
- **Objects fill the frame** — the main objects should be large and dominant, not small and floating in empty space
- **Negative space / cutouts** — some objects like music notes use hollow cutout areas rather than being fully solid. This adds sophistication and matches the reference style
- A small recurring set of ornamental elements (see Section 4) used consistently across all illustrations

---

## 2. Colour Palette

Only these colours are permitted. No other hex values.

| Name | Hex | Notes |
|---|---|---|
| Amber | `#F5A623` | Basket handle, keyboard body, yolk |
| Yellow | `#F5C842` | Sparkles always, banknote centre, accent |
| Red | `#E03535` | Apple, accent dot |
| Orange | `#F26419` | Warm secondary fills |
| Blue | `#2E6FE0` | Primary blue — turntable rims, bulb base, pan handle, stems, banknote body |
| Green | `#3aA845` | Accent dot, leaves |
| Teal / Mint | `#4ECDC4` | Pan, plug, teal bolt, switch, accent |
| Cream white | `#fffef9` | Background, egg white, cutout fill |

**Rules:**
- Never use `opacity` on any shape — use a darker/lighter palette colour instead
- Never use `rgba()` — only hex values from this palette
- The illustration SVG has a **cream/white background only** — no coloured card rect. The card colour is applied by a separate React component wrapper
- Teal (`#4ECDC4`) is approved for pans, plugs, and bolt ornaments
- Orange (`#F26419`) is approved for basket bodies, pizza crusts, and warm secondary fills

---

## 3. Shape Vocabulary

Only these primitive shapes are "legal." This keeps all illustrations feeling like they came from the same hand.

| Shape | Usage |
|---|---|
| Rounded rect (`rx 12–20`) | Basket body, keyboard, battery, banknote, spatula head |
| Circle | Accent dots, note heads, coin centres, pepperoni, egg yolk, basket slot details |
| Hollow/cutout shape | Music note (stems with negative space inside), basket handle opening |
| Organic blob path | Egg white, pan shape, pizza slice body |
| Short rounded capsule stroke | Light rays around bulb, basket weave slots |
| 4-point rounded star path | Sparkles only — never polygon |
| Wire/plug path | Engineer accent — chunky 2-prong plug |
| Banknote | Rounded rect body + circle centre, rotated |

**Not permitted:** jagged paths, hand-drawn wobble, ellipses used as blobs, freeform scribbles, gear shapes, leaves, ribbons, teardrops, 8-point polygon stars.

---

## 4. Ornamental Elements

These specific ornamental objects appear across illustrations as floating accents. Use 2–4 per illustration from this list only.

| Ornament | Description | Colour |
|---|---|---|
| Sparkle | 4-point rounded star path | `#F5C842` yellow — always |
| Accent dot | Simple solid circle, r=6–18 | Any palette colour |
| Banknote | Rounded rect + circle centre, rotated | `#2E6FE0` blue body, `#F5C842` centre |
| Light ray | Short rounded capsule, radiates from bright object | Same colour as emitting object |
| Teal lightning bolt | Chunky rounded bolt | `#4ECDC4` teal |
| Plug | Simple chunky 2-prong plug shape | `#4ECDC4` teal |

Do not invent new ornament types. Use only from this list.

---

## 5. Layering Order

Every illustration must follow this stack from bottom to top:

```
1. Cream/white background (#fffef9) — no card colour, no wave shape
2. Main object — largest, most central game mechanic object
3. Secondary object — overlaps main object slightly, rotated differently
4. Ornamental accents — 2 to 4 items from Section 4, scattered
5. Sparkles — always topmost, never behind anything
```

Objects **must overlap each other slightly** — this creates the cut-paper layering feel. Do not space everything evenly apart with equal breathing room. The composition should feel slightly energetic and dynamic, not centred and static.

---

## 6. Rotation Rules

Rotation creates the hand-placed feel. Follow these ranges strictly.

| Element | Rotation range |
|---|---|
| Main object | -6° to +6° |
| Secondary object | -15° to +15° |
| Banknote ornaments | -25° to +25° (each banknote a different angle) |
| Other accent ornaments | -20° to +20° |
| Sparkles | 0° (always upright) |

---

## 7. Sparkles

**Exactly two** sparkles per illustration. Always `#F5C842` yellow. Always a 4-point rounded star path — never a polygon.

```svg
<!-- Large sparkle — wrap in transform="translate(x, y)" -->
<path d="M0 -16 C2 -6 6 -2 16 0 C6 2 2 6 0 16 C-2 6 -6 2 -16 0 C-6 -2 -2 -6 0 -16Z" fill="#F5C842"/>

<!-- Small sparkle -->
<path d="M0 -10 C1.5 -4 4 -1.5 10 0 C4 1.5 1.5 4 0 10 C-1.5 4 -4 1.5 -10 0 C-4 -1.5 -1.5 -4 0 -10Z" fill="#F5C842"/>
```

Placement: one near the top-left, one near the bottom-right or near a secondary accent. Never cluster both sparkles together.

---

## 8. Per-Game Object Guide

Each entry lists the core mechanic, what to illustrate, colours, and ornaments. Always derive objects from the mechanic — not the theme name.

| Game | Core mechanic | Illustrate | Main colour | Accent colours | Ornaments |
|---|---|---|---|---|---|
| Little Shopper | Earn coins, choose what to buy, decide what to save | Open shopping basket + two banknotes | `#F26419` orange basket, `#F5A623` handle | `#2E6FE0` blue banknotes, `#F5C842` centres | Banknotes × 2, accent dots × 3, sparkles × 2 |
| Little DJ | Tap a cell to loop it, stack beats across layers | Double music note (hollow) + keyboard | `#2E6FE0` blue note | `#F5A623` amber keyboard, `#E03535` red keys | Red circle accent, sparkles × 2 |
| Little Engineer | Flip switches, connect wires, complete circuits | Lightbulb (with rays) + chunky battery | `#F5C842` yellow bulb | `#2E6FE0` blue battery, `#4ECDC4` teal | Light rays, teal plug, teal bolt, sparkles × 2 |
| Little Analyst | Drag the missing slice to complete a pie chart | Pie chart with gap + detached slice | `#2E6FE0` blue | `#E03535` red, `#F5C842` yellow | Accent dots × 3, sparkles × 2 |
| Little Coder | [Add mechanic description before generating] | [Derive from mechanic] | TBD | TBD | TBD |

---

## 9. Reference Image Learnings

These rules were extracted directly from the approved reference illustrations (Bank.png, Bulb.png, Music.png, Pizza.png). When in doubt, refer back to these images.

**Composition:**
- Objects are **large and fill the frame** — not small and centred with lots of empty space
- Main object takes up roughly 50–60% of the canvas area
- Secondary object overlaps the main object or sits closely beside it
- The overall composition feels slightly energetic — not perfectly balanced or symmetrical

**Shopping basket (Little Shopper):**
- Open-top shopping basket — rounded trapezoid body (wider at top, narrower at bottom)
- Chunky rectangular handle with a negative space opening inside
- Vertical slot details on the body — short rounded capsule shapes, not lines
- Use **banknotes** not coins — blue rounded rect with a yellow circle in the centre
- Two banknotes at different angles, partially overlapping

**Music note (Little DJ):**
- The double quaver is **hollow** — the rectangular stem area has negative/cutout space inside creating the distinctive note silhouette
- One note head (left) is a **separate red circle** — not blue like the stems
- The keyboard sits to the right, rotated, with a red/orange top strip and red vertical key bars on a yellow body

**Lightbulb (Little Engineer):**
- Clean **pear/teardrop silhouette** — wide round dome narrowing into a short stubby neck with horizontal band details in orange/red
- **Light rays** radiate from around the bulb — short rounded capsule shapes (not lines), same amber/yellow as the bulb
- Battery is chunky blue rounded rect with white vertical stripe and red horizontal stripe detail
- A **teal plug** (chunky 2-prong) hangs off below as accent
- Teal lightning bolt floats nearby as ornament

**Food (reference for Little Chef if added):**
- Pizza slice: triangular organic path with orange crust, yellow/amber cheese, red pepperoni circles
- Fried egg: white organic blob + yellow circle yolk
- Teal frying pan: simple rounded pan shape with handle
- Blue spatula: rect head with slot cutouts + long handle
- Scattered tiny dots (teal, red, yellow, blue) as food splash accents around the composition

**Shape quality:**
- All corners rounded: rx=12–20 on rects, fully rounded linecaps on all strokes
- Detail strokes (weave slots, spatula slots, light rays) = short rounded capsule shapes
- Shapes feel slightly hand-cut, not robotically perfect

---

## 10. SVG Canvas Spec

```
viewBox: 0 0 680 500
width: 100%
Background: cream white (#fffef9) — no card colour rect, no wave shape
Safe zone: x=160–520, y=40–460
```

The illustration is a standalone SVG. The card component wrapper handles the coloured background. Do not include a card rect or wave path in the illustration SVG.

---

## 11. Prompt Template (for Claude / Claude Code)

Use this prompt verbatim when generating a new illustration:

```
Create a Did·It game card illustration for [GAME NAME] following ILLUSTRATIONS.md exactly.

Game mechanic: [paste the mechanic description here]
Objects to illustrate: [derived from mechanic — 2 to 3 objects max]
Main object colour: [hex]
Accent colours: [hex list]

Rules (non-negotiable):
- Derive objects from the mechanic, not the theme name (Section 0)
- Objects must be LARGE and fill the frame — not small or sparse
- Flat solid fills only — no opacity, no gradients, no rgba
- Cream/white background only (#fffef9) — no card colour rect
- Chunky bold silhouettes, rounded corners everywhere
- Objects overlap slightly — no even spacing
- Use hollow/cutout technique where appropriate (music note, basket handle)
- Layering: main object → secondary object → ornaments → sparkles
- Main rotation: -6° to +6°, secondary: -15° to +15°
- Exactly two 4-point rounded sparkles in #F5C842 (Section 7)
- 2–4 ornaments from approved list only (Section 4)
- Only palette colours from Section 2
- Reference Section 9 for specific shape guidance per game
- SVG viewBox="0 0 680 500"
```

---

## 12. QA Checklist

Before shipping any illustration, verify:

- [ ] Objects derived from game mechanic (Section 0)
- [ ] Objects are LARGE — fill 50–60% of the canvas
- [ ] No `opacity` attribute anywhere
- [ ] No `rgba()` colour values
- [ ] No gradients or filters
- [ ] No card background rect
- [ ] No white wave shape
- [ ] All colours from approved palette (Section 2)
- [ ] Shapes are chunky, bold, readable at small sizes
- [ ] All corners/joins are rounded — no sharp points
- [ ] Objects overlap slightly — not evenly spaced
- [ ] Hollow/cutout technique used where appropriate
- [ ] Layering order correct (Section 5)
- [ ] Rotations within allowed ranges (Section 6)
- [ ] Exactly two rounded 4-point sparkles, yellow
- [ ] 2–4 ornaments from approved list (Section 4)
- [ ] viewBox is `0 0 680 500`
