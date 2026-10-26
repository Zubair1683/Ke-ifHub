import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import ItemGrid from '../components/ItemGrid.jsx';
import Loading from '../components/Loading.jsx';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [text, setText] = useState(q);
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { setText(q); }, [q]);

  useEffect(() => {
    document.title = q ? `“${q}” | Keşif Hub` : 'Search | Keşif Hub';
    if (!q) { setItems([]); return; }
    setItems(null);
    setError('');
    api.get(`/search?q=${encodeURIComponent(q)}`).then(setItems).catch(e => setError(e.message));
  }, [q]);

  const submit = e => {
    e.preventDefault();
    setParams(text.trim() ? { q: text.trim() } : {});
  };

  return (
    <div className="container">
      <h1>Search</h1>
      <form onSubmit={submit} className="searchbar searchbar-light" role="search">
        <input type="search" value={text} onChange={e => setText(e.target.value)} placeholder="Search projects, products and campgrounds" aria-label="Search" autoFocus />
        <button className="btn">Search</button>
      </form>
      {error && <div className="alert alert-error">{error}</div>}
      {!items && !error && <Loading />}
      {items && q && (
        <>
          <p className="muted">{items.length} {items.length === 1 ? 'result' : 'results'} for “{q}”.</p>
          <ItemGrid items={items} empty={`Nothing matches “${q}”. Try a shorter word.`} />
        </>
      )}
      {items && !q && <div className="empty">Type a word from a title to search everything.</div>}
    </div>
  );
}
