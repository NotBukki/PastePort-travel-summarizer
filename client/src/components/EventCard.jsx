const TYPE_META = {
  flight: {
    icon: '✈️', label: 'Flight',     arrowIcon: '→',
    dotCls:  'bg-flight/20 border-flight/40',
    topGlow: 'shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(59,130,246,0.12)]',
  },
  hotel: {
    icon: '🏨', label: 'Hotel',      arrowIcon: '↔',
    dotCls:  'bg-hotel/20 border-hotel/40',
    topGlow: 'shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(245,158,11,0.12)]',
  },
  train: {
    icon: '🚆', label: 'Train',      arrowIcon: '→',
    dotCls:  'bg-train/20 border-train/40',
    topGlow: 'shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(16,185,129,0.12)]',
  },
  car: {
    icon: '🚗', label: 'Car Rental', arrowIcon: '↔',
    dotCls:  'bg-car/20 border-car/40',
    topGlow: 'shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(139,92,246,0.12)]',
  },
  ferry: {
    icon: '⛴️', label: 'Ferry',      arrowIcon: '→',
    dotCls:  'bg-cyan/20 border-cyan/40',
    topGlow: 'shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(6,182,212,0.12)]',
  },
  bus: {
    icon: '🚌', label: 'Bus',        arrowIcon: '→',
    dotCls:  'bg-bus/20 border-bus/40',
    topGlow: 'shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(249,115,22,0.12)]',
  },
  other: {
    icon: '📋', label: 'Booking',    arrowIcon: '→',
    dotCls:  'bg-other/20 border-other/40',
    topGlow: 'shadow-[0_0_0_1px_rgba(255,255,255,0.08)]',
  },
};

function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return iso; }
}

function formatTime(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch { return null; }
}

function duration(dep, arr) {
  if (!dep || !arr) return null;
  try {
    const diffMs = new Date(arr) - new Date(dep);
    if (diffMs <= 0) return null;
    const hours = Math.floor(diffMs / 3_600_000);
    const mins  = Math.floor((diffMs % 3_600_000) / 60_000);
    if (hours === 0) return `${mins}m`;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  } catch { return null; }
}

export default function EventCard({ event, index, format }) {
  const meta    = TYPE_META[event.type] || TYPE_META.other;
  const dur     = duration(event.departure, event.arrival);
  const depDate = formatDate(event.departure);
  const depTime = formatTime(event.departure);
  const arrDate = formatDate(event.arrival);
  const hasPrice = event.price?.amount > 0;
  const isHotel  = event.type === 'hotel';

  const formattedPrice = hasPrice && format
    ? format(event.price.amount, event.price.currency || 'USD')
    : hasPrice
      ? `${event.price.currency || 'USD'} ${event.price.amount.toLocaleString()}`
      : null;

  return (
    <div
      className="group flex gap-5 py-5 animate-slide-in"
      style={{ animationDelay: `${index * 0.07}s` }}
      id={`event-${index}`}
    >
      {/* Timeline dot */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-xl shrink-0 relative z-[1] border-2 transition-transform duration-200 group-hover:scale-105 ${meta.dotCls}`}>
          {meta.icon}
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 min-w-0">
        <div className={`glass-card px-6 py-5 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${meta.topGlow}`}>

          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3.5">
            <div>
              <div className="text-[1rem] font-bold text-ink tracking-[-0.01em]">
                {event.title || `${meta.label} Booking`}
              </div>
              {event.carrier && (
                <div className="text-[0.78rem] text-ink-faint mt-0.5">{event.carrier}</div>
              )}
            </div>
            <div className={`text-[1rem] font-bold whitespace-nowrap ${hasPrice ? 'text-ink' : 'text-ink-faint font-normal text-[0.8rem]'}`}>
              {formattedPrice ?? '—'}
            </div>
          </div>

          {/* Route */}
          {(event.from || event.to) && (
            <div className="flex items-center gap-3 mb-3.5">
              <div className="text-[0.95rem] font-semibold text-ink min-w-[80px]">
                <span>{event.from || '?'}</span>
                {depDate && (
                  <small className="block text-[0.72rem] font-normal text-ink-faint mt-0.5">
                    {depDate}{depTime ? ` · ${depTime}` : ''}
                  </small>
                )}
              </div>
              <div className="flex-1 flex items-center gap-1.5 text-ink-faint text-[0.75rem]">
                <span className="flex-1 h-px bg-rim-bright" />
                {dur && <span>{dur}</span>}
                <span className="flex-1 h-px bg-rim-bright" />
              </div>
              <div className="text-[0.95rem] font-semibold text-ink min-w-[80px] text-right">
                <span>{isHotel ? event.to || event.from : event.to || '?'}</span>
                {arrDate && arrDate !== depDate && !isHotel && (
                  <small className="block text-[0.72rem] font-normal text-ink-faint mt-0.5">{arrDate}</small>
                )}
                {isHotel && arrDate && (
                  <small className="block text-[0.72rem] font-normal text-ink-faint mt-0.5">Check-out: {arrDate}</small>
                )}
              </div>
            </div>
          )}

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.72rem] font-medium bg-white/[0.05] border border-rim text-ink-dim">
              {meta.icon} {meta.label}
            </span>
            {event.confirmation && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.72rem] font-medium bg-violet/[0.08] border border-violet/30 text-violet-light font-mono tracking-[0.05em]" title="Confirmation code">
                🔖 {event.confirmation}
              </span>
            )}
            {event.seat && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.72rem] font-medium bg-white/[0.05] border border-rim text-ink-dim" title="Seat/Room">
                💺 {event.seat}
              </span>
            )}
            {dur && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.72rem] font-medium bg-white/[0.05] border border-rim text-ink-dim">
                ⏱ {dur}
              </span>
            )}
          </div>

          {/* Notes */}
          {event.notes && (
            <div className="mt-3 text-[0.78rem] text-ink-faint leading-[1.6] px-3 py-2 rounded-md bg-black/20 border-l-2 border-rim-bright">
              {event.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
