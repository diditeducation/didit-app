import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { initAudio, sound } from './audio';

/* ── Palette ── */
const C = {
  bg: '#FFFFFF',
  surface: '#FFFFFF',
  border: '#E0F0A8',
  text: '#2D2A26',
  textSoft: '#2D2A26',
  textMuted: '#2D2A26',
  success: '#4CC830',
  warning: '#CF4A4A',
  accent: '#2EA820',
};

const C_card = {
  nightSky: '#E0F0A8',
  nightEdge: '#BEE060',
};

const font = "'Nunito', sans-serif";

/* ── Item sets ── */
const ITEM_SETS = [
  [
    { emoji: '🍬', name: 'Candy', price: 1 },
    { emoji: '🍦', name: 'Ice Cream', price: 2 },
    { emoji: '🎂', name: 'Cake', price: 3 },
    { emoji: '🎮', name: 'Game', price: 4 },
    { emoji: '🚀', name: 'Rocket', price: 5 },
  ],
  [
    { emoji: '🍭', name: 'Lollipop', price: 1 },
    { emoji: '🎈', name: 'Balloon', price: 2 },
    { emoji: '🪆', name: 'Doll', price: 3 },
    { emoji: '🚂', name: 'Train', price: 4 },
    { emoji: '🛴', name: 'Scooter', price: 5 },
  ],
  [
    { emoji: '🍪', name: 'Cookie', price: 1 },
    { emoji: '🪁', name: 'Kite', price: 2 },
    { emoji: '🚗', name: 'Toy Car', price: 3 },
    { emoji: '🎨', name: 'Art Set', price: 4 },
    { emoji: '🚁', name: 'Helicopter', price: 5 },
  ],
];

const START_COINS = 10;

const KEYFRAMES_ID = 'didit-shopgame-keyframes';
const keyframesCSS = `
@keyframes sg-popIn{from{opacity:0}to{opacity:1}}
@keyframes sg-flyDown{from{transform:translateY(0);opacity:1}to{transform:translateY(30px);opacity:0}}
@keyframes sg-flyUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes sg-pulse{0%,100%{opacity:0.2}50%{opacity:0.5}}
@keyframes sg-fadeIn{from{opacity:0}to{opacity:1}}
@keyframes sg-ambientPulse{0%,100%{opacity:0.6}50%{opacity:1}}
@keyframes sg-glowPulse{0%,100%{opacity:0.5;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.2)}}
@keyframes sg-floatCoin1{0%{transform:translate(0,0) rotate(0deg)}33%{transform:translate(15px,-20px) rotate(15deg)}66%{transform:translate(-10px,-35px) rotate(-8deg)}100%{transform:translate(0,0) rotate(0deg)}}
@keyframes sg-floatCoin2{0%{transform:translate(0,0) rotate(0deg)}33%{transform:translate(-18px,-15px) rotate(-12deg)}66%{transform:translate(12px,-30px) rotate(10deg)}100%{transform:translate(0,0) rotate(0deg)}}
@keyframes sg-floatCoin3{0%{transform:translate(0,0) rotate(0deg)}33%{transform:translate(10px,-25px) rotate(8deg)}66%{transform:translate(-15px,-18px) rotate(-14deg)}100%{transform:translate(0,0) rotate(0deg)}}
@keyframes sg-floatCoin4{0%{transform:translate(0,0) rotate(0deg)}33%{transform:translate(-12px,-28px) rotate(-10deg)}66%{transform:translate(18px,-12px) rotate(12deg)}100%{transform:translate(0,0) rotate(0deg)}}
@keyframes sg-floatCoin5{0%{transform:translate(0,0) rotate(0deg)}33%{transform:translate(8px,-32px) rotate(6deg)}66%{transform:translate(-20px,-22px) rotate(-16deg)}100%{transform:translate(0,0) rotate(0deg)}}
@keyframes sg-starBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
.sg-flyDown{animation:sg-flyDown 0.22s ease-in forwards!important}
.sg-flyUp{animation:sg-flyUp 0.2s ease-out forwards!important}
`;

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const s = document.createElement('style');
  s.id = KEYFRAMES_ID;
  s.textContent = keyframesCSS;
  document.head.appendChild(s);
}

function pickRandom() {
  return ITEM_SETS[Math.floor(Math.random() * ITEM_SETS.length)];
}

function makeWallet(count, startId) {
  return Array.from({ length: count }, (_, i) => ({ id: startId + i }));
}

/* ───────────────────── Ambient Glow (replaces Starfield) ───────────────────── */
const AmbientGlow = ({ flash }) => (
  <div
    style={{
      position: 'absolute',
      top: -40,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 280,
      height: 200,
      borderRadius: '50%',
      background: 'radial-gradient(ellipse, rgba(78,255,136,0.06) 0%, transparent 70%)',
      pointerEvents: 'none',
      zIndex: 0,
      animation: 'sg-ambientPulse 3s ease-in-out infinite',
      opacity: flash ? 0.12 : undefined,
      transition: 'opacity 0.3s',
    }}
  />
);

/* ───────────────────── Floating Coin Particles ───────────────────── */
const FLOAT_PARTICLES = [
  { left: '8%', top: '12%', size: 18, opacity: 0.08, anim: 'sg-floatCoin1', dur: 10, delay: 0 },
  { left: '85%', top: '8%', size: 22, opacity: 0.06, anim: 'sg-floatCoin2', dur: 12, delay: 1.5 },
  { left: '5%', top: '50%', size: 16, opacity: 0.1, anim: 'sg-floatCoin3', dur: 9, delay: 0.8 },
  { left: '90%', top: '45%', size: 20, opacity: 0.07, anim: 'sg-floatCoin4', dur: 11, delay: 2 },
  { left: '50%', top: '85%', size: 24, opacity: 0.06, anim: 'sg-floatCoin5', dur: 14, delay: 3 },
  { left: '30%', top: '75%', size: 17, opacity: 0.09, anim: 'sg-floatCoin1', dur: 13, delay: 1 },
];

const FloatingParticles = () => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
    {FLOAT_PARTICLES.map((p, i) => (
      <span
        key={i}
        style={{
          position: 'absolute',
          left: p.left,
          top: p.top,
          fontSize: p.size,
          opacity: p.opacity,
          animation: `${p.anim} ${p.dur}s ease-in-out ${p.delay}s infinite`,
        }}
      >
        🪙
      </span>
    ))}
  </div>
);

/* ───────────────────── Coin Component ───────────────────── */
function Coin({ variant = 'wallet', onTap, animClass, dimmed, onDragStart, coinSize }) {
  const isPayment = variant === 'payment';
  const size = coinSize || 'clamp(36px, 8vw, 44px)';
  const bg = isPayment
    ? 'radial-gradient(circle at 36% 30%, #e8f8a0 0%, #c8d820 26%, #a0b018 58%, #707800 100%)'
    : 'radial-gradient(circle at 36% 30%, #fff9c0 0%, #f5c535 26%, #d4a010 58%, #a07008 100%)';
  const borderColor = isPayment ? '#606000' : '#7a5006';
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (onTap) onTap();
      }}
      className={animClass || ''}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        border: 'none',
        boxShadow: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
        touchAction: 'none',
        flexShrink: 0,
        transition: 'transform 0.12s ease, opacity 0.15s',
        opacity: dimmed ? 0.4 : 1,
      }}
      onPointerDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.88)';
        if (onDragStart) onDragStart(e);
      }}
      onPointerUp={(e) => {
        e.currentTarget.style.transform = '';
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.transform = '';
      }}
      onPointerEnter={(e) => {
        if (!animClass) e.currentTarget.style.transform = 'translateY(-3px) scale(1.08)';
      }}
    >
      {/* Highlight oval */}
      <div
        style={{
          position: 'absolute',
          top: '14%',
          left: '20%',
          width: '32%',
          height: '20%',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.35)',
          pointerEvents: 'none',
        }}
      />
      {/* Label */}
      <span
        style={{
          fontSize: 'clamp(0.5rem, 1.6vw, 0.65rem)',
          fontWeight: 900,
          fontFamily: font,
          color: isPayment ? '#404000' : '#7a5000',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      >
        $1
      </span>
    </div>
  );
}

/* ───────────────────── Empty Coin Slot ───────────────────── */
function EmptySlot() {
  return (
    <div
      style={{
        width: 'clamp(36px, 8vw, 44px)',
        height: 'clamp(36px, 8vw, 44px)',
        borderRadius: '50%',
        border: '2px dashed rgba(255,255,255,0.1)',
        background: 'transparent',
        flexShrink: 0,
      }}
    />
  );
}

/* ───────────────────── Ghost Coin (drag) ───────────────────── */
function GhostCoin({ x, y }) {
  return (
    <div
      style={{
        position: 'fixed',
        left: x - 27,
        top: y - 27,
        width: 54,
        height: 54,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 36% 30%, #fff9c0 0%, #f5c535 26%, #d4a010 58%, #a07008 100%)',
        border: 'none',
        boxShadow: 'none',
        zIndex: 9999,
        pointerEvents: 'none',
        opacity: 0.92,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          fontSize: '0.6rem',
          fontWeight: 900,
          fontFamily: font,
          color: '#7a5000',
        }}
      >
        $1
      </span>
    </div>
  );
}

/* ───────────────────── Mini Confetti Burst ───────────────────── */
const CONFETTI_COLORS = ['#4eff88', '#f0c030', '#ffffff', '#9BB5E8', '#E8AAAA'];

function fireConfetti(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  canvas.width = W;
  canvas.height = H;

  const particles = Array.from({ length: 30 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 60;
    return {
      x: W * 0.5,
      y: H * 0.4,
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      size: 3 + Math.random() * 3,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      dur: 0.6 + Math.random() * 0.3,
      elapsed: 0,
    };
  });

  let last = performance.now();
  function tick(now) {
    const dt = (now - last) / 1000;
    last = now;
    ctx.clearRect(0, 0, W, H);
    let alive = false;
    for (const p of particles) {
      p.elapsed += dt;
      if (p.elapsed >= p.dur) continue;
      alive = true;
      const progress = p.elapsed / p.dur;
      const x = p.x + p.dx * progress;
      const y = p.y + p.dy * progress + 30 * progress * progress;
      ctx.globalAlpha = 1 - progress;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (alive) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, W, H);
  }
  requestAnimationFrame(tick);
}

/* ═══════════════════════════════════════════════════════════
   ShopGame — single continuous flow
   ═══════════════════════════════════════════════════════════ */
export default function ShopGame({ onMilestone, onComplete, onGameEnd, resetRef }) {
  const [items, setItems] = useState(() => pickRandom());
  const [wallet, setWallet] = useState(() => makeWallet(START_COINS, 0));
  const [payment, setPayment] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [bought, setBought] = useState([]);
  const [showEnd, setShowEnd] = useState(false);
  const [itemPop, setItemPop] = useState(true);
  const [showHint, setShowHint] = useState(true);
  const [flyDownIds, setFlyDownIds] = useState(new Set());
  const [flyUpIds, setFlyUpIds] = useState(new Set());
  const [fadeItem, setFadeItem] = useState(false);
  const [buyFlash, setBuyFlash] = useState(false);
  const [buySuccessFlash, setBuySuccessFlash] = useState(false);
  const [itemVisible, setItemVisible] = useState(true);

  const animating = useRef(false);
  const idGen = useRef(START_COINS);
  const milestoneFired = useRef(false);
  const trayRef = useRef(null);
  const confettiRef = useRef(null);

  /* Drag state */
  const [dragging, setDragging] = useState(null);
  const dragCoinId = useRef(null);

  useEffect(() => {
    injectKeyframes();
  }, []);

  const currentItem = items[qIdx];
  const exact = payment.length === currentItem?.price;
  const over = payment.length > (currentItem?.price || 0);
  const cantAfford = wallet.length + payment.length < (currentItem?.price || 0);
  const needMore = payment.length > 0 && payment.length < (currentItem?.price || 0);

  /* ── Load next item ── */
  const loadItem = useCallback((idx) => {
    setPayment([]);
    setQIdx(idx);
    setItemPop(false);
    setFadeItem(false);
    setItemVisible(true);
    requestAnimationFrame(() => setItemPop(true));
  }, []);

  /* ── End screen ── */
  const showEndScreen = useCallback(() => {
    setPayment([]);
    setShowEnd(true);
  }, []);

  const gameEndFired = useRef(false);

  /* Fire onGameEnd + milestone after game ends */
  useEffect(() => {
    if (!showEnd) return;
    if (!gameEndFired.current) {
      gameEndFired.current = true;
      if (onGameEnd) onGameEnd({ bought, saved: wallet.length });
      if (onComplete) onComplete();
    }
    if (!milestoneFired.current) {
      const saved = wallet.length;
      if (saved > 0 && onMilestone) {
        milestoneFired.current = true;
        const t = setTimeout(() => onMilestone(50, 40), 800);
        return () => clearTimeout(t);
      }
    }
  }, [showEnd, wallet.length, bought, onMilestone, onComplete, onGameEnd]);

  /* ── Reset game (called from parent via ref) ── */
  const resetGame = useCallback(() => {
    const newSet = ITEM_SETS[Math.floor(Math.random() * ITEM_SETS.length)];
    setItems(newSet);
    setWallet(Array.from({ length: START_COINS }, () => ({ id: idGen.current++ })));
    setPayment([]);
    setQIdx(0);
    setBought([]);
    setShowEnd(false);
    setItemPop(false);
    setShowHint(true);
    setFadeItem(false);
    setFlyDownIds(new Set());
    setFlyUpIds(new Set());
    setBuyFlash(false);
    setBuySuccessFlash(false);
    setItemVisible(true);
    setDragging(null);
    animating.current = false;
    milestoneFired.current = false;
    gameEndFired.current = false;
    requestAnimationFrame(() => setItemPop(true));
  }, []);

  useEffect(() => {
    if (resetRef) resetRef.current = resetGame;
  }, [resetRef, resetGame]);

  /* ── Tap wallet coin (always removes LAST coin) ── */
  const handleTapWallet = useCallback(
    () => {
      if (animating.current || showEnd || wallet.length === 0) return;
      animating.current = true;
      initAudio();
      sound.coin();

      /* Always target the last coin in wallet */
      const lastCoin = wallet[wallet.length - 1];
      setFlyDownIds(new Set([lastCoin.id]));
      setShowHint(false);

      setTimeout(() => {
        setWallet((w) => w.slice(0, -1));
        setPayment((p) => [...p, { id: lastCoin.id }]);
        setFlyDownIds(new Set());
        animating.current = false;
      }, 220);
    },
    [showEnd, wallet]
  );

  /* ── Tap payment coin ── */
  const handleTapPayment = useCallback(
    (coinId) => {
      if (showEnd) return;
      setFlyUpIds(new Set([coinId]));
      setTimeout(() => {
        setPayment((p) => p.filter((c) => c.id !== coinId));
        setWallet((w) => [...w, { id: coinId }]);
        setFlyUpIds(new Set());
      }, 200);
    },
    [showEnd]
  );

  /* ── Drag handlers ── */
  const handleDragStart = useCallback(
    (e) => {
      if (animating.current || showEnd || wallet.length === 0) return;
      e.preventDefault();
      /* Always target last coin for drag too */
      const lastCoin = wallet[wallet.length - 1];
      dragCoinId.current = lastCoin.id;
      setDragging({ coinId: lastCoin.id, x: e.clientX, y: e.clientY });
    },
    [showEnd, wallet]
  );

  const handlePointerMove = useCallback((e) => {
    if (dragCoinId.current == null) return;
    setDragging((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : null));
  }, []);

  const handlePointerUp = useCallback((e) => {
    if (dragCoinId.current == null) return;
    const coinId = dragCoinId.current;
    dragCoinId.current = null;
    if (trayRef.current) {
      const rect = trayRef.current.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        initAudio();
        sound.coin();
        setWallet((w) => w.filter((c) => c.id !== coinId));
        setPayment((p) => [...p, { id: coinId }]);
        setShowHint(false);
      }
    }
    setDragging(null);
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  /* ── Buy ── */
  const handleBuy = useCallback(() => {
    if (!exact || animating.current) return;
    animating.current = true;
    initAudio();
    sound.kaching();

    /* Immediate: hide hints, glow + confetti + green flash */
    setShowHint(false);
    const ids = new Set(payment.map((c) => c.id));
    setFlyDownIds(ids);
    setBuyFlash(true);
    setBuySuccessFlash(true);
    fireConfetti(confettiRef.current);

    /* After 220ms: clear flyDown, record purchase */
    setTimeout(() => {
      setFlyDownIds(new Set());
      setBought((b) => [...b, currentItem]);
      sound.correct();
    }, 220);

    /* Glow off after 1200ms */
    setTimeout(() => setBuyFlash(false), 1200);

    /* 1500ms: green flash off + load next item */
    setTimeout(() => {
      setBuySuccessFlash(false);
      const nextIdx = qIdx + 1;
      if (nextIdx >= items.length) {
        setPayment([]);
        animating.current = false;
        showEndScreen();
      } else {
        setPayment([]);
        setQIdx(nextIdx);
        setFadeItem(false);
        setItemPop(false);
        setTimeout(() => {
          animating.current = false;
          requestAnimationFrame(() => setItemPop(true));
        }, 100);
      }
    }, 1500);
  }, [exact, payment, currentItem, qIdx, items.length, showEndScreen]);

  /* ── Skip ── */
  const handleSkip = useCallback(() => {
    if (animating.current || showEnd) return;
    setWallet((w) => [...w, ...payment]);
    setPayment([]);
    setFadeItem(true);
    setTimeout(() => {
      if (qIdx + 1 >= items.length) {
        showEndScreen();
      } else {
        loadItem(qIdx + 1);
      }
    }, 200);
  }, [qIdx, showEnd, payment, showEndScreen, loadItem]);

  /* ── Hint text logic ── */
  let hintText = '';
  let hintColor = '#ff4444';
  if (!showEnd && currentItem) {
    if (cantAfford) {
      hintText = 'Not enough coins, try saving for next time! 💰';
    } else if (over) {
      hintText = `${payment.length - currentItem.price} too many, tap a coin to remove`;
    } else if (needMore) {
      hintText = `Add ${currentItem.price - payment.length} more`;
      hintColor = C.textSoft;
    }
  }

  /* ── Wallet grid: first N = filled coins, last (10-N) = empty slots ── */
  const walletCount = wallet.length;
  const lastCoinId = wallet.length > 0 ? wallet[wallet.length - 1].id : null;

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: font,
      }}
    >
      {/* ── Dynamic Background ── */}
      <FloatingParticles />

      {/* ── A. Wallet Box (above scene card) ── */}
      <div style={{ flexShrink: 0, padding: '12px 0 0', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            background: C_card.nightSky,
            borderRadius: 18,
            padding: '10px 14px',
            maxWidth: 340,
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.02em',
                color: '#2D2A26',
                fontFamily: font,
              }}
            >
              Your wallet
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: wallet.length <= 2 ? '#CF4A4A' : '#2D2A26',
                fontFamily: font,
              }}
            >
              {`$${wallet.length}`}
            </span>
          </div>
          {/* 2×5 grid — first N filled, rest empty */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gridTemplateRows: 'repeat(2, auto)',
              gap: 4,
              justifyItems: 'center',
            }}
          >
            {Array.from({ length: START_COINS }, (_, slotIdx) => {
              if (slotIdx < walletCount) {
                const coin = wallet[slotIdx];
                const isLast = slotIdx === walletCount - 1;
                return (
                  <Coin
                    key={`slot-${slotIdx}`}
                    variant="wallet"
                    animClass={flyDownIds.has(coin.id) ? 'sg-flyDown' : ''}
                    dimmed={dragging && dragging.coinId === coin.id}
                    onTap={handleTapWallet}
                    onDragStart={handleDragStart}
                  />
                );
              }
              return <EmptySlot key={`slot-${slotIdx}`} />;
            })}
          </div>
        </div>
      </div>

      {/* ── Gap between wallet and scene card ── */}
      <div style={{ height: 6, flexShrink: 0 }} />

      {/* ── Scene Card ── */}
      <div
        style={{
          width: '100%',
          maxWidth: 340,
          borderRadius: 18,
          border: 'none',
          background: buySuccessFlash
            ? '#BEE060'
            : C_card.nightSky,
          boxShadow: 'none',
          overflow: 'hidden',
          position: 'relative',
          margin: '0 auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1,
          boxSizing: 'border-box',
          transition: buySuccessFlash
            ? 'background 0.1s ease-in'
            : 'background 0.5s ease-out',
        }}
      >

        {/* Confetti canvas */}
        <canvas
          ref={confettiRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />

        {/* ── A. Item Section ── */}
        {!showEnd && currentItem && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              zIndex: 2,
              padding: '16px 13px 3px',
              position: 'relative',
            }}
          >
            {/* Instruction hint — hidden during buySuccessFlash */}
            {!buySuccessFlash && (
              <div
                style={{
                  fontSize: 'clamp(0.65rem, 2vw, 0.78rem)',
                  fontWeight: 700,
                  color: C.accent,
                  fontFamily: font,
                  opacity: showHint ? 1 : 0,
                  transition: 'opacity 0.3s',
                  pointerEvents: 'none',
                  textAlign: 'center',
                  marginBottom: 2,
                }}
              >
                Tap a coin to pay, or skip to pass
              </div>
            )}

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div
                key={`item-${qIdx}`}
                style={{
                  fontSize: 'clamp(3rem, 14vw, 5rem)',
                  lineHeight: 1,
                  animation: itemPop ? 'sg-popIn 0.4s ease-out' : 'none',
                  opacity: fadeItem ? 0.15 : itemVisible ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }}
              >
                {currentItem.emoji}
              </div>
              {/* overlay moved to scene card level */}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#2D2A26',
                fontFamily: font,
                opacity: itemVisible ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}
            >
              {currentItem.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, opacity: itemVisible ? 1 : 0, transition: 'opacity 0.3s ease' }}>
              <span
                style={{
                  fontSize: 'clamp(1rem, 4vw, 1.4rem)',
                  fontWeight: 700,
                  color: '#2D2A26',
                  fontFamily: font,
                  transition: 'color 0.1s',
                }}
              >
                $
              </span>
              <span
                style={{
                  fontSize: 'clamp(1.4rem, 6vw, 2.2rem)',
                  fontWeight: 900,
                  color: '#2D2A26',
                  fontFamily: font,
                  transition: 'color 0.1s',
                }}
              >
                {currentItem.price}
              </span>
            </div>

            {/* Arrow hint — hidden during buySuccessFlash */}
          </div>
        )}

        {/* ── B. Payment Tray Section ── */}
        {!showEnd && (
          <div
            style={{
              flexShrink: 0,
              borderTop: 'none',
              padding: '8px 13px',
              zIndex: 2,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  color: '#2D2A26',
                  fontFamily: font,
                }}
              >
                Paying
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  fontFamily: font,
                  color: over ? '#CF4A4A' : '#2D2A26',
                }}
              >
                {`$${payment.length}`}
              </span>
            </div>
            <div
              ref={trayRef}
              style={{
                background: '#FFFFFF',
                border: 'none',
                borderRadius: 12,
                minHeight: 48,
                padding: '6px 10px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.3s',
                boxShadow: 'none',
              }}
            >
              {payment.length === 0 && (
                <span
                  style={{
                    color: '#9A8F82',
                    fontSize: '0.75rem',
                    fontFamily: font,
                  }}
                >
                  tap coins to pay
                </span>
              )}
              {payment.map((coin) => (
                <Coin
                  key={coin.id}
                  variant="payment"
                  animClass={
                    flyDownIds.has(coin.id)
                      ? 'sg-flyDown'
                      : flyUpIds.has(coin.id)
                        ? 'sg-flyUp'
                        : ''
                  }
                  onTap={() => handleTapPayment(coin.id)}
                />
              ))}
            </div>
            {/* Hint text */}
            <div
              style={{
                minHeight: '1em',
                textAlign: 'center',
                fontSize: 'clamp(0.6rem, 2vw, 0.78rem)',
                fontWeight: 700,
                color: hintColor,
                fontFamily: font,
                marginTop: 4,
              }}
            >
              {hintText}
            </div>
          </div>
        )}

      </div>

      {/* ── Buttons OUTSIDE scene card ── */}
      {!showEnd && (
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            padding: '8px 24px 10px',
            maxWidth: 480,
            margin: '0 auto',
            width: '100%',
            position: 'relative',
            zIndex: 1,
            boxSizing: 'border-box',
          }}
        >
          {/* Buy button */}
          <button
            onClick={handleBuy}
            style={{
              position: 'relative',
              borderRadius: 9999,
              border: '2px solid var(--game-primary)',
              fontFamily: font,
              fontWeight: 800,
              fontSize: '1rem',
              padding: '12px 36px',
              cursor: exact ? 'pointer' : 'default',
              transition: 'all 0.2s',
              background: exact
                ? 'var(--game-primary)'
                : 'color-mix(in srgb, var(--game-primary) 20%, transparent)',
              color: exact ? '#ffffff' : 'var(--game-primary)',
              opacity: exact ? 1 : 0.5,
              boxShadow: 'none',
              pointerEvents: exact ? 'all' : 'none',
            }}
            onPointerDown={(e) => {
              if (exact) e.currentTarget.style.transform = 'scale(0.93) translateY(2px)';
            }}
            onPointerUp={(e) => {
              e.currentTarget.style.transform = '';
            }}
          >
            Buy {currentItem?.emoji}
          </button>

          {/* Skip button */}
          <button
            onClick={handleSkip}
            style={{
              borderRadius: 9999,
              fontFamily: font,
              fontWeight: 800,
              fontSize: '1rem',
              padding: '12px 36px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: exact
                ? 'color-mix(in srgb, var(--game-primary) 30%, transparent)'
                : 'var(--game-primary)',
              color: exact ? 'var(--game-primary)' : '#ffffff',
              border: exact
                ? '2px solid color-mix(in srgb, var(--game-primary) 40%, transparent)'
                : '2px solid var(--game-primary)',
              opacity: exact ? 0.5 : 1,
              boxShadow: 'none',
            }}
            onPointerDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.93)';
            }}
            onPointerUp={(e) => {
              e.currentTarget.style.transform = '';
            }}
          >
            Skip ▶
          </button>
        </div>
      )}

      {/* Ghost coin for dragging */}
      {dragging && <GhostCoin x={dragging.x} y={dragging.y} />}
    </div>
  );
}
