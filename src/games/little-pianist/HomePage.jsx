import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHomeLayout from '../../design-system/layouts/GameHomeLayout';
import FeedbackModal from '../../components/FeedbackModal';
import { PianistIllustration } from '../../pages/GameIllustrations';
import theme from './theme';

export default function HomePage() {
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div style={theme}>
      <GameHomeLayout
        illustrationComponent={<PianistIllustration />}
        heroVisual={<div style={{ width: 160, height: 160 }}><PianistIllustration /></div>}
        title="Pianist"
        tagline="Do Re Mi, then real songs — tap the notes and make music."
        tag="🎹 Piano & Solfège"
        description="Tap the coloured keys and learn Do Re Mi! Once you've got the notes down, follow along and play real songs — one tap at a time."
        skillPills={[{ label: 'Solfège' }, { label: 'Note sequences' }, { label: 'Pitch & tone' }]}
        gameId="little-pianist"
        onPlay={() => navigate('/games/little-pianist/play')}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        shareButton
        parentTipBody={
          <span>
            Sing along as they tap! <em>&quot;Do Re Mi&quot;</em> out loud, then hum the song when they get to it.
            <br /><br />
            If they tap the wrong note, just encourage them to try again — the tune will click. 🎹
          </span>
        }
      />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} gameName="Little Pianist" />
    </div>
  );
}
