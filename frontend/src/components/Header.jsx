import React, { useContext } from 'react';
import './Header.css';
import { AuthContext } from '../AuthContext';
import { UserIcon, SidebarIcon, LoginIcon, LogoutIcon } from '../assets/icons/icons';
import { Link, useNavigate } from 'react-router-dom';

function Header({ onBurgerClick }) {
    const { user, logout, isFullscreen } = useContext(AuthContext);
    const navigate = useNavigate();

    if (isFullscreen) return null;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header-left">
                <button className="icon-button" onClick={onBurgerClick}>
                    <SidebarIcon width="20px" height="20px" />
                </button>
                <div className="header-logo-and-title">
                    <img
                        src="/favicon.png"
                        alt="Nyx-Icon"
                        className="header-logo"
                    />
                    <span className="header-project-name">Projekt Nyx</span>
                    <span className="header-version-badge">v0.1.1</span>
                </div>
            </div>

            <div className="header-right">
                {user && (
                    <span style={{ marginRight: '20px' }}>
                        <UserIcon width='15px' style={{ verticalAlign: '-2px' }} /> {user.username} (ID: {user.userId})
                    </span>
                )}
                <button
                    onClick={user ? handleLogout : () => navigate('/login')}
                    style={{ marginRight: '25px' }}
                    className='header-button'
                >
                    {user ?
                        <div className='header-link'>
                            <div className='header-icon'>
                                <LogoutIcon width="20px" height="20px" />
                            </div>
                            Abmelden
                        </div> :
                        <div className='header-link'>
                            <div className='header-icon'>
                                <LoginIcon width="20px" height="20px" />
                            </div>
                            Anmelden
                        </div>}
                </button>
            </div>
        </header>
    );
}

export default Header;
