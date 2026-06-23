import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell from '../../design-system/layouts/GameShell';
import Confetti from '../../design-system/components/Confetti';
import Toast from '../../design-system/components/Toast';
import SuccessScreen from '../../design-system/components/SuccessScreen';
import FeedbackModal from '../../components/FeedbackModal';
import { useToast } from '../../design-system/useToast';
import { fonts } from '../../design-system/tokens';
import theme from './theme';
import ChefBoard from './Board';
import { trackGameOpen, trackGameComplete } from '../../analytics';

export default function Game() {
  const navigate = useNavigate();
  const [showNext, setShowNext] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [milestone, setMilestone] = useState({
    active: false,
    originX: 50,
    originY: 50,
  });
  const [chefResult, setChefResult] = useState({ cooked: [], total: 0 });
  const chefResetRef = useRef(null);
  const { toast, showToast } = useToast();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => { trackGameOpen('little-chef'); }, []);

  const triggerMilestone = (originX, originY, nextFn, message, toastTop) => {
    setMilestone({ active: true, originX, originY });
    if (message) {
      setTimeout(() => showToast(message, 1500, toastTop), 600);
    }
  };

  const nextBtnStyle = {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 300,
    background: 'var(--game-primary)',
    color: '#FFFFFF',
    borderRadius: '9999px',
    padding: '16px 48px',
    fontFamily: fonts.display,
    fontWeight: 800,
    fontSize: '1rem',
    border: 'none',
    cursor: 'pointer',
    boxShadow: 'none',
    whiteSpace: 'nowrap',
    bottom: '32px',
    animation: 'nextFloatUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  };

  return (
    <div style={theme}>
      <style>{`
        @keyframes nextFloatUp {
          from { bottom: -80px; }
          to { bottom: 32px; }
        }
      `}</style>

      <GameShell
        title="Little Chef"
        hideTabs
        onBack={() => navigate('/hub')}
      >
        <ChefBoard
          resetRef={chefResetRef}
          onMilestone={(x, y) =>
            triggerMilestone(
              x,
              y,
              null,
              'Delicious! 👨‍🍳',
              40
            )
          }
          onGameEnd={({ cooked, total }) => {
            setChefResult({ cooked, total });
            setShowNext(true);
            trackGameComplete('little-chef');
            setShowSuccess(true);
          }}
        />
      </GameShell>

      <Toast
        message={toast.message}
        visible={toast.visible}
        topPercent={toast.topPercent}
        duration={toast.duration}
      />

      <Confetti
        active={milestone.active}
        originX={milestone.originX}
        originY={milestone.originY}
        onComplete={() => setMilestone((m) => ({ ...m, active: false }))}
      />

      {showNext && (
        <button
          style={nextBtnStyle}
          onClick={() => {
            chefResetRef.current?.();
            setShowSuccess(false);
            setShowNext(false);
            setMilestone({ active: false, originX: 50, originY: 50 });
            setChefResult({ cooked: [], total: 0 });
          }}
        >
          Play again 🔄
        </button>
      )}

      <SuccessScreen
        visible={showSuccess}
        gameName="Little Chef"
        learnedText="cooking and sequencing"
        savedCoins={null}
        boughtItems={chefResult.cooked.map(c => ({ emoji: c.emoji, name: c.name, price: null }))}
        boughtLabel="You prepared"
        onPlayAgain={() => {
          chefResetRef.current?.();
          setShowSuccess(false);
          setShowNext(false);
          setMilestone({ active: false, originX: 50, originY: 50 });
          setChefResult({ cooked: [], total: 0 });
        }}
        onBack={() => navigate('/hub')}
        onFeedback={() => setFeedbackOpen(true)}
        showShare
        gameId="little-chef"
      />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} gameName="Little Chef" />
    </div>
  );
}
