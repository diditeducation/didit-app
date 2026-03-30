import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const KEYFRAMES_ID = 'didit-feedback-modal-keyframes';

const keyframesCSS = `
@keyframes fbOverlayIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes fbModalIn {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes fbConfirmPop {
  0%   { opacity: 0; transform: scale(0); }
  60%  { opacity: 1; transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}
`;

function injectKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = keyframesCSS;
  document.head.appendChild(style);
}

const FONT = "'Nunito', sans-serif";
const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

const VIBES = [
  { emoji: '😞', label: 'Not great',  border: '#E24B4A', bg: '#FCEBEB', text: '#A32D2D' },
  { emoji: '🙂', label: 'It\'s okay', border: '#EF9F27', bg: '#FAEEDA', text: '#854F0B' },
  { emoji: '😄', label: 'Loved it',   border: '#1D9E75', bg: '#E1F5EE', text: '#085041' },
  { emoji: '🤩', label: 'Amazing',    border: '#7F77DD', bg: '#EEEDFE', text: '#3C3489' },
];

const CHIPS = [
  { id: 'easy',        emoji: '🎮', label: 'Easy to play' },
  { id: 'safe',        emoji: '🔒', label: 'Safe for kids' },
  { id: 'teaches',     emoji: '🧠', label: 'Teaches real things' },
  { id: 'together',    emoji: '🤝', label: 'Fun together' },
  { id: 'looks',       emoji: '🎨', label: 'Looks great' },
  { id: 'noads',       emoji: '⚡', label: 'No ads or distractions' },
  { id: 'childloves',  emoji: '😊', label: 'My child loves it' },
  { id: 'other',       emoji: '✏️', label: 'Something else' },
];

const ACTIVE_CHIP = { border: '#1D9E75', bg: '#E1F5EE', text: '#085041' };

function Divider() {
  return <div style={{ width: '100%', height: 0, borderTop: '0.5px solid #e8e8e8', margin: '20px 0' }} />;
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.82rem', color: '#666', marginBottom: 12 }}>
      {children}
    </div>
  );
}

export default function FeedbackModal({ isOpen, onClose, gameName = '' }) {
  const [vibe, setVibe]           = useState(null);
  const [likes, setLikes]         = useState(new Set());
  const [otherText, setOtherText] = useState('');
  const [wish, setWish]           = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [vibeScale, setVibeScale] = useState({});
  const [chipScale, setChipScale] = useState({});
  const [btnHover, setBtnHover]   = useState(false);
  const [btnActive, setBtnActive] = useState(false);
  const wishRef = useRef(null);

  useEffect(() => { injectKeyframes(); }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setVibe(null);
      setLikes(new Set());
      setOtherText('');
      setWish('');
      setSubmitted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Progress: dot 1 = vibe selected, dot 2 = any like chip, dot 3 = wish has content
  const dot1 = vibe !== null;
  const dot2 = likes.size > 0;
  const dot3 = wish.trim().length > 0;

  function toggleLike(id) {
    setChipScale(s => ({ ...s, [id]: true }));
    setTimeout(() => setChipScale(s => ({ ...s, [id]: false })), 300);
    setLikes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectVibe(i) {
    setVibeScale(s => ({ ...s, [i]: true }));
    setTimeout(() => setVibeScale(s => ({ ...s, [i]: false })), 300);
    setVibe(i);
  }

  function handleSubmit() {
    const payload = {
      gameName,
      vibe: vibe !== null ? vibe + 1 : null,
      vibeLabel: vibe !== null ? VIBES[vibe].label : null,
      likes: [...likes].filter(id => id !== 'other'),
      other: likes.has('other') ? otherText.trim() : null,
      wish: wish.trim(),
    };
    addDoc(collection(db, 'feedback'), { ...payload, timestamp: serverTimestamp() })
      .catch((err) => console.error('Feedback save failed:', err));
    setSubmitted(true);
  }

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 500,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 16px',
    animation: 'fbOverlayIn 0.18s ease-out both',
  };

  const modalStyle = {
    background: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 380,
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '24px 22px',
    boxSizing: 'border-box',
    animation: 'fbModalIn 0.22s ease-out both',
    fontFamily: FONT,
  };

  /* ── Confirmation ── */
  if (submitted) {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div style={{ ...modalStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, minHeight: 200 }}>
          <div style={{ fontSize: 40, animation: 'fbConfirmPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}>💌</div>
          <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.95rem', color: '#2D2A26', textAlign: 'center', lineHeight: 1.55, margin: 0, maxWidth: 280 }}>
            Thank you for taking the time! 💛 We value your input and read every single piece of feedback. It's going to help make Did It! even better for the kids and carers to enjoy. Cheers!
          </p>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <button
              onClick={onClose}
              style={{ position: 'absolute', right: 0, top: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '1.1rem', padding: 0, lineHeight: 1 }}
              aria-label="Close"
            >
              ✕
            </button>
            <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#3A6CE5', marginBottom: 4 }}>
              How was that?
            </div>
            <div style={{ fontWeight: 400, fontSize: '0.72rem', color: '#000', fontStyle: 'italic' }}>
              Only takes 30 seconds
            </div>
          </div>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'center' }}>
            {[dot1, dot2, dot3].map((filled, i) => (
              <div
                key={i}
                style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: filled ? '#1D9E75' : '#e0e0e0',
                  transition: 'background 0.25s ease',
                }}
              />
            ))}
          </div>
        </div>

        <Divider />

        {/* Section 1 — Vibe */}
        <SectionLabel>Overall vibe</SectionLabel>
        <div style={{ display: 'flex', gap: 8 }}>
          {VIBES.map((v, i) => {
            const active = vibe === i;
            const springing = vibeScale[i];
            return (
              <button
                key={i}
                onClick={() => selectVibe(i)}
                style={{
                  flex: 1,
                  height: 64,
                  borderRadius: 14,
                  border: `1.5px solid ${active ? v.border : '#e0e0e0'}`,
                  background: active ? v.bg : '#fafafa',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  padding: 0,
                  transition: 'border 0.12s, background 0.12s',
                  transform: springing ? 'scale(1.12)' : 'scale(1)',
                  transitionProperty: 'border, background, transform',
                  transitionDuration: springing ? '0.3s' : '0.12s',
                  transitionTimingFunction: springing ? SPRING : 'ease',
                }}
              >
                <span style={{ fontSize: 24, lineHeight: 1 }}>{v.emoji}</span>
                <span style={{ fontSize: 10, fontFamily: FONT, fontWeight: 700, color: active ? v.text : '#999', lineHeight: 1 }}>
                  {v.label}
                </span>
              </button>
            );
          })}
        </div>

        <Divider />

        {/* Section 2 — Likes */}
        <SectionLabel>What did you like? Pick all that apply</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CHIPS.map(chip => {
            const active = likes.has(chip.id);
            const springing = chipScale[chip.id];
            return (
              <button
                key={chip.id}
                onClick={() => toggleLike(chip.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '7px 12px',
                  borderRadius: 9999,
                  border: `1.5px solid ${active ? ACTIVE_CHIP.border : '#e0e0e0'}`,
                  background: active ? ACTIVE_CHIP.bg : '#fafafa',
                  cursor: 'pointer',
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  color: active ? ACTIVE_CHIP.text : '#555',
                  transition: 'border 0.12s, background 0.12s, color 0.12s',
                  transform: springing ? 'scale(1.12)' : 'scale(1)',
                  transitionProperty: 'border, background, color, transform',
                  transitionDuration: springing ? '0.3s' : '0.12s',
                  transitionTimingFunction: springing ? SPRING : 'ease',
                }}
              >
                <span style={{ fontSize: 13 }}>{chip.emoji}</span>
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* "Something else" text input */}
        {likes.has('other') && (
          <input
            autoFocus
            type="text"
            value={otherText}
            onChange={e => setOtherText(e.target.value)}
            placeholder="What else did you like?"
            style={{
              marginTop: 10,
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1.5px solid #e0e0e0',
              fontFamily: FONT,
              fontSize: '0.85rem',
              color: '#2D2A26',
              outline: 'none',
              transition: 'border 0.15s',
            }}
            onFocus={e => { e.target.style.borderColor = '#378ADD'; e.target.style.background = '#fff'; }}
            onBlur={e  => { e.target.style.borderColor = '#e0e0e0'; }}
          />
        )}

        <Divider />

        {/* Section 3 — Wish */}
        <SectionLabel>One thing you wish Did·It had</SectionLabel>
        <textarea
          ref={wishRef}
          rows={2}
          value={wish}
          onChange={e => setWish(e.target.value)}
          placeholder="More games, different topics, offline mode…"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '10px 14px',
            borderRadius: 10,
            border: '1.5px solid #e0e0e0',
            fontFamily: FONT,
            fontSize: '0.85rem',
            color: '#2D2A26',
            resize: 'none',
            outline: 'none',
            transition: 'border 0.15s',
            lineHeight: 1.5,
          }}
          onFocus={e => { e.target.style.borderColor = '#378ADD'; e.target.style.background = '#fff'; }}
          onBlur={e  => { e.target.style.borderColor = '#e0e0e0'; }}
        />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => { setBtnHover(false); setBtnActive(false); }}
          onMouseDown={() => setBtnActive(true)}
          onMouseUp={() => setBtnActive(false)}
          onTouchStart={() => setBtnActive(true)}
          onTouchEnd={() => setBtnActive(false)}
          style={{
            marginTop: 18,
            width: '100%',
            padding: '13px 0',
            borderRadius: 12,
            border: 'none',
            background: '#3A6CE5',
            color: '#fff',
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            transform: btnActive ? 'scale(0.97)' : btnHover ? 'scale(1.02)' : 'scale(1)',
            transition: `transform 0.2s ${SPRING}`,
          }}
        >
          Send feedback →
        </button>
      </div>
    </div>
  );
}
