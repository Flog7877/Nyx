import React, { useContext, useState, useEffect } from 'react';
import './Header.css';
import { AuthContext } from '../AuthContext';
import { UserIcon, SidebarIcon, LoginIcon, LogoutIcon, ToolsIcon } from '../assets/icons/icons';
import { Link, useNavigate } from 'react-router-dom';
import { fetchChangelogStatus, markChangelogAsRead } from '../api';
import ChangelogContent from './ChangelogContent';
import useIsMobile from '../hooks/useIsMobile';


function Header({ onBurgerClick }) {
    const isMobile = useIsMobile();
    const { user, logout, isFullscreen } = useContext(AuthContext);
    const [isChangelogOpen, setIsChangelogOpen] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [isUserPopupOpen, setIsUserPopupOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchChangelogStatus(user)
                .then((data) => {
                    setShowNotification(!data.read)
                })
                .catch((error) => {
                    console.error('Fehler beim Abrufen des Changelog-Status:', error);
                    setShowNotification(false);
                });
        }
    }, [user]);

    const markChangelogAsReadHandler = () => {
        const payload = user;
        markChangelogAsRead(payload)
            .then(() => {
                setShowNotification(false);
                setIsChangelogOpen(false);
            })
            .catch((error) => console.error('Fehler beim Aktualisieren des Changelog-Status:', error));
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleChangelogPopup = () => {
        setIsChangelogOpen(!isChangelogOpen);
    };

    const toggleUserPopup = () => {
        setIsUserPopupOpen(!isUserPopupOpen);
    };

    if (isFullscreen) return null;

    return (
        <>
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
                        {!isMobile && (
                            <>
                                <div
                                    className="header-version-badge"
                                    onClick={toggleChangelogPopup}
                                >
                                    v0.1.3
                                    {showNotification && <span className="notification-badge"></span>}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className='header-right-wrapper'>
                    {user && (
                        <>
                            {isMobile ? (
                                <div className="mobile-user-icon-container">
                                    <button
                                        className="icon-button-mobile"
                                        onClick={toggleUserPopup}
                                    >
                                        <UserIcon width="20px" height="20px" />
                                    </button>
                                    {isUserPopupOpen && (
                                        <div className="user-popup" onClick={(e) => e.stopPropagation()}>
                                            <p><strong>{user.username}</strong></p>
                                            <p>ID: {user.userId}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <span style={{ marginRight: '20px' }}>
                                    <UserIcon width="15px" style={{ verticalAlign: '-2px' }} />
                                    {' ' + user.username} (ID: {user.userId})
                                </span>
                            )}
                        </>
                    )}
                    <div className="header-right">
                        <button
                            onClick={user ? handleLogout : () => navigate('/login')}
                            style={{ marginRight: '25px' }}
                            className="header-button"
                        >
                            <div className="header-link">
                                <div className="header-icon">
                                    {user ? (
                                        <LogoutIcon width="20px" height="20px" />
                                    ) : (
                                        <LoginIcon width="20px" height="20px" />
                                    )}
                                </div>
                                {!isMobile && (
                                    <>
                                        {user ? <span>Abmelden&nbsp;&nbsp;</span> : <span>Anmelden&nbsp;&nbsp;</span>}
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </header>
            {!isMobile && isChangelogOpen && (
                <div className="changelog-popup-overlay" onClick={toggleChangelogPopup}>
                    <div
                        className="changelog-popup"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h1>
                            <ToolsIcon className="changelog-icon" /> Changelog
                        </h1>
                        <ChangelogContent />
                        <button
                            disabled={!showNotification}
                            className="mark-as-read-button"
                            onClick={markChangelogAsReadHandler}
                            style={{ marginRight: "10px", marginTop: "10px" }}
                        >
                            Gelesen
                        </button>
                        <button
                            className="close-popup-button"
                            onClick={toggleChangelogPopup}
                        >
                            Schließen
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Header;
