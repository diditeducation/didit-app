import { useEffect, useRef, useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { trackWishSubmit } from '../analytics';

const KEYFRAMES_ID = 'didit-wish-modal-keyframes';

const keyframesCSS = `
@keyframes wmOverlayIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes wmModalIn {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes wmConfirmPop {
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

/**
 * "Submit a wish" modal — open text field where parents can pitch a
 * profession, skill, or topic they'd like a Did·It game built around.
 *
 * Submissions land in the shared Firestore `feedback` collection
 * tagged with `kind: 'wish'`, alongside the bug reports and longer
 * vibe surveys, so the /admin/feedback page surfaces them in one place.
 */
export default function WishModal({ isOpen, onClose }) {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [btnActive, setBtnActive] = useState(false);
  const taRef = useRef(null);

  useEffect(() => { injectKeyframes(); }, []);

  useEffect(() => {
    if (isOpen) {
      setText('');
      setSubmitted(false);
      setSubmitting(false);
      setTimeout(() => taRef.current?.focus(), 60);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmed = text.trim();
  const canSubmit = trimmed.length > 0 && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        kind: 'wish',
        source: 'hub-wish-card',
        wish: trimmed,                   // reuse same field as Quick modal
        gameName: 'Wish — game request',
        timestamp: serverTimestamp(),
      });
      trackWishSubmit();
      setSubmitted(true);
    } catch (err) {
      console.error('Wish save failed:', err);
      // Still show the success card — submission failures aren't
      // actionable for the user, and quietly losing the message is
      // friendlier than a blocking error.
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
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
    animation: 'wmOverlayIn 0.18s ease-out both',
  };

  const modalStyle = {
    background: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 380,
    padding: '24px 22px',
    boxSizing: 'border-box',
    animation: 'wmModalIn 0.22s ease-out both',
    fontFamily: FONT,
  };

  if (submitted) {
    return (
      <div style={overlayStyle} onClick={onClose}>
        <div
          style={{
            ...modalStyle,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 16, minHeight: 200,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            fontSize: 40,
            animation: 'wmConfirmPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            🪄
          </div>
          <p style={{
            fontFamily: FONT, fontWeight: 700, fontSize: '0.95rem',
            color: '#2D2A26', textAlign: 'center', lineHeight: 1.55,
            margin: 0, maxWidth: 280,
          }}>
            Wish received! Thank you for helping shape what Did·It builds next. 💛
          </p>
          <button
            onClick={onClose}
            style={{
              marginTop: 4,
              background: '#C23C3C', color: '#fff',
              border: 'none', borderRadius: 12,
              padding: '10px 22px',
              fontFamily: FONT, fontWeight: 800, fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ position: 'relative', textAlign: 'center', marginBottom: 14 }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', right: 0, top: 0,
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#aaa', fontSize: '1.1rem', padding: 0, lineHeight: 1,
            }}
            aria-label="Close"
          >
            ✕
          </button>
          <div style={{ fontSize: 32, marginBottom: 4 }}>🪄</div>
          <div style={{
            fontWeight: 900, fontSize: '1.15rem', color: '#C23C3C',
            marginBottom: 4,
          }}>
            Submit a wish
          </div>
          <div style={{
            fontWeight: 500, fontSize: '0.85rem', color: '#5C3D08',
            lineHeight: 1.5, maxWidth: 300, margin: '0 auto',
          }}>
            Pitch a profession or skill we should turn into a game.
            We&apos;re actively seeking ideas from our community and
            endeavour to bring your wishes to life.
          </div>
        </div>

        <textarea
          ref={taRef}
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Little Doctor — anatomy and healing…"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '12px 14px',
            borderRadius: 12,
            border: '1.5px solid #e0e0e0',
            fontFamily: FONT,
            fontSize: '0.92rem',
            color: '#2D2A26',
            resize: 'none',
            outline: 'none',
            transition: 'border 0.15s',
            lineHeight: 1.5,
          }}
          onFocus={(e) => { e.target.style.borderColor = '#C23C3C'; }}
          onBlur={(e)  => { e.target.style.borderColor = '#e0e0e0'; }}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit();
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => { setBtnHover(false); setBtnActive(false); }}
          onMouseDown={() => setBtnActive(true)}
          onMouseUp={() => setBtnActive(false)}
          onTouchStart={() => setBtnActive(true)}
          onTouchEnd={() => setBtnActive(false)}
          style={{
            marginTop: 14,
            width: '100%',
            padding: '13px 0',
            borderRadius: 12,
            border: 'none',
            background: '#C23C3C',
            color: '#fff',
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            opacity: canSubmit ? 1 : 0.5,
            transform: btnActive ? 'scale(0.97)' : btnHover && canSubmit ? 'scale(1.02)' : 'scale(1)',
            transition: `transform 0.2s ${SPRING}, opacity 0.15s ease`,
          }}
        >
          {submitting ? 'Sending…' : 'Send my wish 🪄'}
        </button>
      </div>
    </div>
  );
}
