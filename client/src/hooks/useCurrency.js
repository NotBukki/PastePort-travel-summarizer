import { useState, useEffect, useCallback } from 'react';

// ─── Currency metadata ──────────────────────────────────────────────────────
export const CURRENCY_META = {
  USD: { symbol: '$',   name: 'US Dollar',         flag: '🇺🇸' },
  EUR: { symbol: '€',   name: 'Euro',               flag: '🇪🇺' },
  GBP: { symbol: '£',   name: 'British Pound',      flag: '🇬🇧' },
  JPY: { symbol: '¥',   name: 'Japanese Yen',       flag: '🇯🇵' },
  CAD: { symbol: 'C$',  name: 'Canadian Dollar',    flag: '🇨🇦' },
  AUD: { symbol: 'A$',  name: 'Australian Dollar',  flag: '🇦🇺' },
  CHF: { symbol: 'Fr',  name: 'Swiss Franc',        flag: '🇨🇭' },
  SEK: { symbol: 'kr',  name: 'Swedish Krona',      flag: '🇸🇪' },
  NOK: { symbol: 'kr',  name: 'Norwegian Krone',    flag: '🇳🇴' },
  DKK: { symbol: 'kr',  name: 'Danish Krone',       flag: '🇩🇰' },
  PLN: { symbol: 'zł',  name: 'Polish Złoty',       flag: '🇵🇱' },
  CZK: { symbol: 'Kč',  name: 'Czech Koruna',       flag: '🇨🇿' },
  HUF: { symbol: 'Ft',  name: 'Hungarian Forint',   flag: '🇭🇺' },
  TRY: { symbol: '₺',   name: 'Turkish Lira',       flag: '🇹🇷' },
  INR: { symbol: '₹',   name: 'Indian Rupee',       flag: '🇮🇳' },
  BRL: { symbol: 'R$',  name: 'Brazilian Real',     flag: '🇧🇷' },
  ZAR: { symbol: 'R',   name: 'South African Rand', flag: '🇿🇦' },
  SGD: { symbol: 'S$',  name: 'Singapore Dollar',   flag: '🇸🇬' },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar',   flag: '🇭🇰' },
  KRW: { symbol: '₩',   name: 'South Korean Won',   flag: '🇰🇷' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham',         flag: '🇦🇪' },
  MXN: { symbol: 'MX$', name: 'Mexican Peso',       flag: '🇲🇽' },
};

const GEO_CACHE_KEY   = 'pp_detected_currency';
const RATES_CACHE_KEY = 'pp_exchange_rates';
const RATES_CACHE_TTL = 60 * 60 * 1000; // 1 hour

export function useCurrency() {
  const [currency, setCurrencyState]   = useState('USD');
  const [rates, setRates]               = useState({ USD: 1 });
  const [detectedCurrency, setDetected] = useState('USD');
  const [status, setStatus]             = useState('loading'); // loading | ready | error

  useEffect(() => {
    async function init() {
      try {
        // ── 1. Detect currency from IP (cache per session) ──────────────────
        let detectedCode = sessionStorage.getItem(GEO_CACHE_KEY);
        if (!detectedCode) {
          const geoRes  = await fetch('https://ipapi.co/json/');
          const geo     = await geoRes.json();
          detectedCode  = geo.currency || 'USD';
          // Only accept currencies we know about
          if (!CURRENCY_META[detectedCode]) detectedCode = 'USD';
          sessionStorage.setItem(GEO_CACHE_KEY, detectedCode);
        }
        setDetected(detectedCode);
        setCurrencyState(detectedCode);

        // ── 2. Fetch exchange rates (cache with TTL) ─────────────────────────
        const cachedRatesRaw = localStorage.getItem(RATES_CACHE_KEY);
        let ratesData = { USD: 1 };

        if (cachedRatesRaw) {
          const { ts, data } = JSON.parse(cachedRatesRaw);
          if (Date.now() - ts < RATES_CACHE_TTL) {
            ratesData = data;
          }
        }

        if (Object.keys(ratesData).length <= 1) {
          // Fetch all rates at once from USD base
          const ratesRes  = await fetch('https://api.frankfurter.app/latest?from=USD');
          const ratesJson = await ratesRes.json();
          ratesData = { USD: 1, ...ratesJson.rates };
          localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: ratesData }));
        }

        setRates(ratesData);
        setStatus('ready');
      } catch (err) {
        console.warn('[useCurrency] Detection failed, defaulting to USD:', err);
        setStatus('error');
      }
    }
    init();
  }, []);

  const setCurrency = useCallback((code) => {
    if (!CURRENCY_META[code]) return;
    setCurrencyState(code);
    sessionStorage.setItem(GEO_CACHE_KEY, code);
  }, []);

  /**
   * Convert a USD amount to the current display currency.
   * fromCurrency: if the source amount is not USD, pass its currency code.
   */
  const convert = useCallback((amount, fromCurrency = 'USD') => {
    if (!amount || amount === 0) return 0;
    const fromRate = rates[fromCurrency] ?? 1;  // USD → fromCurrency
    const toRate   = rates[currency]    ?? 1;   // USD → display currency
    return amount / fromRate * toRate;
  }, [rates, currency]);

  /**
   * Format a USD amount as a localized string in the display currency.
   * fromCurrency: optionally pass the original currency of the amount.
   */
  const format = useCallback((amount, fromCurrency = 'USD') => {
    if (!amount || amount === 0) return null;
    const converted = convert(amount, fromCurrency);
    const meta      = CURRENCY_META[currency];
    const symbol    = meta?.symbol ?? currency;

    // Yen / Won / Forint — no decimals
    const noDecimals = ['JPY', 'KRW', 'HUF'].includes(currency);
    const rounded = noDecimals ? Math.round(converted) : Math.round(converted);
    return `${symbol}${rounded.toLocaleString()}`;
  }, [convert, currency]);

  return {
    currency,
    setCurrency,
    rates,
    detectedCurrency,
    status,
    convert,
    format,
    meta: CURRENCY_META[currency] ?? CURRENCY_META.USD,
  };
}
