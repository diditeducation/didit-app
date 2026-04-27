import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import { TraderIllustration } from '../../pages/GameIllustrations';
import theme from './theme';

export default function HomePage() {
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div style={theme}>
      <GameHomeLayout
        illustrationComponent={<TraderIllustration />}
        heroVisual={<div style={{ width: 160, height: 160 }}><TraderIllustration /></div>}
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
