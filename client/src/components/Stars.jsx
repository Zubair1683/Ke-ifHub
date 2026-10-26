// Read-only star rating, e.g. <Stars value={3.5} />
export function Stars({ value = 0, size = 16 }) {
  const full = Math.round(value);
  return (
    <span className="stars" role="img" aria-label={`${value} out of 5 stars`} style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={n <= full ? 'star on' : 'star'}>★</span>
      ))}
    </span>
  );
}

// Clickable rating input
export function StarInput({ value, onChange }) {
  return (
    <div className="star-input" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={n <= value ? 'star on' : 'star'}
          onClick={() => onChange(n)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
