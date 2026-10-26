import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import ItemGrid from '../components/ItemGrid.jsx';
import Loading from '../components/Loading.jsx';

// Decorative contour lines for the hero (a nod to topographic maps)
function Contours() {
  const rings = [60, 120, 180, 240, 300, 360];
  return (
    <svg className="contours" viewBox="0 0 800 400" aria-hidden="true" preserveAspectRatio="xMaxYMid slice">
      {rings.map((r, i) => (
        <ellipse key={r} cx="620" cy="210" rx={r * 1.25} ry={r * 0.78 + (i % 2) * 6} transform={`rotate(${-12 + i * 3} 620 210)`} />
      ))}
    </svg>
  );
}

function Section({ title, note, items, feature }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="section">
      <div className="section-head">
        <h2>{title}</h2>
        {note && <p className="muted">{note}</p>}
      </div>
      <div className={feature ? 'feature' : ''}>
        <ItemGrid items={items} />
      </div>
    </section>
  );
}

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Keşif Hub';
    api.get('/home').then(setData).catch(e => setError(e.message));
  }, []);

  const search = e => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <>
      <div className="hero">
        <Contours />
        <div className="hero-inner">
          <h1>See what people are building, selling and exploring.</h1>
          <form onSubmit={search} className="searchbar" role="search">
            <input
              type="search"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search projects, products and campgrounds"
              aria-label="Search"
            />
            <button className="btn btn-accent">Search</button>
          </form>
          {data && data.totals.items > 0 && (
            <p className="hero-note">
              {data.totals.members} {data.totals.members === 1 ? 'member has' : 'members have'} shared {data.totals.items} {data.totals.items === 1 ? 'post' : 'posts'}.
            </p>
          )}
        </div>
      </div>

      <div className="container">
        {error && <div className="alert alert-error">{error}</div>}
        {!data && !error && <Loading />}
        {data && data.totals.items === 0 && (
          <div className="empty">Nobody has posted yet. Create an account and share the first project.</div>
        )}
        {data && (
          <>
            <Section title="Trending" note="Opened most often." items={data.trending} feature />
            <Section title="Most viewed by members" items={data.topViewed} />
            <Section title="Recommended" note="Best reviewed first." items={data.recommended} />
            <Section title="Latest" items={data.latest} />
          </>
        )}
      </div>
    </>
  );
}
