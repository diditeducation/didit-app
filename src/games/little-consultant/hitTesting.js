// Little Consultant — drag/drop hit-testing helpers.

export function pointInRect(px, py, x, y, w, h) {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

export function pointInCircle(px, py, cx, cy, r) {
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= r * r;
}

/**
 * 1.4× expanded hit-test against a home rect — toddler-forgiving.
 * Returns true if the point falls within the expanded bounds.
 */
export function pointInHome(px, py, home) {
  const expandX = home.w * 0.20;
  const expandY = home.h * 0.20;
  return px >= home.x - expandX
    && px <= home.x + home.w + expandX
    && py >= home.y - expandY
    && py <= home.y + home.h + expandY;
}
