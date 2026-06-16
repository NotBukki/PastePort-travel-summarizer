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
const makeSegment = () => ({ id: _nextId++, customName: '', mode: 'text', text: '', file: null });
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf'];

const readFileAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve({ name: file.name, mediaType: file.type, data: reader.result.split(',')[1] });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function SegmentCard({ segment, displayIndex, total, onRemove, onChangeName, onChangeText, onChangeMode, onChangeFile, isNew }) {
  const ref = useRef(null);
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!isNew) return;
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(-12px) scale(0.98)';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = 'opacity 0.3s cubic-bezier(0.34,1.1,0.64,1), transform 0.35s cubic-bezier(0.34,1.1,0.64,1)';
        el.style.opacity    = '1';
        el.style.transform  = 'translateY(0) scale(1)';
      });
    });
  }, []);

  const processFile = async (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Unsupported file type. Please upload PNG, JPG, WEBP, GIF, or PDF.');
      return;
    }
    onChangeFile(segment.id, await readFileAsBase64(file));
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await processFile(file);
  };

  const handleFileInput = async (e) => {
    const file = e.target.files[0];
    if (file) await processFile(file);
    e.target.value = '';
  };

  const autoName = `Document ${displayIndex}`;

  return (
    <div ref={ref} className="glass-card p-5">
      {/* Top row */}
      <div className="flex items-center gap-3 mb-3.5">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[15px] bg-violet/30 border border-violet/30 shrink-0">
            {ICONS[(displayIndex - 1) % ICONS.length]}
          </div>
          <input
            className="bg-transparent border-none outline-none text-ink text-[0.9rem] font-semibold font-sans cursor-text w-full placeholder:text-ink-faint"
            value={segment.customName}
            onChange={(e) => onChangeName(segment.id, e.target.value)}
            placeholder={autoName}
            id={`segment-name-${segment.id}`}
          />
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Mode tabs */}
          <div
            id={displayIndex === 1 ? 'segment-mode-toggle-first' : undefined}
            className="flex bg-white/[0.04] border border-rim rounded-lg p-[3px] gap-0.5"
          >
            <button
              className={`px-2.5 py-1 text-[0.72rem] font-medium rounded-[5px] border-none cursor-pointer font-sans whitespace-nowrap transition-colors duration-200 ${segment.mode === 'text' ? 'bg-violet text-white' : 'bg-transparent text-ink-faint hover:text-ink-dim'}`}
              onClick={() => onChangeMode(segment.id, 'text')}
            >
              ✏️ Text
            </button>
            <button
              className={`px-2.5 py-1 text-[0.72rem] font-medium rounded-[5px] border-none cursor-pointer font-sans whitespace-nowrap transition-colors duration-200 ${segment.mode === 'file' ? 'bg-violet text-white' : 'bg-transparent text-ink-faint hover:text-ink-dim'}`}
              onClick={() => onChangeMode(segment.id, 'file')}
            >
              📎 File
            </button>
          </div>
          {total > 1 && (
            <button
              className="flex items-center justify-center w-7 h-7 rounded-md border border-rim bg-transparent text-ink-faint cursor-pointer text-sm shrink-0 transition-all duration-200 hover:border-red-500 hover:text-red-500 hover:bg-red-500/10"
              onClick={() => onRemove(segment.id)}
              aria-label="Remove segment"
              id={`btn-remove-${segment.id}`}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {segment.mode === 'text' ? (
        <textarea
          className="w-full min-h-[140px] bg-black/20 border border-rim rounded-lg px-4 py-3.5 text-ink text-[0.83rem] font-mono leading-[1.65] resize-y outline-none transition-colors duration-200 focus:border-violet/50 placeholder:text-ink-faint placeholder:leading-[1.7]"
          value={segment.text}
          onChange={(e) => onChangeText(segment.id, e.target.value)}
          placeholder={`Paste your raw booking email or confirmation here...\n\nExamples:\n• Flight booking confirmation from airline\n• Hotel reservation email\n• Train ticket details\n• Car rental confirmation`}
          id={displayIndex === 1 ? 'segment-text-first' : `segment-text-${segment.id}`}
          spellCheck={false}
        />
      ) : (
        <div
          className={[
            'border-2 border-dashed rounded-[14px] text-center cursor-pointer min-h-[160px] flex items-center justify-center transition-all duration-200',
            dragging
              ? 'border-violet bg-violet/10 border-solid'
              : segment.file
                ? 'border-emerald-500/35 bg-emerald-500/[0.04] border-solid cursor-default min-h-[unset] p-5'
                : 'border-rim-bright hover:border-violet hover:bg-violet/[0.05] focus-visible:border-violet focus-visible:outline-none',
          ].join(' ')}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !segment.file && fileInputRef.current?.click()}
          role={!segment.file ? 'button' : undefined}
          tabIndex={!segment.file ? 0 : undefined}
          onKeyDown={!segment.file ? (e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); } : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.gif,.pdf"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
          {segment.file ? (
            <div className="flex items-center gap-3.5 w-full">
              <span className="text-3xl shrink-0 leading-none">
                {segment.file.mediaType === 'application/pdf' ? '📄' : '🖼️'}
              </span>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-[0.88rem] font-semibold text-ink whitespace-nowrap overflow-hidden text-ellipsis">
                  {segment.file.name}
                </div>
                <div className="text-[0.74rem] text-ink-faint mt-0.5">
                  {segment.file.mediaType === 'application/pdf' ? 'PDF Document' : 'Image'}
                </div>
              </div>
              <button
                className="shrink-0 bg-white/[0.06] border border-rim rounded-md text-ink-dim cursor-pointer px-2.5 py-1 text-[0.75rem] font-sans transition-all duration-200 hover:bg-red-500/[0.18] hover:text-red-500 hover:border-red-500/30"
                onClick={(e) => { e.stopPropagation(); onChangeFile(segment.id, null); }}
                aria-label="Remove file"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 pointer-events-none">
              <div className="text-3xl">📎</div>
              <div className="text-[0.9rem] font-medium text-ink-dim">Drop file here or click to browse</div>
              <div className="text-[0.76rem] text-ink-faint">Supports PNG · JPG · WEBP · GIF · PDF</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PasteInput({ onParse, loading }) {
  const [segments, setSegments]     = useState([makeSegment()]);
  const [removingIds, setRemovingIds] = useState(new Set());
  const [newIds, setNewIds]         = useState(new Set());
  const [travelerType, setTravelerType] = useState('mid-range');

  const addSegment = () => {
    const seg = makeSegment();
    setNewIds((prev) => new Set([...prev, seg.id]));
    setSegments((s) => [...s, seg]);
    setTimeout(() => {
      setNewIds((prev) => { const n = new Set(prev); n.delete(seg.id); return n; });
    }, 400);
  };

  const removeSegment = (id) => {
    if (segments.length - removingIds.size <= 1) return;
    setRemovingIds((prev) => new Set([...prev, id]));
    setTimeout(() => {
      setSegments((s) => s.filter((seg) => seg.id !== id));
      setRemovingIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }, 280);
  };

  const updateText = (id, text) => setSegments((s) => s.map((seg) => seg.id === id ? { ...seg, text } : seg));
  const updateName = (id, customName) => setSegments((s) => s.map((seg) => seg.id === id ? { ...seg, customName } : seg));
  const updateMode = (id, mode) => setSegments((s) => s.map((seg) => seg.id === id ? { ...seg, mode } : seg));
  const updateFile = (id, file) => setSegments((s) => s.map((seg) => seg.id === id ? { ...seg, file } : seg));

  const handleParse = () => {
    const structured = segments
      .filter((s) => s.mode === 'text' ? s.text.trim().length > 0 : s.file !== null)
      .map((s) =>
        s.mode === 'text'
          ? { type: 'text', content: s.text, name: s.customName }
          : { type: s.file.mediaType === 'application/pdf' ? 'pdf' : 'image', name: s.customName || s.file.name, mediaType: s.file.mediaType, data: s.file.data }
      );
    if (structured.length === 0) return;
    onParse(structured, travelerType);
  };

  const hasContent   = segments.some((s) => s.mode === 'text' ? s.text.trim().length > 0 : s.file !== null);
  const visibleSegs  = segments.filter((s) => !removingIds.has(s.id));

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[1.1rem] font-semibold text-ink">Add your booking documents</h2>
        <button
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-rim bg-glass text-ink-dim text-[0.85rem] font-medium cursor-pointer transition-all duration-200 font-sans hover:border-violet hover:text-violet-light hover:bg-violet/30"
          onClick={addSegment}
          id="btn-add-segment"
        >
          <span>+</span> Add document
        </button>
      </div>

      {/* Segments */}
      <div className="flex flex-col gap-4 mb-7">
        {segments.map((seg) => {
          const isRemoving   = removingIds.has(seg.id);
          const displayIndex = visibleSegs.findIndex((s) => s.id === seg.id) + 1;
          return (
            <div key={seg.id} className={`segment-wrapper ${isRemoving ? 'segment-removing' : ''}`}>
              <SegmentCard
                segment={seg}
                displayIndex={displayIndex || 1}
                total={visibleSegs.length}
                onRemove={removeSegment}
                onChangeName={updateName}
                onChangeText={updateText}
                onChangeMode={updateMode}
                onChangeFile={updateFile}
                isNew={newIds.has(seg.id)}
              />
            </div>
          );
        })}
      </div>

      {/* Traveler type selector */}
      <div className="mb-7">
        <div className="flex items-center gap-2 text-[0.95rem] font-semibold text-ink mb-3.5">
          <span>🧭</span> What kind of traveler are you?
        </div>
        <div id="traveler-type-selector" className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
          {TRAVELER_TYPES.map((type) => {
            const isActive = travelerType === type.id;
            return (
              <button
                key={type.id}
                id={`traveler-type-${type.id}`}
                className={[
                  'relative flex flex-col items-start gap-2.5 p-4 rounded-[14px] border cursor-pointer text-left font-sans transition-all duration-200 overflow-hidden',
                  isActive
                    ? 'transform-gpu translate-y-[-2px]'
                    : 'border-rim bg-glass hover:border-rim-bright hover:bg-glass-hover hover:-translate-y-0.5',
                ].join(' ')}
                onClick={() => setTravelerType(type.id)}
                style={isActive ? {
                  borderColor: type.border,
                  background: type.glow,
                  boxShadow: `0 0 20px ${type.glow}`,
                } : {}}
              >
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg bg-white/[0.06] border border-rim transition-all duration-200"
                  style={isActive ? { background: type.glow, borderColor: type.border } : {}}
                >
                  {type.icon}
                </div>
                <div className="flex flex-col gap-0.5 flex-1">
                  <div
                    className="text-[0.9rem] font-bold transition-colors duration-200"
                    style={{ color: isActive ? type.color : undefined }}
                  >
                    {type.label}
                  </div>
                  <div className="text-[0.72rem] text-ink-faint italic">{type.tagline}</div>
                  <div className="text-[0.7rem] text-ink-faint leading-[1.4] mt-0.5">{type.description}</div>
                </div>
                {isActive && (
                  <div
                    className="absolute top-2.5 right-2.5 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: type.color }}
                  >
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Parse button */}
      <div className="flex justify-center">
        <button
          className="relative flex items-center gap-2.5 px-12 py-4 rounded-full border-none text-white text-[1rem] font-bold font-sans tracking-[-0.01em] cursor-pointer transition-all duration-300 btn-parse-gradient shadow-[0_0_40px_rgba(124,58,237,0.3),0_4px_24px_rgba(0,0,0,0.4)] disabled:opacity-60 disabled:cursor-not-allowed enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_0_60px_rgba(124,58,237,0.4),0_8px_32px_rgba(0,0,0,0.5)] enabled:active:translate-y-0"
          onClick={handleParse}
          disabled={!hasContent || loading}
          id="btn-parse-trip"
        >
          <span className="text-[1.2rem]">✈️</span>
          {loading ? 'Parsing your trip...' : 'Parse My Trip'}
        </button>
      </div>
    </div>
  );
}
