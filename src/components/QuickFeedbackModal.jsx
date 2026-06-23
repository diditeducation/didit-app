import { useEffect, useRef, useState } from 'react';
import { FONT, ModalShell, CloseX, SuccessCard, SubmitButton, submitFeedback } from './FeedbackModalBase';

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
  const taRef = useRef(null);

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
      await submitFeedback({
        kind: 'fix-request',
        source,
        wish: trimmed,             // reuse the existing field so the admin
                                   // page can render it without a new branch
        gameName: source,
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

  if (submitted) {
    return (
      <SuccessCard onClose={onClose} emoji="💌" accent="#3A6CE5" closeLabel="Close">
        Thank you for helping us make Did·It better. 💛
      </SuccessCard>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      {/* Header */}
      <div style={{ position: 'relative', textAlign: 'center', marginBottom: 14 }}>
        <CloseX onClose={onClose} />
        <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#3A6CE5' }}>
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

      <SubmitButton onClick={handleSubmit} disabled={!canSubmit} accent="#3A6CE5">
        {submitting ? 'Sending…' : 'Send'}
      </SubmitButton>
    </ModalShell>
  );
}
