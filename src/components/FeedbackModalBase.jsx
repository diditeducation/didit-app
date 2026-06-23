import { useEffect, useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Shared shell for the three feedback-style modals — FeedbackModal (full
 * vibe + likes + wish survey), QuickFeedbackModal (bug report) and WishModal
 * (game request). They all open the same overlay/card, run the same open/
 * confirm animations, and write to the same Firestore `feedback` collection
 * (tagged by `kind`/`source`), so the scaffolding lives here once and each
 * modal supplies only its own header, fields and copy.
 */

export const FONT = "'Nunito', sans-serif";
export const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

const KEYFRAMES_ID = 'didit-feedback-modal-keyframes';
const keyframesCSS = `
@keyframes diditModalOverlayIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes diditModalIn {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes diditModalConfirmPop {
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

function overlayStyle() {
  return {
    position: 'fixed',
    inset: 0,
    zIndex: 500,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 16px',
    animation: 'diditModalOverlayIn 0.18s ease-out both',
  };
}

function modalStyle(scroll) {
  return {
    background: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 380,
    ...(scroll ? { maxHeight: '90vh', overflowY: 'auto' } : null),
    padding: '24px 22px',
    boxSizing: 'border-box',
    animation: 'diditModalIn 0.22s ease-out both',
    fontFamily: FONT,
  };
}

/** Write a feedback document. Returns the addDoc promise so callers can
 *  await it or fire-and-forget with `.catch`. */
export function submitFeedback(payload) {
  return addDoc(collection(db, 'feedback'), { ...payload, timestamp: serverTimestamp() });
}

/** Overlay + white card. Click-outside closes; clicks inside don't bubble. */
export function ModalShell({ onClose, scroll = false, children }) {
  useEffect(() => { injectKeyframes(); }, []);
  return (
    <div style={overlayStyle()} onClick={onClose}>
      <div style={modalStyle(scroll)} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/** Absolutely-positioned ✕ for a card header. Parent must be position: relative. */
export function CloseX({ onClose }) {
  return (
    <button
      onClick={onClose}
      aria-label="Close"
      style={{
        position: 'absolute', right: 0, top: 0,
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#aaa', fontSize: '1.1rem', padding: 0, lineHeight: 1,
      }}
    >
      ✕
    </button>
  );
}

/**
 * Post-submit confirmation card with a popping emoji and a thank-you message.
 * Pass `closeLabel` to show an explicit close button (clicks inside the card
 * are then captured); omit it and the whole card click-closes — matching the
 * two historical variants.
 */
export function SuccessCard({ onClose, emoji, accent = '#3A6CE5', closeLabel, children }) {
  useEffect(() => { injectKeyframes(); }, []);
  const hasButton = !!closeLabel;
  return (
    <div style={overlayStyle()} onClick={onClose}>
      <div
        style={{
          ...modalStyle(false),
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 16, minHeight: 200,
        }}
        onClick={hasButton ? (e) => e.stopPropagation() : undefined}
      >
        <div style={{ fontSize: 40, animation: `diditModalConfirmPop 0.45s ${SPRING} both` }}>
          {emoji}
        </div>
        <p style={{
          fontFamily: FONT, fontWeight: 700, fontSize: '0.95rem',
          color: '#2D2A26', textAlign: 'center', lineHeight: 1.55,
          margin: 0, maxWidth: 280,
        }}>
          {children}
        </p>
        {hasButton && (
          <button
            onClick={onClose}
            style={{
              marginTop: 4,
              background: accent, color: '#fff',
              border: 'none', borderRadius: 12,
              padding: '10px 22px',
              fontFamily: FONT, fontWeight: 800, fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {closeLabel}
          </button>
        )}
      </div>
    </div>
  );
}

/** Full-width primary submit button with hover/press spring + disabled state. */
export function SubmitButton({ onClick, disabled = false, accent = '#3A6CE5', marginTop = 14, children }) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const enabled = !disabled;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      onTouchStart={() => setActive(true)}
      onTouchEnd={() => setActive(false)}
      style={{
        marginTop,
        width: '100%',
        padding: '13px 0',
        borderRadius: 12,
        border: 'none',
        background: accent,
        color: '#fff',
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: '0.92rem',
        cursor: enabled ? 'pointer' : 'not-allowed',
        opacity: enabled ? 1 : 0.5,
        transform: active ? 'scale(0.97)' : (hover && enabled) ? 'scale(1.02)' : 'scale(1)',
        transition: `transform 0.2s ${SPRING}, opacity 0.15s ease`,
      }}
    >
      {children}
    </button>
  );
}
