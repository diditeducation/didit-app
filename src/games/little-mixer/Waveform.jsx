import { useRef, useEffect } from 'react';
import { analyser } from './audio';

const BAR_COUNT = 10;
const IDLE_MIN = 4;
const IDLE_MAX = 10;

/* Interpolate between skyLight (#E0F8F6) and skyDark (#03B292) */
function barColor(t) {
  const r = Math.round(224 + (3   - 224) * t);
  const g = Math.round(248 + (178 - 248) * t);
  const b = Math.round(246 + (146 - 246) * t);
  return `rgb(${r},${g},${b})`;
}

export default function Waveform({ height = 48 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext('2d');

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      c.clearRect(0, 0, W, H);

      const node = analyser.getNode();

      if (node) {
        const bufLen = node.frequencyBinCount;
        const data = new Uint8Array(bufLen);
        node.getByteFrequencyData(data);
        const barW = (W / bufLen) * 2.5;
        for (let i = 0; i < bufLen; i++) {
          const t = i / bufLen;
          c.fillStyle = barColor(t);
          const barH = (data[i] / 255) * H * 0.8;
          c.fillRect(i * barW, H / 2 - barH / 2, barW - 1, barH || 2);
        }
      } else {
        const t = Date.now() / 1000;
        const gap = W * 0.02;
        const totalGap = gap * (BAR_COUNT - 1);
        const bw = (W - totalGap) / BAR_COUNT;

        for (let i = 0; i < BAR_COUNT; i++) {
          const phase = i * 0.6;
          const breath = Math.sin(t * 2 + phase) * 0.5 + 0.5;
          const barH = IDLE_MIN + (IDLE_MAX - IDLE_MIN) * breath;
          const scaledH = barH * (H / 48);
          const x = i * (bw + gap);
          const ct = i / (BAR_COUNT - 1);
          c.fillStyle = barColor(ct);
          c.globalAlpha = 0.6;
          const radius = Math.min(scaledH / 2, bw / 2, 3);
          const y = H / 2 - scaledH / 2;
          c.beginPath();
          c.roundRect(x, y, bw, scaledH, radius);
          c.fill();
          c.globalAlpha = 1;
        }
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
    <div style={{
      width: '100%', height,
      background: 'rgba(0,0,0,0.03)',
      borderRadius: 18, overflow: 'hidden', flexShrink: 0,
    }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
