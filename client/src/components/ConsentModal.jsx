import { useState } from 'react';

const DATA_POINTS = [
  { icon: '✈️', label: 'Flight details',       detail: 'dates, times, flight numbers, airports' },
  { icon: '🏨', label: 'Hotel reservations',   detail: 'check-in/out dates, property name' },
  { icon: '👤', label: 'Passenger names',      detail: 'as written in your booking documents' },
  { icon: '🔖', label: 'Booking references',   detail: 'confirmation codes, reservation IDs' },
  { icon: '💳', label: 'Price information',    detail: 'totals and partial card details if present' },
];

export default function ConsentModal({ onAccept, onCancel }) {
  const [checked, setChecked] = useState(false);
  const [shake,   setShake]   = useState(false);

  const handleContinue = () => {
    if (!checked) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    onAccept();
  };

  return (
    <div
      className="fixed inset-0 z-[500] bg-[rgba(6,10,20,0.85)] backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
    >
      <div className="bg-[#0d1324] border border-white/10 rounded-[28px] p-10 max-w-[540px] w-full shadow-[0_0_0_1px_rgba(124,58,237,0.15),0_32px_80px_rgba(0,0,0,0.7),0_0_60px_rgba(124,58,237,0.08)] animate-fade-up max-sm:p-7 max-sm:mx-4">

        {/* Header icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-[18px] bg-gradient-to-br from-violet/25 to-cyan/15 border border-violet/30 flex items-center justify-center text-[28px] shadow-[0_0_30px_rgba(124,58,237,0.2)]">
            🔒
          </div>
        </div>
        <h2 className="text-[1.35rem] font-extrabold text-center tracking-[-0.03em] mb-2.5 text-ink" id="consent-title">
          Before we process your documents
        </h2>
        <p className="text-[0.88rem] text-ink-dim text-center leading-[1.6] mb-7">
          Your text will be sent to Anthropic's API (Claude) to extract travel information.
          Please read what that means for your data.
        </p>

        {/* What gets sent */}
        <div className="mb-5">
          <div className="text-[0.68rem] font-bold tracking-[0.1em] uppercase text-ink-faint mb-2.5">
            What gets sent to Claude
          </div>
          <div className="flex flex-col gap-2">
            {DATA_POINTS.map((d) => (
              <div key={d.label} className="flex items-start gap-3 px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-rim">
                <span className="text-base shrink-0 mt-0.5">{d.icon}</span>
                <div>
                  <div className="text-[0.82rem] font-semibold text-ink">{d.label}</div>
                  <div className="text-[0.74rem] text-ink-faint">{d.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Policy box */}
        <div className="bg-black/25 border border-rim rounded-[14px] px-[18px] py-4 mb-6 flex flex-col gap-2.5">
          {[
            "Anthropic does not use API data to train their models by default",
            "API inputs and outputs are not stored by Anthropic beyond the duration of the request",
            "PastePort never stores your documents or results on any server",
            "All data is encrypted in transit (HTTPS)",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2.5 text-[0.8rem] text-ink-dim leading-[1.5]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] shrink-0 mt-[5px]" />
              <span dangerouslySetInnerHTML={{ __html: text.replace(/(does not use API data to train|not stored|never stores|encrypted)/g, '<strong>$1</strong>') }} />
            </div>
          ))}
          <a
            href="https://www.anthropic.com/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.75rem] text-violet-light no-underline mt-1 inline-block transition-opacity duration-200 hover:opacity-75 hover:underline"
          >
            Read Anthropic's full privacy policy →
          </a>
        </div>

        {/* Checkbox */}
        <label
          className={`flex items-start gap-3 cursor-pointer mb-6 px-4 py-3.5 rounded-[14px] border border-rim bg-white/[0.02] transition-all duration-200 hover:border-violet/40 hover:bg-violet/[0.05] ${shake ? 'animate-shake border-red-500/50' : ''}`}
          id="consent-checkbox-label"
        >
          <input
            type="checkbox"
            id="consent-checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="absolute opacity-0 w-0 h-0"
          />
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 mt-0.5 ${checked ? 'bg-violet border-violet' : 'border-violet/50 bg-violet/[0.08]'}`}>
            {checked && <span className="text-white text-[11px] font-bold leading-none">✓</span>}
          </div>
          <span className="text-[0.82rem] text-ink-dim leading-[1.5] select-none">
            I understand that my document content will be processed by Claude (Anthropic) and agree to continue
          </span>
        </label>

        {/* Actions */}
        <div className="flex gap-3 mb-4 max-sm:flex-col">
          <button
            className="flex-none px-5 py-3 rounded-[14px] border border-rim-bright bg-transparent text-ink-dim text-[0.88rem] font-medium font-sans cursor-pointer transition-all duration-200 hover:text-ink hover:bg-glass"
            onClick={onCancel}
            id="consent-cancel-btn"
          >
            Cancel
          </button>
          <button
            className={`flex-1 px-5 py-3.5 rounded-[14px] border-none bg-gradient-to-br from-violet to-[#5b21b6] text-white text-[0.9rem] font-bold font-sans cursor-pointer transition-all duration-200 shadow-[0_4px_20px_rgba(124,58,237,0.3)] tracking-[-0.01em] ${!checked ? 'opacity-45 cursor-not-allowed' : 'hover:-translate-y-px hover:shadow-[0_6px_28px_rgba(124,58,237,0.4)]'}`}
            onClick={handleContinue}
            id="consent-accept-btn"
            aria-disabled={!checked}
          >
            🔒 I understand — Parse my trip
          </button>
        </div>

        <p className="text-[0.72rem] text-ink-faint text-center leading-[1.5]">
          You won't be asked again on this device. You can review our privacy practices anytime in the footer.
        </p>
      </div>
    </div>
  );
}
