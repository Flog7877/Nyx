import React, { createContext, useState, useEffect, useContext } from 'react';
import { validateAccessToken } from './api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Überprüfe den Benutzerstatus beim Laden der App
  useEffect(() => {
    const validateUser = async () => {
      try {
        const { userId, token } = await validateAccessToken();
        const username = localStorage.getItem('username');
        if (userId && token && username) {
          setUser({ userId, username });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };
    validateUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isFullscreen, setIsFullscreen }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);