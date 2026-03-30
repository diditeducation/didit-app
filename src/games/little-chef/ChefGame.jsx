import { useState, useRef, useCallback, useEffect } from 'react';
import { fonts } from '../../design-system/tokens';
import { initAudio, sound } from './audio';

const ALL_RECIPES = [
  { name: 'Pancakes', emoji: '🥞', steps: [{ emoji: '🌾', label: 'Flour' }, { emoji: '🥛', label: 'Milk' }, { emoji: '🥄', label: 'Mix' }, { emoji: '🍳', label: 'Cook' }] },
  { name: 'Pizza', emoji: '🍕', steps: [{ emoji: '🫓', label: 'Dough' }, { emoji: '🍅', label: 'Sauce' }, { emoji: '🫑', label: 'Toppings' }, { emoji: '🔥', label: 'Bake' }] },
  { name: 'Salad', emoji: '🥗', steps: [{ emoji: '🥬', label: 'Lettuce' }, { emoji: '🍅', label: 'Tomato' }, { emoji: '🥒', label: 'Cucumber' }, { emoji: '🫒', label: 'Dressing' }] },
  { name: 'Cookies', emoji: '🍪', steps: [{ emoji: '🍯', label: 'Sugar' }, { emoji: '🌾', label: 'Flour' }, { emoji: '🧈', label: 'Butter' }, { emoji: '🔥', label: 'Bake' }] },
  { name: 'Sandwich', emoji: '🥪', steps: [{ emoji: '🍞', label: 'Bread' }, { emoji: '🥬', label: 'Lettuce' }, { emoji: '🧀', label: 'Cheese' }, { emoji: '🥩', label: 'Meat' }] },
  { name: 'Omelette', emoji: '🍳', steps: [{ emoji: '🥚', label: 'Egg' }, { emoji: '🧂', label: 'Salt' }, { emoji: '🧀', label: 'Cheese' }, { emoji: '🍳', label: 'Cook' }] },
  { name: 'Smoothie', emoji: '🥤', steps: [{ emoji: '🍌', label: 'Banana' }, { emoji: '🍓', label: 'Berries' }, { emoji: '🥛', label: 'Milk' }, { emoji: '🌀', label: 'Blend' }] },
  { name: 'Soup', emoji: '🍲', steps: [{ emoji: '🥕', label: 'Carrot' }, { emoji: '🧅', label: 'Onion' }, { emoji: '💧', label: 'Water' }, { emoji: '🔥', label: 'Boil' }] },
  { name: 'Tacos', emoji: '🌮', steps: [{ emoji: '🫓', label: 'Shell' }, { emoji: '🥩', label: 'Meat' }, { emoji: '🧀', label: 'Cheese' }, { emoji: '🍅', label: 'Salsa' }] },
  { name: 'Pasta', emoji: '🍝', steps: [{ emoji: '💧', label: 'Water' }, { emoji: '🍝', label: 'Noodles' }, { emoji: '🍅', label: 'Sauce' }, { emoji: '🌿', label: 'Basil' }] },
  { name: 'Sushi', emoji: '🍣', steps: [{ emoji: '🍚', label: 'Rice' }, { emoji: '🐟', label: 'Fish' }, { emoji: '🥬', label: 'Seaweed' }, { emoji: '🍣', label: 'Roll' }] },
  { name: 'Toast', emoji: '🥪', steps: [{ emoji: '🍞', label: 'Bread' }, { emoji: '🔥', label: 'Toast' }, { emoji: '🥑', label: 'Avocado' }, { emoji: '🍅', label: 'Tomato' }] },
  { name: 'Fried Rice', emoji: '🍛', steps: [{ emoji: '🍚', label: 'Rice' }, { emoji: '🥕', label: 'Veggies' }, { emoji: '🧅', label: 'Onion' }, { emoji: '🥄', label: 'Stir' }] },
  { name: 'Burrito', emoji: '🌯', steps: [{ emoji: '🫓', label: 'Wrap' }, { emoji: '🫘', label: 'Beans' }, { emoji: '🍚', label: 'Rice' }, { emoji: '🥑', label: 'Guac' }] },
  { name: 'Burger', emoji: '🍔', steps: [{ emoji: '🍞', label: 'Bun' }, { emoji: '🥩', label: 'Patty' }, { emoji: '🧀', label: 'Cheese' }, { emoji: '🥬', label: 'Lettuce' }] },
  { name: 'Hot Dog', emoji: '🌭', steps: [{ emoji: '🍞', label: 'Bun' }, { emoji: '🌭', label: 'Sausage' }, { emoji: '🍅', label: 'Ketchup' }, { emoji: '🟡', label: 'Mustard' }] },
  { name: 'Waffles', emoji: '🧇', steps: [{ emoji: '🌾', label: 'Flour' }, { emoji: '🥛', label: 'Milk' }, { emoji: '🥄', label: 'Mix' }, { emoji: '🧇', label: 'Press' }] },
  { name: 'Cake', emoji: '🎂', steps: [{ emoji: '🌾', label: 'Flour' }, { emoji: '🥛', label: 'Milk' }, { emoji: '🍫', label: 'Chocolate' }, { emoji: '🔥', label: 'Bake' }] },
  { name: 'Porridge', emoji: '🫕', steps: [{ emoji: '🌾', label: 'Oats' }, { emoji: '🥛', label: 'Milk' }, { emoji: '🔥', label: 'Cook' }, { emoji: '🫐', label: 'Berries' }] },
  { name: 'Stir Fry', emoji: '🥘', steps: [{ emoji: '🥕', label: 'Veggies' }, { emoji: '🍄', label: 'Mushroom' }, { emoji: '🥄', label: 'Stir' }, { emoji: '🍝', label: 'Noodles' }] },
];

const GAME_SIZE = 6;

function pickRecipes() {
  const shuffled = [...ALL_RECIPES];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, GAME_SIZE);
}

const KEYFRAMES_ID = 'didit-chef-game-keyframes';
const keyframesCSS = `
@keyframes chefShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
@keyframes chefPopIn{0%{transform:scale(0);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
@keyframes chefDishReveal{0%{transform:scale(0) rotate(-20deg);opacity:0}50%{transform:scale(1.2) rotate(5deg)}100%{transform:scale(1) rotate(0deg);opacity:1}}
@keyframes chefPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
@keyframes chefFlipOut{0%{transform:rotateY(0deg);opacity:1}100%{transform:rotateY(90deg);opacity:0}}
@keyframes chefFlipIn{0%{transform:rotateY(-90deg);opacity:0}100%{transform:rotateY(0deg);opacity:1}}
`;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ChefGame({ resetRef, onMilestone, onGameEnd }) {
  const [recipes, setRecipes] = useState(() => pickRecipes());
  const [recipeIdx, setRecipeIdx] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [available, setAvailable] = useState(() => shuffle(recipes[0].steps));
  const [wrongIdx, setWrongIdx] = useState(null);
  const [dishRevealed, setDishRevealed] = useState(false);
  const [cooked, setCooked] = useState([]);
  const [transitioning, setTransitioning] = useState(false);
  const [flipPhase, setFlipPhase] = useState(null); // 'out' | 'in' | null
  const animating = useRef(false);

  useEffect(() => {
    if (!document.getElementById(KEYFRAMES_ID)) {
      const s = document.createElement('style');
      s.id = KEYFRAMES_ID;
      s.textContent = keyframesCSS;
      document.head.appendChild(s);
    }
  }, []);

  const recipe = recipes[recipeIdx] || recipes[0];
  const nextStepIdx = completed.length;

  const loadRecipe = useCallback((idx) => {
    const r = recipes[idx];
    if (!r) return;
    setCompleted([]);
    setAvailable(shuffle(r.steps));
    setDishRevealed(false);
    setWrongIdx(null);
    setTransitioning(false);
  }, [recipes]);

  const resetGame = useCallback(() => {
    const newRecipes = pickRecipes();
    setRecipes(newRecipes);
    setRecipeIdx(0);
    setCooked([]);
    setCompleted([]);
    setAvailable(shuffle(newRecipes[0].steps));
    setDishRevealed(false);
    setWrongIdx(null);
    setTransitioning(false);
    setFlipPhase(null);
  }, []);

  useEffect(() => {
    if (resetRef) resetRef.current = resetGame;
  }, [resetRef, resetGame]);

  const handleTap = useCallback((step, idx) => {
    if (animating.current || dishRevealed || transitioning) return;
    initAudio();

    const correctStep = recipe.steps[nextStepIdx];
    if (step.label === correctStep.label && step.emoji === correctStep.emoji) {
      animating.current = true;
      sound.correct();
      setCompleted((prev) => [...prev, step]);
      setAvailable((prev) => prev.filter((_, i) => i !== idx));

      const isLast = nextStepIdx === recipe.steps.length - 1;
      if (isLast) {
        setTimeout(() => {
          setDishRevealed(true);
          sound.complete();
          const newCooked = [...cooked, { name: recipe.name, emoji: recipe.emoji }];
          setCooked(newCooked);

          if (onMilestone) onMilestone(50, 40);

          setTimeout(() => {
            const nextIdx = recipeIdx + 1;
            if (nextIdx < recipes.length) {
              setFlipPhase('out');
              setTimeout(() => {
                setRecipeIdx(nextIdx);
                loadRecipe(nextIdx);
                setFlipPhase('in');
                setTimeout(() => {
                  setFlipPhase(null);
                  animating.current = false;
                }, 400);
              }, 400);
            } else {
              if (onGameEnd) onGameEnd({ cooked: newCooked, total: recipes.length });
              animating.current = false;
            }
          }, 2800);
        }, 400);
      } else {
        setTimeout(() => { animating.current = false; }, 300);
      }
    } else {
      sound.wrong();
      setWrongIdx(idx);
      setTimeout(() => setWrongIdx(null), 500);
    }
  }, [recipe, nextStepIdx, dishRevealed, transitioning, cooked, recipeIdx, recipes, onMilestone, onGameEnd, loadRecipe]);

  const stepSize = 80;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '8px 16px', width: '100%', maxWidth: 440, margin: '0 auto' }}>

      {/* ── Progress Dots ── */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 4 }}>
        {recipes.map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i < recipeIdx ? 'var(--game-primary)' : i === recipeIdx ? 'var(--game-accent)' : 'rgba(0,0,0,0.1)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* ── Recipe Card ── */}
      <div style={{
        width: '100%',
        background: '#FFF8E8',
        borderRadius: 18,
        padding: '40px 16px 40px',
        position: 'relative',
        border: 'none',
        perspective: '600px',
        animation: flipPhase === 'out' ? 'chefFlipOut 0.4s ease-in forwards' : flipPhase === 'in' ? 'chefFlipIn 0.4s ease-out forwards' : 'none',
      }}>
        {/* Recipe header */}
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <div style={{ fontFamily: fonts.display, fontSize: '0.75rem', fontWeight: 600, color: '#9A8F82', marginBottom: 2 }}>Let's make</div>
          <div style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: '1.3rem', color: '#2D2A26' }}>{recipe.name}</div>
        </div>

        {/* Recipe steps — the "answer key" */}
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'center' }}>
          {recipe.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <div style={{
                width: stepSize,
                height: stepSize,
                borderRadius: 14,
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                border: i === nextStepIdx && !dishRevealed ? '2px solid var(--didit-blueberry-dark, #3A6CE5)' : '1.5px solid var(--didit-sun, #F0DC90)',
                transition: 'border 0.3s',
              }}>
                <div style={{ fontSize: '2.2rem' }}>{step.emoji}</div>
                <div style={{ fontFamily: fonts.display, fontSize: '0.5rem', fontWeight: 700, color: '#9A8F82', lineHeight: 1, maxWidth: stepSize - 8, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{step.label}</div>
              </div>
              {i < recipe.steps.length - 1 && (
                <span style={{ fontSize: '0.6rem', color: '#9A8F82' }}>→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Cooking Slots ── */}
      <div style={{
        width: '100%',
        background: 'var(--didit-sun, #F0DC90)',
        borderRadius: 18,
        padding: '32px 16px',
        minHeight: 120,
      }}>
        {dishRevealed ? (
          <div style={{ animation: 'chefDishReveal 0.6s cubic-bezier(0.34,1.56,0.64,1)', fontSize: '6rem', textAlign: 'center', width: '100%', padding: '8px 0' }}>
            {recipe.emoji}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {recipe.steps.map((step, i) => {
              const filled = i < completed.length;
              const isNext = i === nextStepIdx;
              return (
                <div key={i} style={{
                  width: stepSize,
                  height: stepSize,
                  borderRadius: 14,
                  background: filled ? 'white' : 'rgba(255,255,255,0.5)',
                  border: isNext
                    ? '2px dashed var(--didit-blueberry-dark, #3A6CE5)'
                    : filled
                      ? '1.5px solid var(--didit-sun, #F0DC90)'
                      : '1.5px dashed var(--didit-sun-mid, #E8B840)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  transition: 'all 0.3s',
                  animation: filled ? 'chefPopIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' : isNext ? 'chefPulse 1.5s ease-in-out infinite' : 'none',
                }}>
                  {filled ? (
                    <div style={{ fontSize: '2.2rem' }}>{completed[i].emoji}</div>
                  ) : (
                    <div style={{ fontFamily: fonts.display, fontSize: '0.7rem', fontWeight: 800, color: 'rgba(0,0,0,0.15)' }}>{i + 1}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Ingredient Tray ── */}
      {!dishRevealed && !transitioning && (
        <div style={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: 8,
          justifyContent: 'center',
          width: '100%',
          padding: '4px 0',
        }}>
          {available.map((step, i) => (
            <button
              key={`${step.label}-${i}`}
              onClick={() => handleTap(step, i)}
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: 'clamp(6px, 2vw, 10px) clamp(4px, 1.5vw, 14px)',
                borderRadius: 18,
                border: 'none',
                background: wrongIdx === i ? 'rgba(207,74,74,0.15)' : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.2s',
                animation: wrongIdx === i ? 'chefShake 0.4s ease' : 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ fontSize: 'clamp(1.6rem, 6vw, 2.5rem)' }}>{step.emoji}</div>
            </button>
          ))}
        </div>
      )}

      {/* Transition */}
      {transitioning && (
        <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: '1rem', color: 'var(--game-primary)', textAlign: 'center', padding: 20 }}>
          Next recipe! 🍽️
        </div>
      )}
    </div>
  );
}
