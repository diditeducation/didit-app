import { useState, useEffect, useRef } from 'react';

const COLORS = ['#E8AAAA', '#4ECDC4', '#F2DCA0', '#BEE060', '#9BB5E8', '#EDA030'];
const PARTICLE_COUNT = 70;

function createParticles(originX, originY) {
  const particles = [];
  let css = '';

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const isCircle = Math.random() < 0.6;
    const size = isCircle ? 4 + Math.random() * 3 : 4 + Math.random() * 2;
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 120;
    const gravity = 80 + Math.random() * 60;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance + gravity;
    const rot = 180 + Math.random() * 360;
    const duration = 0.8 + Math.random() * 0.5;
    const delay = Math.random() * 0.08;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const name = `sp${i}`;

    css +=
      `@keyframes ${name}{` +
      `0%{transform:translate(0,0) scale(0) rotate(0deg);opacity:1}` +
      `40%{transform:translate(${(tx * 0.5).toFixed(1)}px,${(ty * 0.3).toFixed(1)}px) scale(1) rotate(${(rot * 0.4).toFixed(1)}deg);opacity:1}` +
      `100%{transform:translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px) scale(0.6) rotate(${rot.toFixed(1)}deg);opacity:0}}`;

    particles.push({
      key: i,
      style: {
        position: 'absolute',
        left: `${originX}%`,
        top: `${originY}%`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: isCircle ? '50%' : '2px',
        background: color,
        animation: `${name} ${duration}s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s forwards`,
      },
    });
  }

  return { particles, css };
}

export default function Confetti({ active, originX = 50, originY = 50, onComplete }) {
  console.log('Confetti component, active:', active);
  const [data, setData] = useState({ particles: [], css: '' });
  const triggerCount = useRef(0);

  useEffect(() => {
    console.log('Confetti useEffect fired, active:', active, 'triggerCount:', triggerCount.current, 'time:', Date.now());
    if (!active) {
      console.log('Confetti useEffect: active is false, clearing data', Date.now());
      setData({ particles: [], css: '' });
      return;
    }

    triggerCount.current += 1;
    const d = createParticles(originX, originY);
    console.log('Confetti useEffect: created particles count:', d.particles.length, 'css length:', d.css.length, 'time:', Date.now());
    setData(d);

    const timer = setTimeout(() => {
      console.log('Confetti onComplete timer fired', Date.now());
      if (onComplete) onComplete();
    }, 1400);

    return () => {
      console.log('Confetti useEffect CLEANUP running, time:', Date.now());
      clearTimeout(timer);
    };
  }, [active]);

  if (!active || data.particles.length === 0) {
    console.log('Confetti EARLY RETURN: active=', active, 'particles=', data.particles.length);
    return null;
  }

  console.log('Confetti RENDERING PARTICLES:', data.particles.length, 'time:', Date.now());

  const containerStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    pointerEvents: 'none',
    overflow: 'hidden',
  };

  return (
    <div style={containerStyle}>
      <style>{data.css}</style>
      {data.particles.map((p) => (
        <div key={`${triggerCount.current}-${p.key}`} style={p.style} />
      ))}
    </div>
  );
}
