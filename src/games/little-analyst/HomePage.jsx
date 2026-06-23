import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import { AnalystIllustration } from '../../components/GameIllustrations';
import theme from './theme';

export default function HomePage() {
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div style={theme}>
      <GameHomeLayout
        illustrationComponent={<AnalystIllustration />}
        heroVisual={<div style={{ width: 160, height: 160 }}><AnalystIllustration /></div>}
        title="Analyst"
        tagline="Fill the missing pieces to complete the chart."
        tag="🥧 Data visualisation"
        description="Uh oh, the chart is missing a piece! Drag the right slice into the gap to complete it. Big slice or little slice — can you spot the one that fits?"
        skillPills={[{ label: 'Percentages' }, { label: 'Shapes' }, { label: 'Spatial recognition' }]}
        gameId="little-pie"
        onPlay={() => navigate('/games/little-pie/play')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        shareButton
        parentTipBody={
          <span>
            Point to each slice and say &quot;this piece is BIG&quot; or &quot;this piece is small&quot;. Ask &quot;which piece is missing?&quot; then help them drag it in. Fractions at play! 🥧
          </span>
        }
      />
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        gameName="Little Analyst"
      />
    </div>
  );
}
