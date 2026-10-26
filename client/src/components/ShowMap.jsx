import { useEffect, useRef } from 'react';

// Small MapTiler map with one marker. The map library is loaded only when this component is shown.
export default function ShowMap({ geometry, title, location }) {
  const box = useRef(null);
  const key = import.meta.env.VITE_MAPTILER_KEY;
  const coords = geometry && geometry.coordinates;

  useEffect(() => {
    if (!key || !coords || !box.current) return;
    let map;
    let cancelled = false;

    (async () => {
      const maptilersdk = await import('@maptiler/sdk');
      await import('@maptiler/sdk/dist/maptiler-sdk.css');
      if (cancelled) return;
      maptilersdk.config.apiKey = key;
      map = new maptilersdk.Map({
        container: box.current,
        style: maptilersdk.MapStyle.BRIGHT,
        center: coords,
        zoom: 10
      });
      const popup = new maptilersdk.Popup({ offset: 25 });
      const content = document.createElement('div');
      const h = document.createElement('strong');
      h.textContent = title;
      const p = document.createElement('p');
      p.textContent = location || '';
      content.append(h, p);
      popup.setDOMContent(content);
      new maptilersdk.Marker().setLngLat(coords).setPopup(popup).addTo(map);
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [key, coords && coords[0], coords && coords[1], title, location]);

  if (!coords) return null;
  if (!key) {
    return (
      <p className="muted">
        Map hidden: add <code>VITE_MAPTILER_KEY</code> to <code>client/.env</code> to show it. Location: {location}
      </p>
    );
  }
  return <div ref={box} className="map" aria-label={`Map showing ${location || title}`} />;
}
