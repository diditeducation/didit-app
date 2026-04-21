import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import { MatisseIllustration } from '../../pages/GameIllustrations';
import theme from './theme';

export default function HomePage() {
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div style={theme}>
      <GameHomeLayout
        heroVisual={<div style={{ width: 160, height: 160 }}><MatisseIllustration /></div>}
        title="Matisse"
        tagline="Drag shapes to make your own collage!"
        tag="🎨 Art & Collage"
        description="A big colourful shape is waiting on the canvas. Grab the cutouts from the tray and place them anywhere you like. Every masterpiece is different!"
        skillPills={[
          { label: 'Creativity' },
          { label: 'Shapes' },
          { label: 'Composition' },
        ]}
        gameId="little-matisse"
        onPlay={() => navigate('/games/little-matisse/play')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        shareButton
        parentTipBody="Let your child place the shapes wherever they want — there's no wrong answer! Name the colours and shapes together. Ask 'What does it look like?' when they're done. Matisse called this 'painting with scissors.' 🎨"
      />
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        gameName="Little Matisse"
      />
    </div>
  );
}
