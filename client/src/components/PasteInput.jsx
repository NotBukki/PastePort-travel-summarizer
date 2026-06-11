import { useState, useRef, useEffect } from 'react';

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

let _nextId = 1;
const makeSegment = () => ({ id: _nextId++, customName: '', text: '' });

// Individual animated segment card
function SegmentCard({ segment, displayIndex, total, onRemove, onChangeName, onChangeText, isNew }) {
  const ref = useRef(null);

  // Trigger enter animation on mount
  useEffect(() => {
    if (!isNew) return;
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(-12px) scale(0.98)';
    // Force reflow then transition in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = 'opacity 0.3s cubic-bezier(0.34, 1.1, 0.64, 1), transform 0.35s cubic-bezier(0.34, 1.1, 0.64, 1)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0) scale(1)';
      });
    });
  }, []);

  const autoName = `Document ${displayIndex}`;
  const displayName = segment.customName || autoName;

  return (
    <div ref={ref} className="glass-card segment-card">
      <div className="segment-top">
        <div className="segment-label">
          <div className="segment-icon">{ICONS[(displayIndex - 1) % ICONS.length]}</div>
          <input
            className="segment-name-input"
            value={segment.customName}
            onChange={(e) => onChangeName(segment.id, e.target.value)}
            placeholder={autoName}
            id={`segment-name-${segment.id}`}
          />
        </div>
        {total > 1 && (
          <button
            className="btn-remove"
            onClick={() => onRemove(segment.id)}
            aria-label="Remove segment"
            id={`btn-remove-${segment.id}`}
          >
            ✕
          </button>
        )}
      </div>
      <textarea
        className="segment-textarea"
        value={segment.text}
        onChange={(e) => onChangeText(segment.id, e.target.value)}
        placeholder={`Paste your raw booking email or confirmation here...\n\nExamples:\n• Flight booking confirmation from airline\n• Hotel reservation email\n• Train ticket details\n• Car rental confirmation`}
        id={`segment-text-${segment.id}`}
        spellCheck={false}
      />
    </div>
  );
}

export default function PasteInput({ onParse, loading }) {
  const [segments, setSegments] = useState([makeSegment()]);
  const [removingIds, setRemovingIds] = useState(new Set());
  const [newIds, setNewIds] = useState(new Set());
  const [travelerType, setTravelerType] = useState('mid-range');

  const addSegment = () => {
    const seg = makeSegment();
    setNewIds((prev) => new Set([...prev, seg.id]));
    setSegments((s) => [...s, seg]);
    // Clean up newIds flag after animation completes
    setTimeout(() => {
      setNewIds((prev) => {
        const next = new Set(prev);
        next.delete(seg.id);
        return next;
      });
    }, 400);
  };

  const removeSegment = (id) => {
    if (segments.length - removingIds.size <= 1) return;

    // Mark as removing so we can animate out
    setRemovingIds((prev) => new Set([...prev, id]));

    setTimeout(() => {
      setSegments((s) => s.filter((seg) => seg.id !== id));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 280);
  };

  const updateText = (id, text) =>
    setSegments((s) => s.map((seg) => (seg.id === id ? { ...seg, text } : seg)));

  const updateName = (id, customName) =>
    setSegments((s) => s.map((seg) => (seg.id === id ? { ...seg, customName } : seg)));

  const handleParse = () => {
    const texts = segments.map((s) => s.text).filter((t) => t.trim());
    if (texts.length === 0) return;
    onParse(texts, travelerType);
  };

  const hasContent = segments.some((s) => s.text.trim().length > 0);

  // Visible (non-removing) segments get sequential display numbers
  const visibleSegments = segments.filter((s) => !removingIds.has(s.id));

  return (
    <div className="paste-section">
      <div className="paste-header">
        <h2>Paste your booking documents</h2>
        <button className="btn-add" onClick={addSegment} id="btn-add-segment">
          <span>+</span> Add document
        </button>
      </div>

      <div className="segments-list">
        {segments.map((seg) => {
          const isRemoving = removingIds.has(seg.id);
          // Display index = position among visible segments only
          const displayIndex = visibleSegments.findIndex((s) => s.id === seg.id) + 1;

          return (
            <div
              key={seg.id}
              className={`segment-wrapper ${isRemoving ? 'segment-removing' : ''}`}
            >
              <SegmentCard
                segment={seg}
                displayIndex={displayIndex || 1}
                total={visibleSegments.length}
                onRemove={removeSegment}
                onChangeName={updateName}
                onChangeText={updateText}
                isNew={newIds.has(seg.id)}
              />
            </div>
          );
        })}
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
                <div
                  className="traveler-type-icon"
                  style={isActive ? { background: type.glow, borderColor: type.border } : {}}
                >
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
