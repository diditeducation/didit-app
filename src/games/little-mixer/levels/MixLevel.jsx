import { useState, useEffect, useRef } from 'react';
import { initAudio, sound } from '../audio';
import { colors } from '../../../design-system/tokens';

// C4 → E4 → G4 → C5 — sounds musical in any combination
const MELODY_NOTES = [261.63, 329.63, 392.00, 523.25];

const ALL_LAYERS = [
  { id: 'piano', emoji: '🎹', name: 'Piano',  color: colors.coralMid,      play: (col) => sound.melodyNote(MELODY_NOTES[col]) },
  { id: 'chime', emoji: '🔔', name: 'Chime',  color: colors.sky,           play: ()    => sound.chime()   },
  { id: 'drum',  emoji: '🥁', name: 'Drum',   color: colors.sunDark,       play: ()    => sound.kick()    },
  { id: 'hihat', emoji: '🎩', name: 'Hi-Hat', color: colors.blueberryDark, play: ()    => sound.hihat()   },
  { id: 'snare', emoji: '🪘', name: 'Snare',  color: colors.blueberryMid,  play: ()    => sound.snare()   },
  { id: 'bass',    emoji: '🎈', name: 'Boing',   color: colors.grassMid,   play: ()    => sound.boing()   },
  { id: 'bubbles', emoji: '🫧', name: 'Bubbles', color: colors.sky,        play: ()    => sound.bubbles() },
];

const LEVEL_LAYERS = {
  1: ['piano', 'drum'],
  2: ['piano', 'drum', 'bass'],
  3: ['piano', 'chime', 'snare', 'bass'],
  4: ['piano', 'chime', 'snare', 'bubbles', 'drum'],
};
const MILESTONE_AT = { 1: 2, 2: 2, 3: 2, 4: 3 };

// Fixed circle diameter — chosen so Full Mix (5 rows) is ~75% of the original height
const CELL_SIZE = 42;

const BEATS = 4;
const BPM   = 100;
const BEAT_MS = Math.round((60 / BPM) * 1000);

// ─── Component ─────────────────────────────────────────────────────────────
export default function MixLevel({ level = 1, isLast = false, onMilestone }) {
  const layersRef = useRef(
    LEVEL_LAYERS[level].map(id => ALL_LAYERS.find(l => l.id === id))
  );
  const layers = layersRef.current;

  const makeGrid = () => layers.map((_, li) => Array(BEATS).fill(li === 0));

  const [grid,    setGrid]    = useState(makeGrid);
  const [beatCol, setBeatCol] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [done,    setDone]    = useState(false);

  const gridRef        = useRef(makeGrid());
  const beatRef        = useRef(0);
  const intervalRef    = useRef(null);
  const milestoneFired = useRef(false);

  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => () => clearInterval(intervalRef.current), []);

  // ── Sequencer ────────────────────────────────────────────────────────────
  const startLoop = () => {
    if (intervalRef.current) return;
    beatRef.current = 0;
    setBeatCol(0);
    gridRef.current.forEach((row, li) => { if (row[0]) layers[li].play(0); });

    intervalRef.current = setInterval(() => {
      const next = (beatRef.current + 1) % BEATS;
      beatRef.current = next;
      setBeatCol(next);
      gridRef.current.forEach((row, li) => { if (row[next]) layers[li].play(next); });
    }, BEAT_MS);
  };

  const stopLoop = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setBeatCol(-1);
  };

  const togglePlay = () => {
    initAudio();
    if (playing) { stopLoop(); setPlaying(false); }
    else         { startLoop(); setPlaying(true); }
  };

  // ── Grid interaction — always tappable ───────────────────────────────────
  const toggleCell = (li, col) => {
    initAudio();
    const wasOn = gridRef.current[li][col];
    setGrid(prev =>
      prev.map((row, ri) =>
        ri === li ? row.map((c, ci) => (ci === col ? !c : c)) : row
      )
    );
    if (!wasOn) layers[li].play(col);
    if (!playing) { setPlaying(true); startLoop(); }
  };

  // ── Milestone ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (milestoneFired.current) return;
    const activeLayers = grid.filter(row => row.some(Boolean)).length;
    if (activeLayers >= (MILESTONE_AT[level] ?? 2)) {
      milestoneFired.current = true;
      setDone(true);
    }
  }, [grid, level]);

  const handleNext = () => { onMilestone(50, 50); };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flex: 1, width: '100%', flexDirection: 'column', gap: 12 }}>
      {/* ── Sequencer card ─────────────────────────────────────────────── */}
      <div style={{
        width: '100%',
        background: '#fff',
        borderRadius: 24,
        border: `2px solid ${done ? 'var(--game-primary)' : 'rgba(0,0,0,0.08)'}`,
        boxSizing: 'border-box',
        padding: '18px 16px 20px',
        transition: 'border-color 0.35s ease',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>

        {/* Top bar: play/pause only */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
          <button
            onPointerDown={togglePlay}
            style={{
              width: 48, height: 48, borderRadius: '50%',
              background: playing ? 'rgba(0,0,0,0.07)' : 'var(--game-primary)',
              border: 'none', cursor: 'pointer',
              touchAction: 'manipulation',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.15rem',
              color: playing ? 'rgba(0,0,0,0.5)' : '#fff',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            {playing ? '⏸' : '▶'}
          </button>
        </div>

        {/* ── Grid ─────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {layers.map((layer, li) => (
            <div key={layer.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

              {/* Emoji + name label */}
              <div style={{
                width: 48, flexShrink: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2,
              }}>
                <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{layer.emoji}</span>
                <span style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '0.48rem', fontWeight: 800,
                  color: 'rgba(0,0,0,0.38)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  lineHeight: 1,
                }}>
                  {layer.name}
                </span>
              </div>

              {/* Beat cells — fixed-size circles inside flex wrappers for large tap area */}
              {Array.from({ length: BEATS }, (_, col) => {
                const on        = grid[li][col];
                const isCurrent = playing && beatCol === col;
                return (
                  <div
                    key={col}
                    onPointerDown={() => toggleCell(li, col)}
                    style={{
                      flex: 1,
                      height: CELL_SIZE,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', touchAction: 'manipulation',
                      // Yellow column highlight behind the circle
                      background: isCurrent ? 'rgba(254,202,87,0.28)' : 'transparent',
                      borderRadius: 10,
                      transition: 'background 0.08s',
                    }}
                  >
                    <div style={{
                      width: CELL_SIZE, height: CELL_SIZE,
                      borderRadius: '50%',
                      pointerEvents: 'none',
                      background: on
                        ? layer.color
                        : 'rgba(0,0,0,0.07)',
                      boxShadow: on && !isCurrent ? `0 0 10px ${layer.color}66` : 'none',
                      opacity: on && isCurrent ? 0.85 : 1,
                      transition: 'background 0.08s, box-shadow 0.08s, opacity 0.06s',
                    }} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── Beat indicator dots ──────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center' }}>
          <div style={{ width: 48, flexShrink: 0 }} />
          {Array.from({ length: BEATS }, (_, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: playing && beatCol === i ? '#FECA57' : 'rgba(0,0,0,0.12)',
                boxShadow: playing && beatCol === i ? '0 0 8px #FECA57' : 'none',
                transition: 'background 0.08s, box-shadow 0.08s',
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Next / Finished button ──────────────────────────────────────── */}
      {done && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onPointerDown={handleNext}
            style={{
              padding: '14px 40px',
              background: 'var(--game-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 9999,
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            {isLast ? 'Finished! 🎉' : 'Next ▶'}
          </button>
        </div>
      )}
    </div>
  );
}
