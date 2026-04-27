/**
 * Did·It — Game Card Illustrations
 *
 * All illustrations follow public/game illustrations/ILLUSTRATIONS.md exactly.
 * Style: cut-paper collage, flat solid fills, chunky rounded shapes,
 * slight rotations, overlapping objects, exactly 2 yellow sparkles per illustration.
 *
 * SIMPLICITY RULE (Section 0.1): one hero visual, max 6 core shapes, one dominant colour.
 * Reference benchmark: Little Analyst and Little Architect.
 *
 * Palette: only approved hex values from Section 2 of ILLUSTRATIONS.md.
 * Canvas: viewBox="0 0 500 500" (square hub-card variant).
 */

// ── Shared sparkle component (Section 7) ────────────────────
function Sparkle({ x, y, large = false }) {
  return large
    ? <path transform={`translate(${x},${y})`} d="M0 -16 C2 -6 6 -2 16 0 C6 2 2 6 0 16 C-2 6 -6 2 -16 0 C-6 -2 -2 -6 0 -16Z" fill="#F5C842"/>
    : <path transform={`translate(${x},${y})`} d="M0 -10 C1.5 -4 4 -1.5 10 0 C4 1.5 1.5 4 0 10 C-1.5 4 -4 1.5 -10 0 C-4 -1.5 -1.5 -4 0 -10Z" fill="#F5C842"/>;
}

// ── Little Shopper ───────────────────────────────────────────
// Hero: open shopping basket (trapezoid with weave slots). 6 core shapes.
export function ShopperIllustration() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 500 500">

      {/* 1 — Basket body (trapezoid — wider at top, narrower at bottom) */}
      <path d="M108,240 L392,240 L362,440 Q358,454 344,454 L156,454 Q142,454 138,440 Z" rx="18" fill="#2E6FE0"/>

      {/* 2 — Handle arch */}
      <path d="M178,240 Q178,148 250,148 Q322,148 322,240" fill="none" stroke="#F5A623" strokeWidth="28" strokeLinecap="round"/>

      {/* 3 — Weave slot left */}
      <rect x="158" y="296" width="52" height="14" rx="7" fill="#2E6FE0"/>
      {/* 4 — Weave slot centre */}
      <rect x="224" y="296" width="52" height="14" rx="7" fill="#2E6FE0"/>
      {/* 5 — Weave slot right */}
      <rect x="290" y="296" width="52" height="14" rx="7" fill="#2E6FE0"/>
      {/* Lower weave slots */}
      <rect x="172" y="348" width="52" height="14" rx="7" fill="#2E6FE0"/>
      <rect x="248" y="348" width="52" height="14" rx="7" fill="#2E6FE0"/>

      {/* 6 — Apple sitting at basket base — 80% size, shifted left 30px */}
      <g transform="translate(-50,0) translate(250,365) scale(0.8) translate(-250,-365)">
        <path d="M250,260 C180,260 130,310 140,380 C148,435 195,470 250,470 C305,470 352,435 360,380 C370,310 320,260 250,260Z" fill="#E03535"/>
        {/* Apple top indent */}
        <path d="M228,268 Q250,285 272,268" fill="#E03535" stroke="#E03535" strokeWidth="4"/>
        {/* Apple shine */}
        <circle cx="210" cy="340" r="24" fill="#fffef9"/>
        {/* Stem */}
        <path d="M250,268 Q260,238 268,252" fill="none" stroke="#2E6FE0" strokeWidth="12" strokeLinecap="round"/>
        {/* Leaf */}
        <path d="M262,250 Q300,220 304,260 Q278,266 262,250Z" fill="#3aA845"/>
      </g>

      {/* Accent dots */}
      <circle cx="148" cy="448" r="9" fill="#3aA845"/>
      <circle cx="458" cy="428" r="7" fill="#4ECDC4"/>

      <Sparkle x={455} y={155} />
      <Sparkle x={158} y={458} large/>
    </svg>
  );
}

// ── Little DJ ────────────────────────────────────────────────
// Hero: DJ deck with two turntable platters. 6 core shapes.
export function DJIllustration() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 500 500">

      {/* 1 — Deck body */}
      <rect x="52" y="218" width="396" height="196" rx="28" fill="#F5A623"/>

      {/* Left platter — 2 circles = 2 shapes */}
      {/* 2 — Outer ring */}
      <circle cx="158" cy="315" r="88" fill="#2E6FE0"/>
      {/* 3 — Inner record */}
      <circle cx="158" cy="315" r="60" fill="#2E6FE0"/>
      <circle cx="158" cy="315" r="18" fill="#F5C842"/>

      {/* Right platter */}
      {/* 4 — Outer ring */}
      <circle cx="342" cy="315" r="88" fill="#2E6FE0"/>
      {/* 5 — Inner record */}
      <circle cx="342" cy="315" r="60" fill="#E03535"/>
      <circle cx="342" cy="315" r="18" fill="#F5C842"/>

      {/* 6 — Crossfader */}
      <rect x="196" y="384" width="108" height="20" rx="10" fill="#2E6FE0"/>
      <rect x="234" y="374" width="32" height="40" rx="10" fill="#fffef9"/>

      {/* Accent dots */}
      <circle cx="155" cy="165" r="10" fill="#E03535"/>
      <circle cx="458" cy="428" r="8"  fill="#4ECDC4"/>

      <Sparkle x={455} y={145} />
      <Sparkle x={165} y={458} large/>
    </svg>
  );
}

// ── Little Engineer ──────────────────────────────────────────
// Hero: lightbulb with screw base + light switch. 6 core shapes.
export function EngineerIllustration() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 500 500">

      {/* 1 — Bulb glass — proper lightbulb: round top, tapered bottom sides */}
      <path
        d="M250,70
           C358,70 418,148 418,248
           C418,308 392,346 364,370
           C352,380 344,388 340,398
           L160,398
           C156,388 148,380 136,370
           C108,346 82,308 82,248
           C82,148 142,70 250,70 Z"
        fill="#F5C842"
      />
      {/* Bulb inner shine */}
      <ellipse cx="192" cy="178" rx="28" ry="42" fill="#fffef9" transform="rotate(-20 192 178)"/>

      {/* 2 — Base band 1 (widest) */}
      <rect x="162" y="396" width="176" height="26" rx="13" fill="#F5A623"/>
      {/* 3 — Base band 2 */}
      <rect x="176" y="418" width="148" height="22" rx="11" fill="#2E6FE0"/>
      {/* 4 — Base band 3 (tip) */}
      <rect x="196" y="436" width="108" height="20" rx="10" fill="#F5A623"/>
      {/* Flat bottom cap */}
      <rect x="214" y="452" width="72" height="14" rx="7" fill="#2E6FE0"/>

      {/* 5 — Light switch plate (2x size) */}
      <g transform="translate(400,340) rotate(8) scale(2)">
        {/* Plate */}
        <rect x="-34" y="-52" width="68" height="104" rx="14" fill="#4ECDC4"/>
        {/* Toggle rocker — up (ON) */}
        <rect x="-16" y="-40" width="32" height="44" rx="12" fill="#fffef9"/>
        {/* Toggle bottom half (off side) — dimmer */}
        <rect x="-16" y="8" width="32" height="30" rx="10" fill="#fffef9"/>
        {/* ON indicator dot */}
        <circle cx="0" cy="-20" r="5" fill="#4ECDC4"/>
      </g>

      {/* Accent dot */}
      <circle cx="148" cy="452" r="9" fill="#E03535"/>

      <Sparkle x={462} y={135} />
      <Sparkle x={156} y={458} large/>
    </svg>
  );
}

// ── Little Chef ──────────────────────────────────────────────
// Hero: frying pan with sunny side up egg. 6 core shapes.
export function ChefIllustration() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 500 500">

      {/* 1 — Pan handle (behind pan body) */}
      <rect x="340" y="244" width="140" height="36" rx="18" fill="#2E6FE0"/>

      {/* 2 — Pan body */}
      <circle cx="230" cy="262" r="155" fill="#4ECDC4"/>

      {/* 3 — Pan inner cooking surface */}
      <circle cx="230" cy="262" r="128" fill="#4ECDC4"/>

      {/* 4 — Egg white (organic blob) */}
      <path d="M230,175 C300,160 345,205 340,262 C343,328 295,365 238,362 C168,368 120,318 124,262 C118,205 165,162 230,175Z" fill="#fffef9"/>

      {/* 5 — Egg yolk */}
      <circle cx="238" cy="258" r="52" fill="#F5A623"/>
      {/* Yolk highlight */}
      <circle cx="224" cy="242" r="14" fill="#F5C842"/>

      {/* 6 — Handle rivet */}
      <circle cx="348" cy="262" r="8" fill="#F5A623"/>

      {/* Accent dots */}
      <circle cx="120" cy="120" r="9" fill="#E03535"/>
      <circle cx="458" cy="440" r="7" fill="#3aA845"/>

      <Sparkle x={462} y={128} />
      <Sparkle x={148} y={462} large/>
    </svg>
  );
}

// ── Little Pianist ───────────────────────────────────────────
// Hero: piano keyboard with white & black key pattern using brand colours. 6 core shapes.
export function PianistIllustration() {
  // White keys (7) — use cream/light brand colours
  const whiteKeys = [
    { x: 72,  color: '#fffef9' },
    { x: 124, color: '#fffef9' },
    { x: 176, color: '#fffef9' },
    { x: 228, color: '#fffef9' },
    { x: 280, color: '#fffef9' },
    { x: 332, color: '#fffef9' },
    { x: 384, color: '#fffef9' },
  ];

  // Black keys (5) — use brand accent colours instead of black
  const blackKeys = [
    { x: 106, color: '#2E6FE0' },
    { x: 158, color: '#E03535' },
    { x: 262, color: '#4ECDC4' },
    { x: 314, color: '#F26419' },
    { x: 366, color: '#3aA845' },
  ];

  return (
    <svg width="100%" height="100%" viewBox="0 0 500 500">

      {/* 1 — Piano body */}
      <rect x="58" y="195" width="384" height="234" rx="20" fill="#2E6FE0"/>

      {/* 2 — White keys row */}
      {whiteKeys.map(({ x, color }, i) => (
        <rect key={`w${i}`} x={x} y="215" width="48" height="194" rx="8" fill={color}/>
      ))}

      {/* 3-6 — Black keys (shorter, overlapping white keys) */}
      {blackKeys.map(({ x, color }, i) => (
        <rect key={`b${i}`} x={x} y="215" width="34" height="120" rx="8" fill={color}/>
      ))}

      {/* Accent dots */}
      <circle cx="155" cy="155" r="10" fill="#F5A623"/>
      <circle cx="460" cy="435" r="8"  fill="#E03535"/>

      <Sparkle x={455} y={138} />
      <Sparkle x={162} y={455} large/>
    </svg>
  );
}

// ── Little Coder ─────────────────────────────────────────────
// Hero: computer monitor with code lines. 6 core shapes.
export function CoderIllustration() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 500 500">

      {/* 1 — Monitor frame */}
      <rect x="92" y="128" width="316" height="228" rx="22" fill="#2E6FE0"/>
      {/* 2 — Screen */}
      <rect x="116" y="152" width="268" height="180" rx="12" fill="#fffef9"/>

      {/* 3 — Code line 1 */}
      <rect x="140" y="178" width="148" height="18" rx="9" fill="#4ECDC4"/>
      {/* 4 — Code line 2 */}
      <rect x="140" y="210" width="100" height="18" rx="9" fill="#E03535"/>
      {/* 5 — Code line 3 */}
      <rect x="140" y="242" width="176" height="18" rx="9" fill="#F5C842"/>
      <rect x="140" y="274" width="116" height="18" rx="9" fill="#4ECDC4"/>

      {/* 6 — Stand + base */}
      <rect x="228" y="356" width="44" height="48" rx="12" fill="#2E6FE0"/>
      <rect x="178" y="396" width="144" height="24" rx="12" fill="#2E6FE0"/>

      {/* Accent dots */}
      <circle cx="155" cy="448" r="9"  fill="#F26419"/>
      <circle cx="460" cy="155" r="8"  fill="#3aA845"/>

      <Sparkle x={455} y={455} />
      <Sparkle x={162} y={138} large/>
    </svg>
  );
}

// ── Little Chemist ───────────────────────────────────────────
// Hero: NH₃ ammonia molecule — blue N + three teal H atoms + amber bonds. 5 core shapes.
export function ChemistIllustration() {
  // Nitrogen centre
  const nx = 250, ny = 280;
  // Three hydrogen atoms arranged in trigonal pattern
  const h1x = 140, h1y = 160; // top-left
  const h2x = 360, h2y = 160; // top-right
  const h3x = 250, h3y = 420; // bottom

  // Bond helper
  function bond(ax, ay, bx, by) {
    const cx = (ax + bx) / 2;
    const cy = (ay + by) / 2;
    const len = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
    const ang = Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
    return { cx, cy, len, ang };
  }

  const b1 = bond(nx, ny, h1x, h1y);
  const b2 = bond(nx, ny, h2x, h2y);
  const b3 = bond(nx, ny, h3x, h3y);

  return (
    <svg width="100%" height="100%" viewBox="0 0 500 500">
      <g transform="rotate(45 250 250)">
        {/* 1 — Bond to H top-left */}
        <g transform={`translate(${b1.cx.toFixed(1)},${b1.cy.toFixed(1)}) rotate(${b1.ang.toFixed(1)})`}>
          <rect x={(-b1.len / 2).toFixed(1)} y="-12" width={b1.len.toFixed(1)} height="24" rx="12" fill="#F5A623"/>
        </g>
        {/* 2 — Bond to H top-right */}
        <g transform={`translate(${b2.cx.toFixed(1)},${b2.cy.toFixed(1)}) rotate(${b2.ang.toFixed(1)})`}>
          <rect x={(-b2.len / 2).toFixed(1)} y="-12" width={b2.len.toFixed(1)} height="24" rx="12" fill="#F5A623"/>
        </g>
        {/* Bond to H bottom */}
        <g transform={`translate(${b3.cx.toFixed(1)},${b3.cy.toFixed(1)}) rotate(${b3.ang.toFixed(1)})`}>
          <rect x={(-b3.len / 2).toFixed(1)} y="-12" width={b3.len.toFixed(1)} height="24" rx="12" fill="#F5A623"/>
        </g>

        {/* 3 — H atom top-left */}
        <circle cx={h1x} cy={h1y} r="50" fill="#4ECDC4"/>
        {/* 4 — H atom top-right */}
        <circle cx={h2x} cy={h2y} r="50" fill="#4ECDC4"/>
        {/* H atom bottom */}
        <circle cx={h3x} cy={h3y} r="50" fill="#4ECDC4"/>
        {/* 5 — N atom (large, centre, front) */}
        <circle cx={nx} cy={ny} r="72" fill="#2E6FE0"/>

        {/* Accent dots */}
        <circle cx="155" cy="448" r="8"  fill="#3aA845"/>
        <circle cx="462" cy="118" r="7"  fill="#E03535"/>

        <Sparkle x={455} y={138} />
        <Sparkle x={162} y={458} large/>
      </g>
    </svg>
  );
}

// ── Little Astronomer ────────────────────────────────────────
// Hero: Aries constellation — ram's horn shape with stars. 5 core shapes.
export function AstronomerIllustration() {
  // Aries constellation star positions (classic ram horn pattern)
  const stars = [
    { x: 120, y: 310, r: 20 },  // α Ari (Hamal) — brightest, bottom-left
    { x: 205, y: 265, r: 18 },  // β Ari (Sheratan)
    { x: 285, y: 240, r: 16 },  // γ Ari (Mesarthim)
    { x: 365, y: 190, r: 18 },  // 41 Ari — horn tip top-right
  ];

  // Connection lines between stars
  const lines = [
    [0, 1], [1, 2], [2, 3],
  ];

  return (
    <svg width="100%" height="100%" viewBox="0 0 500 500">

      {/* Background tiny stars */}
      <circle cx="442" cy="128" r="5" fill="#F5C842"/>
      <circle cx="88" cy="178" r="4" fill="#F5C842"/>
      <circle cx="432" cy="388" r="5" fill="#F5C842"/>
      <circle cx="158" cy="408" r="3" fill="#F5C842"/>
      <circle cx="340" cy="380" r="3" fill="#F5C842"/>
      <circle cx="190" cy="140" r="4" fill="#F5C842"/>

      {/* Constellation connection lines */}
      {lines.map(([a, b], i) => (
        <line
          key={i}
          x1={stars[a].x} y1={stars[a].y}
          x2={stars[b].x} y2={stars[b].y}
          stroke="#F5A623" strokeWidth="8" strokeLinecap="round"
        />
      ))}

      {/* Constellation stars */}
      {stars.map(({ x, y, r }, i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={i === 0 ? '#F26419' : i % 2 === 0 ? '#2E6FE0' : '#4ECDC4'}/>
      ))}

      {/* Accent dots */}
      <circle cx="448" cy="308" r="8" fill="#E03535"/>
      <circle cx="78" cy="268" r="7" fill="#3aA845"/>

      <Sparkle x={165} y={438} large/>
      <Sparkle x={448} y={158} />
    </svg>
  );
}

// ── Little Analyst ───────────────────────────────────────────
// Hero: pie chart with gap + detached floating slice. 5 core shapes.
export function AnalystIllustration() {
  const cx = 242, cy = 268, r = 115;
  function pt(deg) {
    const rad = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }
  const [bx, by] = pt(0);
  const [rx2, ry2] = pt(200);
  const [yx, yy] = pt(310);

  const bluePath  = `M ${cx} ${cy} L ${bx.toFixed(1)} ${by.toFixed(1)} A ${r} ${r} 0 1 1 ${rx2.toFixed(1)} ${ry2.toFixed(1)} Z`;
  const redPath   = `M ${cx} ${cy} L ${rx2.toFixed(1)} ${ry2.toFixed(1)} A ${r} ${r} 0 0 1 ${yx.toFixed(1)} ${yy.toFixed(1)} Z`;

  const ox = -24, oy = -52;
  const floatPath = `M ${cx+ox} ${cy+oy} L ${(yx+ox).toFixed(1)} ${(yy+oy).toFixed(1)} A ${r} ${r} 0 0 1 ${(bx+ox).toFixed(1)} ${(by+oy).toFixed(1)} Z`;

  return (
    <svg width="100%" height="100%" viewBox="0 0 500 500">

      <path d={bluePath}  fill="#2E6FE0"/>
      <path d={redPath}   fill="#E03535"/>
      <circle cx={cx} cy={cy} r="14" fill="#fffef9"/>

      <path d={floatPath} fill="#F5C842"/>
      <circle cx={cx+ox} cy={cy+oy} r="14" fill="#fffef9"/>

      <circle cx="388" cy="415" r="12" fill="#E03535"/>
      <circle cx="398" cy="145" r="10" fill="#4ECDC4"/>
      <circle cx="162" cy="438" r="8"  fill="#3aA845"/>

      <Sparkle x={162} y={108} />
      <Sparkle x={412} y={442} large/>
    </svg>
  );
}

// ── Little Architect ─────────────────────────────────────────
// Hero: house (wall + roof + chimney + door + window) + floating shape pieces.
export function ArchitectIllustration() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 500 500">

      {/* Chimney — amber, drawn first so roof overlaps its base */}
      <rect x="294" y="152" width="40" height="96" rx="14" fill="#F5A623"/>

      {/* Roof — orange, wider than wall, overlaps wall top */}
      <path d="M248,178 Q256,164 264,178 L378,302 Q385,312 372,312 L128,312 Q115,312 122,302 Z" fill="#F26419"/>

      {/* Wall — blue, anchored below roof */}
      <rect x="126" y="296" width="248" height="162" rx="20" fill="#2E6FE0"/>

      {/* Door — red, centered on wall */}
      <rect x="216" y="368" width="58" height="90" rx="14" fill="#E03535"/>

      {/* Window — teal, upper-right of wall */}
      <rect x="300" y="320" width="56" height="56" rx="13" fill="#4ECDC4"/>
      <rect x="300" y="344" width="56" height="7" rx="3" fill="#2E6FE0"/>
      <rect x="324" y="320" width="7"  height="56" rx="3" fill="#2E6FE0"/>

      {/* Floating triangle piece — overlaps house right edge */}
      <path d="M406,215 Q414,202 422,215 L470,300 Q476,312 462,312 L378,312 Q364,312 370,300 Z" fill="#4ECDC4"/>

      {/* Floating square piece */}
      <rect x="366" y="328" width="72" height="72" rx="16" fill="#F5A623"/>

      <circle cx="152" cy="208" r="10" fill="#3aA845"/>
      <circle cx="464" cy="438" r="8"  fill="#E03535"/>

      <Sparkle x={460} y={148} />
      <Sparkle x={158} y={460} large/>
    </svg>
  );
}

export function MatisseIllustration() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 680 500">
      {/* Torn square — red, main hero, slight tilt */}
      <g transform="translate(280, 220) rotate(-4)">
        <path d="M-110,-100 L110,-106 L116,96 L-104,104 Z" fill="#E03535" />
      </g>

      {/* Torn slab — blue, overlapping upper-right */}
      <g transform="translate(400, 160) rotate(8)">
        <path d="M-70,-60 L60,-68 L66,58 L-64,66 Z" fill="#2E6FE0" />
      </g>

      {/* Torn brick — amber, overlapping bottom */}
      <g transform="translate(310, 370) rotate(3)">
        <path d="M-120,-22 L110,-26 L106,22 L-116,26 Z" fill="#F5A623" />
      </g>

      {/* Small torn square — orange, lower-right accent */}
      <g transform="translate(460, 340) rotate(-12)">
        <path d="M-40,-36 L40,-38 L42,34 L-38,38 Z" fill="#F26419" />
      </g>

      {/* Algae — teal, iconic Matisse botanical, in front of everything */}
      <g transform="translate(195, 260) rotate(-8) scale(2.4)">
        <path d="M48,6 C46,14 52,20 50,30 C40,28 32,22 26,28 C30,36 40,36 46,42 C36,44 26,42 22,52 C32,56 44,52 50,58 C42,66 30,68 28,78 C38,80 48,72 52,80 C54,72 62,72 70,76 C70,66 60,62 54,58 C62,54 72,56 78,50 C70,44 60,48 54,42 C62,38 72,36 74,28 C66,24 58,30 52,30 C52,20 56,14 54,6 C52,4 50,4 48,6 Z" fill="#4ECDC4" />
      </g>

      {/* Accent dots */}
      <circle cx="500" cy="130" r="10" fill="#3aA845" />
      <circle cx="185" cy="420" r="8"  fill="#E03535" />

      {/* Sparkles — exactly 2, yellow, 4-point rounded star */}
      <Sparkle x={200} y={90} />
      <Sparkle x={510} y={420} large />
    </svg>
  );
}

// ── Little Trader ────────────────────────────────────────────
// Mechanic: each round flips up a new card; keep it (drag down) or skip it.
// The docket caps at 5 — keeping a new card later means swapping out an old.
//
// Hero shapes (5, under the 6-shape cap):
//   1. amber back card        — bottom of fan
//   2. red  back card         — middle of fan
//   3. blue front card body   — the "new" card
//   4. cream face panel       — top portion of front card (icon area)
//   5. cream label strip      — bottom portion of front card (label area)
// Plus a yellow circle "icon" on the face (counts as ornament, mirrors the
// docket card's emoji area). Accent dots + sparkles on top per Section 0.1.
export function TraderIllustration() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 500 500">
      {/* Back card — amber, peeks behind right */}
      <g transform="translate(348, 264) rotate(15)">
        <rect x="-95" y="-130" width="190" height="260" rx="20" fill="#F5A623" />
      </g>

      {/* Back card — red, peeks behind left, overlaps amber */}
      <g transform="translate(154, 260) rotate(-16)">
        <rect x="-95" y="-130" width="190" height="260" rx="20" fill="#E03535" />
      </g>

      {/* Front card — blue, the hero, slight tilt */}
      <g transform="translate(252, 240) rotate(-3)">
        {/* Card body */}
        <rect x="-115" y="-150" width="230" height="300" rx="24" fill="#2E6FE0" />
        {/* Cream face panel (icon area) */}
        <rect x="-86" y="-118" width="172" height="186" rx="14" fill="#fffef9" />
        {/* Cream label strip — gives the front card a real "trading card" feel */}
        <rect x="-86" y="86" width="172" height="36" rx="10" fill="#fffef9" />
        {/* Yellow icon on the face panel */}
        <circle cx="0" cy="-26" r="46" fill="#F5C842" />
      </g>

      {/* Accent dots — 2 floats */}
      <circle cx="436" cy="120" r="10" fill="#4ECDC4" />
      <circle cx="74"  cy="416" r="12" fill="#3aA845" />

      {/* Sparkles — exactly 2, yellow */}
      <Sparkle x={104} y={120} />
      <Sparkle x={420} y={444} large />
    </svg>
  );
}
