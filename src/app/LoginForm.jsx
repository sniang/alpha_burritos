/**
 * @file LoginForm.jsx
 * @description Login form component for user authentication.
 *              Checks server availability on mount and displays an error alert
 *              if the server is unreachable. Submits credentials via POST and
 *              calls the onLogin callback on success.
 * @author Samuel Niang
 */

import { useState, useEffect } from 'react';
import LoginIcon from '@mui/icons-material/Login';
import Button from "@mui/material/Button";
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import { Typography, Alert } from '@mui/material';

/**
 * LoginForm – renders a login form with username/password fields.
 *
 * @component
 * @param {Object} props
 * @param {Function} props.onLogin - Callback invoked after successful authentication.
 * @returns {JSX.Element} The login form UI.
 */
export default function LoginForm({ onLogin }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [serverError, setServerError] = useState(null);

  /** On mount, verify that the API server is reachable. */
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch('/api/test');
        if (!res.ok) throw new Error('Server not reachable');
      } catch (error) {
        setServerError(error);
      }
    };
    checkServer();
  }, []);

  /**
   * Handles form submission for user login.
   * Sends credentials to the server and calls onLogin on success.
   * @param {Event} e - Form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });
      if (res.ok) {
        onLogin();
      } else {
        throw new Error('Invalid login or password');
      }
    } catch (error) {
      setMessage(error.message || 'An error occurred during login');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Paper
          elevation={3}
          style={{
            padding: '20px',
            maxWidth: '400px',
            margin: '20px auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <Typography variant="h6">Please log in</Typography>
          {/* Login input field */}
          <TextField id="outlined-basic" label="Login" variant="outlined" value={login} onChange={(e) => setLogin(e.target.value)} />
          {/* Password input field */}
          <TextField id="outlined-password" label="Password" variant="outlined" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {/* Submit button */}
          <Button type="submit" startIcon={<LoginIcon />} variant="contained">
            Log in
          </Button>
          {/* Error message after failed login attempt */}
          {message && <span className="message">{message}</span>}
        </Paper>
      </form>
      {/* Server connectivity error alert */}
      {serverError && (
        <Alert severity="error">
          {serverError.message || String(serverError)}. Please ensure the server is running and reachable.
        </Alert>
      )}
    </>
  );
}