import React, { useState } from 'react';
import { resendVerification } from '../api';

function ResendVerification() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(false);

  const handleResend = async () => {
    if (!email) {
      setMessage('Bitte E-Mail eingeben.');
      return;
    }
    try {
      setMessage('Sende Verifizierungs-Mail...');
      await resendVerification(email);
      setMessage('Erfolgreich gesendet. Bitte prüfe dein Postfach!');
      setCooldown(true);
      setTimeout(() => setCooldown(false), 60*1000); // 60s cooldown
    } catch (err) {
      setMessage(err.error || 'Fehler beim erneuten Senden.');
    }
  };

  return (
    <div>
      <h3>Erneut E-Mail-Verifizierung senden</h3>
      <div>
        <label>E-Mail:</label>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginLeft:'8px' }}
        />
        <button onClick={handleResend} style={{ marginLeft:'8px' }} disabled={cooldown}>
          Erneut senden
        </button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ResendVerification;
