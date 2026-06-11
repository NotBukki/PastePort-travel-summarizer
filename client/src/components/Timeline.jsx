import EventCard from './EventCard';

export default function Timeline({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="timeline-section">
        <h2>Timeline</h2>
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No travel events were detected.
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-section">
      <h2>✦ Chronological Timeline</h2>
      <div className="timeline" role="list">
        {events.map((event, i) => (
          <EventCard key={i} event={event} index={i} />
        ))}
      </div>
    </div>
  );
}
