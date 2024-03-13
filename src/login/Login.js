import React, {useState} from 'react';
import axios from 'axios';
import {Button, Dialog, DialogContent, DialogTitle, Snackbar, TextField} from '@mui/material';
import {useAuth} from "../auth/AuthProvider";
import {jwtDecode} from "jwt-decode";

function Login({open, handleClose, onLoginSuccess}) {
    const { setUsername, setToken } = useAuth();
    const [localUsername, setLocalUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${baseURL}/auth/login`, {username: localUsername, password});
            if (response.data && response.data.accessToken) {
                const { accessToken } = response.data;
                localStorage.setItem('token', accessToken);

                const decodedToken = jwtDecode(accessToken);
                const username = decodedToken.sub;

                onLoginSuccess(response.data); // Handle login success
                setUsername(username); // Update parent component's username state
                handleClose(); // Close the login dialog
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

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSuccess(false);
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
                    <Button type="submit" color="primary" variant="contained" fullWidth style={{marginTop: '20px'}}>
                        Login
                    </Button>
                    {error && <p style={{color: 'red', marginTop: '10px'}}>{error}</p>}
                </form>
            </DialogContent>
            <Snackbar
                open={success}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message="Login successful!"
                action={
                    <Button color="secondary" size="small" onClick={handleSnackbarClose}>
                        Close
                    </Button>
                }
            />
        </Dialog>
    );
}

export default Login;
