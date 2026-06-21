import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import { CoderIllustration } from '../../components/GameIllustrations';
import theme from './theme';

export default function HomePage() {
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div style={theme}>
      <GameHomeLayout
        illustrationComponent={<CoderIllustration />}
        heroVisual={<div style={{ width: 160, height: 160 }}><CoderIllustration /></div>}
        title="Coder"
        tagline="Guide the rat to the cheese — your toddler's first coding challenge."
        tag="💻 Coding & Logic"
        description="The rat is hungry! Tap the arrows to move it one step at a time — up, down, left, right. Can you find the way to the cheese?"
        skillPills={[{ label: 'Directions' }, { label: 'Logic' }, { label: 'Sequencing' }]}
        gameId="little-coder"
        onPlay={() => navigate('/games/little-coder/play')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        shareButton
        parentTipBody="Little Coder teaches directional thinking and early sequencing. Ask your child 'which way should the rat go?' before each move. Each level places the cheese further away, gently increasing the challenge."
      />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} gameName="Little Coder" />
    </div>
  );
}
