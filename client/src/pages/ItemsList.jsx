import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../AuthContext.jsx';
import { KINDS } from '../kinds.js';
import ItemGrid from '../components/ItemGrid.jsx';
import Loading from '../components/Loading.jsx';
import NotFound from './NotFound.jsx';

export default function ItemsList() {
  const { kind: kindKey } = useParams();
  const kind = KINDS[kindKey];
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const [text, setText] = useState(q);
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { setText(q); }, [q, kindKey]);

  useEffect(() => {
    if (!kind) return;
    document.title = `${kind.plural} | Keşif Hub`;
    setItems(null);
    setError('');
    api.get(`/${kindKey}${q ? `?q=${encodeURIComponent(q)}` : ''}`)
      .then(setItems)
      .catch(e => setError(e.message));
  }, [kindKey, q]);

  if (!kind) return <NotFound />;

  const submit = e => {
    e.preventDefault();
    setParams(text.trim() ? { q: text.trim() } : {});
  };

  const addHref = `/${kindKey}/new`;

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h1>{kind.plural}</h1>
          <p className="muted">{kind.blurb}</p>
        </div>
        {user ? (
          <Link to={addHref} className="btn btn-accent">Add a {kind.singular.toLowerCase()}</Link>
        ) : (
          <button className="btn btn-accent" onClick={() => navigate('/login', { state: { from: addHref } })}>
            Log in to add a {kind.singular.toLowerCase()}
          </button>
        )}
      </div>

      <form onSubmit={submit} className="searchbar searchbar-light" role="search">
        <input
          type="search"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={`Search ${kind.plural.toLowerCase()} by title`}
          aria-label={`Search ${kind.plural.toLowerCase()}`}
        />
        <button className="btn">Search</button>
        {q && <button type="button" className="btn btn-quiet" onClick={() => setParams({})}>Clear</button>}
      </form>

      {error && <div className="alert alert-error">{error}</div>}
      {!items && !error && <Loading />}
      {items && (
        <ItemGrid
          items={items}
          empty={q ? `No ${kind.plural.toLowerCase()} match “${q}”.` : `No ${kind.plural.toLowerCase()} yet. Be the first to add one.`}
        />
      )}
    </div>
  );
}
