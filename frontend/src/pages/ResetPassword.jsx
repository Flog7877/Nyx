import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async () => {
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
    <div>
      <h2>Neues Passwort vergeben</h2>
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
      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPassword;
