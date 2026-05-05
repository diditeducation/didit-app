import { useState } from 'react';
import { fonts, easing, colors } from '../tokens';
import { toTitleCase } from '../textCase';

const variants = {
  purple: {
    background: 'rgba(199,125,255,0.15)',
    border: '1.5px solid rgba(199,125,255,0.4)',
    color: colors.blueberryLight,
  },
  pink: {
    background: 'rgba(255,107,204,0.15)',
    border: '1.5px solid rgba(255,107,204,0.4)',
    color: colors.coralLight,
  },
  teal: {
    background: 'rgba(78,205,196,0.15)',
    border: '1.5px solid rgba(78,205,196,0.4)',
    color: colors.sky,
  },
  amber: {
    background: 'rgba(255,184,77,0.15)',
    border: '1.5px solid rgba(255,184,77,0.4)',
    color: colors.sunDark,
  },
  green: {
    background: 'rgba(149,225,160,0.15)',
    border: '1.5px solid rgba(149,225,160,0.4)',
    color: colors.grass,
  },
};

export default function SkillPill({ label, variant = 'purple', style: overrideStyle }) {
  const [hovered, setHovered] = useState(false);
  const v = variants[variant] || variants.purple;

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    borderRadius: '9999px',
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: '0.72rem',
    userSelect: 'none',
    cursor: 'default',
    transition: `transform 0.2s ${easing.bounce}`,
    transform: hovered ? 'translateY(-2px) scale(1.05)' : 'translateY(0) scale(1)',
    ...v,
    ...overrideStyle,
  };

  return (
    <span
      style={style}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {toTitleCase(label)}
    </span>
  );
}
