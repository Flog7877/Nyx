import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import API from '../api';
import '../styles/ResetPassword.css'

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    const token = searchParams.get('token');
    if (!token) {
      setMessage('Kein Token vorhanden.');
      return;
    }
    if (newPassword !== confirmPw) {
      setMessage('Passwörter stimmen nicht überein!');
      return;
    }

    try {
      const resp = await API.post('/resetPassword', {
        token,
        newPassword
      });
      setMessage(resp.message || 'Passwort zurückgesetzt. Du kannst dich nun einloggen.');
    } catch (err) {
      setMessage(err.error || 'Fehler');
    }
  };

  return (
    <div className='reset-page-container'>
      {/*<h2>Neues Passwort vergeben</h2>
      <div style={{ marginBottom:'8px' }}>
        <label>Neues Passwort:</label>
        <input 
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div style={{ marginBottom:'8px' }}>
        <label>Passwort bestätigen:</label>
        <input 
          type="password"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
        />
      </div>
      <button onClick={handleReset}>Speichern</button>
      {message && <p>{message}</p>}*/}
      <div className='reset-wrapper'>
        <form className="reset-form" onSubmit={handleReset} >
          <p className="reset-form-title">Passwort zurücksetzen</p>
          <div className="reset-input-container">
            <input
              placeholder="Neues Passwort"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <span>
            </span>
          </div>
          <div className="reset-input-container">
            <input
              placeholder="Passwort bestätigen"
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
            />
          </div>
          <button type="submit" className="reset-submit">
            Zurücksetzen
          </button>
        </form>
      </div>
      {message && <p>{message}</p>}
      <div className='reset-help'>
        Probleme beim Zurücksetzen?&nbsp;
        <Link to="/support">Hilfe</Link>
      </div>
    </div>
  );
}

export default ResetPassword;
