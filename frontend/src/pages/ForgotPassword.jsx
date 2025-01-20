import React, { useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/ForgotPassword.css'

function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState('');

  const handleForgot = async (e) => {
    e.preventDefault();
    try {
      const resp = await API.post('/forgotPassword', { identifier });
      setMessage(resp.message || 'Mail verschickt (falls existent).');
    } catch (err) {
      setMessage(err.error || 'Fehler');
    }
  };

  return (
    <div className='forgot-page-container'>
      {/*<h2>Passwort vergessen?</h2>
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
      </p>*/}
      <div className='forgot-wrapper'>
        <form className="forgot-form" onSubmit={handleForgot} >
          <p className="forgot-form-title">Passwort vergessen?</p>
          <div className="forgot-input-container">
            <input
              type="text"
              placeholder="Email oder Username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <span>
            </span>
          </div>
          <button type="submit" className="forgot-submit">
            Email senden
          </button>

          <p className="forgot-signup-link">
            Noch keinen Account?&nbsp;&nbsp;
            <Link to="/register">
              Registrieren
            </Link>
          </p>
        </form>
        {message && <p>{message}</p>}
      </div>
      <div className='forgot-help'>
        Probleme bei der Anmeldung?&nbsp;
        <Link to="/support">
          Hilfe
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
