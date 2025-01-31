import React from 'react';
import { useAuthGuard } from '../utils/auth';

import {
  TimerIcon1,
  SettingsIcon,
  HomeIcon,
  CategoriesIcon,
  StatisticsIcon,
  QuestionmarkIcon
} from '../assets/icons/icons';

function Home() {
  //useAuthGuard();
  return (
    <div style = {{ textAlign: 'justify', textJustify: 'inter-word' }}>
      <h1>Home</h1>
      <p>
        Willkommen bei Projekt Nyx! Das Projekt befindet sich noch in der Entwicklung und ist noch lange nicht fertig. 'Nyx' ist übrigens die griechische Göttin der Nacht! Das fand ich sehr passend, weil ich meistens zu später Stunde richtig produktiv bin. Hier eine kleine Zusammenfassung von chatGPT:
      </p>
      <h2><TimerIcon1 width="1.2em" style={{ verticalAlign: '-.25em' }} /> Timer-Funktionen</h2>
      <p>
        Dieses Projekt wurde entwickelt, um produktives Arbeiten zu erleichtern und Zeit effizienter zu nutzen. Der Timer hat dafür folgende Modi:
      </p>
      <ul>
        <li>
          <b>Pomodoro-Modus:</b> Ein Timer, der auf der Pomodoro-Technik basiert. Diese Methode unterteilt die Arbeit in feste Intervalle,
          typischerweise 25 Minuten Fokuszeit, gefolgt von 5 Minuten Pause. Ziel ist es, Konzentration und Produktivität zu fördern.
        </li>
        <li>
          <b>Ping-Modus:</b> Eine Stoppuhr, die in definierten Intervallen ein akustisches Signal ausgibt. Dieses Signal dient
          dazu, den Fokus zu überprüfen oder eine Pause einzuleiten.
        </li>
        <li>
          <b>Timer-Modus:</b> Ein einfacher Countdown-Timer, der flexibel eingestellt werden kann.
        </li>
        <li>
          <b>Cronograph-Modus:</b> Eine Stoppuhr mit Rundenfunktion. Jede Runde kann mit einer Notiz versehen werden,
          um Fortschritte oder erledigte Aufgaben zu dokumentieren.
        </li>
      </ul>
      <p>
        Dabei können natürlich sämtliche Einstellungen an persönliche Bedürfnisse angepasst werden.
      </p>
      <h2><StatisticsIcon width="1.2em" style={{ verticalAlign: '-.25em' }} /> Statistiken und Analysen</h2>
      <p>
        Jede Sitzung kann gespeichert und später in den Statistiken eingesehen werden. Diese bieten einen umfassenden Überblick
        über die geleistete Arbeit, mit der Möglichkeit, Daten nach Modi, Kategorien oder Zeiträumen zu filtern. Erweiterte
        Visualisierungen und zusätzliche Analysetools sind geplant.
      </p>
      <h2><CategoriesIcon width="1.2em" style={{ verticalAlign: '-.25em' }} /> Kategorien-System</h2>
      <p>
        Ein hierarchisches Kategorien-System ermöglicht es, Sitzungen zu organisieren und bestimmten Themen oder Aufgabenbereichen
        zuzuordnen. Dies schafft eine strukturierte Übersicht und erleichtert die Auswertung.
      </p>
      <h2><SettingsIcon width="1.2em" style={{ verticalAlign: '-.25em' }} /> Einstellungen</h2>
      <p>
        Die Einstellungen erlauben die Anpassung verschiedener Parameter, wie Standardwerte für die Timer-Modi oder
        persönliche Präferenzen. Zukünftige Erweiterungen umfassen zusätzliche Optionen zur Individualisierung, wie Design-Einstellungen.
      </p>
    </div>
  );
}

export default Home;
