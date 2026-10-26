import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../Toast.jsx';
import Field from '../components/Field.jsx';

export default function ProfileEdit() {
  const { user, setUser } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();

  const [values, setValues] = useState({
    firstname: user.firstname, lastname: user.lastname, username: user.username, email: user.email,
    phonenumber: user.phonenumber, country: user.country, city: user.city, zipcode: user.zipcode,
    birthday: user.birthday ? user.birthday.slice(0, 10) : ''
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [pw, setPw] = useState({ oldPassword: '', newPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => { document.title = 'Edit profile | Keşif Hub'; }, []);
  const set = name => e => setValues(v => ({ ...v, [name]: e.target.value }));

  const save = async e => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      Object.entries(values).forEach(([k, v]) => form.append(k, v));
      if (file) form.append('image', file);
      const data = await api.put('/users/me', form);
      setUser(data.user);
      notify('Profile updated.');
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const changePassword = async e => {
    e.preventDefault();
    setPwBusy(true);
    setPwError('');
    try {
      await api.post('/users/me/password', pw);
      setPw({ oldPassword: '', newPassword: '' });
      notify('Password changed.');
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwBusy(false);
    }
  };

  return (
    <div className="container narrow">
      <h1>Edit profile</h1>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <form onSubmit={save} className="form">
        <Field label="Profile photo" id="image">
          <div className="photo-row">
            {user.image ? <img src={user.image.url} alt="" className="avatar avatar-lg" /> : <span className="avatar avatar-lg avatar-fallback">{user.username[0].toUpperCase()}</span>}
            <input id="image" type="file" accept="image/png,image/jpeg" onChange={e => setFile(e.target.files[0] || null)} />
          </div>
        </Field>
        <div className="form-row">
          <Field label="First name" id="firstname"><input id="firstname" value={values.firstname} onChange={set('firstname')} required /></Field>
          <Field label="Last name" id="lastname"><input id="lastname" value={values.lastname} onChange={set('lastname')} required /></Field>
        </div>
        <Field label="Username" id="username"><input id="username" value={values.username} onChange={set('username')} minLength={3} required /></Field>
        <Field label="Email" id="email"><input id="email" type="email" value={values.email} onChange={set('email')} required /></Field>
        <Field label="Phone number" id="phonenumber"><input id="phonenumber" type="tel" value={values.phonenumber} onChange={set('phonenumber')} required /></Field>
        <div className="form-row">
          <Field label="Country" id="country"><input id="country" value={values.country} onChange={set('country')} required /></Field>
          <Field label="City" id="city"><input id="city" value={values.city} onChange={set('city')} required /></Field>
          <Field label="Zip code" id="zipcode"><input id="zipcode" value={values.zipcode} onChange={set('zipcode')} required /></Field>
        </div>
        <Field label="Birthday" id="birthday"><input id="birthday" type="date" value={values.birthday} onChange={set('birthday')} required /></Field>
        <div className="actions">
          <button className="btn btn-accent" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
          <Link to="/profile" className="btn btn-quiet">Cancel</Link>
        </div>
      </form>

      <h2 className="spaced">Change password</h2>
      {pwError && <div className="alert alert-error" role="alert">{pwError}</div>}
      <form onSubmit={changePassword} className="form">
        <Field label="Current password" id="oldPassword">
          <input id="oldPassword" type="password" value={pw.oldPassword} onChange={e => setPw(p => ({ ...p, oldPassword: e.target.value }))} autoComplete="current-password" required />
        </Field>
        <Field label="New password" id="newPassword" hint="At least 6 characters.">
          <input id="newPassword" type="password" value={pw.newPassword} onChange={e => setPw(p => ({ ...p, newPassword: e.target.value }))} autoComplete="new-password" minLength={6} required />
        </Field>
        <div className="actions">
          <button className="btn" disabled={pwBusy}>{pwBusy ? 'Changing…' : 'Change password'}</button>
        </div>
      </form>
    </div>
  );
}
