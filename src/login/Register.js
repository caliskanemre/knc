import React, {useState} from 'react';
import axios from 'axios';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar,
    TextField
} from '@mui/material';

function Register({open, handleClose}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [rePassword, setRePassword] = useState('');
    const [success, setSuccess] = useState(false);
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== rePassword) {
            setError('Passwords do not match');
            return; // Stop the form submission
        }

        try {
            await axios.post(`${baseURL}/auth/register`, {username, password, email});
            setSuccess(true);
            setError('');
            setUsername('');
            setPassword('');
            setRePassword('');
            setEmail('');
            setError('');
            // Optionally, inform the user of successful registration
        } catch (error) {
            setError('Failed to register');
            setSuccess(false);
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSuccess(false); // Reset success status
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Register</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    To register, please enter your username and password.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="username"
                    label="Username"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                <TextField
                    margin="dense"
                    id="re-password"
                    label="Confirm Password"
                    type="password"
                    fullWidth
                    variant="outlined"
                    value={rePassword}
                    onChange={(e) => setRePassword(e.target.value)}
                />
                <TextField
                    margin="dense"
                    id="email"
                    label="e-mail"
                    type="email"
                    fullWidth
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {error && <p style={{color: 'red'}}>{error}</p>}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSubmit}>Register</Button>
            </DialogActions>
            <Snackbar
                open={success}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message="Registration successful!"
                action={
                    <Button color="secondary" size="small" onClick={handleSnackbarClose}>
                        Close
                    </Button>
                }
            />
        </Dialog>
    );
}

export default Register