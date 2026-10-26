import { useEffect, useState } from 'react';

const weatherText = code => {
  if (code === 0) return 'clear sky';
  if (code <= 3) return 'partly cloudy';
  if (code <= 48) return 'foggy';
  if (code <= 57) return 'drizzling';
  if (code <= 67) return 'raining';
  if (code <= 77) return 'snowing';
  if (code <= 82) return 'showery';
  return 'stormy';
};

export default function Contact() {
  const [weather, setWeather] = useState('');
  const [sent, setSent] = useState(false);
  const [v, setV] = useState({ name: '', surname: '', email: '', phone: '', country: '', message: '' });
  const set = k => e => setV(x => ({ ...x, [k]: e.target.value }));

  useEffect(() => {
    document.title = 'Contact | Keşif Hub';
    fetch('https://api.open-meteo.com/v1/forecast?latitude=39.9334&longitude=32.8597&current=temperature_2m,weather_code')
      .then(r => r.json())
      .then(d => setWeather(`Right now in Ankara it is ${d.current.temperature_2m}°C and ${weatherText(d.current.weather_code)}.`))
      .catch(() => {});
  }, []);

  const submit = e => {
    e.preventDefault();
    // The original site only validated this form in the browser; nothing is sent anywhere yet.
    setSent(true);
  };

  return (
    <div className="container narrow">
      <h1>Contact us</h1>
      {weather && <p className="muted">{weather}</p>}
      {sent ? (
        <div className="alert alert-ok" role="status">Thanks, {v.name}. Your message was recorded.</div>
      ) : (
        <form onSubmit={submit} className="form">
          <div className="form-row">
            <label className="field"><span>Name</span><input value={v.name} onChange={set('name')} maxLength={15} required /></label>
            <label className="field"><span>Surname</span><input value={v.surname} onChange={set('surname')} maxLength={15} required /></label>
          </div>
          <label className="field"><span>Email</span><input type="email" value={v.email} onChange={set('email')} required /></label>
          <div className="form-row">
            <label className="field"><span>Phone (optional)</span><input type="tel" value={v.phone} onChange={set('phone')} /></label>
            <label className="field"><span>Country</span><input value={v.country} onChange={set('country')} required /></label>
          </div>
          <label className="field">
            <span>Your question or recommendation</span>
            <textarea rows="5" maxLength={200} value={v.message} onChange={set('message')} required />
          </label>
          <div className="actions"><button className="btn btn-accent">Send message</button></div>
        </form>
      )}
    </div>
  );
}
