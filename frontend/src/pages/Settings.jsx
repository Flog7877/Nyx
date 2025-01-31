import React, { useEffect, useState } from 'react';
import API from '../api';
import { useAuthGuard } from '../utils/auth';
import { getPreferences, updatePreferences } from '../api';
import '../styles/Settings.css'
import { Link } from 'react-router-dom';

function formatToHHMMSS(sec) {
  const hrs = String(Math.floor(sec / 3600)).padStart(2, '0');
  const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const secs = String(sec % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function validateTimeString(str) {
  const match = str.match(/^(\d{2}):([0-5]\d):([0-5]\d)$/);
  if (!match) return null;
  const [_, hh, mm, ss] = match;
  const totalSec = parseInt(hh, 10) * 3600 + parseInt(mm, 10) * 60 + parseInt(ss, 10);
  if (totalSec <= 0) return null;
  return totalSec;
}

function Settings() {
  useAuthGuard();
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const [notificationMode, setNotificationMode] = useState(false);

  const [timerFocus, setTimerFocus] = useState('00:25:00');
  const [timerPause, setTimerPause] = useState('00:05:00');
  const [timerPing, setTimerPing] = useState('00:15:00');
  const [timerDuration, setTimerDuration] = useState('00:10:00');

  const [deletePw, setDeletePw] = useState('');

  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const pref = await getPreferences();
      setNotificationMode(!!pref.notification_mode);
    } catch (e) {
      console.error(e);
      setMessage('Fehler beim Laden der Benachrichtigungseinstellungen.');
    }
  };

  const loadSettings = async () => {
    try {
      const resp = await API.get('/settings');
      const st = resp.data.settings || {};
      setUsername(resp.data.username);
      if (resp.data.settings.timer_pomodoro_focus) {
        setTimerFocus(formatToHHMMSS(parseInt(st.timer_pomodoro_focus, 10)));
      }
      if (resp.data.settings.timer_pomodoro_pause) {
        setTimerPause(formatToHHMMSS(parseInt(st.timer_pomodoro_pause, 10)));
      }
      if (resp.data.settings.timer_ping_interval) {
        setTimerPing(formatToHHMMSS(parseInt(st.timer_ping_interval, 10)));
      }
      if (resp.data.settings.timer_timer_duration) {
        setTimerDuration(formatToHHMMSS(parseInt(st.timer_timer_duration, 10)));
      }
    } catch (err) {
      setMessage(err.error || 'Fehler beim Laden.');
    }
  };

  const handleChangeUsername = async () => {
    try {
      const resp = await API.put('/settings/username', { newUsername: username });
      setMessage(resp.data.message);
      setTimeout(() => setMessage(null), 3000);
      localStorage.setItem('username', username);
      location.reload();
      setMessage(resp.data.message);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage(err.error || 'Fehler beim Usernamen ändern.');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPw) {
      setMessage('Passwörter stimmen nicht überein!');
      return;
    }
    try {
      const resp = await API.put('/settings/password', { oldPassword, newPassword });
      setMessage(resp.data.message);
    } catch (err) {
      setMessage(err.error || 'Fehler beim Passwort ändern.');
    }
  };

  const handleSaveTimer = async () => {
    let errors = false;
    const focusSec = validateTimeString(timerFocus);
    const pauseSec = validateTimeString(timerPause);
    const pingSec = validateTimeString(timerPing);
    const durSec = validateTimeString(timerDuration);

    if (focusSec === null || pauseSec === null || pingSec === null || durSec === null) {
      setMessage('Bitte gültiges Format hh:mm:ss eingeben, z.B. 00:25:00');
      errors = true;
    }
    if (errors) return;

    try {
      await API.put('/settings', {
        settings: {
          timer_pomodoro_focus: focusSec,
          timer_pomodoro_pause: pauseSec,
          timer_ping_interval: pingSec,
          timer_timer_duration: durSec
        }
      });
      setMessage('Einstellungen gespeichert!');
    } catch (err) {
      setMessage(err.error || 'Fehler');
    }
  };

  const handleToggleNotification = async (e) => {
    const newValue = e.target.checked;
    if (newValue) {
      // Aktivierung
      if (Notification.permission === 'granted') {
        setNotificationMode(true);
        try {
          await updatePreferences({ notification_mode: true });
          setMessage('Benachrichtigungen aktiviert.');
        } catch (err) {
          setMessage('Fehler beim Speichern.');
        }
      } else {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            setNotificationMode(true);
            await updatePreferences({ notification_mode: true });
            setMessage('Benachrichtigungen aktiviert.');
          } else {
            setMessage('Benachrichtigungen wurden verweigert.');
            setNotificationMode(false);
          }
        } catch (err) {
          console.error(err);
          setMessage('Fehler bei der Anfrage.');
          setNotificationMode(false);
        }
      }
    } else {
      setNotificationMode(false);
      try {
        await updatePreferences({ notification_mode: false });
        setMessage('Benachrichtigungen deaktiviert.');
      } catch (err) {
        setMessage('Fehler beim Speichern.');
      }
    }
  };


  const handleDeleteUser = async () => {
    if (!deletePw) {
      setMessage('Bitte Passwort eingeben zur Löschung');
      return;
    }
    if (!window.confirm('Willst du wirklich dein Konto löschen? :(')) return;
    try {
      const resp = await API.delete('/api/settings/user', {
        data: { password: deletePw }
      });
      setMessage(resp.data.message);
      localStorage.clear();
      window.location.href = '/login';
    } catch (err) {
      setMessage(err.error || 'Fehler beim Löschen');
    }
  };


  return (
    <div>
      <h1>Einstellungen</h1>
      <p>
        Hier können persönliche Präferenzen eingestellt werden und Benutzer*in-Informationen angepasst werden.
      </p>
      {message && <p>{message}</p>}

      <h2>Benutzername ändern</h2>
      <div>
        <label>Benutzername:</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={handleChangeUsername}>Username ändern</button>
      </div>

      <h2>Passwort ändern</h2>
      <div>
        <label>Altes PW:</label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
      </div>
      <div>
        <label>Neues PW:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div>
        <label>Neues PW bestätigen:</label>
        <input
          type="password"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
        />
      </div>
      <button onClick={handleChangePassword}>Passwort ändern</button>

      <h2>Standardwerte</h2>
      <div>
        <label>Pomodoro-Fokuszeit (hh:mm:ss):</label>
        <input
          type="text"
          value={timerFocus}
          onChange={(e) => setTimerFocus(e.target.value)}
        />
      </div>
      <div>
        <label>Pomodoro-Pausenzeit (hh:mm:ss):</label>
        <input
          type="text"
          value={timerPause}
          onChange={(e) => setTimerPause(e.target.value)}
        />
      </div>
      <div>
        <label>Ping-Intervall (hh:mm:ss):</label>
        <input
          type="text"
          value={timerPing}
          onChange={(e) => setTimerPing(e.target.value)}
        />
      </div>
      <div>
        <label>Timer-Dauer (hh:mm:ss):</label>
        <input
          type="text"
          value={timerDuration}
          onChange={(e) => setTimerDuration(e.target.value)}
        />
      </div>
      <button onClick={handleSaveTimer}>Speichern</button>

      <div className='notification-settings-wrapper'>
        <h2>Benachrichtigungen</h2>
        <p style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
          Optional können zusätzlich zu den Tönen auch Benachrichtigungen mit den aktuellen Daten gesendet werden (z.B. beim Wechsel Fokus-Pause oder einem Ping). Dafür muss diese Seite Berechtigungen haben, Benachrichtigungen zu schicken. Der Benachrichtigungsmodus kann hier jederzeit aktiviert und deaktiviert werden.
        </p>
        <div className='notification-toggle-wrapper'>
          <div>
            Notification-Modus:&nbsp;&nbsp;&nbsp;
          </div>
          <div className="toggler">
            <input
              id="toggler-notifications"
              name="notification-toggle"
              type="checkbox"
              checked={notificationMode}
              onChange={handleToggleNotification}
            />
            <label htmlFor="toggler-notifications">
              <svg className="toggler-on" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                <polyline className="path check" points="100.2,40.2 51.5,88.8 29.8,67.5"></polyline>
              </svg>
              <svg className="toggler-off" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                <line className="path line" x1="34.4" y1="34.4" x2="95.8" y2="95.8"></line>
                <line className="path line" x1="95.8" y1="34.4" x2="34.4" y2="95.8"></line>
              </svg>
            </label>
          </div>
        </div>
        <p>
          Probleme mit Benachrichtigungen oder Berechtigungen? <a href='https://www.stern.de/sonst/browser-benachrichtungen-an--und-abschalten-8543416.html' target="_blank" rel="noopener noreferrer">Hilfe</a>
        </p>
        {Notification.permission === 'denied' && (
          <div>
            <div className="notification-warning">
              Hinweis: Benachrichtigungen sind deaktiviert.
            </div>
            <p style={{ fontSize: '80%' }} >
              Dies könnte möglicherweise eine Standartbrowsereinstellung sein.<br></br>
              Falls es hierzu Fragen gibt:&nbsp;
              <Link to="/support">
                Support
              </Link>
            </p>
          </div>
        )}
      </div>


      <h2>Benutzer löschen</h2>
      <div>
        <label>Passwort:</label>
        <input
          type="password"
          value={deletePw}
          onChange={(e) => setDeletePw(e.target.value)}
        />
      </div>
      <button
        style={{ color: 'red', marginTop: '1em', cursor: 'not-allowed' }}
        disabled={true}
      >
        Benutzer löschen
      </button>
      <p>
        Hinweis: Die Route für das Löschen ist noch Fehlerhaft.
      </p>
    </div>
  );
}

export default Settings;