import EventCard from './EventCard';

export default function Timeline({ events, format }) {
  if (!events || events.length === 0) {
    return (
      <div>
        <h2 className="text-[0.75rem] font-bold mb-6 text-ink-dim tracking-[0.06em] uppercase">Timeline</h2>
        <div className="glass-card p-8 text-center text-ink-faint">
          No travel events were detected.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-[0.75rem] font-bold mb-6 text-ink-dim tracking-[0.06em] uppercase">✦ Chronological Timeline</h2>
      <div className="timeline-track flex flex-col" role="list">
        {events.map((event, i) => (
          <EventCard key={i} event={event} index={i} format={format} />
        ))}
      </div>
    </div>
  );
}
