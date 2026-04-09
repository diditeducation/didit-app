import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import theme from './theme';
import ChemistHeroVisual from './HeroVisual';

export default function HomePage() {
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div style={theme}>
      <GameHomeLayout
        heroVisual={<ChemistHeroVisual />}
        title="Chemist"
        tagline="Balance atoms on a seesaw — your little one's first chemistry lesson."
        tag="⚗️ Chemistry & Balance"
        description="They see atoms on one side and tap to match the other. Counting, balancing, and the wonder of elements."
        skillPills={[{ label: 'Counting' }, { label: 'Balancing' }, { label: 'Elements' }]}
        gameId="little-chemist"
        onPlay={() => navigate('/games/little-chemist/play')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        shareButton
        parentTipBody={
          <span>
            Name the element together as they tap — &quot;that&apos;s Hydrogen, it&apos;s the lightest atom!&quot;
            <br />
            <br />
            Watch the seesaw tip and balance. That&apos;s physics + chemistry in one! 🌟
          </span>
        }
      />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} gameName="Little Chemist" />
    </div>
  );
}
