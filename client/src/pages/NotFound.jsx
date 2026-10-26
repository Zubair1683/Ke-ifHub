import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container narrow">
      <h1>Page not found</h1>
      <p>That address does not lead anywhere. It may have been moved or deleted.</p>
      <Link to="/home" className="btn btn-accent">Go to the home page</Link>
    </div>
  );
}
