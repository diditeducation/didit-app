import { useEffect, useRef, useCallback } from 'react';
import {
  SHAPES, LEVELS, getCorrectHome, SHAPE_COLOURS, NEUTRAL,
} from './shapes';
import { drawShape, drawGiraffeSpots, roundRect, roundRectTop } from './patterns';
import { pointInHome } from './hitTesting';
import { initAudio, sound } from './audio';

// ── Tunables ────────────────────────────────────────────────
const LEVEL_BAR_HEIGHT  = 8;      // height of each level-progress bar
const LEVEL_BAR_TOP_PAD = 14;     // top inset for the bars row
const TITLE_HEIGHT      = 60;     // total top zone: bars + "By Colour" / etc title
const PILE_TOP_PAD      = 14;     // gap between title and pile container
const PILE_HORIZ_PAD    = 18;
const HOME_HORIZ_PAD    = 10;
const HOME_GAP          = 10;
const HOME_BOTTOM_PAD   = 16;
const HOME_HEIGHT_RATIO   = 0.42;  // of canvas height
const BANNER_HEIGHT_RATIO = 0.32;  // of home height — the solid coloured top bar
const BOUNCE_MS = 400;
const SNAP_MS  = 280;
const FLOATBACK_MS = 1200;
const PULSE_MS = 600;

// ── Component ───────────────────────────────────────────────
export default function ConsultantCanvas({ level, phase, onLevelComplete, onCorrectDrop }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const dprRef = useRef(1);
  const rafRef = useRef(null);
  const completedFiredRef = useRef(false);
  // phaseRef so the resize observer (long-lived closure) always sees
  // the current phase when relaying out the homes.
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // ── Initialise / reset state when level changes ───────────
  const initState = useCallback(() => {
    const lvl = LEVELS.find(l => l.id === level);
    if (!lvl) return;
    const { w, h } = sizeRef.current;
    if (!w || !h) {
      // Will re-init once size lands via ResizeObserver.
      stateRef.current = { level: lvl, shapes: [], homes: [], drag: null, completed: false };
      return;
    }
    const homes = makeHomes(lvl, w, h, phase);
    const shapes = buildShapes(w, h);
    stateRef.current = {
      level: lvl,
      shapes,
      homes,
      drag: null,
      placedCount: 0,
      completed: false,
    };
    completedFiredRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  useEffect(() => { initState(); }, [initState]);

  // When `phase` changes (playing → transitioning), re-lay out the homes
  // so they shift to the vertical centre, and re-anchor every placed
  // shape to its new slot inside the moved home.
  useEffect(() => {
    const st = stateRef.current;
    const { w, h } = sizeRef.current;
    if (!st || !st.level || !w || !h) return;
    st.homes = makeHomes(st.level, w, h, phase);
    const placedCounts = {};
    st.shapes.forEach(s => {
      if (!s.placed) return;
      const home = st.homes.find(hh => hh.name === s.placed);
      if (!home) return;
      const idx = (placedCounts[s.placed] || 0);
      placedCounts[s.placed] = idx + 1;
      const slot = homeSlotPosition(home, idx);
      s.x = slot.x;       s.y = slot.y;
      s.originX = slot.x; s.originY = slot.y;
      s.targetX = slot.x; s.targetY = slot.y;
      s.fromX = slot.x;   s.fromY = slot.y;
      s.animType = null;
    });
  }, [phase]);

  // ── Resize observer ──────────────────────────────────────
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const handle = () => {
      const r = c.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      sizeRef.current = { w: r.width, h: r.height };
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = Math.max(1, Math.round(r.width * dpr));
        canvas.height = Math.max(1, Math.round(r.height * dpr));
        canvas.style.width = r.width + 'px';
        canvas.style.height = r.height + 'px';
      }
      // Re-layout the existing state if it's already populated.
      const st = stateRef.current;
      if (st && st.level) {
        st.homes = makeHomes(st.level, r.width, r.height, phaseRef.current);
        // For unplaced shapes, recompute pile positions; for placed
        // shapes, re-anchor them inside their (new) home.
        const piled = buildShapes(r.width, r.height);
        const placedCounts = {};
        st.shapes = st.shapes.map((s, i) => {
          if (s.placed) {
            const home = st.homes.find(h => h.name === s.placed);
            const idx = (placedCounts[s.placed] || 0);
            placedCounts[s.placed] = idx + 1;
            const slot = homeSlotPosition(home, idx);
            return { ...s, x: slot.x, y: slot.y, originX: slot.x, originY: slot.y, targetX: slot.x, targetY: slot.y };
          }
          const fresh = piled[i];
          return { ...s, x: fresh.x, y: fresh.y, originX: fresh.x, originY: fresh.y, targetX: fresh.x, targetY: fresh.y };
        });
      } else {
        initState();
      }
    };
    handle();
    const ro = new ResizeObserver(handle);
    ro.observe(c);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initState]);

  // ── Animation loop ───────────────────────────────────────
  useEffect(() => {
    let running = true;
    function loop() {
      if (!running) return;
      tick();
      draw();
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => { running = false; if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Pause input during transitions ──────────────────────
  const inputAllowed = phase === 'playing';

  // ── Tick: advance per-shape animations ───────────────────
  function tick() {
    const st = stateRef.current;
    if (!st) return;
    const now = performance.now();

    st.shapes.forEach(s => {
      if (!s.animType) return;
      const dur = s.animType === 'bounce' ? BOUNCE_MS
                : s.animType === 'snap'   ? SNAP_MS
                : s.animType === 'floatback' ? FLOATBACK_MS
                : SNAP_MS;
      const t = Math.min(1, (now - s.animStart) / dur);
      const eased = easeOut(t);
      s.x = s.fromX + (s.targetX - s.fromX) * eased;
      s.y = s.fromY + (s.targetY - s.fromY) * eased;
      if (t >= 1) {
        const finishingType = s.animType;
        s.animType = null;
        if (finishingType === 'snap' && s.pendingHome) {
          s.placed = s.pendingHome;
          s.pendingHome = null;
          s.originX = s.x;
          s.originY = s.y;
          st.placedCount += 1;
          // Trigger a per-home pulse + ascending ping.
          const home = st.homes.find(h => h.name === s.placed);
          if (home) home.pulseStart = performance.now();
          sound.ping();
          if (st.placedCount === SHAPES.length && !st.completed && !completedFiredRef.current) {
            st.completed = true;
            completedFiredRef.current = true;
            // Fire after a tiny pause so the last pulse plays first.
            setTimeout(() => onLevelComplete?.(), 240);
          }
        }
      }
    });

    // Update home pulse timer.
    st.homes.forEach(h => {
      if (h.pulseStart) {
        const t = (now - h.pulseStart) / PULSE_MS;
        if (t >= 1) {
          h.pulseStart = null;
          h.pulseT = 0;
        } else {
          h.pulseT = 1 - t;
        }
      }
    });
  }

  // ── Render ───────────────────────────────────────────────
  function draw() {
    const st = stateRef.current;
    const canvas = canvasRef.current;
    if (!st || !canvas) return;
    const ctx = canvas.getContext('2d');
    const { w, h } = sizeRef.current;
    const dpr = dprRef.current;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Level-progress bars (no words) at the very top
    drawLevelBars(ctx, st.level.id, w);

    // Pile container — soft cream rounded rect that holds the loose,
    // not-yet-sorted shapes. Drawn behind the shapes so it reads as a
    // tray they sit on top of.
    drawPileContainer(ctx, st.shapes, w, h);

    // "Sort by Colour / Shape / Pattern" — sits just above the homes,
    // wherever they currently are (playing position or centred during
    // the transition beat). Always has clear vertical space.
    drawDimensionTitle(ctx, st.level, w, st.homes);

    // Homes (the labelled drop boxes)
    st.homes.forEach(home => drawHome(ctx, home, st.level));

    // Placed shapes (inside home interiors) get drawn before drag-active ones
    st.shapes.forEach(s => {
      if (!s.dragging) drawSingleShape(ctx, s, w);
    });

    // Dragging shape on top
    const dragShape = st.shapes.find(s => s.dragging);
    if (dragShape) drawSingleShape(ctx, dragShape, w);

    ctx.restore();
  }

  function drawSingleShape(ctx, s, canvasW) {
    const colour = SHAPE_COLOURS[s.colour];
    const lift = s.dragging ? 1.06 : 1;
    drawShape(ctx, {
      shape: s.shape,
      colour,
      colourName: s.colour,
      pattern: s.pattern,
      x: s.x,
      y: s.y,
      size: shapeSize(canvasW) * lift,
    });
  }

  // ── Pointer handlers ─────────────────────────────────────
  function getPointerCoords(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return { px: e.clientX - rect.left, py: e.clientY - rect.top };
  }

  const onPointerDown = (e) => {
    if (!inputAllowed) return;
    const st = stateRef.current;
    if (!st || st.completed) return;
    initAudio();
    const { px, py } = getPointerCoords(e);
    // Topmost first (reverse iter)
    for (let i = st.shapes.length - 1; i >= 0; i--) {
      const s = st.shapes[i];
      if (s.placed) continue;
      const r = shapeSize(sizeRef.current.w) / 2 + 6;
      if (Math.hypot(s.x - px, s.y - py) <= r * 1.2) {
        st.drag = { shapeId: s.id, offX: s.x - px, offY: s.y - py, pid: e.pointerId };
        s.dragging = true;
        s.animType = null;
        // Move shape to top of array so subsequent draws render it last.
        st.shapes.splice(i, 1);
        st.shapes.push(s);
        try { canvasRef.current.setPointerCapture(e.pointerId); } catch { /* noop */ }
        e.preventDefault();
        return;
      }
    }
  };

  const onPointerMove = (e) => {
    const st = stateRef.current;
    if (!st || !st.drag) return;
    const { px, py } = getPointerCoords(e);
    const s = st.shapes.find(sh => sh.id === st.drag.shapeId);
    if (s) {
      s.x = px + st.drag.offX;
      s.y = py + st.drag.offY;
    }
  };

  const finishDrag = (e) => {
    const st = stateRef.current;
    if (!st || !st.drag) return;
    const s = st.shapes.find(sh => sh.id === st.drag.shapeId);
    try { canvasRef.current.releasePointerCapture(e.pointerId); } catch { /* noop */ }
    st.drag = null;
    if (!s) return;
    s.dragging = false;

    const homeUnder = st.homes.find(h => pointInHome(s.x, s.y, h));
    const correct = getCorrectHome(s, st.level.dimension, st.level.homes);

    if (homeUnder && homeUnder.name === correct) {
      // Snap into next available slot inside the home.
      const slotIdx = st.shapes.filter(sh => sh.placed === homeUnder.name).length;
      const slot = homeSlotPosition(homeUnder, slotIdx);
      s.fromX = s.x; s.fromY = s.y;
      s.targetX = slot.x; s.targetY = slot.y;
      s.animType = 'snap';
      s.animStart = performance.now();
      s.pendingHome = homeUnder.name;
      sound.thunk();
      // Tell the parent — passes the drop position in viewport CSS px
      // so a toast can be positioned just above where the shape landed.
      const rect = canvasRef.current?.getBoundingClientRect();
      const clientY = rect ? rect.top + s.fromY : null;
      onCorrectDrop?.({ clientY });
    } else {
      // Wrong drop OR released into empty space → bounce back gently.
      s.fromX = s.x; s.fromY = s.y;
      s.targetX = s.originX; s.targetY = s.originY;
      s.animType = 'bounce';
      s.animStart = performance.now();
      if (homeUnder) sound.boop(); // wrong-home feedback
    }
  };

  const onPointerUp = (e) => finishDrag(e);
  const onPointerCancel = (e) => finishDrag(e);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'relative',
        touchAction: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
        }}
      />
    </div>
  );
}

// ── Layout helpers ────────────────────────────────────────

function shapeSize(canvasW) {
  // Scale shape size with canvas width, clamped to a friendly range.
  return Math.max(38, Math.min(60, canvasW * 0.13));
}

function buildShapes(w, h) {
  // 6 shapes in a tight 3-col × 2-row pile. Rows are pulled close
  // together (small gap between them) so the second row doesn't sit
  // far below the first. Order is shuffled per build so the layout
  // changes every load / level / Play Again.
  const bounds = pileBounds(w, h);
  const cols = 3;
  const cellW = bounds.w / cols;
  const ss = shapeSize(w);
  const rowGap = 8;
  const totalRowsH = ss * 2 + rowGap;
  const rowsTop = bounds.y + (bounds.h - totalRowsH) / 2;
  const order = shuffleIndices(SHAPES.length);
  return SHAPES.map((s, i) => {
    const slot = order[i];
    const col = slot % cols;
    const row = Math.floor(slot / cols);
    const x = bounds.x + cellW * col + cellW / 2;
    const y = rowsTop + row * (ss + rowGap) + ss / 2;
    return {
      ...s,
      x, y,
      originX: x, originY: y,
      targetX: x, targetY: y,
      fromX: x,   fromY: y,
      placed: null,
      pendingHome: null,
      dragging: false,
      animType: null,
      animStart: 0,
    };
  });
}

/** Fisher–Yates shuffle returning [0..n-1] in random order. */
function shuffleIndices(n) {
  const out = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Bounding box of the pile container — used by both layout and rendering.
    Sized to snugly fit two rows of shapes with a small gap between, plus
    inner padding. */
const PILE_TO_HOMES_GAP = 36;
function pileBounds(w, h) {
  const ss = shapeSize(w);
  const innerPad = 18;
  const rowGap = 8;
  const desiredH = ss * 2 + rowGap + innerPad * 2;

  const pileTop    = TITLE_HEIGHT + PILE_TOP_PAD;
  const pileBottom = h * (1 - HOME_HEIGHT_RATIO) - PILE_TO_HOMES_GAP;
  const availH    = Math.max(120, pileBottom - pileTop);
  const pileH     = Math.min(desiredH, availH);
  const pileW     = Math.min(320, w - 2 * PILE_HORIZ_PAD);
  return {
    x: (w - pileW) / 2,
    y: pileTop,
    w: pileW,
    h: pileH,
  };
}

function makeHomes(level, w, h, phase = 'playing') {
  const homeWidth = (w - 2 * HOME_HORIZ_PAD - 2 * HOME_GAP) / 3;
  const homeHeight = h * HOME_HEIGHT_RATIO;
  // During transitioning, homes shift up to vertical centre so there's
  // clear space below them for the Next button.
  const isTransitioning = phase === 'transitioning';
  const top = isTransitioning
    ? Math.max(TITLE_HEIGHT + 60, (h - homeHeight) / 2 - 20)
    : h - homeHeight - HOME_BOTTOM_PAD;
  return level.homes.map((name, i) => {
    const x = HOME_HORIZ_PAD + (homeWidth + HOME_GAP) * i;
    return {
      name,
      x,
      y: top,
      w: homeWidth,
      h: homeHeight,
      cx: x + homeWidth / 2,
      cy: top + homeHeight / 2,
      pulseStart: null,
      pulseT: 0,
    };
  });
}

function homeSlotPosition(home, slotIdx) {
  // Two placed shapes stack VERTICALLY in the lower portion of the box,
  // below the solid coloured banner.
  const bannerH     = home.h * BANNER_HEIGHT_RATIO;
  const interiorTop = home.y + bannerH + 12;
  const interiorH   = home.h - bannerH - 24;
  const cellH       = interiorH / 2;
  return {
    x: home.x + home.w / 2,
    y: interiorTop + cellH * slotIdx + cellH / 2,
  };
}

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

// ── Drawing primitives ────────────────────────────────────

// Clean pastel-box design — one rounded rect per home, tinted to match the
// category (for L1) or kept neutral (L2 / L3). A small label icon sits at
// the top of each box; the placed shapes stack vertically below it.

const PATTERN_INK = '#5C5247';

const DIMENSION_LABELS = {
  colour:  'Sort by Colour',
  shape:   'Sort by Shape',
  pattern: 'Sort by Pattern',
};

/** Three small bars at the top of the canvas. Active level filled in
    primary blue, completed levels in dimmed gold, future levels in
    pale grey. No text. */
function drawLevelBars(ctx, currentLevel, w) {
  const total = 3;
  const gap = 8;
  const horizPad = 80;          // pull in from the edges so they look like a unit
  const totalW = w - 2 * horizPad;
  const barW = (totalW - gap * (total - 1)) / total;
  const y = LEVEL_BAR_TOP_PAD;
  ctx.save();
  for (let i = 0; i < total; i++) {
    const lvl = i + 1;
    const x = horizPad + i * (barW + gap);
    let fill;
    if (lvl < currentLevel)      fill = 'rgba(232,184,64,0.55)';   // done
    else if (lvl === currentLevel) fill = '#3A6CE5';                  // active
    else                         fill = 'rgba(0,0,0,0.10)';         // upcoming
    ctx.fillStyle = fill;
    ctx.beginPath();
    roundRect(ctx, x, y, barW, LEVEL_BAR_HEIGHT, LEVEL_BAR_HEIGHT / 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Soft cream tray that holds the loose pile of unsorted shapes. Hidden
    once every shape has been placed (so the empty tray doesn't sit on
    the stage during the celebration beat). */
function drawPileContainer(ctx, shapes, w, h) {
  const anyUnplaced = shapes.some(s => !s.placed);
  if (!anyUnplaced) return;
  const b = pileBounds(w, h);
  ctx.save();
  ctx.shadowColor = 'rgba(60,40,15,0.10)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = '#FBF1D8';
  ctx.beginPath();
  roundRect(ctx, b.x, b.y, b.w, b.h, 18);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.beginPath();
  roundRect(ctx, b.x, b.y, b.w, b.h, 18);
  ctx.stroke();
  ctx.restore();
}

/** "Sort by Colour / Shape / Pattern" — sits just above the row of
    homes wherever they happen to be (playing or transitioning). Always
    has clear vertical space. */
function drawDimensionTitle(ctx, level, w, homes) {
  const label = DIMENSION_LABELS[level.dimension] || '';
  if (!label || !homes.length) return;
  const homesTop = homes[0].y;
  const cy = homesTop - 22;
  ctx.save();
  ctx.font = '900 20px Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#3A6CE5';
  ctx.fillText(label, w / 2, cy);
  ctx.restore();
}

/** Pastel fill + matching darker border for each home, per level. */
function boxPalette(home, level) {
  if (level.dimension === 'colour') {
    if (home.name === 'Red')    return { bg: '#FBD9D9', border: '#E27272' };
    if (home.name === 'Blue')   return { bg: '#D9E2FA', border: '#7691DC' };
    if (home.name === 'Others') return { bg: '#ECE5D2', border: '#B6AC97' };
  }
  // Neutral cream + warm border for L2 / L3 — the icon at the top of the
  // box tells the kid the rule, not the box colour itself.
  return { bg: '#FBF1D8', border: '#D9C99C' };
}

function drawHome(ctx, home, level) {
  const palette = boxPalette(home, level);
  const bannerH = home.h * BANNER_HEIGHT_RATIO;

  ctx.save();

  // Drop shadow under the whole box
  ctx.shadowColor = 'rgba(60,40,15,0.14)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;

  // Outer box — pastel fill (this is the "tray" the shapes sit on)
  ctx.fillStyle = palette.bg;
  ctx.beginPath();
  roundRect(ctx, home.x, home.y, home.w, home.h, 22);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Top bar — full width within the rounded corners. Three flavours:
  //   L1 colour → solid red / blue / neutral
  //   L3 pattern → dot or stripe pattern fills the bar
  //   Otherwise → neutral fill + centred icon / "Others" text
  if (level.dimension === 'pattern' && home.name !== 'Others') {
    drawPatternBar(ctx, home, bannerH, home.name === 'Dots' ? 'dots' : 'stripes');
  } else {
    ctx.fillStyle = bannerBackground(home, level);
    roundRectTop(ctx, home.x, home.y, home.w, bannerH, 22);
    ctx.fill();
    drawBannerContent(ctx, home, level, home.x + home.w / 2, home.y + bannerH / 2, bannerH);
  }

  // Hairline outer border — drawn on top so it sits cleanly over both
  // the bar and the body, hiding the seam where they meet.
  ctx.lineWidth = 1;
  ctx.strokeStyle = palette.border;
  ctx.beginPath();
  roundRect(ctx, home.x, home.y, home.w, home.h, 22);
  ctx.stroke();

  // Pulse outline on correct drop
  if (home.pulseT > 0) {
    ctx.strokeStyle = `rgba(232,184,64,${(home.pulseT * 0.9).toFixed(3)})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    roundRect(ctx, home.x, home.y, home.w, home.h, 22);
    ctx.stroke();
  }

  ctx.restore();
}

function bannerBackground(home, level) {
  if (home.name === 'Others') return '#C9C0A8';            // neutral-grey bar
  if (level.dimension === 'colour') {
    if (home.name === 'Red')  return SHAPE_COLOURS.red;
    if (home.name === 'Blue') return SHAPE_COLOURS.blue;
  }
  return '#F0EBDF';                                         // cream for L2 named homes
}

function drawBannerContent(ctx, home, level, cx, cy, bannerH) {
  // "Others" bar uses the word in white/off-white for contrast on the
  // neutral-grey banner colour.
  if (home.name === 'Others') {
    ctx.font = `900 ${Math.round(bannerH * 0.30)}px Nunito, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFAEB';
    ctx.fillText('Others', cx, cy);
    return;
  }
  // L1 colour bars are pure colour — no icon.
  if (level.dimension === 'colour') return;
  // L2 shape bars — solid filled icon in deep brown for contrast on cream
  if (level.dimension === 'shape') {
    const iconSize = bannerH * 0.62;
    ctx.fillStyle = '#5C5247';
    if (home.name === 'Circle') {
      ctx.beginPath();
      ctx.arc(cx, cy, iconSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (home.name === 'Square') {
      ctx.beginPath();
      roundRect(ctx, cx - iconSize / 2, cy - iconSize / 2, iconSize, iconSize, 8);
      ctx.fill();
    }
  }
}

/** L3 named-home banner — full pattern fill across the top bar. */
function drawPatternBar(ctx, home, bannerH, pattern) {
  ctx.save();
  roundRectTop(ctx, home.x, home.y, home.w, bannerH, 22);
  ctx.clip();

  ctx.fillStyle = '#EEE9DD';
  ctx.fillRect(home.x, home.y, home.w, bannerH);

  if (pattern === 'dots') {
    // L3 banner stays neutral grey so the kid never reads it as a
    // colour cue — pattern is the only rule here.
    drawGiraffeSpots(ctx, home.x, home.y, home.w, bannerH, '#9A8F82');
  } else if (pattern === 'stripes') {
    // Soft wavy diagonal stripes — grey to match the dots banner so
    // the kid reads the rule as "pattern", not "colour".
    ctx.strokeStyle = '#9A8F82';
    ctx.lineWidth = Math.max(8, bannerH * 0.20);
    ctx.lineCap = 'round';
    const spacing = Math.max(20, bannerH * 0.55);
    let seed = 0;
    for (let off = -bannerH * 1.5; off <= home.w + bannerH * 1.5; off += spacing) {
      const w1 = (((seed * 13) % 7) - 3) * (bannerH * 0.04);
      const w2 = (((seed * 7)  % 7) - 3) * (bannerH * 0.04);
      const x0 = home.x + off, y0 = home.y;
      const x1 = home.x + off + bannerH, y1 = home.y + bannerH;
      ctx.beginPath();
      ctx.moveTo(x0 + w1, y0);
      ctx.bezierCurveTo(
        x0 + (x1 - x0) * 0.30 + w2 * 1.8, y0 + bannerH * 0.30,
        x0 + (x1 - x0) * 0.70 + w1 * 1.8, y0 + bannerH * 0.70,
        x1 + w2,                          y1,
      );
      ctx.stroke();
      seed += 1;
    }
  }
  ctx.restore();
}
