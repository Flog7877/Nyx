import React from 'react';
import { useAuthGuard } from '../utils/auth';

function Home() {
  useAuthGuard();
  return (
    <div>
      <h1>In Entwicklung.</h1>
      <p>:3</p>
    </div>
  );
}

export default Home;
