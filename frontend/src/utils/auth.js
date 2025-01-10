import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { validateAccessToken } from '../api'; 

export const useAuthGuard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { userId } = await validateAccessToken();
        if (!userId) {
          console.warn('Benutzer nicht authentifiziert. Weiterleitung zur Login-Seite.');
          navigate('/login');
        }
      } catch (error) {
        console.error('Fehler bei der Authentifizierung:', error);
        navigate('/login'); 
      }
    };

    checkAuth();
  }, [navigate]);
};
