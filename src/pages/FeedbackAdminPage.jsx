import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { fonts, colors } from '../design-system/tokens';

/**
 * Admin-only feedback inbox at /admin/feedback.
 *
 * Reads from the same Firestore `feedback` collection that
 * FeedbackModal writes to. Access is gated by email — only addresses
 * listed in ADMIN_EMAILS see the data; everyone else gets a polite
 * not-authorised screen.
 *
 * To add a new admin: append the email here. (For tighter security
 * later, move the gate to Firestore security rules + a custom claim.)
 */
const ADMIN_EMAILS = [
  'dannelim@gmail.com',
  // add more emails here
];

const VIBE_LABELS = ['', 'Not great', "It's okay", 'Loved it', 'Amazing'];
const VIBE_EMOJIS = ['', '😞', '🙂', '😄', '🤩'];

function formatTimestamp(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString();
}

function csvEscape(value) {
  if (value == null) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function downloadCSV(items) {
  const headers = ['Date', 'Game', 'Vibe', 'Likes', 'Other', 'Wish'];
  const rows = items.map((it) => [
    formatTimestamp(it.timestamp),
    it.gameName || '',
    it.vibeLabel || '',
    Array.isArray(it.likes) ? it.likes.join(' / ') : '',
    it.other || '',
    it.wish || '',
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map(csvEscape).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `didit-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function FeedbackAdminPage() {
  const { user } = useAuth();
  const [items, setItems] = useState(null); // null = loading
  const [error, setError] = useState(null);

  const isAdmin = !!user && ADMIN_EMAILS.includes((user.email || '').toLowerCase());

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItems(rows);
      },
      (err) => {
        console.error('feedback fetch failed', err);
        setError(err.message || 'Failed to load feedback');
      },
    );
    return unsub;
  }, [isAdmin]);

  if (user === undefined) {
    return <Frame><Centered text="Checking sign-in…" /></Frame>;
  }
  if (!user) {
    return (
      <Frame>
        <Centered
          text="You need to sign in to view feedback."
          cta={{ label: 'Go to sign in', href: '/signin' }}
        />
      </Frame>
    );
  }
  if (!isAdmin) {
    return (
      <Frame>
        <Centered
          title="Not authorised"
          text={`This page is admin-only. Signed in as ${user.email || 'unknown'}.`}
        />
      </Frame>
    );
  }
  if (error) {
    return (
      <Frame>
        <Centered title="Couldn't load feedback" text={error} />
      </Frame>
    );
  }
  if (items === null) {
    return <Frame><Centered text="Loading…" /></Frame>;
  }

  return (
    <Frame>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16, gap: 12, flexWrap: 'wrap',
      }}>
        <div>
          <h1 style={{
            fontFamily: fonts.display, fontWeight: 900, fontSize: 22,
            color: colors.text, margin: 0,
          }}>
            Feedback inbox
          </h1>
          <div style={{
            fontFamily: fonts.body, fontSize: 13, color: colors.muted,
            marginTop: 2,
          }}>
            {items.length} {items.length === 1 ? 'submission' : 'submissions'}
            {' · '}live updates
          </div>
        </div>
        <button
          onClick={() => downloadCSV(items)}
          disabled={items.length === 0}
          style={{
            background: colors.blueberryDark, color: '#FFFFFF',
            border: 'none', borderRadius: 9999,
            padding: '10px 18px',
            fontFamily: fonts.display, fontWeight: 800, fontSize: 13,
            cursor: items.length === 0 ? 'not-allowed' : 'pointer',
            opacity: items.length === 0 ? 0.5 : 1,
          }}
        >
          Download CSV
        </button>
      </header>

      {items.length === 0 ? (
        <Centered text="No feedback yet — share the app and check back!" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((it) => <FeedbackCard key={it.id} item={it} />)}
        </div>
      )}
    </Frame>
  );
}

function FeedbackCard({ item }) {
  const vibeLabel = item.vibeLabel || (item.vibe ? VIBE_LABELS[item.vibe] : '');
  const vibeEmoji = item.vibe ? VIBE_EMOJIS[item.vibe] : '';
  return (
    <div style={{
      background: '#FFFFFF', borderRadius: 14,
      border: `1px solid ${colors.border}`,
      padding: '14px 16px',
      fontFamily: fonts.body,
    }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: 8, flexWrap: 'wrap',
      }}>
        <div style={{
          fontFamily: fonts.display, fontWeight: 800, fontSize: 14,
          color: colors.text,
        }}>
          {item.gameName || 'Unknown game'}
          {vibeLabel && (
            <span style={{
              marginLeft: 8, fontWeight: 600, fontSize: 12,
              color: colors.muted,
            }}>
              {vibeEmoji} {vibeLabel}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: colors.muted }}>
          {formatTimestamp(item.timestamp)}
        </div>
      </div>

      {Array.isArray(item.likes) && item.likes.length > 0 && (
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {item.likes.map((id) => (
            <span key={id} style={{
              fontSize: 11, fontWeight: 700,
              background: '#E1F5EE', color: '#085041',
              padding: '4px 10px', borderRadius: 9999,
            }}>
              {id}
            </span>
          ))}
        </div>
      )}

      {item.other && (
        <Block label="Something else they liked" body={item.other} />
      )}
      {item.wish && (
        <Block label="One thing they wish Did·It had" body={item.wish} />
      )}
    </div>
  );
}

function Block({ label, body }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: colors.muted,
        letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 14, color: colors.text, marginTop: 2,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {body}
      </div>
    </div>
  );
}

function Frame({ children }) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: '#FFFBF5',
      padding: '24px 20px 80px',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {children}
      </div>
    </div>
  );
}

function Centered({ title, text, cta }) {
  return (
    <div style={{
      padding: '60px 20px',
      textAlign: 'center',
      fontFamily: fonts.body,
      color: colors.text,
    }}>
      {title && (
        <div style={{
          fontFamily: fonts.display, fontWeight: 900, fontSize: 18,
          marginBottom: 6,
        }}>
          {title}
        </div>
      )}
      <div style={{ color: colors.muted, fontSize: 14 }}>{text}</div>
      {cta && (
        <a
          href={cta.href}
          style={{
            display: 'inline-block', marginTop: 16,
            background: colors.blueberryDark, color: '#FFFFFF',
            textDecoration: 'none',
            borderRadius: 9999, padding: '10px 20px',
            fontFamily: fonts.display, fontWeight: 800, fontSize: 13,
          }}
        >
          {cta.label}
        </a>
      )}
    </div>
  );
}
