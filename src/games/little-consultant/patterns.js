// Little Consultant — procedural drawing helpers.
//
// Everything here is canvas-only — no SVG, no asset files. Shapes (circle,
// square, triangle, star) are drawn as paths; patterns (dots, stripes,
// plain) are overlaid using the shape's path as a clip region.

const PATTERN_OVERLAY = 'rgba(255,255,255,0.85)';

/**
 * Soft tonal overlay colour per shape colour. The pattern (stripes,
 * giraffe spots, triangle swirls) inherits a hue-shifted version of
 * the base colour so it reads as a tonal decoration rather than a
 * high-contrast addition.
 */
const TONAL_OVERLAYS = {
  red:    'rgba(255, 200, 200, 0.90)',
  blue:   'rgba(205, 225, 255, 0.90)',
  yellow: 'rgba(255, 245, 200, 0.95)',
  orange: 'rgba(255, 222, 195, 0.90)',
  teal:   'rgba(215, 245, 240, 0.90)',
  green:  'rgba(225, 245, 220, 0.90)',
};

function tonalOverlayFor(colourName) {
  return TONAL_OVERLAYS[colourName] || PATTERN_OVERLAY;
}

/**
 * Draws a single shape centred at (x, y) with the given size.
 *   ctx     — 2D context
 *   shape   — 'circle' | 'square' | 'triangle' | 'star'
 *   colour  — base fill (hex/rgba)
 *   pattern — 'dots' | 'stripes' | 'plain'
 *   size    — bounding box size in CSS pixels
 *   shadow  — optional boolean to add a soft drop shadow
 */
// eslint-disable-next-line no-unused-vars
export function drawShape(ctx, { shape, colour, colourName, pattern, x, y, size, shadow = false }) {
  ctx.save();
  ctx.translate(x, y);

  const overlay = tonalOverlayFor(colourName);

  // Shape body, no drop shadow, no outline rim — flat fill only.
  pathShape(ctx, shape, size);
  ctx.fillStyle = colour;
  ctx.fill();

  // Pattern overlay clipped to shape interior. The overlay colour is
  // the base colour's tonal pair, so blue shapes get pale blue lines /
  // spots, yellow gets pale yellow, etc.
  if (pattern && pattern !== 'plain') {
    ctx.save();
    pathShape(ctx, shape, size);
    ctx.clip();
    drawPatternOverlay(ctx, pattern, size, overlay);
    ctx.restore();
  }

  // Plain triangle gets a subtle decorative grid texture so the
  // iconic red triangle isn't visually empty next to the patterned
  // squares and circles.
  if (shape === 'triangle' && (!pattern || pattern === 'plain')) {
    ctx.save();
    pathShape(ctx, shape, size);
    ctx.clip();
    drawGridLines(ctx, size, overlay);
    ctx.restore();
  }

  ctx.restore();
}

function pathShape(ctx, type, size) {
  ctx.beginPath();
  const half = size / 2;
  if (type === 'circle') {
    ctx.arc(0, 0, half, 0, Math.PI * 2);
  } else if (type === 'square') {
    const r = Math.max(4, size * 0.14);
    roundRect(ctx, -half, -half, size, size, r);
  } else if (type === 'triangle') {
    // Equilateral-ish triangle with all three corners rounded.
    const points = [
      { x: 0,     y: -half },
      { x:  half, y:  half * 0.85 },
      { x: -half, y:  half * 0.85 },
    ];
    roundedPolygon(ctx, points, size * 0.12);
  } else if (type === 'star') {
    // 5-point star with every vertex rounded — both the points and the
    // valleys read soft.
    const outer = half;
    const inner = half * 0.50;
    const points = [];
    for (let i = 0; i < 10; i++) {
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? outer : inner;
      points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
    }
    roundedPolygon(ctx, points, size * 0.06);
  }
}

/**
 * Rounded-corner polygon. For each vertex we shorten the inbound edge
 * to a "corner-start" point, then draw a quadratic curve to the
 * "corner-end" point on the outbound edge using the vertex as the
 * control point. The curve never overshoots the vertex, so fills are
 * solid (no gaps) on sharp inside corners like star valleys.
 */
function roundedPolygon(ctx, points, cornerR) {
  const n = points.length;
  if (n < 3) return;
  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const cur  = points[i];
    const next = points[(i + 1) % n];
    const v1x = cur.x - prev.x, v1y = cur.y - prev.y;
    const v2x = next.x - cur.x, v2y = next.y - cur.y;
    const l1 = Math.hypot(v1x, v1y) || 1;
    const l2 = Math.hypot(v2x, v2y) || 1;
    const r  = Math.min(cornerR, l1 / 2, l2 / 2);
    const sx = cur.x - (v1x / l1) * r;
    const sy = cur.y - (v1y / l1) * r;
    const ex = cur.x + (v2x / l2) * r;
    const ey = cur.y + (v2y / l2) * r;
    if (i === 0) ctx.moveTo(sx, sy);
    else         ctx.lineTo(sx, sy);
    ctx.quadraticCurveTo(cur.x, cur.y, ex, ey);
  }
  ctx.closePath();
}

function drawPatternOverlay(ctx, pattern, size, overlayColour) {
  if (pattern === 'dots') {
    // Giraffe-style spots clipped to shape interior by caller.
    drawGiraffeSpots(ctx, -size, -size, size * 2, size * 2, overlayColour);
  } else if (pattern === 'stripes') {
    // Soft, slightly wavy stripes in the shape's tonal-pair colour.
    ctx.save();
    ctx.strokeStyle = overlayColour;
    ctx.lineWidth = Math.max(2.5, size * 0.08);
    ctx.lineCap = 'round';
    const spacing = Math.max(9, size * 0.22);
    let seed = 0;
    for (let off = -size * 1.6; off <= size * 1.6; off += spacing) {
      const w1 = (((seed * 13) % 7) - 3) * (size * 0.012);
      const w2 = (((seed * 7)  % 7) - 3) * (size * 0.012);
      ctx.beginPath();
      ctx.moveTo(-size + off + w1, -size);
      ctx.bezierCurveTo(
        -size * 0.45 + off + w2 * 2.2,    -size * 0.30,
         size * 0.45 + off + w1 * 2.2,     size * 0.30,
         size + off + w2,                  size,
      );
      ctx.stroke();
      seed += 1;
    }
    ctx.restore();
  }
}

/**
 * Draws a dense dalmatian-style scatter of small irregular spots into
 * the rect (x, y, w, h). Many tiny dots, varied sizes, jittered out
 * of a fine grid for an organic "spotted fabric" look. Deterministic
 * (seeded) so the pattern is stable between frames.
 */
export function drawGiraffeSpots(ctx, x, y, w, h, fillStyle, scaleRef = null) {
  ctx.save();
  ctx.fillStyle = fillStyle;

  // `scaleRef` lets callers force the dot-density to match a different
  // reference size — e.g. the L3 banner is wide and short, so passing
  // a scaleRef equal to the shape's typical render size keeps the dots
  // visually the same size as the dots painted inside shapes.
  const baseSize = scaleRef != null ? scaleRef : Math.min(w, h);
  // Fine grid: ~12 cells across the shorter side. Each cell holds (most
  // of the time) one small spot at a randomised position with a varied
  // radius. Random skips create organic empty patches.
  const cellSize   = Math.max(6, baseSize * 0.085);
  const baseRadius = Math.max(1.2, baseSize * 0.024);

  const cols = Math.max(3, Math.floor(w / cellSize));
  const rows = Math.max(3, Math.floor(h / cellSize));

  // Centre the grid inside the tile.
  const totalW = cols * cellSize;
  const totalH = rows * cellSize;
  const startX = x + (w - totalW) / 2;
  const startY = y + (h - totalH) / 2;

  let blobSeed = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Per-cell pseudo-random "noise" used to drive jitter, size, and
      // the skip-this-cell decision.
      const s = (col * 17 + row * 31 + 13) % 100;

      // Skip about one cell in nine for organic empty patches.
      if (s % 9 === 0) continue;

      // Jitter centre within the cell.
      const jx = (((s * 7)  % 100) / 100 - 0.5) * cellSize * 0.7;
      const jy = (((s * 13) % 100) / 100 - 0.5) * cellSize * 0.7;
      const cx = startX + (col + 0.5) * cellSize + jx;
      const cy = startY + (row + 0.5) * cellSize + jy;

      // Varied radius (0.45×–1.55× of baseRadius) for dalmatian feel.
      const sizeFactor = 0.45 + ((s * 11) % 100) / 100 * 1.10;
      const r = baseRadius * sizeFactor;

      drawBlob(ctx, cx, cy, r, blobSeed++);
    }
  }
  ctx.restore();
}

/** Grid texture — horizontal + vertical lines forming a soft mesh.
    Used inside the plain red triangle as a decorative layer. The
    triangle's clip path automatically trims the grid to the
    triangle silhouette. */
function drawGridLines(ctx, size, overlayColour) {
  ctx.save();
  ctx.strokeStyle = overlayColour;
  ctx.lineWidth = Math.max(1, size * 0.018);
  ctx.lineCap = 'butt';

  const half = size / 2;
  const spacing = size * 0.11;   // ~9 cells across the shape

  // Horizontal lines
  for (let y = -half; y <= half + 0.5; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(-half, y);
    ctx.lineTo(half,  y);
    ctx.stroke();
  }
  // Vertical lines
  for (let x = -half; x <= half + 0.5; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, -half);
    ctx.lineTo(x,  half);
    ctx.stroke();
  }

  ctx.restore();
}

// Per-seed radius variations around the blob; deterministic so the pattern
// is stable between frames.
const BLOB_VARIATIONS = [
  [1.10, 0.85, 1.00, 0.90, 1.05, 0.95],
  [0.95, 1.10, 0.85, 1.05, 0.90, 1.00],
  [1.05, 0.90, 1.10, 0.85, 1.00, 0.95],
  [0.90, 1.05, 0.95, 1.10, 0.85, 1.00],
  [1.00, 0.95, 1.10, 0.90, 1.05, 0.85],
  [0.85, 1.00, 1.05, 0.95, 1.10, 0.90],
  [1.05, 0.85, 0.95, 1.00, 1.10, 0.90],
  [0.90, 1.00, 0.85, 1.05, 0.95, 1.10],
];

function drawBlob(ctx, cx, cy, baseR, seed) {
  const v = BLOB_VARIATIONS[seed % BLOB_VARIATIONS.length];
  const startAngle = (seed * 0.7) % (Math.PI * 2);
  const N = 6;
  // Build the vertex points around the blob.
  const pts = [];
  for (let i = 0; i < N; i++) {
    const angle = startAngle + (i / N) * Math.PI * 2;
    const r = baseR * v[i];
    pts.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  // Connect with quadratic curves through midpoints — gives smooth,
  // organic blob outlines without any sharp corners.
  ctx.beginPath();
  const start = midpoint(pts[N - 1], pts[0]);
  ctx.moveTo(start.x, start.y);
  for (let i = 0; i < N; i++) {
    const cur  = pts[i];
    const next = pts[(i + 1) % N];
    const mid  = midpoint(cur, next);
    ctx.quadraticCurveTo(cur.x, cur.y, mid.x, mid.y);
  }
  ctx.closePath();
  ctx.fill();
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * Banner pattern swatch — used on the L3 home banners. A neutral-toned
 * rounded square filled with a dot or stripe pattern. NO shape outline
 * implied: the swatch is just textured fill.
 */
export function drawBannerPatternSwatch(ctx, pattern, x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x, y, w, h, 6);
  ctx.fillStyle = '#D8D2C4';     // soft neutral substrate
  ctx.fill();
  ctx.clip();

  if (pattern === 'dots') {
    ctx.fillStyle = '#5C5247';
    const r = Math.max(2.5, h * 0.07);
    const spacing = Math.max(8, h * 0.22);
    for (let dx = x; dx <= x + w + spacing; dx += spacing) {
      for (let dy = y; dy <= y + h + spacing; dy += spacing) {
        ctx.beginPath();
        ctx.arc(dx, dy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (pattern === 'stripes') {
    ctx.strokeStyle = '#5C5247';
    ctx.lineWidth = Math.max(2.5, h * 0.10);
    const spacing = Math.max(8, h * 0.22);
    for (let off = -h; off <= w + h; off += spacing) {
      ctx.beginPath();
      ctx.moveTo(x + off, y);
      ctx.lineTo(x + off + h, y + h);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// Local roundRect — small fallback wrapper. Modern browsers (Safari 16+,
// Chrome 99+) implement ctx.roundRect natively; we use it when available,
// otherwise fall back to a quadratic-curve construction.
export function roundRect(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  const radius = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/** Top-rounded only — used by the home banner so its bottom sits flush
    against the home body. */
export function roundRectTop(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
