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
// Hero: open shopping basket. 6 core shapes.
export function ShopperIllustration() {
  return (
    <svg width="90" height="90" viewBox="0 0 500 500">

      {/* 1 — Basket body */}
      <rect x="118" y="248" width="264" height="196" rx="26" fill="#F26419"/>

      {/* 2 — Handle outer */}
      <rect x="148" y="174" width="204" height="86" rx="43" fill="#F5A623"/>
      {/* 3 — Handle inner cutout */}
      <rect x="178" y="196" width="144" height="42" rx="21" fill="#fffef9"/>

      {/* 4 — Apple inside basket */}
      <circle cx="250" cy="268" r="40" fill="#E03535"/>
      {/* Leaf */}
      <ellipse cx="268" cy="232" rx="14" ry="8" transform="rotate(-30,268,232)" fill="#3aA845"/>

      {/* 5 — Banknote leaning behind basket-right */}
      <g transform="translate(358,298) rotate(-18)">
        <rect x="-56" y="-34" width="112" height="68" rx="12" fill="#2E6FE0"/>
        {/* 6 — Banknote centre */}
        <circle cx="0" cy="0" r="17" fill="#F5C842"/>
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
    <svg width="90" height="90" viewBox="0 0 500 500">

      {/* 1 — Deck body */}
      <rect x="52" y="218" width="396" height="196" rx="28" fill="#F5A623"/>

      {/* Left platter — 2 circles = 2 shapes */}
      {/* 2 — Outer ring */}
      <circle cx="158" cy="315" r="88" fill="#7a4e00"/>
      {/* 3 — Inner record */}
      <circle cx="158" cy="315" r="60" fill="#2E6FE0"/>
      <circle cx="158" cy="315" r="18" fill="#F5C842"/>

      {/* Right platter */}
      {/* 4 — Outer ring */}
      <circle cx="342" cy="315" r="88" fill="#7a4e00"/>
      {/* 5 — Inner record */}
      <circle cx="342" cy="315" r="60" fill="#E03535"/>
      <circle cx="342" cy="315" r="18" fill="#F5C842"/>

      {/* 6 — Crossfader */}
      <rect x="196" y="384" width="108" height="20" rx="10" fill="#C47A1E"/>
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
// Hero: lightbulb only. 5 core shapes.
export function EngineerIllustration() {
  return (
    <svg width="90" height="90" viewBox="0 0 500 500">

      {/* 1 — Bulb dome (pear shape) */}
      <path
        d="M252,102 C350,102 408,166 408,248 C408,316 362,360 320,374 L184,374 C142,360 96,316 96,248 C96,166 154,102 252,102 Z"
        fill="#F5C842"
      />
      {/* 2 — Neck */}
      <rect x="216" y="368" width="72" height="58" rx="14" fill="#F5C842"/>
      {/* 3 — Base cap */}
      <rect x="200" y="416" width="104" height="24" rx="12" fill="#F26419"/>

      {/* 4 — Light ray left */}
      <g transform="translate(138,192) rotate(300)">
        <rect x="-7" y="-26" width="14" height="52" rx="7" fill="#F5A623"/>
      </g>
      {/* 5 — Light ray right */}
      <g transform="translate(366,192) rotate(60)">
        <rect x="-7" y="-26" width="14" height="52" rx="7" fill="#F5A623"/>
      </g>

      {/* Accent dots */}
      <circle cx="155" cy="448" r="9"  fill="#4ECDC4"/>
      <circle cx="460" cy="165" r="8"  fill="#E03535"/>

      <Sparkle x={458} y={148} />
      <Sparkle x={162} y={452} large/>
    </svg>
  );
}

// ── Little Chef ──────────────────────────────────────────────
// Hero: pizza slice. 5 core shapes.
export function ChefIllustration() {
  return (
    <svg width="90" height="90" viewBox="0 0 500 500">

      {/* 1 — Slice body (cheese) */}
      <path d="M252,88 L96,392 L408,392 Z" fill="#F5A623"/>

      {/* 2 — Thick crust */}
      <path d="M96,338 Q88,400 112,412 L392,412 Q416,400 408,338 Q340,430 252,430 Q164,430 96,338 Z" fill="#F26419"/>

      {/* 3 — Pepperoni top */}
      <circle cx="252" cy="210" r="26" fill="#E03535"/>
      {/* 4 — Pepperoni left */}
      <circle cx="178" cy="320" r="22" fill="#E03535"/>
      {/* 5 — Pepperoni right */}
      <circle cx="326" cy="320" r="22" fill="#E03535"/>

      {/* Accent dots */}
      <circle cx="148" cy="148" r="9"  fill="#4ECDC4"/>
      <circle cx="460" cy="435" r="7"  fill="#3aA845"/>

      <Sparkle x={458} y={130} />
      <Sparkle x={158} y={458} large/>
    </svg>
  );
}

// ── Little Pianist ───────────────────────────────────────────
// Hero: piano with 5 chunky colourful keys. 6 core shapes.
export function PianistIllustration() {
  const keys = [
    { x: 108, color: '#E03535' },
    { x: 168, color: '#2E6FE0' },
    { x: 228, color: '#4ECDC4' },
    { x: 288, color: '#3aA845' },
    { x: 348, color: '#F26419' },
  ];

  return (
    <svg width="90" height="90" viewBox="0 0 500 500">

      {/* 1 — Piano body */}
      <rect x="92" y="205" width="316" height="214" rx="24" fill="#7a4e00"/>

      {/* 2-6 — Five chunky coloured keys */}
      {keys.map(({ x, color }, i) => (
        <rect key={i} x={x} y="225" width="48" height="154" rx="12" fill={color}/>
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
    <svg width="90" height="90" viewBox="0 0 500 500">

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
// Hero: H₂O molecule — red O + two blue H atoms + amber bonds. 5 core shapes.
export function ChemistIllustration() {
  const ox = 252, oy = 302;
  const h1x = 142, h1y = 168;
  const h2x = 362, h2y = 168;

  const b1cx = (ox + h1x) / 2;
  const b1cy = (oy + h1y) / 2;
  const b1len = Math.sqrt((ox - h1x) ** 2 + (oy - h1y) ** 2);
  const b1ang = Math.atan2(h1y - oy, h1x - ox) * 180 / Math.PI;

  const b2cx = (ox + h2x) / 2;
  const b2cy = (oy + h2y) / 2;
  const b2ang = Math.atan2(h2y - oy, h2x - ox) * 180 / Math.PI;

  return (
    <svg width="90" height="90" viewBox="0 0 500 500">

      {/* 1 — Bond left */}
      <g transform={`translate(${b1cx.toFixed(1)},${b1cy.toFixed(1)}) rotate(${b1ang.toFixed(1)})`}>
        <rect x={(-b1len / 2).toFixed(1)} y="-13" width={b1len.toFixed(1)} height="26" rx="13" fill="#F5A623"/>
      </g>
      {/* 2 — Bond right */}
      <g transform={`translate(${b2cx.toFixed(1)},${b2cy.toFixed(1)}) rotate(${b2ang.toFixed(1)})`}>
        <rect x={(-b1len / 2).toFixed(1)} y="-13" width={b1len.toFixed(1)} height="26" rx="13" fill="#F5A623"/>
      </g>

      {/* 3 — H atom left */}
      <circle cx={h1x} cy={h1y} r="58" fill="#2E6FE0"/>
      {/* 4 — H atom right */}
      <circle cx={h2x} cy={h2y} r="58" fill="#2E6FE0"/>
      {/* 5 — O atom (large, front) */}
      <circle cx={ox} cy={oy} r="84" fill="#E03535"/>

      {/* Accent dots */}
      <circle cx="155" cy="448" r="8"  fill="#3aA845"/>
      <circle cx="462" cy="348" r="7"  fill="#4ECDC4"/>

      <Sparkle x={455} y={138} />
      <Sparkle x={162} y={458} large/>
    </svg>
  );
}

// ── Little Astronomer ────────────────────────────────────────
// Hero: ringed planet. 4 core shapes.
export function AstronomerIllustration() {
  return (
    <svg width="90" height="90" viewBox="0 0 500 500">

      {/* Background stars */}
      <circle cx="162" cy="168" r="6" fill="#F5C842"/>
      <circle cx="448" cy="318" r="5" fill="#F5C842"/>
      <circle cx="148" cy="355" r="4" fill="#F5C842"/>
      <circle cx="432" cy="428" r="5" fill="#F5C842"/>

      {/* 1 — Ring back half */}
      <ellipse cx="258" cy="272" rx="165" ry="38" fill="#F5A623" transform="rotate(-10,258,272)"/>

      {/* 2 — Planet sphere */}
      <circle cx="258" cy="272" r="108" fill="#2E6FE0"/>

      {/* 3 — Small secondary planet */}
      <circle cx="412" cy="172" r="46" fill="#F26419"/>

      {/* Accent dots */}
      <circle cx="155" cy="448" r="8" fill="#4ECDC4"/>

      <Sparkle x={165} y={158} large/>
      <Sparkle x={448} y={448} />
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
    <svg width="90" height="90" viewBox="0 0 500 500">

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
    <svg width="90" height="90" viewBox="0 0 500 500">

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
