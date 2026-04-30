import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import { ConsultantIllustration } from '../../pages/GameIllustrations';
import theme from './theme';

export default function HomePage() {
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div style={theme}>
      <GameHomeLayout
        illustrationComponent={<ConsultantIllustration />}
        heroVisual={<div style={{ width: 160, height: 160 }}><ConsultantIllustration /></div>}
        title="Consultant"
        tagline="Same things, different ways to sort them."
        tag="🗂️ Structured Problem Solving"
        description="Sort six shapes into three homes. The rule changes each level — colour, then shape, then pattern. Learning to flip the question is a clean way to break down any problem with no overlaps and nothing missed."
        skillPills={[
          { label: 'Categorisation' },
          { label: 'Structured thinking' },
          { label: 'Flexibility' },
        ]}
        gameId="little-consultant"
        onPlay={() => navigate('/games/little-consultant/play')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        shareButton
        parentTipBody={
          <span>
            Sit beside your child and ask <em>&quot;where does the red one go?&quot;</em>{' '}
            on level 1. When the homes change to circles and squares, point out
            that the same red triangle moved! Same world, different question.
            <br />
            <br />
            Have fun! 🌟
          </span>
        }
      />
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        gameName="Little Consultant"
      />
    </div>
  );
}
