import React from 'react';

const ChangelogContent = () => (
    <section className="changelog-text">
        <h4>
            <span className="popup-version-badge">v0.1.3</span>
        </h4>
        <ul className="features" >
            <li>Es gibt jetzt einen Handymodus! Es werden nun auch kleine Bildschirme unterstützt.</li>
            <li>Die UI beim Anmeldungs-/ Registrierungsprozess wurde verbessert.</li>
            <li>Ein <strong>Notification-Modus</strong> wurde hinzugefügt. Mehr dazu in den Einstellungen!</li>
            <li>Der Fullscreen-Modus funktioniert jetzt (einigermaßen) vernünftig.</li>
            <li>Man kann jetzt ein Sitzungs-Limit einstellen.</li>
        </ul>
        <strong>Datum:</strong> 21.01.2024
        <h4>
            <span className="popup-version-badge">v0.1.2</span>
        </h4>
        <ul className="features" >
            <li>Darstellung der Statistiken aktualisiert, die Liste ist jetzt übersichtlicher</li>
            <li>Das Filtersystem bei den Statistiken filtert jetzt richtig (z. B. Unterkategorien)</li>
            <li>
                <strong>Wichtig:</strong> Man kann nun jeder Kategorie Standard-Zeitwerte für Modi
                zuordnen. Fehlen diese, greifen allgemeine Standardwerte.
            </li>
            <li>Auch die Darstellung der Kategorien wurde geändert, aber noch nicht final.</li>
        </ul>
        <strong>Datum:</strong> 14.01.2024
    </section>
);

export default ChangelogContent;
