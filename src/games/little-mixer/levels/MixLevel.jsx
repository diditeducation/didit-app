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
  { id: 'bass',  emoji: '🎸', name: 'Bass',   color: colors.grassMid,      play: ()    => sound.bass(0)   },
];

// Instrument sets and milestone thresholds per level
const LEVEL_LAYERS = {
  1: ['piano', 'chime'],
  2: ['piano', 'drum', 'bass'],
  3: ['piano', 'hihat', 'snare', 'bass'],
  4: ['piano', 'chime', 'snare', 'bass', 'drum'],
};
const MILESTONE_AT = { 1: 2, 2: 2, 3: 2, 4: 3 };

const BEATS   = 4;
const BPM     = 100;
const BEAT_MS = Math.round((60 / BPM) * 1000);

// ─── Component ─────────────────────────────────────────────────────────────
export default function MixLevel({ level = 1, onMilestone }) {
  // Stable layer list for this mount (level never changes within a mount)
  const layersRef = useRef(
    LEVEL_LAYERS[level]
      .map(id => ALL_LAYERS.find(l => l.id === id))
  );
  const layers = layersRef.current;

  const makeGrid = () => layers.map((_, li) => Array(BEATS).fill(li === 0)); // piano row on by default

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
    <div style={{
      display: 'flex', flex: 1, width: '100%',
      flexDirection: 'column', gap: 12,
    }}>
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

        {/* Top bar: BPM pill + play/pause */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 18,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(0,0,0,0.05)',
            borderRadius: 20, padding: '5px 13px',
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: playing ? colors.grassMid : 'rgba(0,0,0,0.18)',
              boxShadow: playing ? `0 0 7px ${colors.grassMid}` : 'none',
              transition: 'background 0.3s, box-shadow 0.3s',
            }} />
            <span style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: '0.7rem', fontWeight: 700,
              color: 'rgba(0,0,0,0.5)',
              letterSpacing: '0.04em',
            }}>
              {BPM} BPM
            </span>
          </div>

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

              {/* Beat cells — circles */}
              {Array.from({ length: BEATS }, (_, col) => {
                const on        = grid[li][col];
                const isCurrent = playing && beatCol === col;
                return (
                  <button
                    key={col}
                    onPointerDown={() => toggleCell(li, col)}
                    style={{
                      flex: 1,
                      aspectRatio: '1 / 1',
                      borderRadius: '50%',
                      border: 'none',
                      cursor: 'pointer',
                      touchAction: 'manipulation',
                      background: on
                        ? layer.color
                        : isCurrent
                          ? 'rgba(0,0,0,0.10)'
                          : 'rgba(0,0,0,0.05)',
                      boxShadow: on && isCurrent
                        ? `0 0 20px ${layer.color}bb`
                        : on
                          ? `0 0 10px ${layer.color}66`
                          : 'none',
                      opacity: on && isCurrent ? 0.82 : 1,
                      transition: 'background 0.08s, box-shadow 0.08s, opacity 0.06s',
                    }}
                  />
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
                background: playing && beatCol === i
                  ? 'var(--game-primary)'
                  : 'rgba(0,0,0,0.12)',
                boxShadow: playing && beatCol === i
                  ? '0 0 8px var(--game-primary)' : 'none',
                transition: 'background 0.08s, box-shadow 0.08s',
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Next button (appears once milestone reached) ────────────────── */}
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
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
}
