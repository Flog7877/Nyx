import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../AuthContext';
import '../styles/Login.css'

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
    <div className='login-page-container'>
      <div className='login-wrapper'>
        <form className="login-form" onSubmit={handleLogin} >
          <p className="login-form-title">Login</p>
          <div className="login-input-container">
            <input
              type="text"
              placeholder="Benutzername oder Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <span>
            </span>
          </div>
          <div className="login-input-container">
            <input
              type="password"
              placeholder="Passwort"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-submit">
            Anmelden
          </button>

          <p className="login-signup-link">
            Noch keinen Account?&nbsp;&nbsp;
            <Link to="/register">
              Registrieren
            </Link>
          </p>
        </form>
      </div>
      <div className='login-help'>
        <Link to="/forgotPassword">Passwort vergessen?</Link>
      </div>
    </div>
  );
};

export default Login;
