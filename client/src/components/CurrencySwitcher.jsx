import { useState, useRef, useEffect } from 'react';
import { CURRENCY_META } from '../hooks/useCurrency';

const POPULAR = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'SEK', 'NOK',
                 'DKK', 'PLN', 'CZK', 'HUF', 'TRY', 'INR', 'BRL', 'ZAR', 'SGD',
                 'HKD', 'KRW', 'AED', 'MXN'];

export default function CurrencySwitcher({ currency, detectedCurrency, status, onChangeCurrency }) {
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);
  const meta = CURRENCY_META[currency] ?? CURRENCY_META.USD;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rim-bright bg-glass text-ink text-[0.8rem] font-semibold font-sans cursor-pointer tracking-[0.02em] transition-all duration-200 hover:border-violet hover:bg-violet/30 hover:text-violet-light ${status === 'loading' ? 'opacity-60 pointer-events-none' : ''}`}
        onClick={() => setOpen((o) => !o)}
        id="currency-switcher-btn"
        aria-label="Change display currency"
        title="Change display currency"
      >
        <span className="font-bold">{currency}</span>
        <span className="text-[0.55rem] opacity-60 ml-0.5">{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-[calc(100%+10px)] right-0 w-[300px] bg-[#0f1729] border border-rim-bright rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(124,58,237,0.1)] z-[200] overflow-hidden animate-fade-in"
          role="listbox"
          aria-label="Select currency"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 text-[0.7rem] font-bold tracking-[0.08em] uppercase text-ink-faint border-b border-rim">
            Display currency
            {detectedCurrency && detectedCurrency !== currency && (
              <button
                className="text-[0.68rem] text-violet-light bg-transparent border-none cursor-pointer font-sans px-1.5 py-0.5 rounded transition-colors duration-200 hover:bg-violet/30"
                onClick={() => { onChangeCurrency(detectedCurrency); setOpen(false); }}
              >
                Reset to detected ({detectedCurrency})
              </button>
            )}
          </div>

          {/* Currency list */}
          <div className="max-h-[320px] overflow-y-auto p-1.5 scrollbar-thin-custom">
            {POPULAR.map((code) => {
              const m = CURRENCY_META[code];
              if (!m) return null;
              const isActive = code === currency;
              return (
                <button
                  key={code}
                  className={`flex items-center gap-2 w-full px-2.5 py-2 rounded-lg border-none font-sans text-[0.82rem] cursor-pointer text-left transition-all duration-200 ${isActive ? 'bg-violet/30 text-violet-light' : 'bg-transparent text-ink-dim hover:bg-glass-hover hover:text-ink'}`}
                  onClick={() => { onChangeCurrency(code); setOpen(false); }}
                  role="option"
                  aria-selected={isActive}
                  id={`currency-option-${code}`}
                >
                  <span className="text-base shrink-0">{m.flag}</span>
                  <span className="font-bold min-w-[36px] text-ink">{code}</span>
                  <span className="flex-1 text-[0.75rem]">{m.name}</span>
                  <span className="text-[0.78rem] opacity-60 mr-1">{m.symbol}</span>
                  {isActive && <span className="text-violet-light text-[0.75rem] ml-auto">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
