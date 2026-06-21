import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import { ChefIllustration } from '../../components/GameIllustrations';
import theme from './theme';

export default function HomePage() {
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div style={theme}>
      <GameHomeLayout
        illustrationComponent={<ChefIllustration />}
        heroVisual={<div style={{ width: 160, height: 160 }}><ChefIllustration /></div>}
        title="Chef"
        tagline="Follow the recipe, cook the meal — order matters!"
        tag="🍳 Cooking & Sequencing"
        description="Time to cook! Tap the ingredients in the right order — crack, pour, mix. Get the steps right and watch your dish come together. Yum!"
        skillPills={[{ label: 'Sequencing' }, { label: 'Planning' }, { label: 'Process' }]}
        gameId="little-chef"
        onPlay={() => navigate('/games/little-chef/play')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        shareButton
        parentTipBody={
          <span>
            Cook together! Point to each step and say{' '}
            <em>&quot;what comes next?&quot;</em> — let them tap the ingredient.
            <br />
            <br />
            Talk about why order matters — you can&apos;t frost a cake before baking it! 🎂
          </span>
        }
      />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} gameName="Little Chef" />
    </div>
  );
}
