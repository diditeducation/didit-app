import { easing } from '../tokens';

/**
 * Shared level-progress marker — a row of pips, one per level. The active
 * level is a wide bar, completed levels use the game accent, upcoming levels
 * are faint. Colours come from the game theme vars so it matches each game.
 *
 * Used in the GameShell `topSlot` of the multi-level sampler games
 * (Little Coder, Little Chemist, Little Chef) to keep their progress
 * indicator consistent.
 */
export default function LevelPips({ current, total }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      padding: '4px 0 14px',
    }}>
      {Array.from({ length: total }, (_, i) => {
        const isActive = i + 1 === current;
        const isDone   = i + 1 < current;
        return (
          <div key={i} style={{
            height: 8,
            width: isActive ? 28 : 8,
            borderRadius: 4,
            background: isActive
              ? 'var(--game-primary)'
              : isDone
                ? 'var(--game-accent)'
                : 'rgba(0,0,0,0.13)',
            transition: `all 0.35s ${easing.bounce}`,
          }} />
        );
      })}
    </div>
  );
}
