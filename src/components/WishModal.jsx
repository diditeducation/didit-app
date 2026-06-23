import { useEffect, useRef, useState } from 'react';
import { trackWishSubmit } from '../analytics';
import { FONT, ModalShell, CloseX, SuccessCard, SubmitButton, submitFeedback } from './FeedbackModalBase';

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
  const taRef = useRef(null);

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
      await submitFeedback({
        kind: 'wish',
        source: 'hub-wish-card',
        wish: trimmed,                   // reuse same field as Quick modal
        gameName: 'Wish — game request',
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

  if (submitted) {
    return (
      <SuccessCard onClose={onClose} emoji="🪄" accent="#C23C3C" closeLabel="Close">
        Wish received! Thank you for helping shape what Did·It builds next. 💛
      </SuccessCard>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      <div style={{ position: 'relative', textAlign: 'center', marginBottom: 14 }}>
        <CloseX onClose={onClose} />
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

      <SubmitButton onClick={handleSubmit} disabled={!canSubmit} accent="#C23C3C">
        {submitting ? 'Sending…' : 'Send my wish 🪄'}
      </SubmitButton>
    </ModalShell>
  );
}
