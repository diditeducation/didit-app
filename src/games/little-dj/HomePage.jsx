import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import { DJIllustration } from '../../pages/GameIllustrations';
import theme from './theme';

export default function HomePage() {
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div style={theme}>
      <GameHomeLayout
        illustrationComponent={<DJIllustration />}
        heroVisual={<div style={{ width: 160, height: 160 }}><DJIllustration /></div>}
        title="DJ"
        tagline="Tap a cell, hear it loop — layer up a beat from scratch."
        tag="🎛️ Beat Making"
        description="Tap any square to drop in a sound — drums, bass, keys, you name it. Layer them up and hear your beat come alive. There's no wrong combo, so go wild!"
        skillPills={[{ label: 'Layering sounds' }, { label: 'Rhythm' }, { label: 'Creativity' }]}
        gameId="little-dj"
        onPlay={() => navigate('/games/little-dj/play')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        shareButton
        parentTipBody={
          <span>
            Move your body to the beat and add layers together! Ask{' '}
            <em>&quot;what does the drum sound like?&quot;</em> then{' '}
            <em>&quot;what happens when we add the bass?&quot;</em>
            <br /><br />
            Every combination sounds musical — there are no wrong answers. 🥁
          </span>
        }
      />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} gameName="Little DJ" />
    </div>
  );
}
