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

function Register({ open, handleClose }) {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [rePassword, setRePassword] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false); // 🔄 NEW: Track loading state

    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== rePassword) {
            setError(t('Passwords do not match'));
            return;
        }

        setLoading(true); // 🔄 Show spinner when starting registration

        try {
            await axios.post(`${baseURL}/auth/register`, { email, password });

            if (window.gtag) {
                window.gtag('event', 'conversion', {
                    'send_to': 'AW-854444729/AzNyCLCa4JMZELmVt5cD'
                });
            }

            setSuccess(true);
            setError('');
            setPassword('');
            setRePassword('');
            setEmail('');
        } catch (error) {
            setError(t('Failed to register'));
            setSuccess(false);
        } finally {
            setLoading(false); // 🔄 Hide spinner after request is done
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
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
                    label="E-mail"
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
                    required
                    onChange={(e) => setPassword(e.target.value)}
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
                message={t("Registration successful!")}
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
