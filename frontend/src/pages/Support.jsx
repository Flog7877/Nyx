import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { sendSupportMessage } from '../api';

function Support() {
  const { user } = useContext(AuthContext);

  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [cooldownActive, setCooldownActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

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

    if (!message.trim()) {
      setError('Bitte eine Nachricht eingeben.');
      return;
    }

    try {
      const payload = { message };
      const resp = await sendSupportMessage(payload);

      if (resp.success) {
        setSuccessMsg('Nachricht erfolgreich gesendet!');
        setMessage('');
        setCooldownActive(true);
        setSecondsLeft(60);
      } else {
        setError(resp.error || 'Unerwarteter Fehler.');
      }
    } catch (err) {
      setError(err.error || 'Fehler beim Senden der Nachricht.');
    }
  };

  return (
    <div>
      <h1>Hilfe</h1>
      <p>
        Bei Problemen oder Fragen: <strong>support@flo-g.de</strong>
      </p>
      {!user ? (
        <p style={{ marginTop: '1rem' }}>
          Um Direktnachrichten und Feedback zu senden, ist eine Anmeldung notwendig. 
        </p>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label>
              Verbesserungsvorschläge, Fehler entdeckt oder andere Anliegen? Schicke eine Nachricht: 
              <br></br>
              <br />
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
            {cooldownActive ? `Warte ${secondsLeft} Sek...` : 'Abschicken'}
          </button>
        </form>
      )}
      {!user && (
        <div>
          Keine Verifizierungs-Mail erhalten?&nbsp;
          <Link to="/resendVerification">Erneut senden</Link>
        </div>
      )}
    </div>
  );
}

export default Support;
