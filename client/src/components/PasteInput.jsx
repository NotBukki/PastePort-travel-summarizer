import { useState } from 'react';

const ICONS = ['✈️', '🏨', '🚆', '🚗', '🚢', '🧳'];

const TRAVELER_TYPES = [
  {
    id: 'budget',
    icon: '🎒',
    label: 'Budget',
    tagline: 'Every cent counts',
    description: 'Hostels, street food & free attractions',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.2)',
    border: 'rgba(16, 185, 129, 0.4)',
  },
  {
    id: 'mid-range',
    icon: '✈️',
    label: 'Mid-range',
    tagline: 'Comfort & value',
    description: '3–4 star hotels, restaurants & day trips',
    color: '#7c3aed',
    glow: 'rgba(124, 58, 237, 0.2)',
    border: 'rgba(124, 58, 237, 0.4)',
  },
  {
    id: 'luxury',
    icon: '💎',
    label: 'Luxury',
    tagline: 'Only the best',
    description: '5-star hotels, fine dining & private tours',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.2)',
    border: 'rgba(245, 158, 11, 0.4)',
  },
];

const defaultSegment = (id) => ({
  id,
  name: `Document ${id}`,
  text: '',
});

export default function PasteInput({ onParse, loading }) {
  const [segments, setSegments] = useState([defaultSegment(1)]);
  const [nextId, setNextId] = useState(2);
  const [travelerType, setTravelerType] = useState('mid-range');

  const addSegment = () => {
    setSegments((s) => [...s, defaultSegment(nextId)]);
    setNextId((n) => n + 1);
  };

  const removeSegment = (id) => {
    if (segments.length === 1) return;
    setSegments((s) => s.filter((seg) => seg.id !== id));
  };

  const updateText = (id, text) =>
    setSegments((s) => s.map((seg) => (seg.id === id ? { ...seg, text } : seg)));

  const updateName = (id, name) =>
    setSegments((s) => s.map((seg) => (seg.id === id ? { ...seg, name } : seg)));

  const handleParse = () => {
    const texts = segments.map((s) => s.text).filter((t) => t.trim());
    if (texts.length === 0) return;
    onParse(texts, travelerType);
  };

  const hasContent = segments.some((s) => s.text.trim().length > 0);

  return (
    <div className="paste-section">
      {/* Documents */}
      <div className="paste-header">
        <h2>Paste your booking documents</h2>
        <button className="btn-add" onClick={addSegment} id="btn-add-segment">
          <span>+</span> Add document
        </button>
      </div>

      <div className="segments-list">
        {segments.map((seg, idx) => (
          <div key={seg.id} className="glass-card segment-card">
            <div className="segment-top">
              <div className="segment-label">
                <div className="segment-icon">{ICONS[idx % ICONS.length]}</div>
                <input
                  className="segment-name-input"
                  value={seg.name}
                  onChange={(e) => updateName(seg.id, e.target.value)}
                  placeholder="Document name..."
                  id={`segment-name-${seg.id}`}
                />
              </div>
              {segments.length > 1 && (
                <button
                  className="btn-remove"
                  onClick={() => removeSegment(seg.id)}
                  aria-label="Remove segment"
                  id={`btn-remove-${seg.id}`}
                >
                  ✕
                </button>
              )}
            </div>
            <textarea
              className="segment-textarea"
              value={seg.text}
              onChange={(e) => updateText(seg.id, e.target.value)}
              placeholder={`Paste your raw booking email or confirmation here...\n\nExamples:\n• Flight booking confirmation from airline\n• Hotel reservation email\n• Train ticket details\n• Car rental confirmation`}
              id={`segment-text-${seg.id}`}
              spellCheck={false}
            />
          </div>
        ))}
      </div>

      {/* Traveler Type Selector */}
      <div className="traveler-selector-wrap">
        <div className="traveler-selector-label">
          <span>🧭</span> What kind of traveler are you?
        </div>
        <div className="traveler-types">
          {TRAVELER_TYPES.map((type) => {
            const isActive = travelerType === type.id;
            return (
              <button
                key={type.id}
                id={`traveler-type-${type.id}`}
                className={`traveler-type-card ${isActive ? 'active' : ''}`}
                onClick={() => setTravelerType(type.id)}
                style={isActive ? {
                  '--type-color': type.color,
                  '--type-glow': type.glow,
                  '--type-border': type.border,
                } : {}}
              >
                <div className="traveler-type-icon"
                  style={{ background: isActive ? type.glow : undefined, borderColor: isActive ? type.border : undefined }}>
                  {type.icon}
                </div>
                <div className="traveler-type-body">
                  <div className="traveler-type-name" style={{ color: isActive ? type.color : undefined }}>
                    {type.label}
                  </div>
                  <div className="traveler-type-tagline">{type.tagline}</div>
                  <div className="traveler-type-desc">{type.description}</div>
                </div>
                {isActive && (
                  <div className="traveler-type-check" style={{ background: type.color }}>✓</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Parse Button */}
      <div className="parse-btn-wrap">
        <button
          className="btn-parse"
          onClick={handleParse}
          disabled={!hasContent || loading}
          id="btn-parse-trip"
        >
          <span className="btn-parse-icon">✈️</span>
          {loading ? 'Parsing your trip...' : 'Parse My Trip'}
        </button>
      </div>
    </div>
  );
}
