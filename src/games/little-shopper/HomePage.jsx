import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import { ShopperIllustration } from '../../pages/GameIllustrations';
import theme from './theme';

export default function HomePage() {
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div style={theme}>
      <GameHomeLayout
        illustrationComponent={<ShopperIllustration />}
        heroVisual={<div style={{ width: 160, height: 160 }}><ShopperIllustration /></div>}
        title="Shopper"
        tagline="Tap, count, and pay — your toddler's first shopping trip."
        tag="💰 Financial Literacy"
        description="You've got coins — now decide what to buy! Tap an item, check the price, and see if you can afford it. Save up or spend it all — it's your call!"
        skillPills={[{ label: 'Budgeting' }, { label: 'Saving vs spending' }, { label: 'Price comparison' }]}
        gameId="little-shopper"
        onPlay={() => navigate('/games/little-shopper/play')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        shareButton
        parentTipBody={
          <span>
            Sit together and let them pick items and count coins. Ask{' '}
            <em>&quot;how many coins do we need?&quot;</em> — then count together.
            <br />
            <br />
            That&apos;s it. Have fun! 🌟
          </span>
        }
      />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} gameName="Little Shopper" />
    </div>
  );
}
