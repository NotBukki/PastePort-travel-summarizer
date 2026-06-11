import { useState, useRef, useEffect } from 'react';
import { CURRENCY_META } from '../hooks/useCurrency';

const POPULAR = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'SEK', 'NOK',
                 'DKK', 'PLN', 'CZK', 'HUF', 'TRY', 'INR', 'BRL', 'ZAR', 'SGD',
                 'HKD', 'KRW', 'AED', 'MXN'];

export default function CurrencySwitcher({ currency, detectedCurrency, status, onChangeCurrency }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const meta = CURRENCY_META[currency] ?? CURRENCY_META.USD;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="currency-switcher" ref={ref}>
      <button
        className={`currency-btn ${status === 'loading' ? 'loading' : ''}`}
        onClick={() => setOpen((o) => !o)}
        id="currency-switcher-btn"
        aria-label="Change display currency"
        title="Change display currency"
      >
        <span className="currency-btn-code">{currency}</span>
        <span className="currency-btn-arrow">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="currency-dropdown" role="listbox" aria-label="Select currency">
          <div className="currency-dropdown-header">
            Display currency
            {detectedCurrency && detectedCurrency !== currency && (
              <button
                className="currency-reset-btn"
                onClick={() => { onChangeCurrency(detectedCurrency); setOpen(false); }}
              >
                Reset to detected ({detectedCurrency})
              </button>
            )}
          </div>
          <div className="currency-list">
            {POPULAR.map((code) => {
              const m = CURRENCY_META[code];
              if (!m) return null;
              const isActive = code === currency;
              return (
                <button
                  key={code}
                  className={`currency-option ${isActive ? 'active' : ''}`}
                  onClick={() => { onChangeCurrency(code); setOpen(false); }}
                  role="option"
                  aria-selected={isActive}
                  id={`currency-option-${code}`}
                >
                  <span className="currency-option-flag">{m.flag}</span>
                  <span className="currency-option-code">{code}</span>
                  <span className="currency-option-name">{m.name}</span>
                  <span className="currency-option-symbol">{m.symbol}</span>
                  {isActive && <span className="currency-option-check">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
