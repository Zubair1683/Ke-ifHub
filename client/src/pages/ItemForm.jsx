import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useToast } from '../Toast.jsx';
import { KINDS } from '../kinds.js';
import Field from '../components/Field.jsx';
import Loading from '../components/Loading.jsx';
import NotFound from './NotFound.jsx';

const empty = { title: '', price: '', location: '', description: '' };

// Used for both "add" (/:kind/new) and "edit" (/:kind/:id/edit)
export default function ItemForm({ mode }) {
  const { kind: kindKey, id } = useParams();
  const kind = KINDS[kindKey];
  const notify = useToast();
  const navigate = useNavigate();
  const editing = mode === 'edit';

  const [values, setValues] = useState(empty);
  const [existing, setExisting] = useState([]);
  const [toDelete, setToDelete] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing || !kind) return;
    api.get(`/${kindKey}/${id}`)
      .then(item => {
        setValues({
          title: item.title || '',
          price: item.price ?? '',
          location: item.location || '',
          description: item.description || ''
        });
        setExisting(item.images || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [editing, kindKey, id]);

  if (!kind) return <NotFound />;
  if (loading) return <Loading />;

  const set = name => e => setValues(v => ({ ...v, [name]: e.target.value }));
  const toggleDelete = filename =>
    setToDelete(list => (list.includes(filename) ? list.filter(f => f !== filename) : [...list, filename]));

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.append('title', values.title);
      form.append('description', values.description);
      if (kind.price) form.append('price', values.price);
      if (kind.location) form.append('location', values.location);
      files.forEach(f => form.append('image', f));
      toDelete.forEach(f => form.append('deleteImages', f));

      const saved = editing ? await api.put(`/${kindKey}/${id}`, form) : await api.post(`/${kindKey}`, form);
      notify(editing ? `${kind.singular} updated.` : `${kind.singular} added.`);
      navigate(`/${kindKey}/${saved._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container narrow">
      <h1>{editing ? `Edit ${kind.singular.toLowerCase()}` : `Add a ${kind.singular.toLowerCase()}`}</h1>
      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <form onSubmit={submit} className="form">
        <Field label="Title" id="title">
          <input id="title" value={values.title} onChange={set('title')} required />
        </Field>

        {kind.location && (
          <Field label="Location" id="location" hint="A city or address. It is placed on the map.">
            <input id="location" value={values.location} onChange={set('location')} required />
          </Field>
        )}

        {kind.price && (
          <Field label={kindKey === 'campgrounds' ? 'Price per night ($)' : 'Price ($)'} id="price">
            <input id="price" type="number" min="0" step="0.01" value={values.price} onChange={set('price')} required />
          </Field>
        )}

        <Field label="Description" id="description">
          <textarea id="description" rows="6" value={values.description} onChange={set('description')} required />
        </Field>

        <Field label={editing ? 'Add more photos' : 'Photos'} id="image" hint="JPG or PNG.">
          <input id="image" type="file" accept="image/png,image/jpeg" multiple onChange={e => setFiles([...e.target.files])} />
        </Field>

        {existing.length > 0 && (
          <fieldset className="existing-images">
            <legend>Current photos. Tick the ones to remove.</legend>
            {existing.map(img => (
              <label key={img.filename} className={toDelete.includes(img.filename) ? 'thumb marked' : 'thumb'}>
                <img src={img.url} alt="" />
                <span>
                  <input
                    type="checkbox"
                    checked={toDelete.includes(img.filename)}
                    onChange={() => toggleDelete(img.filename)}
                  /> Remove
                </span>
              </label>
            ))}
          </fieldset>
        )}

        <div className="actions">
          <button className="btn btn-accent" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save changes' : `Add ${kind.singular.toLowerCase()}`}
          </button>
          <Link to={editing ? `/${kindKey}/${id}` : `/${kindKey}`} className="btn btn-quiet">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
