import { useNavigate } from 'react-router-dom';
import { fonts, colors } from '../design-system/tokens';

/**
 * About / philosophy page.
 *
 * Mirrors LandingPage's dark "Did*It" header layout, but instead of the
 * games grid, presents the philosophy writeup. Linked from HubPage
 * footer + every GameHomeLayout's parent-tip "Read more about Did·It →".
 */
export default function AboutPage() {
  const nav = useNavigate();

  const pageStyle = {
    minHeight: '100vh',
    background: colors.night,
    color: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: fonts.body,
    padding: '0 24px',
    boxSizing: 'border-box',
  };

  const headerStyle = {
    marginTop: '64px',
    textAlign: 'center',
  };

  const titleStyle = {
    fontFamily: fonts.display,
    fontWeight: 900,
    fontSize: '4rem',
    userSelect: 'none',
    cursor: 'pointer',
  };

  const asteriskStyle = {
    color: colors.coral,
  };

  const subtitleStyle = {
    fontFamily: fonts.body,
    fontSize: '1.2rem',
    color: colors.muted,
    marginTop: '8px',
  };

  const bodyStyle = {
    width: '100%',
    maxWidth: '560px',
    marginTop: '48px',
    paddingBottom: '64px',
    color: '#FFFFFF',
  };

  const sectionTitle = {
    fontFamily: fonts.display,
    fontWeight: 900,
    fontSize: '1.15rem',
    margin: '32px 0 8px',
    letterSpacing: '0.01em',
  };

  const para = {
    fontFamily: fonts.body,
    fontWeight: 400,
    fontSize: '1rem',
    lineHeight: 1.65,
    margin: '0 0 12px',
    color: 'rgba(255,255,255,0.85)',
  };

  const strongStyle = { color: '#FFFFFF', fontWeight: 700 };

  const backBtn = {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#FFFFFF',
    borderRadius: 9999,
    padding: '8px 16px',
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    marginTop: 32,
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={titleStyle} onClick={() => nav('/hub')}>
          Did<span style={asteriskStyle}>*</span>It
        </div>
        <div style={subtitleStyle}>Small games. Big ideas.</div>
        <span
          style={{
            display: 'inline-block',
            marginTop: 10,
            fontFamily: fonts.display,
            fontWeight: 900,
            fontSize: 9,
            letterSpacing: '0.18em',
            color: 'rgba(255,255,255,0.85)',
            background: 'rgba(255,255,255,0.14)',
            padding: '2px 8px',
            borderRadius: 999,
          }}
        >
          BETA
        </span>
      </div>

      <div style={bodyStyle}>
        <h2 style={sectionTitle}>What we&apos;re actually teaching</h2>
        <p style={para}>
          Every Did·It game is a tiny lesson in a real-world way of thinking,
          smuggled into a toddler-friendly puzzle. Sequencing, trade-offs,
          categorisation, opportunity cost, pattern recognition, structured
          problem solving — the kinds of mental moves grown-ups rely on every
          day. We don&apos;t name them. The kid just plays.
        </p>

        <h2 style={sectionTitle}>Three rules we never break</h2>
        <p style={para}>
          <span style={strongStyle}>No fail states.</span> Wrong answers
          gently animate and reset. Nothing is &quot;you got it wrong.&quot;
          Curiosity beats correctness at this age.
        </p>
        <p style={para}>
          <span style={strongStyle}>No text instructions for kids.</span>{' '}
          Toddlers can&apos;t read. The mechanic teaches itself or it&apos;s
          not the right mechanic.
        </p>
        <p style={para}>
          <span style={strongStyle}>Celebrate every step.</span> Every correct
          action gets confetti, a chime, a small reveal. Reinforcement is the
          lesson.
        </p>

        <h2 style={sectionTitle}>Co-play, not screen-time</h2>
        <p style={para}>
          Each game ships with a Grown-up Guide explaining what the child is
          learning, why it matters, and how to extend the lesson into real
          life. Sit beside them, narrate, and ask questions. The science is
          unambiguous: parental commentary during play is a multiplier on
          everything else.
        </p>

        <h2 style={sectionTitle}>Why &quot;Did·It&quot;</h2>
        <p style={para}>
          The first time a toddler sees their own action cause a result —
          stack the block, light the bulb, sort the shape — they say it out
          loud: <em>&quot;I did it.&quot;</em> That moment is the whole goal.
          Every game in the app is engineered to deliver that moment, again
          and again.
        </p>

        <h2 style={sectionTitle}>Our Design Philosophy</h2>
        <p style={para}>
          <span style={strongStyle}>Play together — that&apos;s the magic.</span>{' '}
          The games are a tool in your parenting toolkit, for you and your child
          to explore together. Your encouragement and coaching makes the learning
          moment more magical.
        </p>
        <p style={para}>
          <span style={strongStyle}>Big concepts, made simple.</span> The ideas
          may be big, but the games are simple. Designed for tiny fingers, they
          are intuitive and tactile, without being overwhelming.
        </p>
        <p style={para}>
          <span style={strongStyle}>No clutter, no surprises.</span> A clean,
          safe, distraction-free space. Designed for your child to explore and
          for you to feel at ease. Zero ads, ever.
        </p>

        <h2 style={sectionTitle}>Our Story</h2>
        <p style={para}>
          We&apos;re Danne &amp; Nigel, parents from Sydney with a wonderfully
          energetic, curious toddler. Teaching him is one of our favourite things
          to do together — but every game we found was either loud and mindless,
          or never went beyond letters and numbers.
        </p>
        <p style={para}>
          So we built our own. The more we played, the more we saw how capable
          little minds really are — they can stretch so much further than we give
          them credit for. We hope your family gets to discover that too. {'🧡'}
        </p>

        <button onClick={() => nav('/hub')} style={backBtn}>← Back to games</button>
      </div>
    </div>
  );
}
