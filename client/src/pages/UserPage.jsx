import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../AuthContext.jsx';
import { KIND_LIST } from '../kinds.js';
import ItemGrid from '../components/ItemGrid.jsx';
import Loading from '../components/Loading.jsx';

// /profile (own page) and /users/:id (anyone's page)
export default function UserPage() {
  const params = useParams();
  const { user: me } = useAuth();
  const userId = params.id || (me && me._id);
  const isSelf = me && String(me._id) === String(userId);

  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    setData(null);
    setError('');
    api.get(`/users/${userId}`).then(setData).catch(e => setError(e.message));
  }, [userId]);

  useEffect(() => {
    if (data) document.title = `${data.user.username} | Keşif Hub`;
  }, [data]);

  if (error) return <div className="container"><div className="alert alert-error">{error}</div></div>;
  if (!data) return <Loading />;

  const u = data.user;
  const total = KIND_LIST.reduce((n, k) => n + data.items[k.key].length, 0);

  return (
    <div className="container">
      <header className="profile-head">
        {u.image ? (
          <img src={u.image.url} alt="" className="avatar avatar-lg" />
        ) : (
          <span className="avatar avatar-lg avatar-fallback">{u.username[0].toUpperCase()}</span>
        )}
        <div className="profile-info">
          <h1>{u.firstname} {u.lastname}</h1>
          <p className="muted">@{u.username}{u.city || u.country ? `, ${[u.city, u.country].filter(Boolean).join(', ')}` : ''}</p>
          {isSelf && u.email && <p className="small">{u.email}{u.phonenumber ? `, ${u.phonenumber}` : ''}</p>}
        </div>
        {isSelf && <Link to="/profile/edit" className="btn">Edit profile</Link>}
      </header>

      {KIND_LIST.map(k => (
        <section key={k.key} className="section">
          <div className="section-head">
            <h2>{k.plural}</h2>
            {isSelf && <Link to={`/${k.key}/new`} className="btn btn-small">Add a {k.singular.toLowerCase()}</Link>}
          </div>
          <ItemGrid
            items={data.items[k.key]}
            showAuthor={false}
            empty={isSelf ? `You have not added any ${k.plural.toLowerCase()} yet.` : `No ${k.plural.toLowerCase()} from ${u.username} yet.`}
          />
        </section>
      ))}
      {total === 0 && !isSelf && <p className="muted">{u.username} has not posted anything yet.</p>}
    </div>
  );
}
