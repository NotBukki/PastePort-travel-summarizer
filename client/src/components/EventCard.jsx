const TYPE_META = {
  flight: { icon: '✈️', label: 'Flight',    className: 'flight', arrowIcon: '→' },
  hotel:  { icon: '🏨', label: 'Hotel',     className: 'hotel',  arrowIcon: '↔' },
  train:  { icon: '🚆', label: 'Train',     className: 'train',  arrowIcon: '→' },
  car:    { icon: '🚗', label: 'Car Rental',className: 'car',    arrowIcon: '↔' },
  ferry:  { icon: '⛴️', label: 'Ferry',     className: 'ferry',  arrowIcon: '→' },
  bus:    { icon: '🚌', label: 'Bus',       className: 'bus',    arrowIcon: '→' },
  other:  { icon: '📋', label: 'Booking',   className: 'other',  arrowIcon: '→' },
};

function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch { return iso; }
}

function formatTime(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
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
  const meta  = TYPE_META[event.type] || TYPE_META.other;
  const dur   = duration(event.departure, event.arrival);
  const depDate = formatDate(event.departure);
  const depTime = formatTime(event.departure);
  const arrDate = formatDate(event.arrival);
  const hasPrice = event.price?.amount > 0;
  const isHotel = event.type === 'hotel';

  // Convert the extracted price from its original currency to the user's display currency
  const formattedPrice = hasPrice && format
    ? format(event.price.amount, event.price.currency || 'USD')
    : hasPrice
      ? `${event.price.currency || 'USD'} ${event.price.amount.toLocaleString()}`
      : null;

  return (
    <div
      className="event-card"
      style={{ animationDelay: `${index * 0.07}s` }}
      id={`event-${index}`}
    >
      {/* Dot */}
      <div className="event-dot-wrap">
        <div className={`event-dot ${meta.className}`}>{meta.icon}</div>
      </div>

      {/* Content */}
      <div className="event-body">
        <div className={`glass-card event-inner ${meta.className}`}>
          {/* Header */}
          <div className="event-header">
            <div>
              <div className="event-title">{event.title || `${meta.label} Booking`}</div>
              {event.carrier && <div className="event-carrier">{event.carrier}</div>}
            </div>
            <div className={`event-price ${hasPrice ? '' : 'zero'}`}>
              {formattedPrice ?? '—'}
            </div>
          </div>

          {/* Route */}
          {(event.from || event.to) && (
            <div className="event-route">
              <div className="route-city">
                <span>{event.from || '?'}</span>
                {depDate && <small>{depDate}{depTime ? ` · ${depTime}` : ''}</small>}
              </div>
              <div className="route-line">
                {dur && <span>{dur}</span>}
              </div>
              <div className="route-city" style={{ textAlign: 'right' }}>
                <span>{isHotel ? event.to || event.from : event.to || '?'}</span>
                {arrDate && arrDate !== depDate && <small>{arrDate}</small>}
                {isHotel && arrDate && <small>Check-out: {arrDate}</small>}
              </div>
            </div>
          )}

          {/* Meta chips */}
          <div className="event-meta">
            <span className="meta-chip">
              {meta.icon} {meta.label}
            </span>
            {event.confirmation && (
              <span className="meta-chip confirm" title="Confirmation code">
                🔖 {event.confirmation}
              </span>
            )}
            {event.seat && (
              <span className="meta-chip" title="Seat/Room">
                💺 {event.seat}
              </span>
            )}
            {dur && (
              <span className="meta-chip">
                ⏱ {dur}
              </span>
            )}
          </div>

          {/* Notes */}
          {event.notes && (
            <div className="event-notes">{event.notes}</div>
          )}
        </div>
      </div>
    </div>
  );
}
