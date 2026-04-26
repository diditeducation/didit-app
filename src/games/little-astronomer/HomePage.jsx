import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import { AstronomerIllustration } from '../../pages/GameIllustrations';
import theme from './theme';

export default function HomePage() {
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div style={theme}>
      <GameHomeLayout
        illustrationComponent={<AstronomerIllustration />}
        heroVisual={<div style={{ width: 160, height: 160 }}><AstronomerIllustration /></div>}
        title="Astronomer"
        tagline="Tap the stars to draw a constellation!"
        tag="🌟 Stars & Constellations"
        description="Look — glowing stars in the night sky! Tap them one by one to connect the dots. What animal or symbol is hiding up there? Only one way to find out!"
        skillPills={[
          { label: 'Constellations' },
          { label: 'Stars' },
          { label: 'Sequences' },
        ]}
        gameId="little-astronomer"
        onPlay={() => navigate('/games/little-astronomer/play')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        shareButton
        parentTipBody="Point to each glowing star and count them together! After the constellation appears, name it and look it up in a real star map. Constellations are how ancient people told stories through the night sky 🌙"
      />
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        gameName="Little Astronomer"
      />
    </div>
  );
}
