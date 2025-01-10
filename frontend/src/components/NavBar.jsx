import '../assets/Styles/NavBar.css'
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

import {
  UserIcon,
  SettingsIcon
} from "../assets/icons/icons"

const NavBar = () => {
  const { user, logout, isFullscreen } = useContext(AuthContext);
  const navigate = useNavigate();

  if (isFullscreen) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className='navbar'>
      <div className='navbar-content'>
        {user && (
          <span style={{ marginRight: '20px' }}>
            <UserIcon width='15px' style={{ verticalAlign: '-2px' }} /> {user.username} (ID: {user.userId})
          </span>
        )}

        <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
        {user && (
          <>
            <Link to="/timer" style={{ marginRight: '10px' }}>Timer</Link>
            <Link to="/categories" style={{ marginRight: '10px' }}>Kategorien</Link>
            <Link to="/statistics" style={{ marginRight: '10px' }}>Statistiken</Link>
            <Link to="/settings" style={{ marginRight: '10px' }}><SettingsIcon width='22px' style={{ verticalAlign: '-4px' }} /></Link>
          </>
        )}
        <button
          onClick={user ? handleLogout : () => navigate('/login')}
          style={{ marginLeft: '10px' }}
        >
          {user ? 'Abmelden' : 'Anmelden'}
        </button>
        <div className='navbar-infos'>
          Achtung! Im Moment laufen experimentelle Änderungen auf dieser Subdomain.
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
