import { ROUNDS } from './deckLogic';

/**
 * Eight horizontal segments. `completed` segments fill in the theme's
 * accent colour (passed by the parent), the active segment shows a
 * lighter pulse so the kid sees "we're on this one right now".
 */
export default function ProgressBar({ completed = 0, active = 0, accentColor }) {
  const fill = accentColor || 'var(--game-accent)';
  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        width: '100%',
        maxWidth: 460,
        margin: '0 auto',
        padding: '4px 16px 0',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        @keyframes traderSegPulse {
          0%, 100% { opacity: 0.7; }
          50%      { opacity: 1; }
        }
      `}</style>
      {Array.from({ length: ROUNDS }, (_, i) => {
        const isDone   = i < completed;
        const isActive = i === active && !isDone;
        const bg = isDone || isActive ? fill : 'rgba(0,0,0,0.08)';
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 999,
              background: bg,
              opacity: isActive ? 0.9 : 1,
              animation: isActive ? 'traderSegPulse 1.3s ease-in-out infinite' : 'none',
              transition: 'background 0.4s ease',
            }}
          />
        );
      })}
    </div>
  );
}
