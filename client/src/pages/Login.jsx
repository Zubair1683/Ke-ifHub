import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../Toast.jsx';
import Field from '../components/Field.jsx';

export default function Login() {
  const { signIn } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = 'Log in | Keşif Hub'; }, []);

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api.post('/auth/login', { username, password });
      signIn(data);
      notify(`Welcome back, ${data.user.username}!`);
      navigate((location.state && location.state.from) || '/home', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container narrow">
      <h1>Log in</h1>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <form onSubmit={submit} className="form">
        <Field label="Username" id="username">
          <input id="username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required autoFocus />
        </Field>
        <Field label="Password" id="password">
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
        </Field>
        <div className="actions">
          <button className="btn btn-accent" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
          <Link to="/forgot-password">Forgot your password?</Link>
        </div>
      </form>
      <p>New here? <Link to="/register" state={location.state}>Create an account</Link>.</p>
    </div>
  );
}
