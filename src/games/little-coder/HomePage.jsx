import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import { colors } from '../../design-system/tokens';
import theme from './theme';

const CELL = 44;
const GAP  = 4;

function MiniGrid() {
  const rat    = [0, 0];
  const cheese = [2, 2];
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(3, ${CELL}px)`,
      gridTemplateRows:    `repeat(3, ${CELL}px)`,
      gap: GAP,
    }}>
      {Array.from({ length: 9 }, (_, i) => {
        const r = Math.floor(i / 3);
        const c = i % 3;
        const isRat    = r === rat[0]    && c === rat[1];
        const isCheese = r === cheese[0] && c === cheese[1];
        const isEven   = (r + c) % 2 === 0;
        return (
          <div key={i} style={{
            width: CELL, height: CELL,
            borderRadius: 10,
            background: isRat
              ? 'rgba(162,155,254,0.25)'
              : isCheese
                ? `color-mix(in srgb, ${colors.sunMid} 22%, white)`
                : isEven
                  ? 'rgba(0,0,0,0.04)'
                  : 'rgba(0,0,0,0.07)',
            border: `2px solid ${isCheese
              ? colors.sunMid + '70'
              : 'rgba(0,0,0,0.07)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: CELL * 0.52,
            lineHeight: 1,
          }}>
            {isRat ? '🐭' : isCheese ? '🧀' : ''}
          </div>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div style={theme}>
      <GameHomeLayout
        heroVisual={<MiniGrid />}
        title="Coder"
        tag="💻 Coding & Logic"
        hookLine="Guide the rat to the cheese!"
        description="Tap UP, DOWN, LEFT, RIGHT to move the rat one step at a time. Reach the cheese to win."
        skillPills={['Directions', 'Logic', 'Sequencing']}
        onPlay={() => navigate('/games/little-coder/play')}
        parentTipBody="Little Coder teaches directional thinking and early sequencing. Ask your child 'which way should the rat go?' before each move. Each level places the cheese further away, gently increasing the challenge."
        shareButton
        gameId="little-coder"
      />
    </div>
  );
}
