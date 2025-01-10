import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';

import Register from './pages/Register';
import Login from './pages/Login';
import Timer from './pages/Timer';
import Categories from './pages/Categories';
import Statistics from './pages/Statistics';
import Home from './pages/Home';
import EmailVerified from './pages/EmailVerified';
import NotVerified from './pages/NotVerified';
import VerifyPage from './pages/VerifyPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Settings from './pages/Settings';
import Support from './pages/Support';
import { AuthProvider } from './AuthContext';
import { WarningIcon } from './assets/icons/icons';
 
const App = () => {

    const [isTooSmall, setIsTooSmall] = useState(window.innerWidth < 500);

    useEffect(() => {
        function handleResize() {
            setIsTooSmall(window.innerWidth < 500);
        }

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    if (isTooSmall) {
        return (
            <div style={{
                textAlign: 'center',
                marginTop: '2rem',
                padding: '1rem'
            }}>
                <h2><WarningIcon />Kleine Bildschirme werden noch nicht unterstützt.</h2>
                <p>
                    Im Moment kann die Seite nur auf Bildschirmen, die eine Mindestbreite von 700px haben, angezeigt werden.
                </p>
            </div>
        );
    }
    return (
        <AuthProvider>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgotPassword" element={<ForgotPassword />} />
                        <Route path="/resetPassword" element={<ResetPassword />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/timer" element={<Timer />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/statistics" element={<Statistics />} />
                        <Route path="/verify" element={<VerifyPage />} />
                        <Route path="/EmailVerified" element={<EmailVerified />} />
                        <Route path="/notVerified" element={<NotVerified />} />
                        <Route path="/support" element={<Support />} />
                    </Routes>
                </Layout>
            </Router>
        </AuthProvider>
    );
};

export default App;