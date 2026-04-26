import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import theme from './theme';
import { EMOJI_FONT_STACK } from './styles';

/**
 * Until we draw a proper "trader" SVG, the home page hero is a stylised
 * playing-card emoji on a soft amber circle — picks up the cream theme
 * and reads as "cards" without being one of the existing illustrations.
 */
function TraderHero() {
  return (
    <div
      aria-hidden="true"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 35% 30%, #FFE9A8 0%, #F2C246 70%, #E8B840 100%)',
        borderRadius: 28,
        boxShadow: '0 12px 32px rgba(232,184,64,0.4)',
      }}
    >
      <span
        style={{
          fontFamily: EMOJI_FONT_STACK,
          fontSize: 96,
          lineHeight: 1,
          transform: 'rotate(-6deg)',
          display: 'inline-block',
        }}
      >
        🃏
      </span>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div style={theme}>
      <GameHomeLayout
        illustrationComponent={<TraderHero />}
        heroVisual={<div style={{ width: 160, height: 160 }}><TraderHero /></div>}
        title="Trader"
        tagline="Every choice has a cost — pick what to keep!"
        tag="🃏 Trade-offs & Choices"
        description="A new card flips over each round. Drag it down to keep it, or tap skip to let it go. Your docket only fits a few — choose wisely!"
        skillPills={[
          { label: 'Decisions' },
          { label: 'Trade-offs' },
          { label: 'Memory' },
        ]}
        gameId="little-trader"
        onPlay={() => navigate('/games/little-trader/play')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        shareButton
        parentTipBody={
          <span>
            Sit beside your child and ask <em>&quot;keep or skip?&quot;</em> as
            each card appears. When the docket fills, the real choices begin —
            keeping a new card means letting an old one go.
            <br />
            <br />
            Have fun! 🌟
          </span>
        }
      />
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        gameName="Little Trader"
      />
    </div>
  );
}
