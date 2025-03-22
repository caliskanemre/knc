import React, { useState } from 'react';
import axios from 'axios';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  TextField,
  CircularProgress
} from '@mui/material';
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthProvider";
import {jwtDecode} from "jwt-decode";
//import jwtDecode from 'jwt-decode';
// NOT import { jwtDecode } from 'jwt-decode';

function Register({ open, handleClose }) {
  const { setUsername } = useAuth();
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

  // Helper: simple email format validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (!validateEmail(email)) {
      setError(t("Please enter a valid email address"));
      return;
    }
    if (password.length < 5) {
      setError(t("Password must be at least 5 characters"));
      return;
    }
    if (password !== rePassword) {
      setError(t("Passwords do not match"));
      return;
    }

    setLoading(true);
    setError('');

  try {
    // Registration API call
    const registerResponse = await axios.post(`${baseURL}/auth/register`, { email, password });
    console.log("Register response:", registerResponse.data); // Debug

      // Optional tracking event
      if (window.gtag) {
        window.gtag('event', 'conversion', {
          'send_to': 'AW-854444729/AzNyCLCa4JMZELmVt5cD'
        });
      }

    // Automatic login API call
    const loginResponse = await axios.post(`${baseURL}/auth/login`, { email, password });
    console.log("Login response:", loginResponse.data); // Debug

    if (loginResponse.data && loginResponse.data.accessToken) {
      const { accessToken } = loginResponse.data;
      localStorage.setItem('token', accessToken);

      const decodedToken = jwtDecode(accessToken);
      const userEmail = decodedToken.sub;

      setUsername(userEmail);
      setSuccess(true);

        // Clear fields and close dialog
        setPassword('');
        setRePassword('');
        setEmail('');
        handleClose();
      } else {
        setError(t("Registration successful but failed to log in automatically."));
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError(t("Failed to register."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSuccess(false);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{t("Register")}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t("To register, please enter your email and password")}
        </DialogContentText>

        <TextField
          margin="dense"
          id="email"
          label={t("E-mail")}
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          margin="dense"
          id="password"
          label={t("Password")}
          type="password"
          fullWidth
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <TextField
          margin="dense"
          id="re-password"
          label={t("Confirm Password")}
          type="password"
          fullWidth
          variant="outlined"
          value={rePassword}
          onChange={(e) => setRePassword(e.target.value)}
          required
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {t("Cancel")}
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : t("Register")}
        </Button>
      </DialogActions>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={t("Registration successful and you are now logged in!")}
        action={
          <Button color="secondary" size="small" onClick={handleSnackbarClose}>
            {t("Close")}
          </Button>
        }
      />
    </Dialog>
  );
}

export default Register;
