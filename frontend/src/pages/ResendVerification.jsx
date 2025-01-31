import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resendVerification } from '../api';
import '../styles/ResendVerification.css'

function ResendVerification() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(false);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Bitte E-Mail eingeben.');
      return;
    }
    try {
      setMessage('Sende Verifizierungs-Mail...');
      await resendVerification(email);
      setMessage('Erfolgreich gesendet. Bitte prüfe dein Postfach!');
      setCooldown(true);
      setTimeout(() => setCooldown(false), 60 * 1000);
    } catch (err) {
      setMessage(err.error || 'Fehler beim erneuten Senden.');
    }
  };

  return (
    <div className='resend-page-container'>
      <div className='resend-wrapper'>
        <form className="resend-form" onSubmit={handleResend} >
          <p className="resend-form-title">Verifizierungsmail</p>
          <div className="resend-input-container">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span>
            </span>
          </div>
          <button type="submit" className="resend-submit">
            Erneut senden
          </button>

          <p className="resend-signup-link">
            Noch keinen Account?&nbsp;&nbsp;
            <Link to="/register">
              Registrieren
            </Link>
          </p>
        </form>
        {message && <p>{message}</p>}
      </div>
      <div className='resend-help'>
        Probleme bei der Registrierung?&nbsp;
        <Link to="/support">
          Hilfe
        </Link>
      </div>
    </div>
  );
}

export default ResendVerification;
