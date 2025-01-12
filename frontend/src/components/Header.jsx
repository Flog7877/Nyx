import React, { useContext, useState, useEffect } from 'react';
import './Header.css';
import { AuthContext } from '../AuthContext';
import { UserIcon, SidebarIcon, LoginIcon, LogoutIcon, ToolsIcon } from '../assets/icons/icons';
import { Link, useNavigate } from 'react-router-dom';
import { fetchChangelogStatus, markChangelogAsRead } from '../api';

function Header({ onBurgerClick }) {
    const { user, logout, isFullscreen } = useContext(AuthContext);
    const [isChangelogOpen, setIsChangelogOpen] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const navigate = useNavigate();

    // Status der Changelog-Benachrichtigung beim Laden abrufen
    useEffect(() => {
        if (user) {
            fetchChangelogStatus()
                .then((data) => setShowNotification(!data.read)) // Zeigt den Kreis nur, wenn "read" false ist
                .catch((error) => {
                    console.error('Fehler beim Abrufen des Changelog-Status:', error);
                    setShowNotification(false); // Zur Sicherheit kein Kreis bei Fehlern
                });
        }
    }, [user]);

    // Markiere Changelog als gelesen und entferne die Benachrichtigung
    const markChangelogAsReadHandler = () => {
        markChangelogAsRead()
            .then(() => {
                setShowNotification(false); // Kreis entfernen
                setIsChangelogOpen(false); // Popup schließen
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
                        <div
                            className="header-version-badge"
                            onClick={toggleChangelogPopup}
                        >
                            v0.1.2
                            {showNotification && <span className="notification-badge"></span>}
                        </div>
                    </div>
                </div>

                <div className="header-right">
                    {user && (
                        <span style={{ marginRight: '20px' }}>
                            <UserIcon width="15px" style={{ verticalAlign: '-2px' }} /> {user.username} (ID: {user.userId})
                        </span>
                    )}
                    <button
                        onClick={user ? handleLogout : () => navigate('/login')}
                        style={{ marginRight: '25px' }}
                        className="header-button"
                    >
                        {user ? (
                            <div className="header-link">
                                <div className="header-icon">
                                    <LogoutIcon width="20px" height="20px" />
                                </div>
                                Abmelden
                            </div>
                        ) : (
                            <div className="header-link">
                                <div className="header-icon">
                                    <LoginIcon width="20px" height="20px" />
                                </div>
                                Anmelden
                            </div>
                        )}
                    </button>
                </div>
            </header>

            {isChangelogOpen && (
                <div className="changelog-popup-overlay" onClick={toggleChangelogPopup}>
                    <div
                        className="changelog-popup"
                        onClick={(e) => e.stopPropagation()} // Verhindert Schließen bei Klick im Popup
                    >
                        <h1>
                            <ToolsIcon className="changelog-icon" /> Changelog
                        </h1>
                        <section>
                            <h4>
                                <span className="popup-version-badge">v0.1.2</span>
                            </h4>
                            <ul className="features">
                                <li>Darstellung der Statistiken aktualisiert, die Liste ist jetzt übersichtlicher</li>
                                <li>Das Filtersystem bei den Statistiken filtert jetzt richtig (z. B. Unterkategorien)</li>
                                <li>
                                    <strong>Wichtig:</strong> Man kann nun jeder Kategorie Standard-Zeitwerte für Modi
                                    zuordnen. Fehlen diese, greifen allgemeine Standardwerte.
                                </li>
                                <li>Auch die Darstellung der Kategorien wurde geändert, aber noch nicht final.</li>
                            </ul>
                        </section>
                        <button
                            className="mark-as-read-button"
                            onClick={markChangelogAsReadHandler}
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
