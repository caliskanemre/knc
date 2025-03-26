import React, { useState } from 'react';
import axios from 'axios';
import { Button, Dialog, DialogContent, DialogTitle, Snackbar, TextField } from '@mui/material';
import { useAuth } from "../auth/AuthProvider";
import { jwtDecode } from "jwt-decode";
import DialogActions from "@mui/material/DialogActions";
import { useTranslation } from "react-i18next";
import { ClipLoader } from 'react-spinners'; // Import a spinner

function Login({ open, handleClose, onLoginSuccess, handleOpenRegisterDialog }) {
    const { setUsername } = useAuth();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [loading, setLoading] = useState(false); // Add loading state
    const { t } = useTranslation();

    const handleForgotPassword = async () => {
        try {
            const response = await axios.post(`${baseURL}/auth/forgot-password`, { email });
            console.log("Forgot password response:", response.data);
            setShowForgotPassword(false);
        } catch (error) {
            console.error("Forgot password error:", error.response || error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Show spinner
        try {
            const response = await axios.post(`${baseURL}/auth/login`, { email, password }); // Changed to use email
            if (response.data && response.data.accessToken) {
                const { accessToken } = response.data;
                localStorage.setItem('token', accessToken);

                const decodedToken = jwtDecode(accessToken);
                const userEmail = decodedToken.sub; // Extract email instead of username

                onLoginSuccess(response.data);
                setUsername(userEmail);
                setError('');
                setSuccess(true);

                // Simulate a delay to show the animation, then close
                setTimeout(() => {
                    setLoading(false);
                    handleClose();
                }, 1000); // 1-second delay for animation
            } else {
                setError('Failed to login - No data received');
                setLoading(false);
            }
        } catch (error) {
            console.error('Login error:', error.response || error.message);
            setError('Failed to login');
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>{t("Login")}</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="email"
                        label="Email"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        id="password"
                        label="Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        color="primary"
                        variant="contained"
                        fullWidth
                        style={{ marginTop: '20px' }}
                        disabled={loading} // Disable button while loading
                    >
                        {loading ? <ClipLoader size={20} color="#fff" /> : t("Login")}
                    </Button>
                    <p style={{ textAlign: 'center', marginTop: '10px' }}>{t("Not a member yet?")}</p>
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
                        {t("Sign Up")}
                    </Button>
                    {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                </form>
            </DialogContent>

            <DialogActions>
                <Button color="primary" onClick={() => setShowForgotPassword(true)} disabled={loading}>
                    {t("Forgot Password")}
                </Button>
                <Button onClick={handleClose} color="primary" disabled={loading}>
                    {t("Close")}
                </Button>
            </DialogActions>

            {/* Forgot Password Dialog */}
            <Dialog open={showForgotPassword} onClose={() => setShowForgotPassword(false)}>
                <DialogTitle>{t("Forgot Password")}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="forgot-email"
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="primary" variant="contained" onClick={handleForgotPassword}>
                        {t("Send Reset Link")}
                    </Button>
                    <Button onClick={() => setShowForgotPassword(false)} color="primary">
                        {t("Cancel")}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={success && !loading} // Only show when loading is done
                autoHideDuration={6000}
                message={t("Login successful!")}
                action={
                    <Button color="secondary" size="small" onClick={() => setSuccess(false)}>
                        {t("Close")}
                    </Button>
                }
            />
        </Dialog>
    );
}

export default Login;
