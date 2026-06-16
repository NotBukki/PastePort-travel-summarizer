import { useState, useEffect, useCallback } from 'react';

const TOUR_KEY = 'pp_tour_v1';

const STEPS = [
  {
    target: 'segment-text-first',
    title: 'Add your booking documents',
    body: 'Paste raw text from any confirmation email, or switch to file mode to upload a PDF or image — whatever format you have.',
    icon: '📋',
  },
  {
    target: 'segment-mode-toggle-first',
    title: 'Text or file — your choice',
    body: 'Use this toggle to switch between pasting text and uploading a file. Each document slot can be a different type.',
    icon: '🔀',
  },
  {
    target: 'traveler-type-selector',
    title: 'Choose your travel style',
    body: 'Budget, mid-range, or luxury — this calibrates budget estimates and local recommendations to how you actually travel.',
    icon: '🧭',
  },
  {
    target: 'btn-parse-trip',
    title: "You're all set!",
    body: 'Hit Parse and Claude AI will build your full itinerary with timeline, daily budgets, and local tips in seconds.',
    icon: '✈️',
  },
];

const PAD = 10;
const TOOLTIP_W = 300;

export default function OnboardingTour() {
  const [active,  setActive]  = useState(false);
  const [step,    setStep]    = useState(0);
  const [rect,    setRect]    = useState(null);
  const [fading,  setFading]  = useState(false);

  useEffect(() => {
    if (localStorage.getItem(TOUR_KEY) !== 'true') {
      const t = setTimeout(() => setActive(true), 900);
      return () => clearTimeout(t);
    }
  }, []);

  const measure = useCallback((idx) => {
    const el = document.getElementById(STEPS[idx].target);
    if (!el) return;
    el.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'nearest' });
    const r = el.getBoundingClientRect();
    setRect({ left: r.left, top: r.top, width: r.width, height: r.height });
  }, []);

  useEffect(() => {
    if (!active) return;
    measure(step);
    const onResize = () => measure(step);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [active, step, measure]);

  const dismiss = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setActive(false);
  };

  const goTo = (next) => {
    setFading(true);
    setTimeout(() => { setStep(next); setFading(false); }, 180);
  };

  const next = () => step === STEPS.length - 1 ? dismiss() : goTo(step + 1);
  const prev = () => step > 0 && goTo(step - 1);

  if (!active || !rect) return null;

  const sx = rect.left - PAD;
  const sy = rect.top  - PAD;
  const sw = rect.width  + PAD * 2;
  const sh = rect.height + PAD * 2;

  const isLower = (sy + sh / 2) > window.innerHeight * 0.55;
  const tLeft   = Math.max(12, Math.min(sx + sw / 2 - TOOLTIP_W / 2, window.innerWidth - TOOLTIP_W - 12));
  const tPos    = isLower
    ? { left: tLeft, bottom: window.innerHeight - sy + 16 }
    : { left: tLeft, top:    sy + sh + 16 };

  const s = STEPS[step];

  return (
    <>
      {/* ── Dark overlay with transparent cutout ── */}
      <svg
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1100, width: '100vw', height: '100vh' }}
        aria-hidden="true"
      >
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect x={sx} y={sy} width={sw} height={sh} rx="14" fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(6,10,20,0.82)" mask="url(#tour-mask)" />
      </svg>

      {/* ── Highlight ring ── */}
      <div
        aria-hidden="true"
        className="fixed pointer-events-none"
        style={{
          zIndex: 1101,
          left: sx, top: sy, width: sw, height: sh,
          borderRadius: 14,
          border: '2px solid rgba(124,58,237,0.7)',
          boxShadow: '0 0 0 1px rgba(124,58,237,0.2), 0 0 28px rgba(124,58,237,0.22)',
          transition: 'left 0.38s cubic-bezier(0.4,0,0.2,1), top 0.38s cubic-bezier(0.4,0,0.2,1), width 0.38s cubic-bezier(0.4,0,0.2,1), height 0.38s cubic-bezier(0.4,0,0.2,1)',
        }}
      />

      {/* ── Click-outside-to-dismiss backdrop ── */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 1099 }}
        onClick={dismiss}
        aria-label="Dismiss tutorial"
      />

      {/* ── Tooltip ── */}
      <div
        role="dialog"
        aria-label={`Tutorial step ${step + 1} of ${STEPS.length}: ${s.title}`}
        className="fixed"
        style={{
          zIndex: 1102,
          width: TOOLTIP_W,
          opacity:   fading ? 0 : 1,
          transform: fading ? 'translateY(8px)' : 'translateY(0)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
          ...tPos,
        }}
      >
        <div
          style={{
            background: 'rgba(13,19,36,0.98)',
            border: '1px solid rgba(124,58,237,0.35)',
            borderRadius: 18,
            padding: 20,
            boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.08)',
          }}
        >
          {/* Step dots + skip */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 5,
                    borderRadius: 3,
                    width:      i === step ? 18 : 5,
                    background: i === step ? '#7c3aed' : i < step ? 'rgba(124,58,237,0.38)' : 'rgba(255,255,255,0.11)',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
            <button
              onClick={dismiss}
              className="bg-transparent border-none cursor-pointer font-sans transition-colors duration-200 text-ink-faint hover:text-ink-dim"
              style={{ fontSize: '0.72rem', padding: '2px 4px' }}
            >
              Skip tour
            </button>
          </div>

          {/* Icon + text */}
          <div className="flex items-start gap-3 mb-5">
            <span style={{ fontSize: '1.5rem', lineHeight: 1, marginTop: 2, flexShrink: 0 }}>
              {s.icon}
            </span>
            <div>
              <div
                className="text-ink font-bold mb-1"
                style={{ fontSize: '0.95rem', letterSpacing: '-0.01em', lineHeight: 1.3 }}
              >
                {s.title}
              </div>
              <div className="text-ink-dim" style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
                {s.body}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-2">
            {step > 0 ? (
              <button
                onClick={prev}
                className="font-sans cursor-pointer transition-all duration-200 hover:text-ink"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  color: '#94a3b8',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  padding: '7px 14px',
                }}
              >
                ← Back
              </button>
            ) : <div />}
            <button
              onClick={next}
              className="font-sans cursor-pointer transition-all duration-200 hover:-translate-y-px"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                border: 'none',
                borderRadius: 10,
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 700,
                padding: '7px 18px',
                boxShadow: '0 4px 14px rgba(124,58,237,0.38)',
              }}
            >
              {step === STEPS.length - 1 ? "Let's go! ✈️" : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
