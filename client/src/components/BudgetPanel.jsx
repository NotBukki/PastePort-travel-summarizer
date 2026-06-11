// Donut chart built with plain SVG — no dependencies needed
const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b'];
const CATEGORY_ICONS = { accommodation: '🏨', food: '🍽️', transport: '🚌', activities: '🎭' };

const TRAVELER_LABELS = {
  budget: { icon: '🎒', label: 'Budget', color: '#10b981' },
  'mid-range': { icon: '✈️', label: 'Mid-range', color: '#7c3aed' },
  luxury: { icon: '💎', label: 'Luxury', color: '#f59e0b' },
};

function DonutChart({ breakdown }) {
  const entries = Object.entries(breakdown).filter(([, v]) => v > 0);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  if (total === 0) return null;

  const radius = 36;
  const cx = 44;
  const cy = 44;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const slices = entries.map(([key, value], i) => {
    const pct = value / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const currentOffset = offset;
    offset += dash;
    return { key, value, pct, dash, gap, offset: currentOffset, color: COLORS[i % COLORS.length] };
  });

  return (
    <div className="donut-wrap">
      <svg className="donut-svg" width="88" height="88" viewBox="0 0 88 88">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
        {slices.map((s) => (
          <circle
            key={s.key}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset + circumference * 0.25}
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="Inter">/day</text>
      </svg>
      <div className="donut-legend">
        {slices.map((s) => (
          <div className="legend-item" key={s.key}>
            <div className="legend-dot" style={{ background: s.color }} />
            <span className="legend-label">{s.key}</span>
            <span className="legend-pct">{Math.round(s.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetCard({ dest, index }) {
  const breakdown = dest.budget_breakdown || {};
  const total = Object.values(breakdown).reduce((sum, v) => sum + (v || 0), 0);
  const daily = dest.estimated_daily_budget_usd || 0;
  const nights = dest.nights || 0;
  const totalStay = dest.total_estimated_stay_usd || (daily * nights) || 0;

  return (
    <div
      className="glass-card budget-card"
      id={`budget-${index}`}
      style={{ animationDelay: `${index * 0.1}s`, animation: 'fadeUp 0.5s ease both' }}
    >
      {/* Header */}
      <div className="budget-card-header">
        <div>
          <div className="budget-city">{dest.city}</div>
          <div className="budget-country">{dest.country}</div>
        </div>
        {nights > 0 && (
          <span className="budget-nights">{nights} {nights === 1 ? 'night' : 'nights'}</span>
        )}
      </div>

      {/* Daily + Total budget row */}
      <div className="budget-amounts-row">
        <div className="budget-amount-block">
          <div className="budget-amount-label">Daily budget</div>
          <div className="budget-daily-amount">
            ${daily.toLocaleString()}
            <span className="budget-per-day">/day</span>
          </div>
        </div>
        {totalStay > 0 && (
          <>
            <div className="budget-amounts-divider" />
            <div className="budget-amount-block">
              <div className="budget-amount-label">
                Total stay {nights > 0 ? `(${nights} nights)` : ''}
              </div>
              <div className="budget-total-amount">
                ~${totalStay.toLocaleString()}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Donut chart */}
      {total > 0 && <DonutChart breakdown={breakdown} />}

      {/* Breakdown bars */}
      {total > 0 && (
        <div className="budget-breakdown-list">
          {Object.entries(breakdown)
            .filter(([, v]) => v > 0)
            .map(([key, val], i) => {
              const pct = total > 0 ? (val / total) * 100 : 0;
              return (
                <div className="breakdown-row" key={key}>
                  <div className="breakdown-label">
                    <span>{CATEGORY_ICONS[key] || '•'}</span>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
                  <div className="breakdown-bar-wrap">
                    <div
                      className="breakdown-bar"
                      style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                  <div className="breakdown-amount">${val}/day</div>
                </div>
              );
            })}
        </div>
      )}

      {dest.budget_notes && (
        <div className="budget-notes">{dest.budget_notes}</div>
      )}
    </div>
  );
}

function PassengersCard({ passengers }) {
  if (!passengers || passengers.length === 0) return null;
  return (
    <div className="glass-card budget-card passengers-card" style={{ animation: 'fadeUp 0.5s ease both' }}>
      <div className="budget-city" style={{ marginBottom: 14 }}>
        👥 Passengers <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>({passengers.length})</span>
      </div>
      <div className="passengers-list">
        {passengers.map((p, i) => (
          <div className="passenger-row" key={i}>
            <div className="passenger-name">
              <span className="passenger-avatar">{p.name?.[0] || '?'}</span>
              {p.name}
            </div>
            {p.addons && p.addons.length > 0 && (
              <div className="passenger-addons">
                {p.addons.map((addon, j) => (
                  <span key={j} className="meta-chip">{addon}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BudgetPanel({ destinations, totalCost, passengers, travelerType }) {
  const travelerMeta = TRAVELER_LABELS[travelerType] || TRAVELER_LABELS['mid-range'];
  const grandTotal = destinations?.reduce((sum, d) => sum + (d.total_estimated_stay_usd || 0), 0) || 0;

  return (
    <div className="budget-panel">
      <div className="budget-panel-header">
        <h2>✦ Budget Estimates</h2>
        {travelerType && (
          <span className="traveler-badge" style={{ color: travelerMeta.color, borderColor: travelerMeta.color + '55', background: travelerMeta.color + '18' }}>
            {travelerMeta.icon} {travelerMeta.label}
          </span>
        )}
      </div>

      <div className="budget-cards">
        {/* Passenger card first */}
        <PassengersCard passengers={passengers} />

        {/* Per-destination budgets */}
        {destinations?.map((dest, i) => (
          <BudgetCard key={i} dest={dest} index={i} />
        ))}

        {/* Grand total */}
        {(grandTotal > 0 || totalCost > 0) && (
          <div className="total-cost-card">
            {grandTotal > 0 && (
              <div style={{ marginBottom: totalCost > 0 ? 16 : 0 }}>
                <div className="total-cost-label">Total estimated trip spend</div>
                <div className="total-cost-value">~${grandTotal.toLocaleString()}</div>
                <div className="total-cost-sub">AI estimate based on {travelerMeta?.label?.toLowerCase() || 'mid-range'} travel style</div>
              </div>
            )}
            {totalCost > 0 && (
              <div style={{ borderTop: grandTotal > 0 ? '1px solid var(--border)' : 'none', paddingTop: grandTotal > 0 ? 16 : 0 }}>
                <div className="total-cost-label">Confirmed spend (from documents)</div>
                <div className="total-cost-value" style={{ fontSize: '1.5rem' }}>${totalCost.toLocaleString()}</div>
                <div className="total-cost-sub">Extracted from your booking confirmations</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
