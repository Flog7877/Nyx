import React, { useState } from 'react';
import API from '../api';

function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState('');

  const handleForgot = async () => {
    try {
      const resp = await API.post('/forgotPassword', { identifier });
      setMessage(resp.message || 'Mail verschickt (falls existent).');
    } catch (err) {
      setMessage(err.error || 'Fehler');
    }
  };

  return (
    <div>
      <h2>Passwort vergessen?</h2>
      <div>
        <label>Username oder E-Mail:</label>
        <input 
          value={identifier} 
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <button onClick={handleForgot}>Zurücksetzen anfordern</button>
      </div>
      {message && <p>{message}</p>}
      <p>
        Probleme bei der Registrierung/ Anmeldung? Gerne an support@flo-g.de wenden.
      </p>
    </div>
  );
}

export default ForgotPassword;
