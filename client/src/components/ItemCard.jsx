import { Link } from 'react-router-dom';
import { Stars } from './Stars.jsx';
import { KINDS } from '../kinds.js';

export default function ItemCard({ item, showAuthor = true }) {
  const kind = KINDS[item.kind];
  const img = item.images && item.images[0];
  return (
    <article className={`plate plate-${item.kind}`}>
      <Link to={`/${item.kind}/${item._id}`} className="plate-image">
        {img ? <img src={img.url} alt="" loading="lazy" /> : <div className="plate-noimage">No photo</div>}
        <span className="plate-kind">{kind.singular}</span>
      </Link>
      <div className="plate-body">
        <h3><Link to={`/${item.kind}/${item._id}`}>{item.title}</Link></h3>
        <p className="plate-meta">
          {item.price != null && kind.price && <span className="price">${item.price}</span>}
          {item.location && <span>{item.location}</span>}
        </p>
        <div className="plate-foot">
          {item.reviewCount > 0 ? (
            <span className="rating"><Stars value={item.avgRating} size={14} /> {item.avgRating} ({item.reviewCount})</span>
          ) : (
            <span className="muted">No reviews yet</span>
          )}
          {showAuthor && item.ownerId && (
            <Link to={`/users/${item.ownerId}`} className="by">by {item.author}</Link>
          )}
        </div>
      </div>
    </article>
  );
}
