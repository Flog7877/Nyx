import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../AuthContext';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const resp = await API.post('/login', { identifier, password });
      const { accessToken, refreshToken, user_id, username } = resp.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user_id', user_id);
      localStorage.setItem('username', username);
      login({ userId: user_id, username });
      navigate('/timer');
    } catch (err) {
      console.error('Fehler beim Login. ', err);
      alert('Login fehlgeschlagen.');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Benutzername oder E-Mail:
            <input
              style={{ marginLeft: '10px' }}
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Passwort:
            <input
              style={{ marginLeft: '10px' }}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>
        <button type="submit">Einloggen</button>
      </form>
      <p>
        <Link to="/forgotPassword">Passwort vergessen?</Link>
      </p>
      <p>
        Noch nicht registriert?
        <Link to="/register" style={{ marginLeft: '8px' }}>
          Hier registrieren
        </Link>
      </p>
      <p>
        Bei Problemen mit dem Login: support@flo-g.de
      </p>
    </div>
  );
};

export default Login;
