import { useState } from 'react';

export default function ImageCarousel({ images = [], alt = '' }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) return <div className="carousel carousel-empty">No photos yet</div>;

  const go = d => setIndex(i => (i + d + images.length) % images.length);
  return (
    <div className="carousel">
      <img src={images[index].url} alt={`${alt} - photo ${index + 1} of ${images.length}`} />
      {images.length > 1 && (
        <>
          <button className="carousel-btn prev" onClick={() => go(-1)} aria-label="Previous photo">‹</button>
          <button className="carousel-btn next" onClick={() => go(1)} aria-label="Next photo">›</button>
          <div className="carousel-dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={i === index ? 'dot on' : 'dot'}
                aria-label={`Show photo ${i + 1}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
