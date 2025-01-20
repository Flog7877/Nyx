import React, { useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';
import {
    PartyIcon,
    NewMailIcon
} from '../assets/icons/icons';

function AccountCreated() {
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
      <h1>Willkommen <PartyIcon width="42px" /> </h1>
      <div>
      <p>
        Der Account wurde erfolgreich registriert, willkommen bei Projekt Nyx. 
      </p>
      <h2><NewMailIcon width="24px" style={{ verticalAlign: '-4px' }}/> Verifizierung</h2>
      Um die Seite nutzen zu können, muss die angegebene Email verifiziert werden. Bitte das Postfach überprüfen!
      <p>
        Kam die Verifizierungs-Mail nicht an? &nbsp;
        <Link to="/resendVerification">Erneut senden</Link>
      </p>
      <p style={{ paddingTop: '5px', borderTop: '1px solid white', color: '#bdbdbd' }}>
        Dieser Tab kann nun geschlossen werden.
      </p>
    </div>
    </div>
  );
}

export default AccountCreated;
