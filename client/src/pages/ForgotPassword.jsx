import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../Toast.jsx';
import Field from '../components/Field.jsx';

export default function ForgotPassword() {
  const { signIn } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: '', phonenumber: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = 'Reset password | Keşif Hub'; }, []);
  const set = name => e => setValues(v => ({ ...v, [name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api.post('/auth/forgot-password', values);
      signIn(data);
      notify('Your password was changed. Welcome back!');
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container narrow">
      <h1>Reset your password</h1>
      <p className="muted">Enter your username and the phone number on your account, then choose a new password.</p>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <form onSubmit={submit} className="form">
        <Field label="Username" id="username"><input id="username" value={values.username} onChange={set('username')} required /></Field>
        <Field label="Phone number" id="phonenumber"><input id="phonenumber" type="tel" value={values.phonenumber} onChange={set('phonenumber')} required /></Field>
        <Field label="New password" id="password" hint="At least 6 characters.">
          <input id="password" type="password" value={values.password} onChange={set('password')} autoComplete="new-password" minLength={6} required />
        </Field>
        <div className="actions">
          <button className="btn btn-accent" disabled={busy}>{busy ? 'Saving…' : 'Change password'}</button>
          <Link to="/login">Back to log in</Link>
        </div>
      </form>
    </div>
  );
}
