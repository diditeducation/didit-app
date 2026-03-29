import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

const FONT = "'Nunito', sans-serif";

const QUESTIONS = [
  { key: 'q1', label: 'What do you like about Did It?' },
  { key: 'q2', label: 'What do you think we can improve?' },
  { key: 'q3', label: 'Do you have any requests/wishes you\'d like for us to build, or issues you\'d like for us to fix?' },
];

export default function FeedbackModal({ open, onClose, gameId = null, userId = null }) {
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        gameId,
        userId,
        q1: answers.q1,
        q2: answers.q2,
        q3: answers.q3,
        timestamp: serverTimestamp(),
      });
    } catch (_) {
      // fail silently — don't block the user
    }
    setSubmitting(false);
    setDone(true);
    setTimeout(() => {
      setDone(false);
      setAnswers({ q1: '', q2: '', q3: '' });
      onClose();
    }, 1800);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF', borderRadius: 20,
          padding: '28px 24px', width: '100%', maxWidth: 380,
          boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div style={{ textAlign: 'center', padding: '24px 0', fontFamily: FONT }}>
            <div style={{ fontSize: '2.4rem', marginBottom: 12 }}>🙌</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#2D2A26' }}>Thanks so much!</div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#9A8F82', marginTop: 6 }}>Your feedback means the world to us.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: '1.1rem', color: '#2D2A26' }}>
              💬 Share your thoughts
            </div>

            {QUESTIONS.map(({ key, label }) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.82rem', color: '#2D2A26' }}>
                  {label}
                </label>
                <textarea
                  value={answers[key]}
                  onChange={(e) => setAnswers((a) => ({ ...a, [key]: e.target.value }))}
                  rows={2}
                  style={{
                    fontFamily: FONT, fontSize: '0.88rem', color: '#2D2A26',
                    border: '1.5px solid #EDE5D8', borderRadius: 10, padding: '10px 12px',
                    resize: 'none', outline: 'none', lineHeight: 1.5,
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#9BB5E8')}
                  onBlur={(e) => (e.target.style.borderColor = '#EDE5D8')}
                />
              </div>
            ))}

            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 9999, border: 'none',
                  background: '#2D2A26', color: '#FFFFFF', fontFamily: FONT,
                  fontWeight: 800, fontSize: '0.88rem', cursor: submitting ? 'wait' : 'pointer',
                  opacity: submitting ? 0.7 : 1, transition: 'opacity 0.2s',
                }}
              >
                {submitting ? 'Sending…' : 'Send feedback →'}
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '12px 18px', borderRadius: 9999,
                  border: '1.5px solid #EDE5D8', background: 'transparent',
                  fontFamily: FONT, fontWeight: 700, fontSize: '0.88rem',
                  color: '#9A8F82', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
