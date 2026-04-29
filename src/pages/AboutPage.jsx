import { useNavigate } from 'react-router-dom';
import { colors, fonts } from '../design-system/tokens';
import { PAGE_MAX_WIDTH } from '../design-system/layout';

const SECTION_GAP = 28;

/**
 * About / philosophy page.
 *
 * Linked from the HubPage footer + every GameHomeLayout's parent-tip
 * "Read more about Did·It →". Lives at /about.
 */
export default function AboutPage() {
  const nav = useNavigate();

  const wrapStyle = {
    minHeight: '100dvh',
    background: '#FFFBF5',
    color: colors.text,
    fontFamily: fonts.display,
    padding: '24px 24px 88px',
  };
  const innerStyle = {
    maxWidth: PAGE_MAX_WIDTH,
    margin: '0 auto',
  };
  const headerBtnStyle = {
    background: 'rgba(0,0,0,0.05)',
    border: 'none',
    borderRadius: 9999,
    padding: '8px 16px',
    fontFamily: fonts.display,
    fontWeight: 700,
    fontSize: 13,
    color: colors.text,
    cursor: 'pointer',
  };
  const heroStyle = {
    fontWeight: 900,
    fontSize: 'clamp(2rem, 6vw, 2.6rem)',
    lineHeight: 1.1,
    color: colors.text,
    margin: '24px 0 8px',
    letterSpacing: '-0.01em',
  };
  const subStyle = {
    fontWeight: 600,
    fontSize: 16,
    color: colors.muted,
    margin: '0 0 32px',
    lineHeight: 1.55,
  };
  const sectionTitle = {
    fontWeight: 900,
    fontSize: 18,
    color: colors.text,
    margin: `${SECTION_GAP}px 0 8px`,
    letterSpacing: '0.01em',
  };
  const para = {
    fontWeight: 500,
    fontSize: 15,
    color: colors.text,
    lineHeight: 1.65,
    margin: '0 0 12px',
  };

  return (
    <div style={wrapStyle}>
      <div style={innerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => nav('/hub')} style={headerBtnStyle}>← Back</button>
          <img src="/logo.png" alt="Did It!" style={{ height: 28 }} />
        </div>

        <h1 style={heroStyle}>About Did·It</h1>
        <p style={subStyle}>
          A toddler app built on one belief: the most important things kids
          will need to know aren&apos;t a curriculum — they&apos;re ways of
          thinking.
        </p>

        <h2 style={sectionTitle}>What we&apos;re actually teaching</h2>
        <p style={para}>
          Every Did·It game is a tiny lesson in a real-world way of thinking,
          smuggled into a toddler-friendly puzzle. Sequencing, trade-offs,
          MECE categorisation, opportunity cost, pattern recognition,
          structured problem solving — the kinds of mental moves grown-ups
          rely on every day. We don&apos;t name them. The kid just plays.
        </p>

        <h2 style={sectionTitle}>Three rules we never break</h2>
        <p style={para}>
          <strong>No fail states.</strong> Wrong answers gently animate and
          reset. Nothing is &quot;you got it wrong.&quot; Curiosity beats
          correctness at this age.
        </p>
        <p style={para}>
          <strong>No text instructions for kids.</strong> Toddlers
          can&apos;t read. The mechanic teaches itself or it&apos;s not the
          right mechanic.
        </p>
        <p style={para}>
          <strong>Celebrate every step.</strong> Every correct action gets
          confetti, a chime, a small reveal. Reinforcement is the lesson.
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

        <div style={{ marginTop: SECTION_GAP, color: colors.muted, fontSize: 13 }}>
          Questions, ideas, complaints? We read everything that comes via
          the in-app feedback button.
        </div>
      </div>
    </div>
  );
}
