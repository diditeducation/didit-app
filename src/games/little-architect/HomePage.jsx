import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import { ArchitectIllustration } from '../../pages/GameIllustrations';
import theme from './theme';

export default function HomePage() {
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div style={theme}>
      <GameHomeLayout
        illustrationComponent={<ArchitectIllustration />}
        heroVisual={<div style={{ width: 160, height: 160 }}><ArchitectIllustration /></div>}
        title="Architect"
        tagline="Drag the pieces onto the outline to build it."
        tag="🏗️ Spatial building"
        description="See that building outline? Grab the shape pieces and drag them into place! Triangles, squares, rectangles — fit them all in and watch your building appear."
        skillPills={[{ label: 'Shapes' }, { label: 'Spatial reasoning' }, { label: 'Building' }]}
        gameId="little-architect"
        onPlay={() => navigate('/games/little-architect/play')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        shareButton
        parentTipBody={
          <span>
            Name each shape as you hand it over — "this is a triangle, it goes on top!" Spatial language (over, under, beside) builds early maths foundations. 🏗️
          </span>
        }
      />
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        gameName="Little Architect"
      />
    </div>
  );
}
