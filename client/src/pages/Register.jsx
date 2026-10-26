import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../Toast.jsx';
import Field from '../components/Field.jsx';

const initial = {
  firstname: '', lastname: '', username: '', email: '', phonenumber: '',
  country: '', city: '', zipcode: '', birthday: '', password: ''
};

export default function Register() {
  const { signIn } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState(initial);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { document.title = 'Create account | Keşif Hub'; }, []);
  const set = name => e => setValues(v => ({ ...v, [name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await api.post('/auth/register', values);
      signIn(data);
      notify('Welcome to Keşif Hub!');
      navigate((location.state && location.state.from) || '/home', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container narrow">
      <h1>Create an account</h1>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <form onSubmit={submit} className="form">
        <div className="form-row">
          <Field label="First name" id="firstname"><input id="firstname" value={values.firstname} onChange={set('firstname')} autoComplete="given-name" required /></Field>
          <Field label="Last name" id="lastname"><input id="lastname" value={values.lastname} onChange={set('lastname')} autoComplete="family-name" required /></Field>
        </div>
        <Field label="Username" id="username" hint="At least 3 characters. This is public.">
          <input id="username" value={values.username} onChange={set('username')} autoComplete="username" minLength={3} required />
        </Field>
        <Field label="Email" id="email"><input id="email" type="email" value={values.email} onChange={set('email')} autoComplete="email" required /></Field>
        <Field label="Phone number" id="phonenumber" hint="Used to confirm it is you if you forget your password.">
          <input id="phonenumber" type="tel" value={values.phonenumber} onChange={set('phonenumber')} autoComplete="tel" required />
        </Field>
        <div className="form-row">
          <Field label="Country" id="country"><input id="country" value={values.country} onChange={set('country')} autoComplete="country-name" required /></Field>
          <Field label="City" id="city"><input id="city" value={values.city} onChange={set('city')} autoComplete="address-level2" required /></Field>
          <Field label="Zip code" id="zipcode"><input id="zipcode" value={values.zipcode} onChange={set('zipcode')} autoComplete="postal-code" required /></Field>
        </div>
        <Field label="Birthday" id="birthday"><input id="birthday" type="date" value={values.birthday} onChange={set('birthday')} required /></Field>
        <Field label="Password" id="password" hint="At least 6 characters.">
          <input id="password" type="password" value={values.password} onChange={set('password')} autoComplete="new-password" minLength={6} required />
        </Field>
        <div className="actions">
          <button className="btn btn-accent" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        </div>
      </form>
      <p>Already have an account? <Link to="/login">Log in</Link>.</p>
    </div>
  );
}
