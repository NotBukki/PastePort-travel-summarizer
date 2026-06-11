import { useTripParser } from './hooks/useTripParser';
import PasteInput from './components/PasteInput';
import Timeline from './components/Timeline';
import BudgetPanel from './components/BudgetPanel';
import LoadingOverlay from './components/LoadingOverlay';

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

  return (
    <div className="app">
      {/* ===== NAV ===== */}
      <nav className="nav">
        <div className="container nav-inner">
          <a href="/" className="nav-logo" id="nav-logo">
            <div className="nav-logo-icon">✈️</div>
            PastePort
          </a>
          <span className="nav-badge">Beta</span>
        </div>
      </nav>

      <main>
        {/* ===== LOADING ===== */}
        {loading && <LoadingOverlay />}

        {/* ===== HERO + INPUT (when no result) ===== */}
        {!result && (
          <>
            <section className="hero">
              <div className="container">
                <div className="hero-eyebrow">
                  <span>✦</span> AI-Powered Travel Parser
                </div>
                <h1 className="hero-title">
                  Turn messy emails into<br />
                  <span className="gradient">your perfect itinerary</span>
                </h1>
                <p className="hero-sub">
                  Paste raw booking confirmations — flights, hotels, trains — and get an instant chronological timeline with daily budget estimates per destination.
                </p>
              </div>
            </section>

            <div className="container">
              {error && (
                <div className="error-banner" role="alert">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}
              <PasteInput onParse={parse} loading={loading} />
            </div>
          </>
        )}

        {/* ===== RESULTS ===== */}
        {result && (
          <div className="container results-section">
            {/* Trip summary header */}
            <div className="trip-summary">
              <div className="trip-title-row">
                <div>
                  <h1 className="trip-title">
                    <span>{result.trip_summary?.trip_title || 'Your Trip'}</span>
                  </h1>
                  {result.trip_summary?.traveler_name && (
                    <div className="trip-traveler">
                      <span>👤</span> {result.trip_summary.traveler_name}
                    </div>
                  )}
                </div>
                <button className="btn-reset" onClick={reset} id="btn-reset">
                  ← Parse another trip
                </button>
              </div>

              <div className="trip-stats">
                {result.trip_summary?.start_date && (
                  <div className="stat-item">
                    <div className="stat-label">Dates</div>
                    <div className="stat-value" style={{ fontSize: '1rem' }}>
                      {formatDateRange(result.trip_summary.start_date, result.trip_summary.end_date)}
                    </div>
                  </div>
                )}
                {result.trip_summary?.total_days > 0 && (
                  <div className="stat-item">
                    <div className="stat-label">Total Days</div>
                    <div className="stat-value accent">{result.trip_summary.total_days}</div>
                  </div>
                )}
                {result.events?.length > 0 && (
                  <div className="stat-item">
                    <div className="stat-label">Bookings Found</div>
                    <div className="stat-value accent">{result.events.length}</div>
                  </div>
                )}
                {result.destinations?.length > 0 && (
                  <div className="stat-item">
                    <div className="stat-label">Destinations</div>
                    <div className="stat-value accent">{result.destinations.length}</div>
                  </div>
                )}
                {result.trip_summary?.total_cost_extracted_usd > 0 && (
                  <div className="stat-item">
                    <div className="stat-label">Cost Extracted</div>
                    <div className="stat-value accent">
                      ${result.trip_summary.total_cost_extracted_usd.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline + Budget */}
            <div className="results-grid">
              <Timeline events={result.events} />
              <BudgetPanel
                destinations={result.destinations}
                totalCost={result.trip_summary?.total_cost_extracted_usd}
                passengers={result.passengers}
                travelerType={travelerType}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="container">
          PastePort · Powered by GPT-4o · Your data is never stored.
        </div>
      </footer>
    </div>
  );
}
