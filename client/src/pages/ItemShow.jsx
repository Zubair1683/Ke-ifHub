import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../Toast.jsx';
import { KINDS } from '../kinds.js';
import ImageCarousel from '../components/ImageCarousel.jsx';
import ShowMap from '../components/ShowMap.jsx';
import Loading from '../components/Loading.jsx';
import { Stars, StarInput } from '../components/Stars.jsx';
import NotFound from './NotFound.jsx';

export default function ItemShow() {
  const { kind: kindKey, id } = useParams();
  const kind = KINDS[kindKey];
  const { user } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () =>
    api.get(`/${kindKey}/${id}`).then(setItem).catch(e => setError(e.message));

  useEffect(() => {
    if (!kind) return;
    setItem(null);
    setError('');
    load();
    window.scrollTo(0, 0);
  }, [kindKey, id, user && user._id]);

  useEffect(() => { if (item) document.title = `${item.title} | Keşif Hub`; }, [item && item.title]);

  if (!kind) return <NotFound />;
  if (error) return <div className="container"><div className="alert alert-error">{error}</div><Link to={`/${kindKey}`}>Back to {kind.plural.toLowerCase()}</Link></div>;
  if (!item) return <Loading />;

  const isOwner = user && String(user._id) === String(item.ownerId);

  const remove = async () => {
    if (!window.confirm(`Delete “${item.title}”? This also deletes its reviews.`)) return;
    try {
      await api.del(`/${kindKey}/${id}`);
      notify(`${kind.singular} deleted.`);
      navigate(`/${kindKey}`);
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const addReview = async e => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post(`/${kindKey}/${id}/reviews`, { rating, body });
      setBody('');
      setRating(5);
      notify('Review added.');
      await load();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const removeReview = async reviewId => {
    try {
      await api.del(`/${kindKey}/${id}/reviews/${reviewId}`);
      notify('Review deleted.');
      await load();
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  return (
    <div className="container">
      <p className="crumbs"><Link to={`/${kindKey}`}>{kind.plural}</Link></p>

      <div className="show">
        <div className="show-main">
          <ImageCarousel images={item.images} alt={item.title} />

          <h1>{item.title}</h1>
          <p className="show-meta">
            {kind.price && item.price != null && <span className="price">${item.price}{kindKey === 'campgrounds' ? ' / night' : ''}</span>}
            {item.location && <span>{item.location}</span>}
            <span>
              by {item.owner ? <Link to={`/users/${item.owner._id}`}>{item.author}</Link> : item.author}
            </span>
            <span>{item.generalViewCounter} {item.generalViewCounter === 1 ? 'view' : 'views'}</span>
          </p>

          <p className="description">{item.description}</p>

          {isOwner && (
            <div className="actions">
              <Link to={`/${kindKey}/${id}/edit`} className="btn">Edit</Link>
              <button className="btn btn-danger" onClick={remove}>Delete</button>
            </div>
          )}

          {item.geometry && <ShowMap geometry={item.geometry} title={item.title} location={item.location} />}
        </div>

        <aside className="show-side" aria-label="Reviews">
          <h2>Reviews</h2>
          {item.reviewCount > 0 && (
            <p className="rating-summary">
              <Stars value={item.avgRating} size={20} /> {item.avgRating} from {item.reviewCount} {item.reviewCount === 1 ? 'review' : 'reviews'}
            </p>
          )}

          {user ? (
            <form onSubmit={addReview} className="review-form">
              <StarInput value={rating} onChange={setRating} />
              <label htmlFor="review-body" className="sr-only">Your review</label>
              <textarea
                id="review-body"
                rows="3"
                required
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="What did you think?"
              />
              <button className="btn btn-accent" disabled={busy}>{busy ? 'Posting…' : 'Post review'}</button>
            </form>
          ) : (
            <p><Link to="/login" state={{ from: `/${kindKey}/${id}` }}>Log in</Link> to leave a review.</p>
          )}

          {item.reviews.length === 0 ? (
            <p className="muted">No reviews yet.</p>
          ) : (
            <ul className="reviews">
              {item.reviews.map(r => (
                <li key={r._id} className="review">
                  <div className="review-head">
                    {r.imageURL ? (
                      <img src={r.imageURL} alt="" className="avatar avatar-sm" />
                    ) : (
                      <span className="avatar avatar-sm avatar-fallback">{r.author[0].toUpperCase()}</span>
                    )}
                    <div>
                      <strong>{r.author}</strong>
                      <div className="muted small">{new Date(r.date).toLocaleDateString()}</div>
                    </div>
                    <Stars value={r.rating} size={14} />
                  </div>
                  <p>{r.body}</p>
                  {user && (String(user._id) === String(r.accountId) || user.username === r.author) && (
                    <button className="btn btn-quiet btn-small" onClick={() => removeReview(r._id)}>Delete</button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
