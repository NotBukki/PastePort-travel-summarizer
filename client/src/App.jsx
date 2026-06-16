import { useState } from 'react';
import { useTripParser } from './hooks/useTripParser';
import { useCurrency } from './hooks/useCurrency';
import { useConsent } from './hooks/useConsent';
import PasteInput from './components/PasteInput';
import Timeline from './components/Timeline';
import BudgetPanel from './components/BudgetPanel';
import LoadingOverlay from './components/LoadingOverlay';
import CurrencySwitcher from './components/CurrencySwitcher';
import ConsentModal from './components/ConsentModal';
import SuggestionsPanel from './components/SuggestionsPanel';
import OnboardingTour from './components/OnboardingTour';

function formatDateRange(start, end) {
  if (!start) return null;
  const opts = { month: 'short', day: 'numeric' };
  const s = new Date(start).toLocaleDateString('en-US', opts);
  if (!end || end === start) return s;
  const e = new Date(end).toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  return `${s} – ${e}`;
}

export default function App() {
  const { loading, error, result, travelerType, parse, reset } = useTripParser();
  const { currency, setCurrency, detectedCurrency, status: currencyStatus, format } = useCurrency();
  const { consentGiven, giveConsent } = useConsent();
  const [pendingParse, setPendingParse] = useState(null);

  const handleParseRequest = (segments, tType) => {
    if (consentGiven) parse(segments, tType);
    else setPendingParse({ segments, travelerType: tType });
  };

  const handleConsentAccept = () => {
    giveConsent();
    if (pendingParse) {
      parse(pendingParse.segments, pendingParse.travelerType);
      setPendingParse(null);
    }
  };

  const handleConsentCancel = () => setPendingParse(null);

  return (
    <div className="min-h-screen flex flex-col">

      {/* ===== NAV ===== */}
      <nav className="sticky top-0 z-[100] border-b border-rim backdrop-blur-xl bg-[rgba(6,10,20,0.75)]">
        <div className="max-w-[1100px] mx-auto px-6 w-full flex items-center justify-between py-5">
          <a href="/" id="nav-logo" className="flex items-center gap-2.5 font-extrabold text-xl tracking-[-0.02em] text-ink no-underline">
            <div className="w-9 h-9 bg-gradient-to-br from-violet to-cyan rounded-[10px] flex items-center justify-center text-lg shrink-0">✈️</div>
            PastePort
          </a>
          <div className="flex items-center gap-2.5">
            <CurrencySwitcher
              currency={currency}
              detectedCurrency={detectedCurrency}
              status={currencyStatus}
              onChangeCurrency={setCurrency}
            />
            <span className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full bg-violet/30 border border-violet/40 text-violet-light tracking-[0.05em] uppercase">
              Beta
            </span>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {loading && <LoadingOverlay />}

        {/* ===== HERO + INPUT ===== */}
        {!result && (
          <>
            <section className="pt-20 pb-16 text-center">
              <div className="max-w-[1100px] mx-auto px-6">
                <div className="inline-flex items-center gap-2 text-[0.8rem] font-semibold tracking-[0.12em] uppercase text-cyan mb-6 px-4 py-1.5 rounded-full border border-cyan/30 bg-cyan/[0.08]">
                  <span>✦</span> AI-Powered Travel Parser
                </div>
                <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-extrabold tracking-[-0.04em] leading-[1.1] mb-5 text-ink">
                  Turn messy emails into<br />
                  <span className="gradient-text">your perfect itinerary</span>
                </h1>
                <p className="text-[1.1rem] text-ink-dim max-w-[560px] mx-auto leading-[1.7]">
                  Paste raw booking confirmations — flights, hotels, trains — and get an instant chronological timeline with daily budget estimates per destination.
                </p>
              </div>
            </section>

            <div className="max-w-[1100px] mx-auto px-6 pb-20">
              {error && (
                <div className="flex items-center gap-3 px-5 py-4 rounded-[14px] bg-red-500/10 border border-red-500/30 text-red-300 text-sm mb-6 animate-fade-in" role="alert">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}
              <PasteInput onParse={handleParseRequest} loading={loading} />
            </div>
          </>
        )}

        {/* ===== RESULTS ===== */}
        {result && (
          <div className="max-w-[1100px] mx-auto px-6 pb-24 animate-fade-up">

            {/* Trip summary header */}
            <div className="relative overflow-hidden rounded-[28px] p-10 mb-12 bg-gradient-to-br from-violet/15 to-cyan/10 border border-violet/25">
              {/* Decorative radial glow */}
              <div className="absolute -top-1/2 -right-[20%] w-[400px] h-[400px] rounded-full bg-violet/[0.12] blur-[80px] pointer-events-none" />

              <div className="relative flex items-start justify-between gap-4 mb-8 flex-wrap">
                <div>
                  <h1 className="text-[1.75rem] font-extrabold tracking-[-0.03em] leading-[1.2]">
                    <span className="gradient-text">{result.trip_summary?.trip_title || 'Your Trip'}</span>
                  </h1>
                  {result.trip_summary?.traveler_name && (
                    <div className="flex items-center gap-1.5 text-[0.85rem] text-ink-dim mt-1.5">
                      <span>👤</span> {result.trip_summary.traveler_name}
                    </div>
                  )}
                </div>
                <button
                  className="flex items-center gap-1.5 px-[18px] py-2 rounded-lg border border-rim-bright bg-glass text-ink-dim text-[0.85rem] font-medium cursor-pointer transition-all duration-200 hover:text-ink hover:border-violet hover:bg-violet/30 font-sans whitespace-nowrap"
                  onClick={reset}
                  id="btn-reset"
                >
                  ← Parse another trip
                </button>
              </div>

              <div className="relative grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4">
                {result.trip_summary?.start_date && (
                  <div className="flex flex-col gap-1">
                    <div className="text-[0.72rem] font-semibold tracking-[0.08em] uppercase text-ink-faint">Dates</div>
                    <div className="text-[1rem] font-bold text-ink tracking-[-0.01em]">
                      {formatDateRange(result.trip_summary.start_date, result.trip_summary.end_date)}
                    </div>
                  </div>
                )}
                {result.trip_summary?.total_days > 0 && (
                  <div className="flex flex-col gap-1">
                    <div className="text-[0.72rem] font-semibold tracking-[0.08em] uppercase text-ink-faint">Total Days</div>
                    <div className="text-[1.4rem] font-bold tracking-[-0.02em] gradient-text">{result.trip_summary.total_days}</div>
                  </div>
                )}
                {result.events?.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <div className="text-[0.72rem] font-semibold tracking-[0.08em] uppercase text-ink-faint">Bookings Found</div>
                    <div className="text-[1.4rem] font-bold tracking-[-0.02em] gradient-text">{result.events.length}</div>
                  </div>
                )}
                {result.destinations?.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <div className="text-[0.72rem] font-semibold tracking-[0.08em] uppercase text-ink-faint">Destinations</div>
                    <div className="text-[1.4rem] font-bold tracking-[-0.02em] gradient-text">{result.destinations.length}</div>
                  </div>
                )}
                {result.trip_summary?.total_cost_extracted_usd > 0 && (
                  <div className="flex flex-col gap-1">
                    <div className="text-[0.72rem] font-semibold tracking-[0.08em] uppercase text-ink-faint">Confirmed Spend</div>
                    <div className="text-[1.4rem] font-bold tracking-[-0.02em] gradient-text">
                      {format(result.trip_summary.total_cost_extracted_usd)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline + Budget */}
            <div className="grid grid-cols-1 min-[900px]:grid-cols-[1fr_360px] gap-8 items-start">
              <Timeline events={result.events} format={format} />
              <BudgetPanel
                destinations={result.destinations}
                totalCost={result.trip_summary?.total_cost_extracted_usd}
                passengers={result.passengers}
                travelerType={travelerType}
                format={format}
                currency={currency}
              />
            </div>

            {/* Suggestions */}
            {result.suggestions?.length > 0 && (
              <SuggestionsPanel
                suggestions={result.suggestions}
                travelerType={travelerType}
                format={format}
                events={result.events || []}
              />
            )}
          </div>
        )}
      </main>

      {/* ===== ONBOARDING TOUR ===== */}
      {!result && <OnboardingTour />}

      {/* ===== CONSENT MODAL ===== */}
      {pendingParse && (
        <ConsentModal onAccept={handleConsentAccept} onCancel={handleConsentCancel} />
      )}

      {/* ===== FOOTER ===== */}
      <footer className="py-7 border-t border-rim">
        <div className="max-w-[1100px] mx-auto px-6 flex items-center justify-center flex-wrap gap-2 text-ink-faint text-[0.78rem]">
          <span>PastePort · Powered by Claude</span>
          <span className="opacity-40">·</span>
          <span>Your documents are never stored on our servers</span>
          <span className="opacity-40">·</span>
          <a
            href="https://www.anthropic.com/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-light no-underline font-medium transition-opacity duration-200 hover:opacity-75 hover:underline"
          >
            Privacy & Data Policy
          </a>
        </div>
      </footer>
    </div>
  );
}
