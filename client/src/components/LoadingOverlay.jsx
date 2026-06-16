import { useState, useEffect } from 'react';

const STEPS = [
  { icon: '📄', label: 'Reading your documents',  short: 'Documents',  sub: 'Parsing text and images from your bookings' },
  { icon: '✈️', label: 'Extracting travel events', short: 'Extracting', sub: 'Finding flights, hotels, trains & more' },
  { icon: '🗓️', label: 'Building your timeline',  short: 'Timeline',   sub: 'Ordering every event chronologically' },
  { icon: '💰', label: 'Estimating budgets',       short: 'Budgets',    sub: 'Calculating costs per destination' },
];

export default function LoadingOverlay() {
  const [stepIdx, setStepIdx] = useState(0);
  const [phase,   setPhase]   = useState('in'); // 'in' | 'out'

  useEffect(() => {
    const tick = setInterval(() => {
      setPhase('out');
      setTimeout(() => {
        setStepIdx((i) => (i + 1) % STEPS.length);
        setPhase('in');
      }, 300);
    }, 2800);
    return () => clearInterval(tick);
  }, []);

  const step = STEPS[stepIdx];

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[rgba(6,10,20,0.97)] backdrop-blur-xl animate-fade-in overflow-hidden"
      role="status"
      aria-label="Parsing your trip"
    >
      {/* ── Ambient background glows ── */}
      <div
        className="absolute w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
          animation: 'glowExpand 4s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none translate-x-48 translate-y-24"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)',
          animation: 'glowExpand 5s ease-in-out infinite 1.5s',
        }}
      />

      {/* ── Multi-ring spinner ── */}
      <div className="relative mb-12" style={{ width: 220, height: 220 }}>

        {/* Pulsing backdrop rings */}
        <div className="absolute inset-0 rounded-full border border-violet/15 animate-ping [animation-duration:2.4s]" />
        <div className="absolute inset-[14%] rounded-full border border-cyan/10 animate-ping [animation-duration:3.2s] [animation-delay:0.8s]" />

        {/* SVG concentric arcs */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 220 220" fill="none">
          <defs>
            {/* Gradient for outer arc */}
            <linearGradient id="lg-outer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.1" />
              <stop offset="40%"  stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
            </linearGradient>
            {/* Gradient for middle arc */}
            <linearGradient id="lg-mid" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#a78bfa" stopOpacity="0.1" />
              <stop offset="50%"  stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.2" />
            </linearGradient>
            {/* Gradient for inner arc */}
            <linearGradient id="lg-inner" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#67e8f9" stopOpacity="0.15" />
              <stop offset="50%"  stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Outer track */}
          <circle cx="110" cy="110" r="100" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
          {/* Outer spinning arc  (CW, 2 s) */}
          <circle
            cx="110" cy="110" r="100"
            stroke="url(#lg-outer)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="157 471"   /* 25% of 628 circumference */
            className="spinner-arc"
            style={{ animation: 'spinCW 2s linear infinite' }}
          />
          {/* Outer accent dot */}
          <circle
            cx="110" cy="10" r="4"
            fill="#7c3aed"
            opacity="0.9"
            className="spinner-arc"
            style={{ animation: 'spinCW 2s linear infinite', filter: 'drop-shadow(0 0 4px #7c3aed)' }}
          />

          {/* Middle track */}
          <circle cx="110" cy="110" r="78" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
          {/* Middle spinning arc (CCW, 3 s) */}
          <circle
            cx="110" cy="110" r="78"
            stroke="url(#lg-mid)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="98 392"    /* ~20% of 490 circumference */
            className="spinner-arc"
            style={{ animation: 'spinCCW 3s linear infinite' }}
          />
          {/* Middle accent dot */}
          <circle
            cx="110" cy="32" r="3"
            fill="#a78bfa"
            opacity="0.85"
            className="spinner-arc"
            style={{ animation: 'spinCCW 3s linear infinite', filter: 'drop-shadow(0 0 4px #a78bfa)' }}
          />

          {/* Inner track */}
          <circle cx="110" cy="110" r="56" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
          {/* Inner spinning arc (CW, 1.6 s) */}
          <circle
            cx="110" cy="110" r="56"
            stroke="url(#lg-inner)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="70 282"    /* 20% of 352 circumference */
            className="spinner-arc"
            style={{ animation: 'spinCW 1.6s linear infinite reverse' }}
          />
          {/* Inner accent dot */}
          <circle
            cx="110" cy="54" r="2.5"
            fill="#06b6d4"
            opacity="0.9"
            className="spinner-arc"
            style={{ animation: 'spinCW 1.6s linear infinite reverse', filter: 'drop-shadow(0 0 4px #06b6d4)' }}
          />
        </svg>

        {/* Center glass circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-[88px] h-[88px] rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle at 40% 35%, rgba(124,58,237,0.25), rgba(6,10,20,0.95) 70%)',
              border: '1px solid rgba(124,58,237,0.25)',
              boxShadow: '0 0 40px rgba(124,58,237,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <span
              className="text-4xl select-none"
              style={{ animation: 'floatIcon 3s ease-in-out infinite' }}
            >
              ✈️
            </span>
          </div>
        </div>
      </div>

      {/* ── Cycling status text ── */}
      <div
        className="text-center mb-10"
        style={{
          opacity:    phase === 'in' ? 1 : 0,
          transform:  phase === 'in' ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.28s ease, transform 0.28s ease',
        }}
      >
        <div className="text-[1.35rem] font-bold text-ink tracking-[-0.02em] mb-2">
          {step.label}
        </div>
        <div className="text-[0.88rem] text-ink-dim leading-relaxed">
          {step.sub}
        </div>
      </div>

      {/* ── Step progress row ── */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const isPast    = i < stepIdx;
          const isCurrent = i === stepIdx;
          const isFuture  = i > stepIdx;
          return (
            <div key={i} className="flex items-center">
              {/* Step node */}
              <div
                className="flex flex-col items-center gap-2 transition-all duration-500"
                style={{ opacity: isFuture ? 0.28 : 1 }}
              >
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[1.1rem] border transition-all duration-500"
                  style={
                    isCurrent
                      ? {
                          background: 'rgba(124,58,237,0.35)',
                          borderColor: 'rgba(124,58,237,0.65)',
                          boxShadow: '0 0 20px rgba(124,58,237,0.5), 0 0 8px rgba(124,58,237,0.3)',
                          transform: 'scale(1.12)',
                        }
                      : isPast
                        ? { background: 'rgba(124,58,237,0.15)', borderColor: 'rgba(124,58,237,0.3)' }
                        : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }
                  }
                >
                  {isPast ? (
                    <span className="text-violet-light text-sm font-bold">✓</span>
                  ) : (
                    s.icon
                  )}
                </div>
                <div
                  className="text-[0.7rem] font-medium tracking-[0.01em] whitespace-nowrap transition-all duration-500"
                  style={{ color: isCurrent ? '#a78bfa' : isPast ? 'rgba(167,139,250,0.6)' : 'rgba(71,85,105,0.8)' }}
                >
                  {s.short}
                </div>
              </div>

              {/* Connector */}
              {i < STEPS.length - 1 && (
                <div className="w-14 flex items-center pb-6 mx-1">
                  <div
                    className="w-full h-px transition-all duration-700"
                    style={{
                      background: i < stepIdx
                        ? 'linear-gradient(90deg, rgba(124,58,237,0.7), rgba(167,139,250,0.4))'
                        : 'rgba(255,255,255,0.07)',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Hint text ── */}
      <p className="mt-8 text-[0.72rem] text-ink-faint tracking-[0.06em] uppercase opacity-60">
        Usually takes 5 – 15 seconds
      </p>
    </div>
  );
}
