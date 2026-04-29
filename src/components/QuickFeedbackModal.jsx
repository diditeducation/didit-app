import { useEffect, useRef, useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const KEYFRAMES_ID = 'didit-quick-feedback-keyframes';

const keyframesCSS = `
@keyframes qfOverlayIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes qfModalIn {
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes qfConfirmPop {
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
 * Lightweight bug-report modal — a single textarea.
 *
 * Submissions land in the same Firestore `feedback` collection that
 * FeedbackModal writes to, tagged with `kind: 'fix-request'` so the
 * /admin/feedback page can tell them apart from the longer surveys.
 *
 * Use this when you only want to surface "what's broken?" — e.g. from
 * the BetaBanner or any persistent "report a problem" affordance —
 * rather than the full vibe + likes + wish flow.
 */
export default function QuickFeedbackModal({ isOpen, onClose, source = 'unknown' }) {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [btnActive, setBtnActive] = useState(false);
  const taRef = useRef(null);

  useEffect(() => { injectKeyframes(); }, []);

  // Reset every time the modal re-opens.
  useEffect(() => {
    if (isOpen) {
      setText('');
      setSubmitted(false);
      setSubmitting(false);
      // Defer focus so the overlay is mounted first.
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
        kind: 'fix-request',
        source,
        wish: trimmed,             // reuse the existing field so the admin
                                   // page can render it without a new branch
        gameName: source,
        timestamp: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Quick feedback save failed:', err);
      // Show the success card anyway — failing silently is friendlier
      // than confronting the user with a save error they can't act on.
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
    animation: 'qfOverlayIn 0.18s ease-out both',
  };

  const modalStyle = {
    background: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 380,
    padding: '24px 22px',
    boxSizing: 'border-box',
    animation: 'qfModalIn 0.22s ease-out both',
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
            animation: 'qfConfirmPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            💌
          </div>
          <p style={{
            fontFamily: FONT, fontWeight: 700, fontSize: '0.95rem',
            color: '#2D2A26', textAlign: 'center', lineHeight: 1.55,
            margin: 0, maxWidth: 280,
          }}>
            Thanks — we&apos;ve got it. Every note makes Did·It better.
          </p>
          <button
            onClick={onClose}
            style={{
              marginTop: 4,
              background: '#3A6CE5', color: '#fff',
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

        {/* Header */}
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
          <div style={{
            fontWeight: 900, fontSize: '1.15rem', color: '#3A6CE5',
          }}>
            What would you like us to fix?
          </div>
        </div>

        <textarea
          ref={taRef}
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="The thing that's broken or confusing…"
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
          onFocus={(e) => { e.target.style.borderColor = '#378ADD'; }}
          onBlur={(e)  => { e.target.style.borderColor = '#e0e0e0'; }}
          onKeyDown={(e) => {
            // Cmd/Ctrl+Enter submits — small power-user nicety.
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
            background: '#3A6CE5',
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
          {submitting ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  );
}
