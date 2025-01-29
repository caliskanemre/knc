import React, { useState } from 'react';
import axios from 'axios';
import { Button, Dialog, DialogContent, DialogTitle, Snackbar, TextField } from '@mui/material';
import { useAuth } from "../auth/AuthProvider";
import { jwtDecode } from "jwt-decode";
import DialogActions from "@mui/material/DialogActions";

function Login({ open, handleClose, onLoginSuccess, handleOpenRegisterDialog }) {
    const { setUsername } = useAuth();
    const [localUsername, setLocalUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const [success, setSuccess] = useState(false);
    const [email, setEmail] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${baseURL}/auth/login`, { username: localUsername, password });
            if (response.data && response.data.accessToken) {
                const { accessToken } = response.data;
                localStorage.setItem('token', accessToken);

                const decodedToken = jwtDecode(accessToken);
                const username = decodedToken.sub;

                onLoginSuccess(response.data);
                setUsername(username);
                handleClose();
                setError('');
                setSuccess(true);
            } else {
                setError('Failed to login - No data received');
            }
        } catch (error) {
            console.error('Login error:', error.response || error.message);
            setError('Failed to login');
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Login</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="username"
                        label="Username"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={localUsername}
                        onChange={(e) => setLocalUsername(e.target.value)}
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
                    <Button type="submit" color="primary" variant="contained" fullWidth style={{ marginTop: '20px' }}>
                        Giriş Yap
                    </Button>
                    <p style={{ textAlign: 'center', marginTop: '10px' }}>Üye değil misiniz?</p>
                    <Button
                        color="primary"
                        variant="contained"
                        fullWidth
                        onClick={() => {
                            handleClose(); // Giriş ekranını kapat
                            handleOpenRegisterDialog(); // Üye Ol ekranını aç
                        }}
                    >
                        üye ol
                    </Button>
                    {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                </form>
            </DialogContent>

            <DialogActions>
                <Button color="primary" onClick={() => setShowForgotPassword(true)}>
                    Forgot Password?
                </Button>
                <Button onClick={handleClose} color="primary">
                    Close
                </Button>

            </DialogActions>

            {/* Forgot Password Dialog */}
            <Dialog open={showForgotPassword} onClose={() => setShowForgotPassword(false)}>
                <DialogTitle>Forgot Password</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="email"
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color="primary" variant="contained">
                        Send Reset Link
                    </Button>
                    <Button onClick={() => setShowForgotPassword(false)} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={success}
                autoHideDuration={6000}
                message="Login successful!"
                action={
                    <Button color="secondary" size="small" onClick={() => setSuccess(false)}>
                        Close
                    </Button>
                }
            />
        </Dialog>
    );
}

export default Login;
