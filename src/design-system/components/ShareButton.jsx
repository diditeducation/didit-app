import { useState, useRef } from 'react';
import { trackShareClick } from '../../analytics';

// Text and URL kept separate — iOS iMessage combines them into one bubble correctly.
// Embedding the URL inside the text string causes iOS to split it into two message bubbles.
const SHARE_TEXT = "Hey! Just discovered Did·It. These games pack in real life concepts such as finance, engineering, music production into simple games little kids enjoy. Give it a go! ✨";
const SHARE_URL  = "https://didit.games";

export default function ShareButton({ label = 'Share with a friend 🔗', style = {}, gameId = null }) {
  const [copied, setCopied] = useState(false);
  const busy = useRef(false);

  const handleShare = async (e) => {
    e.stopPropagation();
    if (busy.current) return;
    busy.current = true;
    trackShareClick(gameId);
    try {
      if (navigator.share) {
        await navigator.share({ text: SHARE_TEXT, url: SHARE_URL });
      } else {
        await navigator.clipboard.writeText(`${SHARE_TEXT} → ${SHARE_URL}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (_) {
      // user cancelled — do nothing
    } finally {
      busy.current = false;
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
