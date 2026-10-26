import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { useToast } from '../Toast.jsx';
import { KIND_LIST } from '../kinds.js';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const notify = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);
  const logout = () => {
    signOut();
    close();
    notify('You are signed out.');
    navigate('/home');
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/home" className="brand" onClick={close}>
          <img src="/logo.png" alt="" width="34" height="34" />
          <span>Keşif Hub</span>
        </Link>

        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen(o => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>

        <nav id="main-nav" className={`nav ${open ? 'open' : ''}`}>
          <NavLink to="/home" onClick={close}>Home</NavLink>
          {KIND_LIST.map(k => (
            <NavLink key={k.key} to={`/${k.key}`} onClick={close}>{k.plural}</NavLink>
          ))}
          <NavLink to="/about" onClick={close}>About</NavLink>
          <NavLink to="/contact" onClick={close}>Contact</NavLink>

          <span className="nav-spacer" />

          {user ? (
            <>
              <NavLink to="/profile" className="nav-profile" onClick={close}>
                {user.image ? (
                  <img src={user.image.url} alt="" className="avatar avatar-sm" />
                ) : (
                  <span className="avatar avatar-sm avatar-fallback">{user.username[0].toUpperCase()}</span>
                )}
                {user.username}
              </NavLink>
              <button className="btn btn-quiet" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>Log in</NavLink>
              <Link to="/register" className="btn btn-accent" onClick={close}>Create account</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
