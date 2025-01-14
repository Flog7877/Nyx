import React from 'react';

const ChangelogContent = () => (
    <section className="changelog-text">
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
    </section>
);

export default ChangelogContent;
