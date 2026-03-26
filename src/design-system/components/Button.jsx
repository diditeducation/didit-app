import { useState } from 'react';
import { easing, fonts, radii, colors } from '../tokens';

const variantStyles = {
  primary: {
    background: 'var(--game-primary)',
    color: '#FFFFFF',
    border: 'none',
  },
  secondary: {
    background: 'var(--game-accent)',
    color: '#FFFFFF',
    border: 'none',
  },
  ghost: {
    background: '#FFFFFF',
    border: `2px solid ${colors.border}`,
    color: colors.text,
  },
  icon: {
    background: 'var(--game-primary)',
    color: '#FFFFFF',
    border: 'none',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    padding: 0,
  },
};

const sizeStyles = {
  default: {
    minHeight: '56px',
    padding: '12px 32px',
  },
  lg: {
    minHeight: '72px',
    padding: '12px 32px',
    fontSize: '1.3rem',
  },
  icon: {
    width: '64px',
    height: '64px',
    minHeight: 'unset',
    padding: 0,
    borderRadius: '50%',
  },
};

export default function Button({
  variant = 'primary',
  size = 'default',
  children,
  onClick,
  disabled = false,
  ariaLabel,
  style: overrideStyle,
}) {
  const [active, setActive] = useState(false);

  const resolvedSize = variant === 'icon' ? 'icon' : size;

  const baseStyle = {
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: '1rem',
    borderRadius: radii.pill,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `all 0.15s ${easing.bounce}`,
    opacity: disabled ? 0.5 : 1,
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    transform: active ? 'translateY(3px)' : 'translateY(0)',
    ...variantStyles[variant],
    ...sizeStyles[resolvedSize],
  };



  const merged = { ...baseStyle, ...overrideStyle };

  return (
    <button
      style={merged}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      onPointerDown={() => setActive(true)}
      onPointerUp={() => setActive(false)}
      onPointerLeave={() => setActive(false)}
    >
      {children}
    </button>
  );
}
