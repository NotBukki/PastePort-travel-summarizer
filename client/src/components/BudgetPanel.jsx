const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b'];
const CATEGORY_ICONS = { accommodation: '🏨', food: '🍽️', transport: '🚌', activities: '🎭' };

const TRAVELER_LABELS = {
  budget:      { icon: '🎒', label: 'Budget',    color: '#10b981' },
  'mid-range': { icon: '✈️', label: 'Mid-range', color: '#7c3aed' },
  luxury:      { icon: '💎', label: 'Luxury',    color: '#f59e0b' },
};

function DonutChart({ breakdown }) {
  const entries = Object.entries(breakdown).filter(([, v]) => v > 0);
  const total   = entries.reduce((sum, [, v]) => sum + v, 0);
  if (total === 0) return null;

  const radius = 36, cx = 44, cy = 44;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const slices = entries.map(([key, value], i) => {
    const pct  = value / total;
    const dash = pct * circumference;
    const cur  = offset;
    offset += dash;
    return { key, value, pct, dash, gap: circumference - dash, offset: cur, color: COLORS[i % COLORS.length] };
  });

  return (
    <div className="flex items-center gap-5 mb-5">
      <svg className="shrink-0" width="88" height="88" viewBox="0 0 88 88">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
        {slices.map((s) => (
          <circle
            key={s.key}
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset + circumference * 0.25}
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="Inter">/day</text>
      </svg>
      <div className="flex flex-col gap-2 flex-1">
        {slices.map((s) => (
          <div key={s.key} className="flex items-center gap-2 text-[0.75rem] text-ink-dim">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="flex-1">{s.key}</span>
            <span className="font-semibold text-ink">{Math.round(s.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetCard({ dest, index, passengerCount, format }) {
  const breakdown    = dest.budget_breakdown || {};
  const total        = Object.values(breakdown).reduce((sum, v) => sum + (v || 0), 0);
  const daily        = dest.estimated_daily_budget_usd || 0;
  const nights       = dest.nights || 0;
  const perPersonStay = dest.total_estimated_stay_usd || (daily * nights) || 0;
  const count        = Math.max(passengerCount || 1, 1);
  const groupTotal   = perPersonStay * count;

  return (
    <div
      className="glass-card p-6"
      id={`budget-${index}`}
      style={{ animationDelay: `${index * 0.1}s`, animation: 'fadeUp 0.5s ease both' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="text-[1rem] font-bold text-ink tracking-[-0.01em]">{dest.city}</div>
          <div className="text-[0.75rem] text-ink-faint">{dest.country}</div>
        </div>
        {nights > 0 && (
          <span className="text-[0.72rem] font-semibold px-2.5 py-1 rounded-full bg-violet/30 border border-violet/30 text-violet-light whitespace-nowrap">
            {nights} {nights === 1 ? 'night' : 'nights'}
          </span>
        )}
      </div>

      {/* Per-person amounts */}
      <div className="flex items-stretch mb-5 bg-black/20 rounded-lg overflow-hidden border border-rim">
        <div className="flex-1 px-3.5 py-3 flex flex-col gap-1">
          <div className="text-[0.68rem] font-semibold tracking-[0.07em] uppercase text-ink-faint">Per person</div>
          <div className="text-[1.6rem] font-extrabold tracking-[-0.04em] leading-[1.15] gradient-text">{format(daily)}</div>
          <div className="text-[0.7rem] font-semibold tracking-[0.06em] uppercase text-ink-faint">/day</div>
        </div>
        {perPersonStay > 0 && (
          <>
            <div className="w-px bg-rim my-2" />
            <div className="flex-1 px-3.5 py-3 flex flex-col gap-1">
              <div className="text-[0.68rem] font-semibold tracking-[0.07em] uppercase text-ink-faint">
                Per person {nights > 0 ? `(${nights} nights)` : ''}
              </div>
              <div className="text-[1.35rem] font-bold tracking-[-0.03em] leading-[1.15] text-ink">
                {format ? `~${format(perPersonStay)}` : `~$${perPersonStay.toLocaleString()}`}
              </div>
              <div className="text-[0.7rem] font-semibold tracking-[0.06em] uppercase text-ink-faint">&nbsp;</div>
            </div>
          </>
        )}
      </div>

      {/* Group total (multi-passenger) */}
      {count > 1 && groupTotal > 0 && (
        <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg bg-gradient-to-r from-violet/[0.08] to-cyan/[0.06] border border-violet/20 mb-4">
          <span className="text-[0.78rem] text-ink-dim font-medium">👥 {count} travelers total</span>
          <span className="text-[1rem] font-bold gradient-text whitespace-nowrap">
            {format ? `~${format(groupTotal)}` : `~$${groupTotal.toLocaleString()}`}
          </span>
        </div>
      )}

      {/* Donut chart */}
      {total > 0 && <DonutChart breakdown={breakdown} />}

      {/* Breakdown bars */}
      {total > 0 && (
        <div className="flex flex-col gap-2.5 mb-4">
          {Object.entries(breakdown)
            .filter(([, v]) => v > 0)
            .map(([key, val], i) => {
              const pct = total > 0 ? (val / total) * 100 : 0;
              return (
                <div key={key} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[0.78rem] text-ink-dim">
                    <span>{CATEGORY_ICONS[key] || '•'}</span>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
                  <div className="flex-1 h-1 bg-white/[0.08] rounded-full overflow-hidden mx-2">
                    <div
                      className="h-full rounded-full transition-[width] duration-700"
                      style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                  <div className="text-[0.78rem] font-semibold text-ink min-w-[50px] text-right">
                    {format ? format(val) : `$${val}`}/day
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {dest.budget_notes && (
        <div className="text-[0.72rem] text-ink-faint leading-[1.6] px-3 py-2.5 rounded-md bg-black/20 border-l-2 border-rim-bright">
          {dest.budget_notes}
        </div>
      )}
    </div>
  );
}

function PassengersCard({ passengers }) {
  if (!passengers || passengers.length === 0) return null;
  return (
    <div className="glass-card p-6" style={{ animation: 'fadeUp 0.5s ease both' }}>
      <div className="text-[1rem] font-bold text-ink tracking-[-0.01em] mb-3.5">
        👥 Passengers{' '}
        <span className="text-[0.8rem] font-normal text-ink-faint">({passengers.length})</span>
      </div>
      <div className="flex flex-col gap-3.5">
        {passengers.map((p, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5 text-[0.9rem] font-semibold text-ink">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet to-cyan flex items-center justify-center text-[0.75rem] font-bold text-white shrink-0 uppercase">
                {p.name?.[0] || '?'}
              </div>
              {p.name}
            </div>
            {p.addons && p.addons.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pl-[38px]">
                {p.addons.map((addon, j) => (
                  <span key={j} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.72rem] font-medium bg-white/[0.05] border border-rim text-ink-dim">
                    {addon}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BudgetPanel({ destinations, totalCost, passengers, travelerType, format, currency }) {
  const travelerMeta  = TRAVELER_LABELS[travelerType] || TRAVELER_LABELS['mid-range'];
  const passengerCount = passengers?.length || 1;

  const grandTotal = destinations?.reduce((sum, d) => {
    return sum + (d.total_estimated_stay_usd || 0) * passengerCount;
  }, 0) || 0;

  return (
    <div className="sticky top-[90px]">
      {/* Panel header */}
      <div className="flex items-center justify-between gap-2.5 mb-5">
        <h2 className="text-[0.75rem] font-bold text-ink-dim tracking-[0.06em] uppercase">✦ Budget Estimates</h2>
        {travelerType && (
          <span
            className="text-[0.7rem] font-bold px-2.5 py-1 rounded-full border tracking-[0.04em] whitespace-nowrap"
            style={{ color: travelerMeta.color, borderColor: travelerMeta.color + '55', background: travelerMeta.color + '18' }}
          >
            {travelerMeta.icon} {travelerMeta.label}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <PassengersCard passengers={passengers} />

        {destinations?.map((dest, i) => (
          <BudgetCard key={i} dest={dest} index={i} passengerCount={passengerCount} format={format} />
        ))}

        {(grandTotal > 0 || totalCost > 0) && (
          <div className="p-5 rounded-[14px] bg-gradient-to-br from-violet/[0.12] to-cyan/[0.08] border border-violet/20">
            {grandTotal > 0 && (
              <div style={{ marginBottom: totalCost > 0 ? 16 : 0 }}>
                <div className="text-[0.72rem] font-semibold tracking-[0.08em] uppercase text-ink-faint mb-1.5">
                  Total estimated spend · {passengerCount} {passengerCount === 1 ? 'traveler' : 'travelers'}
                </div>
                <div className="text-[2rem] font-extrabold tracking-[-0.04em] gradient-text">
                  {format ? `~${format(grandTotal)}` : `~$${grandTotal.toLocaleString()}`}
                </div>
                <div className="text-[0.72rem] text-ink-faint mt-1">
                  AI estimate · {travelerMeta?.label || 'Mid-range'} style
                </div>
              </div>
            )}
            {totalCost > 0 && (
              <div style={{ borderTop: grandTotal > 0 ? '1px solid var(--border)' : 'none', paddingTop: grandTotal > 0 ? 16 : 0 }}>
                <div className="text-[0.72rem] font-semibold tracking-[0.08em] uppercase text-ink-faint mb-1.5">
                  Confirmed spend (from documents)
                </div>
                <div className="text-[1.5rem] font-extrabold tracking-[-0.04em] gradient-text">
                  {format ? format(totalCost) : `$${totalCost?.toLocaleString()}`}
                </div>
                <div className="text-[0.72rem] text-ink-faint mt-1">
                  Extracted from your booking confirmations
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
