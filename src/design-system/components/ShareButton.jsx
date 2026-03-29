import { useState } from 'react';

const SHARE_TEXT = "We've been playing Did It! with the kids — fun little learning games. Check it out → https://didit.games";

export default function ShareButton({ label = 'Share with a friend 🔗', style = {} }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        // Include URL in text so every app shows it — don't rely on the url field alone
        await navigator.share({ title: 'Did It!', text: SHARE_TEXT });
      } catch (_) {
        // user cancelled — do nothing
      }
    } else {
      try {
        await navigator.clipboard.writeText(SHARE_TEXT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (_) {
        // clipboard not available
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      style={{
        background: 'none', border: 'none', padding: 0,
        fontFamily: "'Nunito', sans-serif", fontWeight: 700,
        fontSize: '0.85rem', color: copied ? '#4CC830' : '#9A8F82',
        cursor: 'pointer', textDecoration: 'underline',
        textDecorationStyle: 'dotted', transition: 'color 0.2s',
        ...style,
      }}
    >
      {copied ? 'Link copied! ✓' : label}
    </button>
  );
}
