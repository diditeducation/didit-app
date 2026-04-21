import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import { EngineerIllustration } from '../../pages/GameIllustrations';
import theme from './theme';

export default function HomePage() {
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div style={theme}>
      <GameHomeLayout
        illustrationComponent={<EngineerIllustration />}
        heroVisual={<div style={{ width: 160, height: 160 }}><EngineerIllustration /></div>}
        title="Engineer"
        tagline="Build, connect, solve — your toddler's first engineering challenge."
        tag="🔧 Electrical Engineering"
        description="See that bulb? Follow the coloured wire to find the right switch, then tap it to light things up! Get them all to collect every animal."
        skillPills={[{ label: 'Cause & effect' }, { label: 'Binary logic' }, { label: 'Systems thinking' }]}
        gameId="little-engineer"
        onPlay={() => navigate('/games/little-engineer/play')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        shareButton
        parentTipBody={
          <span>
            Sit with your little one and let them tap around. Ask <em>&quot;what do you think happens if we press that?&quot;</em> — then find out together.
            <br /><br />
            That&apos;s it. Have fun! 🌟
          </span>
        }
      />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} gameName="Little Engineer" />
    </div>
  );
}
