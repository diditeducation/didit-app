import { useState } from 'react';
import { colors, fonts } from '../design-system/tokens';

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{
        fontSize: 11,
        fontWeight: 800,
        color: colors.muted,
        fontFamily: fonts.display,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        marginBottom: 10,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function ParentGuide({ guide }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ background: 'white' }}>
      {/* Toggle button — flush under the hero card */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '13px 20px',
          background: 'transparent',
          border: 'none',
          borderTop: `1px solid ${colors.border}`,
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: 14,
          color: colors.text,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span>💡 Grown-up Guide</span>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: colors.border,
          fontSize: 10,
          fontWeight: 800,
          transition: 'transform 0.3s ease',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          flexShrink: 0,
        }}>
          ↓
        </span>
      </button>

      {/* Expandable body */}
      <div style={{
        maxHeight: open ? '2400px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.55s ease',
      }}>
        <div style={{ padding: '4px 20px 28px' }}>

          {/* ── What they're learning ── */}
          <Section title="What they're learning">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '5px 12px',
              borderRadius: '9999px',
              background: `color-mix(in srgb, ${guide.conceptColor} 12%, transparent)`,
              color: guide.conceptColor,
              fontSize: 12,
              fontWeight: 800,
              fontFamily: fonts.display,
              marginBottom: 12,
            }}>
              {guide.concept}
            </div>
            <p style={{
              fontSize: 14,
              lineHeight: 1.65,
              color: colors.text,
              margin: 0,
              fontFamily: fonts.display,
              fontWeight: 500,
            }}>
              {guide.explanation}
            </p>
          </Section>

          {/* ── The science ── */}
          <Section title="The science">
            <div style={{
              background: '#F3F0FA',
              borderRadius: 14,
              padding: '14px 16px',
              borderLeft: '3px solid #9B8DD4',
            }}>
              <p style={{
                fontSize: 13,
                lineHeight: 1.65,
                color: '#3D2E72',
                margin: 0,
                fontFamily: fonts.display,
                fontWeight: 500,
              }}>
                {guide.science.text}
              </p>
            </div>
          </Section>

          {/* ── Skill ladder ── */}
          <Section title="Skill building blocks">
            <div style={{ position: 'relative', paddingLeft: 32 }}>
              {/* Vertical connector line */}
              <div style={{
                position: 'absolute',
                left: 9,
                top: 18,
                bottom: 18,
                width: 2,
                background: `linear-gradient(to bottom, ${guide.ladder[0].color}, ${guide.ladder[2].color})`,
                borderRadius: 9999,
                opacity: 0.4,
              }} />

              {guide.ladder.map((step, i) => (
                <div
                  key={i}
                  style={{
                    position: 'relative',
                    marginBottom: i < guide.ladder.length - 1 ? 22 : 0,
                  }}
                >
                  {/* Dot */}
                  <div style={{
                    position: 'absolute',
                    left: -32,
                    top: 1,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: step.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: i === 2 ? 11 : 0,
                    zIndex: 1,
                    boxShadow: `0 0 0 3px white, 0 0 0 4px ${step.color}22`,
                  }}>
                    {i === 2 ? '🏆' : ''}
                  </div>

                  <div style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: step.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    marginBottom: 2,
                    fontFamily: fonts.display,
                  }}>
                    {step.label}
                  </div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: colors.text,
                    marginBottom: 3,
                    fontFamily: fonts.display,
                  }}>
                    {step.title}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: colors.muted,
                    lineHeight: 1.5,
                    fontFamily: fonts.display,
                  }}>
                    {step.desc}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── How to play together ── */}
          <Section title="How to play together">
            <div style={{
              background: '#FFF7EB',
              borderRadius: 14,
              padding: '14px 16px',
              borderLeft: `3px solid ${colors.sunMid}`,
            }}>
              <p style={{
                fontSize: 13,
                lineHeight: 1.65,
                color: '#5C3D08',
                margin: '0 0 12px',
                fontFamily: fonts.display,
                fontWeight: 500,
              }}>
                {guide.tip.text}
              </p>
              <div style={{
                background: 'white',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: 700,
                color: '#7A5010',
                fontFamily: fonts.display,
                borderLeft: `2px solid ${colors.sunMid}`,
              }}>
                Ask: {guide.tip.question}
              </div>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
}
