import React, { useState } from 'react';
import { registerUser } from '../api';
import ResendVerification from './ResendVerification';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [message, setMessage] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'password') {
            validatePassword(value);
        }
    };

    const validatePassword = (password) => {
        const errors = [];
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        if (password.length < minLength) {
            errors.push(`${minLength} Zeichen lang sein`);
        }
        if (!hasUpperCase) {
            errors.push('einen Großbuchstaben enthalten');
        }
        if (!hasLowerCase) {
            errors.push('einen Kleinbuchstaben enthalten');
        }
        if (!hasSpecialChar) {
            errors.push('ein Sonderzeichen enthalten');
        }
        if (!hasNumber) {
            errors.push('eine Zahl enthalten');
        }

        setPasswordError(errors);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setMessage('Passwörter stimmen nicht überein.');
            return;
        }

        if (passwordError.length > 0) {
            console.log(passwordError)
            let errorMsg = 'Das Passwort muss mindestens ';
            const count = passwordError.length;
            if (count > 1) {
                for (let i = 0; i < count - 1; i++) {
                    errorMsg += `${passwordError[i]}, `
                }
            }
            errorMsg += count > 1 ? `und ${passwordError[count - 1]}.` : `${passwordError[0]}.`;
            setMessage(errorMsg);
            return;
        }

        try {
            const response = await registerUser(formData);
            setMessage(`Erfolgreich registriert: Benutzer-ID ${response.userId}. Bitte Postfach überprüfen!`);
        } catch (error) {
            setMessage(error.error || 'Registrierung fehlgeschlagen.');
        }
    };

    return (
        <div>
            <h2>Registrieren</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Benutzername:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>E-Mail:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Passwort:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                    />
                </div>
                <div>
                    <label>Passwort bestätigen:</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                    />
                </div>
                <button type="submit">Registrieren</button>
            </form>
            {message && <p>{message}</p>}

            <ResendVerification />
            <p>
                Probleme mit der Registrierung? Mail an support@flo-g.de
            </p>
        </div>
    );
};

export default Register;
