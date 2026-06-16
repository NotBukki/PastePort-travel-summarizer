import { useState, useEffect } from 'react';

const TRAVELER_LABELS = {
  budget:      { icon: '🎒', label: 'Budget',    color: '#10b981' },
  'mid-range': { icon: '✈️', label: 'Mid-range', color: '#7c3aed' },
  luxury:      { icon: '💎', label: 'Luxury',    color: '#f59e0b' },
};

const PLATFORM_URLS = {
  'Booking.com': (city) => `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}`,
  'Airbnb':      (city) => `https://www.airbnb.com/s/${encodeURIComponent(city)}/homes`,
  'Hostelworld': (city) => `https://www.hostelworld.com/findabed.php/ChosenCity.${encodeURIComponent(city)}`,
};

const PLATFORM_ICONS = { 'Booking.com': '🏨', 'Airbnb': '🏠', 'Hostelworld': '🎒' };

const TRANSPORT_ICONS = {
  Metro: '🚇', Bus: '🚌', Tram: '🚊', Taxi: '🚕',
  Uber: '📱', Bolt: '📱', 'Bike hire': '🚲', Walk: '🚶',
  Ferry: '⛴️', Train: '🚂', 'Private transfer': '🚘',
};

const CATEGORIES = [
  { key: 'accommodation', label: 'Stay',       icon: '🏨' },
  { key: 'dining',        label: 'Eat',        icon: '🍽️' },
  { key: 'transport',     label: 'Get Around', icon: '🚌' },
];

function AccommodationCard({ item, city, index, format }) {
  return (
    <div className="glass-card flex flex-col gap-2.5 p-5" style={{ animationDelay: `${index * 0.08}s`, animation: 'fadeUp 0.4s ease both' }}>
      <div className="flex items-start justify-between gap-2.5">
        <div className="text-[1rem] font-bold text-ink tracking-[-0.01em] leading-[1.3]">{item.name}</div>
        <span className="text-[0.68rem] px-2.5 py-1 rounded-full bg-violet/15 text-violet-light border border-violet/25 whitespace-nowrap shrink-0 font-semibold">
          {item.type}
        </span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <span className="text-[0.78rem] text-ink-dim flex items-center gap-1">📍 {item.area}</span>
      </div>
      {item.price_per_night_usd > 0 && (
        <div>
          <div className="text-[1.3rem] font-extrabold tracking-[-0.03em] text-cyan leading-[1.1]">{format(item.price_per_night_usd)}</div>
          <div className="text-[0.7rem] text-ink-faint tracking-[0.04em] uppercase font-semibold mt-0.5">per night</div>
        </div>
      )}
      {item.tip && (
        <div className="text-[0.78rem] text-ink-faint border-t border-rim pt-2.5 leading-[1.5] mt-auto">
          💡 {item.tip}
        </div>
      )}
      {item.search_platforms?.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {item.search_platforms.map((platform) => {
            const url = PLATFORM_URLS[platform]?.(city);
            if (!url) return null;
            return (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.75rem] px-3 py-1.5 rounded-lg border border-rim-bright bg-white/[0.04] text-ink-dim no-underline inline-flex items-center gap-1 font-medium transition-all duration-200 hover:border-violet/50 hover:text-ink hover:bg-violet/10"
              >
                {PLATFORM_ICONS[platform] || '🔗'} {platform}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DiningCard({ item, index, format }) {
  return (
    <div className="glass-card flex flex-col gap-2.5 p-5" style={{ animationDelay: `${index * 0.08}s`, animation: 'fadeUp 0.4s ease both' }}>
      <div className="flex items-start justify-between gap-2.5">
        <div className="text-[1rem] font-bold text-ink tracking-[-0.01em] leading-[1.3]">{item.name}</div>
        <span className="text-[0.68rem] px-2.5 py-1 rounded-full bg-violet/15 text-violet-light border border-violet/25 whitespace-nowrap shrink-0 font-semibold">
          {item.type}
        </span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <span className="text-[0.78rem] text-ink-dim flex items-center gap-1">🍴 {item.cuisine}</span>
        <span className="text-[0.78rem] text-ink-dim flex items-center gap-1">📍 {item.area}</span>
      </div>
      {item.price_per_person_usd > 0 && (
        <div>
          <div className="text-[1.3rem] font-extrabold tracking-[-0.03em] text-cyan leading-[1.1]">{format(item.price_per_person_usd)}</div>
          <div className="text-[0.7rem] text-ink-faint tracking-[0.04em] uppercase font-semibold mt-0.5">per person</div>
        </div>
      )}
      {item.must_try && (
        <div className="bg-cyan/[0.08] border border-cyan/20 rounded-lg px-3 py-2 text-[0.82rem] text-cyan leading-[1.4]">
          <strong className="block text-[0.65rem] text-ink-faint mb-0.5 uppercase tracking-[0.08em] font-bold">Must try</strong>
          {item.must_try}
        </div>
      )}
      {item.tip && (
        <div className="text-[0.78rem] text-ink-faint border-t border-rim pt-2.5 leading-[1.5] mt-auto">
          💡 {item.tip}
        </div>
      )}
    </div>
  );
}

function TransportCard({ item, index, format }) {
  const icon          = TRANSPORT_ICONS[item.mode] || '🚍';
  const formattedCost = item.cost_usd > 0
    ? `${format(item.cost_usd)}${item.cost_unit ? ' ' + item.cost_unit : ''}`
    : null;

  return (
    <div className="glass-card flex flex-col gap-2.5 p-5" style={{ animationDelay: `${index * 0.08}s`, animation: 'fadeUp 0.4s ease both' }}>
      <div className="flex items-center gap-2.5">
        <span className="text-[1.6rem] leading-none">{icon}</span>
        <div className="text-[1rem] font-bold text-ink tracking-[-0.01em]">{item.mode}</div>
      </div>
      {item.description && (
        <p className="text-[0.85rem] text-ink-dim m-0 leading-[1.5]">{item.description}</p>
      )}
      {formattedCost && (
        <div className="text-[0.88rem] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-[5px] w-fit">
          {formattedCost}
        </div>
      )}
      {item.tip && (
        <div className="text-[0.78rem] text-ink-faint border-t border-rim pt-2.5 leading-[1.5] mt-auto">
          💡 {item.tip}
        </div>
      )}
    </div>
  );
}

export default function SuggestionsPanel({ suggestions, travelerType, format, events = [] }) {
  const hasBookedAccommodation = events.some((e) => e.type === 'hotel');
  const defaultCategory = hasBookedAccommodation ? 'dining' : 'accommodation';

  const [activeCity,     setActiveCity]     = useState(0);
  const [activeCategory, setActiveCategory] = useState(defaultCategory);

  useEffect(() => {
    if (hasBookedAccommodation && activeCategory === 'accommodation') setActiveCategory('dining');
  }, [hasBookedAccommodation]);

  if (!suggestions || suggestions.length === 0) return null;

  const visibleCategories = CATEGORIES.filter(
    (cat) => !(cat.key === 'accommodation' && hasBookedAccommodation)
  );

  const travelerMeta = TRAVELER_LABELS[travelerType] || TRAVELER_LABELS['mid-range'];
  const cityData     = suggestions[activeCity];
  if (!cityData) return null;
  const items = cityData[activeCategory] || [];

  return (
    <div className="mt-12 pt-10 border-t border-rim">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-[0.75rem] font-bold text-ink-dim tracking-[0.06em] uppercase m-0">✦ Local Recommendations</h2>
        <span
          className="text-[0.7rem] font-bold px-2.5 py-1 rounded-full border tracking-[0.04em] whitespace-nowrap"
          style={{ color: travelerMeta.color, borderColor: travelerMeta.color + '55', background: travelerMeta.color + '18' }}
        >
          {travelerMeta.icon} {travelerMeta.label} picks
        </span>
      </div>

      {/* City tabs */}
      {suggestions.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {suggestions.map((s, i) => (
            <button
              key={i}
              className={`px-[18px] py-1.5 rounded-full border font-sans text-[0.85rem] cursor-pointer transition-all duration-200 ${activeCity === i ? 'border-violet/50 text-ink bg-violet/[12%]' : 'border-rim bg-transparent text-ink-dim hover:border-rim-bright hover:text-ink'}`}
              onClick={() => setActiveCity(i)}
            >
              {s.city}
            </button>
          ))}
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-1 mb-6 bg-mid rounded-xl p-1 border border-rim w-fit max-sm:w-full">
        {visibleCategories.map((cat) => (
          <button
            key={cat.key}
            className={`px-[22px] py-2 rounded-lg border-none font-sans text-[0.88rem] cursor-pointer transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap max-sm:flex-1 max-sm:justify-center max-sm:px-3 ${activeCategory === cat.key ? 'bg-violet/20 text-ink font-semibold' : 'bg-transparent text-ink-dim hover:text-ink'}`}
            onClick={() => setActiveCategory(cat.key)}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-4 max-sm:grid-cols-1">
        {activeCategory === 'accommodation' && items.map((item, i) => (
          <AccommodationCard key={i} item={item} city={cityData.city} index={i} format={format} />
        ))}
        {activeCategory === 'dining' && items.map((item, i) => (
          <DiningCard key={i} item={item} index={i} format={format} />
        ))}
        {activeCategory === 'transport' && items.map((item, i) => (
          <TransportCard key={i} item={item} index={i} format={format} />
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-ink-faint text-[0.9rem] py-5">
          No recommendations available for this category.
        </div>
      )}
    </div>
  );
}
