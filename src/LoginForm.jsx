// Author: Samuel Niang

import { useState } from 'react';

/**
 * LoginForm component for user authentication.
 * @param {Function} onLogin - Callback function to execute after successful login.
 */
export default function LoginForm({ onLogin }) {
    // State for login and password fields
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    /**
     * Handles form submission for user login.
     * Sends login credentials to the server and calls onLogin on success.
     * @param {Event} e - Form submission event
     */
    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await fetch('api/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password })
            });
            if (res.ok) {
                // Call the onLogin callback after successful authentication
                onLogin();
            } else {
                // Show an alert if authentication fails
                alert('Login error');
            }
        } catch (error) {
            // Show an alert if a network or server error occurs
            alert('An error occurred');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="blocks">
            {/* Login input field */}
            <input
                value={login}
                onChange={e => setLogin(e.target.value)}
                placeholder="Login"
            />
            {/* Password input field */}
            <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
            />
            {/* Submit button */}
            <button type="submit">Login</button>
        </form>
    );
}