import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import { ChemistIllustration } from '../../components/GameIllustrations';
import theme from './theme';

export default function HomePage() {
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div style={theme}>
      <GameHomeLayout
        illustrationComponent={<ChemistIllustration />}
        heroVisual={<div style={{ width: 160, height: 160 }}><ChemistIllustration /></div>}
        title="Chemist"
        tagline="Balance atoms on a seesaw — your little one's first chemistry lesson."
        tag="⚗️ Chemistry & Balance"
        description="The seesaw is tipping! Tap to add atoms until both sides balance. Count them up, match the elements, and watch it level out."
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
