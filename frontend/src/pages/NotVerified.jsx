import React from 'react';
import ResendVerification from './ResendVerification';

function NotVerified() {
  return (
    <div>
      <h1>E-Mail nicht verifiziert</h1>
      <p>Du kannst dich erst nach Verifizierung einloggen. Prüfe dein Postfach!</p>
      <ResendVerification />
    </div>
  );
}

export default NotVerified;
