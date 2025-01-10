import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../AuthContext';
import { sendSupportMessage } from '../api';
import { useAuthGuard } from '../utils/auth';

function Support() {
  const { user } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // Frontend 60s cooldown
  const [cooldownActive, setCooldownActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Timer-Effect
  useEffect(() => {
    let interval;
    if (cooldownActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft <= 0) {
      setCooldownActive(false);
    }

    return () => clearInterval(interval);
  }, [cooldownActive, secondsLeft]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!user) {
      // not logged in => name/email required
      if (!name.trim() || !email.trim()) {
        setError('Bitte Name und E-Mail ausfüllen.');
        return;
      }
    }

    if (!message.trim()) {
      setError('Bitte eine Nachricht eingeben.');
      return;
    }

    try {
      const payload = { message };
      if (!user) {
        payload.name = name;
        payload.email = email;
      }

      const resp = await sendSupportMessage(payload);
      if (resp.success) {
        setSuccessMsg('Nachricht erfolgreich gesendet!');
        setMessage('');
        if (!user) {
          setName('');
          setEmail('');
        }
        // 60s cooldown 
        setCooldownActive(true);
        setSecondsLeft(60);
      } else {
        setError(resp.error || 'Unerwarteter Fehler.');
      }
    } catch (err) {
      // Hier kann err.error oder err.message drinstecken
      setError(err.error || 'Fehler beim Senden der Nachricht.');
    }
  };

  return (
    <div>
      <h1>Hilfe</h1>
      <p>Bei Problemen oder Fragen: <strong>support@flo-g.de</strong></p>

      <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        {!user && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label>Name:<br />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>E-Mail:<br />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </div>
          </>
        )}
        <div style={{ marginBottom: '1rem' }}>
          <label>Nachricht:<br />
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Deine Nachricht..."
              style={{ width: '100%' }}
            />
          </label>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}

        <button type="submit" disabled={cooldownActive}>
          {cooldownActive 
            ? `Warte ${secondsLeft} Sek...` 
            : 'Abschicken'}
        </button>
      </form>
    </div>
  );
}

export default Support;
