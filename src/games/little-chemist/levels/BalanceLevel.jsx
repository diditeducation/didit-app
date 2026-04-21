import { useState, useRef } from 'react';
import { getAudioContext } from '../../../design-system/audioContext';

const PLANK_W  = 340;
const PLANK_H  = 18;
const ATOM_SIZE = 40;  // same size everywhere
const GROUP_H  = 155;   // tall enough for 3 rows of 40px atoms + plank
const ORIGIN_X = PLANK_W / 2;              // 170
const ORIGIN_Y = GROUP_H - PLANK_H / 2;   // 146  (centre of plank bar)

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function playDrop() {
  try {
    const ac = getAudioContext();
    const o = ac.createOscillator(); const g = ac.createGain();
    o.type = 'sine'; o.frequency.value = 520;
    g.gain.setValueAtTime(0.3, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
    o.connect(g); g.connect(ac.destination);
    o.start(); o.stop(ac.currentTime + 0.14);
  } catch (_) {}
}

function playCelebration() {
  try {
    const ac = getAudioContext();
    [523, 659, 784, 1047, 1319].forEach((freq, i) => {
      const o = ac.createOscillator(); const g = ac.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      const t = ac.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.20);
      o.connect(g); g.connect(ac.destination);
      o.start(t); o.stop(t + 0.22);
    });
  } catch (_) {}
}

function AtomCircle({ el }) {
  return (
    <div style={{
      width: ATOM_SIZE, height: ATOM_SIZE, borderRadius: '50%',
      background: el.fill,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: el.symbol.length > 1 ? ATOM_SIZE * 0.26 : ATOM_SIZE * 0.32,
      fontWeight: 600, color: el.text,
      fontFamily: "'Nunito', sans-serif",
      flexShrink: 0, userSelect: 'none',
      WebkitUserSelect: 'none',
    }}>
      {el.symbol}
    </div>
  );
}

function Badge({ count, isLeft, balanced }) {
  const solid = isLeft || balanced;
  const bg    = isLeft ? '#2EA820' : balanced ? '#2EA820' : '#EE6A30';
  return (
    <div style={{
      width: 52, height: 52, borderRadius: '50%',
      background: bg,
      boxShadow: solid ? 'inset 0 0 0 3px rgba(255,255,255,0.75)' : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.6rem', fontWeight: 900, color: 'white',
      fontFamily: "'Nunito', sans-serif",
      transition: 'background 0.4s ease, box-shadow 0.4s ease',
      flexShrink: 0, position: 'relative',
    }}>
      {!solid && (
        <div style={{
          position: 'absolute', inset: 4, borderRadius: '50%',
          border: '3px dashed rgba(255,255,255,0.75)',
          pointerEvents: 'none',
        }} />
      )}
      {count}
    </div>
  );
}

const ATOM_POP_IN = `
  @keyframes atomPopIn {
    0%   { transform: scale(0.1); opacity: 0; }
    60%  { transform: scale(1.25); opacity: 1; }
    80%  { transform: scale(0.9); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
`;

// ─────────────────────────────────────────────────────────────
export default function BalanceLevel({ leftCount, traySupply, element, onMilestone }) {
  const [rightCount, setRightCount] = useState(0);
  const [balanced,   setBalanced]   = useState(false);
  const triggered = useRef(false);

  // Negative = left side goes down (left heavier)
  const tilt = balanced ? 0 : clamp(-(leftCount - rightCount) * 8, -22, 22);

  function addAtom() {
    if (triggered.current || rightCount >= leftCount) return;
    const n = rightCount + 1;
    setRightCount(n);
    playDrop();
    if (n === leftCount) {
      setBalanced(true);
      playCelebration();
      triggered.current = true;
      setTimeout(() => onMilestone?.(50, 50), 800);
    }
  }

  const seatW = PLANK_W / 2 - 14; // ~156 px per side
  // Force 2×2 grid when leftCount is 4
  const atomContainerW = leftCount === 4 ? ATOM_SIZE * 2 + 4 : seatW;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', userSelect: 'none', WebkitUserSelect: 'none' }}>
      <style>{ATOM_POP_IN}</style>

      {/* Element name pill */}
      <div style={{ textAlign: 'center', padding: '10px 0 6px' }}>
        <span style={{
          display: 'inline-block', padding: '6px 20px',
          color: element.dark,
          fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '1.6rem',
          letterSpacing: 0.3,
        }}>
          {element.name}
        </span>
      </div>

      {/* Badges row — above seesaw */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 20px 0' }}>
        <Badge count={leftCount} isLeft={true} balanced={false} />
        <Badge count={rightCount} isLeft={false} balanced={balanced} />
      </div>

      {/* Gap between badges and seesaw */}
      <div style={{ height: 32 }} />

      {/* ── Seesaw area ─────────────────────────────────── */}
      <div style={{ height: 190, position: 'relative', flexShrink: 0, width: '100%' }}>

        {/* Ground strip */}
        <div style={{
          position: 'absolute', bottom: 12, left: 0, right: 0,
          height: 6, background: '#2EA820', borderRadius: 3,
        }} />

        {/* Fulcrum — centred with margin:auto */}
        <div style={{
          position: 'absolute', bottom: 36,
          left: 0, right: 0, width: 56, margin: '0 auto',
          height: 54,
        }}>
          <div style={{
            position: 'absolute', bottom: 0, left: 0,
            width: 0, height: 0,
            borderLeft: '28px solid transparent',
            borderRight: '28px solid transparent',
            borderBottom: '54px solid #8D6E63',
          }} />
          {/* Pivot cap — centred inside wrapper */}
          <div style={{
            position: 'absolute', top: -9, left: '50%',
            transform: 'translateX(-50%)',
            width: 18, height: 18, borderRadius: '50%',
            background: '#6D4C41', border: '3px solid #BCAAA4',
          }} />
        </div>

        {/* ── Rotating plank group — centred with margin:auto ── */}
        <div style={{
          position: 'absolute',
          bottom: 81,
          left: 0, right: 0, margin: '0 auto',
          width: PLANK_W,
          height: GROUP_H,
          transform: `rotate(${tilt}deg)`,
          transformOrigin: `${ORIGIN_X}px ${ORIGIN_Y}px`,
          transition: 'transform 0.45s cubic-bezier(0.34, 1.2, 0.64, 1)',
        }}>

          {/* Left atoms — above left half of plank */}
          <div style={{
            position: 'absolute', bottom: PLANK_H + 4, left: 8, width: seatW,
            display: 'flex', flexWrap: 'wrap', gap: 4,
            justifyContent: 'center', alignItems: 'flex-end',
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', width: atomContainerW }}>
              {Array.from({ length: leftCount }).map((_, i) => (
                <AtomCircle key={i} el={element} />
              ))}
            </div>
          </div>

          {/* Right atoms — above right half of plank */}
          <div style={{
            position: 'absolute', bottom: PLANK_H + 4, right: 8, width: seatW,
            display: 'flex', flexWrap: 'wrap', gap: 4,
            justifyContent: 'center', alignItems: 'flex-end',
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', width: atomContainerW }}>
              {Array.from({ length: rightCount }).map((_, i) => (
                <div key={i} style={{ animation: i === rightCount - 1 ? 'atomPopIn 0.3s ease-out' : 'none' }}>
                  <AtomCircle el={element} />
                </div>
              ))}
            </div>
          </div>

          {/* Plank bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: PLANK_H,
            background: '#8D6E63',
            borderRadius: 6,
          }} />
        </div>
      </div>


      {/* Gap between seesaw and tray */}
      <div style={{ height: 32 }} />

      {/* ── Atom tray ────────────────────────────────────── */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{
          background: 'rgba(0,0,0,0.05)', borderRadius: 22,
          padding: '10px 16px 14px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            fontFamily: "'Nunito', sans-serif", fontWeight: 700,
            fontSize: '0.8rem', color: 'rgba(0,0,0,0.35)', letterSpacing: 0.2,
          }}>Tap to add and balance both sides</span>
          <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 10, justifyContent: 'center' }}>
          {Array.from({ length: 6 }).map((_, i) => {
            const used = i < rightCount;
            return (
              <div
                key={i}
                onPointerDown={() => !used && addAtom()}
                style={{
                  transform: used ? 'scale(0)' : 'scale(1)',
                  cursor: used ? 'default' : 'pointer',
                  transition: 'transform 0.22s ease-in',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                }}
              >
                <AtomCircle el={element} />
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}
