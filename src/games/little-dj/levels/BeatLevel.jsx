import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { initAudio, sound, analyser } from '../audio';

const C = {
  nightSky: '#0f1b2d',
  nightMid: '#162544',
  nightEdge: '#1e3460',
  warmGlow: '#ffd666',
  coralGlow: '#C23C3C',
};

/* 40 BPM = 1500ms per beat, ±600ms tap window */
const BEAT_INTERVAL = 1500;
const TAP_WINDOW = 600;

const KEYFRAMES_ID = 'didit-beat-level-keyframes';
const keyframesCSS = `
@keyframes twinkle{0%,100%{opacity:0.2}50%{opacity:0.8}}
@keyframes rippleOut{0%{width:115px;height:115px;opacity:0.6}100%{width:200px;height:200px;opacity:0}}
@keyframes heartPop{0%{transform:scale(0.85)}60%{transform:scale(1.18)}100%{transform:scale(1)}}
`;

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = keyframesCSS;
  document.head.appendChild(style);
}

/* ── Starfield ── */
const Starfield = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 70,
        size: 1.5 + Math.random() * 1.5,
        delay: Math.random() * 3,
        dur: 2.5 + Math.random() * 2,
      })),
    []
  );
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: '#fff',
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          background: 'linear-gradient(to top, #0a1220, transparent)',
        }}
      />
    </div>
  );
};

/* ── Mini Waveform (dark-themed, 30px) ── */
const MiniWaveform = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const node = analyser.getNode();
      if (node) {
        const bufLen = node.frequencyBinCount;
        const data = new Uint8Array(bufLen);
        node.getByteFrequencyData(data);
        const barW = (W / bufLen) * 2.5;
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, C.coralGlow);
        grad.addColorStop(0.5, '#C23C3C');
        grad.addColorStop(1, C.warmGlow);
        ctx.fillStyle = grad;
        for (let i = 0; i < bufLen; i++) {
          const barH = (data[i] / 255) * H * 0.8;
          ctx.fillRect(i * barW, H / 2 - barH / 2, barW - 1, barH || 2);
        }
      } else {
        const grad2 = ctx.createLinearGradient(0, 0, W, 0);
        grad2.addColorStop(0, 'rgba(255,107,107,0.3)');
        grad2.addColorStop(1, 'rgba(217,38,38,0.3)');
        ctx.strokeStyle = grad2;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const t = Date.now() / 1000;
        for (let x = 0; x < W; x++) {
          const y =
            H / 2 + Math.sin(x / 30 + t * 2) * 6 + Math.sin(x / 15 + t * 3) * 3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      animRef.current = requestAnimationFrame(draw);
    };

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth * 2;
      canvas.height = canvas.parentElement.offsetHeight * 2;
    };
    resize();
    window.addEventListener('resize', resize);
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 30,
        overflow: 'hidden',
        borderRadius: '0 0 25px 25px',
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

/* ── Beat Level ── */
export default function BeatLevel({ onMilestone }) {
  const [heartScale, setHeartScale] = useState(1);
  const [pulsePhase, setPulsePhase] = useState('rest');
  const [matched, setMatched] = useState(0);
  const [heartGlow, setHeartGlow] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [popping, setPopping] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [showHint, setShowHint] = useState(true);
  const milestoneFired = useRef(false);
  const rippleIdRef = useRef(0);
  const lastBeatRef = useRef(Date.now());

  useEffect(() => {
    injectKeyframes();
  }, []);

  /* Heartbeat pulse — 40 BPM (1500ms per beat, 375ms per phase step) */
  useEffect(() => {
    let step = 0;
    const stepMs = BEAT_INTERVAL / 4; // 375ms per phase
    const id = setInterval(() => {
      step = (step + 1) % 4;
      if (step === 0) {
        lastBeatRef.current = Date.now();
        setPulsePhase('lub');
        setHeartScale(1.28);
        initAudio();
        sound.heartbeat();
      } else if (step === 1) {
        setPulsePhase('window');
        setHeartScale(0.93);
      } else if (step === 2) {
        setPulsePhase('rest');
        setHeartScale(1.0);
      } else {
        setPulsePhase('rest');
        setHeartScale(1.03);
      }
    }, stepMs);
    return () => clearInterval(id);
  }, []);

  /* Tap detection — ±600ms around each beat */
  const handleTap = useCallback(() => {
    initAudio();
    setShowHint(false);
    /* Spawn a ripple ring on user press */
    const rid = rippleIdRef.current++;
    setRipples((prev) => [...prev, rid]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r !== rid));
    }, 800);

    /* Check if tap is within ±600ms of a beat */
    const now = Date.now();
    const timeSinceBeat = now - lastBeatRef.current;
    const timeToNextBeat = BEAT_INTERVAL - timeSinceBeat;
    const isOnBeat = timeSinceBeat <= TAP_WINDOW || timeToNextBeat <= TAP_WINDOW;

    if (isOnBeat) {
      setHeartGlow(true);
      setMatched((m) => {
        const next = Math.min(m + 1, 4);
        if (next >= 4 && !milestoneFired.current) {
          milestoneFired.current = true;
          onMilestone(50, 40);
        }
        return next;
      });
      setTimeout(() => setHeartGlow(false), 300);
    }
  }, [onMilestone]);

  const handlePointerDown = useCallback(() => {
    setPressed(true);
    setPopping(false);
    handleTap();
  }, [handleTap]);

  const handlePointerUp = useCallback(() => {
    setPressed(false);
    setPopping(true);
    setTimeout(() => setPopping(false), 300);
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (pressed) {
      setPressed(false);
      setPopping(true);
      setTimeout(() => setPopping(false), 300);
    }
  }, [pressed]);

  const isGlowing = matched > 0;

  const dots = [];
  for (let i = 0; i < 4; i++) {
    dots.push(
      <div
        key={i}
        style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: i < matched ? C.coralGlow : 'rgba(0,0,0,0.06)',
          border: `2px solid ${i < matched ? C.coralGlow : 'rgba(0,0,0,0.08)'}`,
          boxShadow: 'none',
          transition: 'all 0.3s',
        }}
      />
    );
  }

  const ecgPath =
    pulsePhase === 'lub'
      ? 'M0,14 L60,14 L80,14 L90,3 L100,25 L110,7 L120,14 L140,14 L300,14'
      : 'M0,14 L60,14 L80,14 L90,11 L100,17 L110,13 L120,14 L140,14 L300,14';

  /* Heart transform: pressed → scale down; popping → heartPop keyframe; else pulse scale */
  const heartTransform = pressed
    ? `scale(${heartScale * 0.85}) translateY(4px)`
    : `scale(${heartScale})`;

  const heartAnimation = popping ? 'heartPop 0.3s ease-out' : 'none';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        flex: 1,
        justifyContent: 'center',
        width: '100%',
      }}
    >
      {/* Scene card */}
      <div
        style={{
          width: 320,
          height: 340,
          borderRadius: 18,
          position: 'relative',
          overflow: 'hidden',
          background: isGlowing
            ? `radial-gradient(ellipse at 50% 35%, rgba(255,107,107,0.15), ${C.nightSky} 70%)`
            : C.nightSky,
          border: `3px solid ${isGlowing ? 'rgba(207,74,74,0.4)' : C.nightEdge}`,
          boxShadow: 'none',
          transition: 'all 0.6s ease',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Starfield />

        {/* Heart area */}
        <div
          style={{
            position: 'relative',
            width: 170,
            height: 170,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          {/* Outer ring */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `2px solid ${pulsePhase === 'lub' ? C.coralGlow + '66' : C.coralGlow + '10'}`,
              transform: `scale(${pulsePhase === 'lub' ? 1.25 : 1})`,
              transition: 'all 0.5s ease-out',
            }}
          />
          {/* Inner ring */}
          <div
            style={{
              position: 'absolute',
              inset: 12,
              borderRadius: '50%',
              border: `2px solid ${pulsePhase === 'lub' ? C.coralGlow + '40' : C.coralGlow + '08'}`,
              transform: `scale(${pulsePhase === 'lub' ? 1.15 : 1})`,
              transition: 'all 0.4s ease-out',
            }}
          />
          {/* Tap hint */}
          {showHint && (
            <div style={{
              position: 'absolute',
              top: -32,
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#FFFFFF',
              whiteSpace: 'nowrap',
              opacity: 0.8,
              animation: 'sg-pulse 2s ease-in-out infinite',
              zIndex: 10,
            }}>
              Tap the heart to the beat! ❤️
            </div>
          )}
          {/* Heart button */}
          <button
            style={{
              width: 115,
              height: 115,
              borderRadius: '50%',
              background: heartGlow
                ? `radial-gradient(circle at 40% 35%, ${C.coralGlow}, #C23C3C)`
                : `radial-gradient(circle at 40% 35%, #C23C3C, ${C.coralGlow})`,
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              userSelect: 'none',
              transform: heartTransform,
              animation: heartAnimation,
              transition: pressed
                ? 'transform 0.1s ease-in, background 0.2s'
                : 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s',
              border: 'none',
              padding: 0,
            }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            aria-label="Tap with heartbeat"
          >
            <span
              style={{
                fontSize: 50,
                pointerEvents: 'none',
                filter: heartGlow ? 'brightness(1.3)' : 'none',
              }}
            >
              ❤️
            </span>
          </button>

          {/* Ripple rings — expand on user press only */}
          {ripples.map((rid) => (
            <div
              key={rid}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                border: '2px solid var(--game-primary)',
                borderRadius: '50%',
                pointerEvents: 'none',
                animation: 'rippleOut 0.8s ease-out forwards',
              }}
            />
          ))}
        </div>

        {/* ECG line */}
        <svg
          width="80%"
          height="28"
          viewBox="0 0 300 28"
          preserveAspectRatio="none"
          style={{ position: 'relative', zIndex: 2, marginTop: -8 }}
        >
          <path
            d={ecgPath}
            fill="none"
            stroke={C.coralGlow}
            strokeWidth="2"
            opacity={pulsePhase === 'lub' ? 0.8 : 0.2}
            style={{ transition: 'all 0.2s' }}
          />
        </svg>

        {/* Mini waveform at bottom */}
        <MiniWaveform />
      </div>

      {/* Progress dots (outside card) */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {dots}
        <span
          style={{
            fontSize: '0.65rem',
            fontFamily: "'Nunito', sans-serif",
            color: 'var(--game-text-muted)',
            opacity: 0.5,
            marginLeft: 4,
          }}
        >
          {matched}/4
        </span>
      </div>
    </div>
  );
}
