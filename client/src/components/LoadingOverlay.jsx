export default function LoadingOverlay() {
  const steps = [
    'Reading your documents...',
    'Extracting travel events...',
    'Building your timeline...',
    'Estimating daily budgets...',
  ];

  return (
    <div className="loading-overlay" role="status" aria-label="Parsing your trip">
      <div className="loading-plane">✈️</div>
      <div className="loading-text">Parsing your trip</div>
      <div className="loading-dots">
        <span /><span /><span />
      </div>
      <div className="loading-sub">AI is reading your booking documents...</div>
    </div>
  );
}
