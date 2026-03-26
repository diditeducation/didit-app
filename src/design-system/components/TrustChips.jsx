import { fonts, colors } from '../tokens';

const chips = [
  { dot: colors.grass, label: 'Zero ads, ever' },
  { dot: colors.sun, label: 'Ages 1–4' },
];

export default function TrustChips() {
  const containerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '20px',
    justifyContent: 'center',
  };

  const chipStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '9999px',
    background: 'rgba(0,0,0,0.04)',
    border: '1px solid rgba(0,0,0,0.08)',
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: '0.68rem',
    color: 'var(--game-text-muted)',
    userSelect: 'none',
  };

  const dotStyle = (color) => ({
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
  });

  return (
    <div style={containerStyle}>
      {chips.map((chip) => (
        <div key={chip.label} style={chipStyle}>
          <span style={dotStyle(chip.dot)} />
          {chip.label}
        </div>
      ))}
    </div>
  );
}
