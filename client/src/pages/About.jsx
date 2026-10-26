import { useEffect } from 'react';
import { KIND_LIST } from '../kinds.js';

export default function About() {
  useEffect(() => { document.title = 'About | Keşif Hub'; }, []);
  return (
    <div className="container narrow prose">
      <h1>About Keşif Hub</h1>
      <p>
        Keşif is Turkish for “discovery”. Keşif Hub is a place where members share what they have made
        and found, and where everyone else can look around, leave a review and follow the people behind it.
      </p>
      <h2>What you can share</h2>
      <ul>
        {KIND_LIST.map(k => (
          <li key={k.key}><strong>{k.plural}.</strong> {k.blurb}</li>
        ))}
      </ul>
      <h2>How it works</h2>
      <p>
        Create an account, add a post with photos, and members can rate it from one to five stars.
        The home page lists what is trending, what members open most, what is best reviewed and what is newest.
      </p>
    </div>
  );
}
