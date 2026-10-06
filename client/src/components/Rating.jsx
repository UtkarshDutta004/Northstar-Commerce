import { Star } from 'lucide-react';

export default function Rating({ value = 0, count, compact = false }) {
  return (
    <span className={`rating ${compact ? 'rating-compact' : ''}`} aria-label={`${Number(value).toFixed(1)} out of 5 stars${count != null ? `, ${count} reviews` : ''}`}>
      <span className="rating-stars">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={13} fill={star <= Math.round(value) ? 'currentColor' : 'none'} />)}</span>
      <span>{Number(value).toFixed(1)}</span>
      {count != null && <span className="rating-count">({count})</span>}
    </span>
  );
}
