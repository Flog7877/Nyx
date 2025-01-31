import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../api'; 

function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const hasVerifiedRef = useRef(false);

  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (hasVerifiedRef.current || isVerifying) {
        console.log('VerifyPage: Verifizierung bereits durchgeführt oder wird gerade durchgeführt.');
        return;
      }

      hasVerifiedRef.current = true;
      setIsVerifying(true);

      const token = searchParams.get('token');
      console.log('VerifyPage: Token erhalten:', token);

      if (!token) {
        alert('Kein Token angegeben.');
        navigate('/notVerified');
        return;
      }

      try {
        const response = await API.get(`/verify?token=${token}`);
        console.log('VerifyPage: Verifizierung erfolgreich:', response.data.message);

        alert(response.data.message);
        navigate('/EmailVerified');
      } catch (err) {
        console.log('VerifyPage: Verifizierungsfehler:', err.response?.data?.error);

        if (err.response && err.response.data && err.response.data.error) {
          alert(`Fehler: ${err.response.data.error}`);
        } else {
          alert('Ein unbekannter Fehler ist aufgetreten.');
        }
        navigate('/notVerified');
      } finally {

        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [navigate, searchParams, isVerifying]);

  return (
    <div>
      <h1>Verifikation läuft...</h1>
      <p>Bitte warten.</p>
    </div>
  );
}

export default VerifyPage;
