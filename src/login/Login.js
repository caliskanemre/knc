// Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { Button, Dialog, DialogContent, DialogTitle, Snackbar, TextField, DialogActions } from '@mui/material';
import { useAuth } from '../auth/AuthProvider';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from 'react-i18next';
import { ClipLoader } from 'react-spinners';

const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

function Login({ open, handleClose, onLoginSuccess, handleOpenRegisterDialog }) {
    const { setIsLoggedIn, setUsername, setToken } = useAuth(); // Added setToken
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const handleForgotPassword = async () => {
        try {
            const response = await axios.post(`${baseURL}/auth/forgot-password`, { email });
            console.log('Forgot password response:', response.data);
            setShowForgotPassword(false);
            setSuccess(true);
        } catch (error) {
            console.error('Forgot password error:', error.response?.data || error.message);
            setError(t('forgot_password_failed'));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${baseURL}/auth/login`, { email, password });
            if (response.data && response.data.accessToken) {
                const { accessToken } = response.data;
                localStorage.setItem('token', accessToken); // Store token
                setToken(accessToken); // Update context token

                const decodedToken = jwtDecode(accessToken);
                const userEmail = decodedToken.sub; // Extract email as username

                // Update context state
                setIsLoggedIn(true);
                setUsername(userEmail);

                // Call onLoginSuccess
                onLoginSuccess({ accessToken, email: userEmail });

                setSuccess(true);

                // Simulate delay for animation
                setTimeout(() => {
                    setLoading(false);
                    handleClose();
                }, 1000);
            } else {
                setError(t('login_failed_no_data'));
                setLoading(false);
            }
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            setError(t('login_failed'));
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{t('Login')}</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="email"
                        label={t('Email')}
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
                        label={t('Password')}
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        fullWidth
                        style={{ marginTop: '20px' }}
                        disabled={loading}
                    >
                        {loading ? <ClipLoader size={20} color="#fff" /> : t('Login')}
                    </Button>
                    <p style={{ textAlign: 'center', marginTop: '10px' }}>{t('Not a member yet?')}</p>
                    <Button
                        color="primary"
                        variant="contained"
                        fullWidth
                        onClick={() => {
                            handleClose();
                            handleOpenRegisterDialog();
                        }}
                        disabled={loading}
                    >
                        {t('Sign Up')}
                    </Button>
                    {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                </form>
            </DialogContent>

            <DialogActions>
                <Button color="primary" onClick={() => setShowForgotPassword(true)} disabled={loading}>
                    {t('Forgot Password')}
                </Button>
                <Button onClick={handleClose} color="primary" disabled={loading}>
                    {t('Close')}
                </Button>
            </DialogActions>

            <Dialog open={showForgotPassword} onClose={() => setShowForgotPassword(false)}>
                <DialogTitle>{t('Forgot Password')}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="forgot-email"
                        label={t('Email Address')}
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="primary" variant="contained" onClick={handleForgotPassword}>
                        {t('Send Reset Link')}
                    </Button>
                    <Button onClick={() => setShowForgotPassword(false)} color="primary">
                        {t('Cancel')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={success && !loading}
                autoHideDuration={6000}
                message={t('Login successful!')}
                action={
                    <Button color="secondary" size="small" onClick={() => setSuccess(false)}>
                        {t('Close')}
                    </Button>
                }
            />
        </Dialog>
    );
}

export default Login;