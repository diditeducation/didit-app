import { easing } from '../../design-system/tokens';

const KEYFRAMES_ID = 'didit-chemist-hero-keyframes';

const keyframesCSS = `
@keyframes chemistOrbit {
  0%   { transform: rotate(0deg)   translateX(44px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(44px) rotate(-360deg); }
}
@keyframes chemistOrbit2 {
  0%   { transform: rotate(120deg)  translateX(56px) rotate(-120deg); }
  100% { transform: rotate(480deg)  translateX(56px) rotate(-480deg); }
}
@keyframes chemistOrbit3 {
  0%   { transform: rotate(240deg)  translateX(36px) rotate(-240deg); }
  100% { transform: rotate(600deg)  translateX(36px) rotate(-600deg); }
}
@keyframes chemistPulse {
  0%, 100% { transform: scale(1);    opacity: 0.7; }
  50%       { transform: scale(1.12); opacity: 1; }
}
@keyframes chemistFloat {
  0%   { opacity: 0; transform: translateY(0) scale(0.5); }
  30%  { opacity: 1; transform: translateY(-8px) scale(1); }
  100% { opacity: 0; transform: translateY(-22px) scale(0.3); }
}
`;

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = keyframesCSS;
  document.head.appendChild(style);
}

export default function ChemistHeroVisual() {
  injectKeyframes();

  const orbitBase = {
    position: 'absolute',
    top: '50%', left: '50%',
    marginTop: '-8px', marginLeft: '-8px',
    width: '16px', height: '16px',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.65rem', fontWeight: 800,
    fontFamily: "'Nunito', sans-serif",
  };

  const sparkStyle = (delay, left) => ({
    position: 'absolute',
    fontSize: '0.75rem',
    animation: `chemistFloat 2s ${easing.out} ${delay}s infinite`,
    left, top: '20%', zIndex: 5,
  });

  return (
    <div style={{ width: 180, height: 180, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Pulse ring */}
      <div style={{
        position: 'absolute', width: 130, height: 130, borderRadius: '50%',
        border: '2px solid rgba(76,200,48,0.25)',
        animation: `chemistPulse 2.5s ${easing.out} infinite`,
      }} />

      {/* Nucleus */}
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 35%, #4CC830, #2EA820)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 2,
        fontSize: '2.4rem',
        boxShadow: '0 4px 18px rgba(46,168,32,0.35)',
      }}>🧪</div>

      {/* Orbiting atoms */}
      <div style={{ ...orbitBase, background: '#74B9FF', color: '#003d6b', animation: 'chemistOrbit 3s linear infinite' }}>H</div>
      <div style={{ ...orbitBase, background: '#FF7675', color: '#5a0000', animation: 'chemistOrbit2 4s linear infinite' }}>O</div>
      <div style={{ ...orbitBase, background: '#A29BFE', color: '#1a0060', animation: 'chemistOrbit3 3.5s linear infinite' }}>N</div>

      <span style={sparkStyle(0, '8%')}>✨</span>
      <span style={sparkStyle(0.7, '78%')}>🧪</span>
      <span style={sparkStyle(1.4, '48%')}>💡</span>
    </div>
  );
}
