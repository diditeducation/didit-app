import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../design-system/layouts/GameShell';
import SuccessScreen from '../../design-system/components/SuccessScreen';
import FeedbackModal from '../../components/FeedbackModal';
import theme from './theme';
import JunctionBoxLevel from './levels/JunctionBoxLevel';
import { trackGameOpen, trackGameComplete } from '../../analytics';

const ANIMAL_NAMES = {
  '🐶':'Dog', '🐱':'Cat', '🐭':'Mouse', '🐹':'Hamster',
  '🐰':'Rabbit', '🦊':'Fox', '🐻':'Bear', '🐼':'Panda',
  '🐨':'Koala', '🐯':'Tiger', '🦁':'Lion', '🐮':'Cow',
  '🐷':'Pig', '🐸':'Frog', '🐙':'Octopus', '🦋':'Butterfly',
  '🐢':'Turtle', '🦕':'Dinosaur', '🐳':'Whale', '🦓':'Zebra',
  '🦒':'Giraffe', '🐘':'Elephant', '🦘':'Kangaroo', '🦔':'Hedgehog',
  '🐧':'Penguin', '🦜':'Parrot', '🦩':'Flamingo', '🦚':'Peacock',
  '🐬':'Dolphin', '🦭':'Seal',
};

export default function Game() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [collectedAnimals, setCollectedAnimals] = useState([]);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => { trackGameOpen('little-engineer'); }, []);

  const handleComplete = (animals) => {
    setCollectedAnimals(animals ?? []);
    trackGameComplete('little-engineer');
    setShowSuccess(true);
  };

  const handlePlayAgain = () => {
    setShowSuccess(false);
    setCollectedAnimals([]);
  };

  return (
    <div style={theme}>
      <GameShell
        title="Little Engineer"
        levels={[]}
        activeLevel={1}
        onBack={() => navigate('/hub')}
        hideTabs
      >
        <JunctionBoxLevel
          key={showSuccess ? 'done' : 'playing'}
          onComplete={handleComplete}
        />
      </GameShell>

      <SuccessScreen
        visible={showSuccess}
        gameName="Little Engineer"
        learnedText="wires and circuits ⚡"
        boughtItems={collectedAnimals.map(emoji => ({ emoji, name: ANIMAL_NAMES[emoji] ?? '' }))}
        boughtLabel="Animals you found"
        onPlayAgain={handlePlayAgain}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        showShare
        gameId="little-engineer"
      />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} gameName="Little Engineer" />
    </div>
  );
}
