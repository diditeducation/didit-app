import { useState, useEffect, useRef } from 'react';
import { initAudio, sound } from '../audio';

// ─── Design ────────────────────────────────────────────────────────────────
const BG   = '#0f1b2d';   // night sky (matches SolfegLevel)
const EDGE = '#1e3460';

// C4 → E4 → G4 → C5 — sounds musical in any combination
const MELODY_NOTES = [261.63, 329.63, 392.00, 523.25];

const LAYERS = [
  { id: 'melody', emoji: '🎹', color: '#CF4A4A', play: (col) => sound.melodyNote(MELODY_NOTES[col]) },
  { id: 'kick',   emoji: '🥁', color: '#E8C840', play: ()    => sound.kick()   },
  { id: 'hihat',  emoji: '🎩', color: '#54A0FF', play: ()    => sound.hihat()  },
  { id: 'snare',  emoji: '🪘', color: '#1DD1A1', play: ()    => sound.snare()  },
  { id: 'bass',   emoji: '🎸', color: '#C8A2FF', play: ()    => sound.bass(0)  },
];

const BEATS   = 4;
const BPM     = 90;
const BEAT_MS = Math.round((60 / BPM) * 1000); // 667 ms

function makeGrid() {
  return LAYERS.map(() => Array(BEATS).fill(false));
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function MixLevel({ onMilestone }) {
  const [grid,    setGrid]    = useState(makeGrid);
  const [beatCol, setBeatCol] = useState(-1);   // -1 = stopped
  const [playing, setPlaying] = useState(false);
  const [done,    setDone]    = useState(false);

  // Refs so the setInterval closure always sees current values
  const gridRef          = useRef(makeGrid());
  const beatRef          = useRef(0);
  const intervalRef      = useRef(null);
  const milestoneFired   = useRef(false);

  // Keep gridRef in sync after every render
  useEffect(() => { gridRef.current = grid; }, [grid]);

  // Cleanup interval on unmount
  useEffect(() => () => clearInterval(intervalRef.current), []);

  // ── Sequencer ────────────────────────────────────────────────────────────
  const startLoop = () => {
    if (intervalRef.current) return;
    // Fire beat 0 immediately so there's no perceptible delay
    beatRef.current = 0;
    setBeatCol(0);
    gridRef.current.forEach((row, li) => { if (row[0]) LAYERS[li].play(0); });

    intervalRef.current = setInterval(() => {
      const next = (beatRef.current + 1) % BEATS;
      beatRef.current = next;
      setBeatCol(next);
      gridRef.current.forEach((row, li) => { if (row[next]) LAYERS[li].play(next); });
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

  // ── Grid interaction ─────────────────────────────────────────────────────
  const toggleCell = (li, col) => {
    if (done) return;
    initAudio();

    // Read old value from ref (grid state hasn't updated yet)
    const wasOn = gridRef.current[li][col];
    setGrid(prev =>
      prev.map((row, ri) =>
        ri === li ? row.map((c, ci) => (ci === col ? !c : c)) : row
      )
    );
    if (!wasOn) LAYERS[li].play(col); // preview on activate

    // Auto-start sequencer on first tap
    if (!playing) { setPlaying(true); startLoop(); }
  };

  // ── Milestone: 3+ different layers have at least one active cell ─────────
  useEffect(() => {
    if (milestoneFired.current) return;
    const activeLayers = grid.filter(row => row.some(Boolean)).length;
    if (activeLayers >= 3) {
      milestoneFired.current = true;
      setDone(true);
    }
  }, [grid]);

  const handleNext = () => {
    onMilestone(50, 50);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flex: 1, width: '100%',
      flexDirection: 'column', gap: 10,
    }}>
      {/* ── Sequencer card ─────────────────────────────────────────────── */}
      <div style={{
        width: '100%',
        background: BG,
        borderRadius: 18,
        border: `3px solid ${done ? 'var(--game-primary)' : EDGE}`,
        boxSizing: 'border-box',
        padding: '14px 12px',
        transition: 'border-color 0.35s ease',
      }}>

        {/* Top bar: BPM pill + play/pause */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 14,
        }}>
          {/* BPM pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.09)',
            borderRadius: 20, padding: '5px 13px',
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: playing ? '#1DD1A1' : 'rgba(255,255,255,0.22)',
              boxShadow: playing ? '0 0 7px #1DD1A1' : 'none',
              transition: 'background 0.3s, box-shadow 0.3s',
            }} />
            <span style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: '0.7rem', fontWeight: 700,
              color: 'rgba(255,255,255,0.72)',
              letterSpacing: '0.04em',
            }}>
              {BPM} BPM
            </span>
          </div>

          {/* Play / Pause */}
          <button
            onPointerDown={togglePlay}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: playing
                ? 'rgba(255,255,255,0.12)'
                : 'var(--game-primary)',
              border: 'none', cursor: 'pointer',
              touchAction: 'manipulation',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.15rem',
              color: '#fff',
              transition: 'background 0.2s',
            }}
          >
            {playing ? '⏸' : '▶'}
          </button>
        </div>

        {/* ── Grid ─────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {LAYERS.map((layer, li) => (
            <div key={layer.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

              {/* Layer emoji label */}
              <div style={{
                width: 36, height: 50, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem',
              }}>
                {layer.emoji}
              </div>

              {/* Beat cells */}
              {Array.from({ length: BEATS }, (_, col) => {
                const on        = grid[li][col];
                const isCurrent = playing && beatCol === col;
                return (
                  <button
                    key={col}
                    onPointerDown={() => toggleCell(li, col)}
                    style={{
                      flex: 1, height: 50,
                      borderRadius: 10, border: 'none',
                      cursor: 'pointer', touchAction: 'manipulation',
                      // Background: full color when on, subtle highlight on current beat
                      background: on
                        ? layer.color
                        : isCurrent
                          ? 'rgba(255,255,255,0.13)'
                          : 'rgba(255,255,255,0.05)',
                      // Glow: strong on active+current, gentle when just active
                      boxShadow: on && isCurrent
                        ? `0 0 20px ${layer.color}bb`
                        : on
                          ? `0 0 8px ${layer.color}55`
                          : 'none',
                      // Slight dim when the sequencer "hits" this active cell
                      opacity: on && isCurrent ? 0.82 : 1,
                      transition: 'background 0.08s, box-shadow 0.08s, opacity 0.06s',
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* ── Beat indicator bars ──────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          {/* Spacer aligns bars under the cells, not under the emoji */}
          <div style={{ width: 36, flexShrink: 0 }} />
          {Array.from({ length: BEATS }, (_, i) => (
            <div key={i} style={{
              flex: 1, height: 6, borderRadius: 3,
              background: playing && beatCol === i
                ? '#FECA57'
                : 'rgba(255,255,255,0.14)',
              transition: 'background 0.08s',
            }} />
          ))}
        </div>
      </div>

      {/* ── Next button (appears once 3 layers are active) ─────────────── */}
      {done && (
        <button
          onPointerDown={handleNext}
          style={{
            width: '100%',
            padding: '16px 0',
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
      )}
    </div>
  );
}
