import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {TextField, Button, Snackbar, Box} from '@mui/material';
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function ResetPassword() {
    const query = useQuery();
    const navigate = useNavigate();  // Using useNavigate instead of useHistory
    const token = query.get("token");
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const response = await axios.post(`${baseURL}/auth/reset-password`, { token, newPassword });
            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => navigate('/'), 6000); // Redirect to login after a delay using navigate
            } else {
                setError(response.data.message || "Failed to reset password");
            }
        } catch (error) {
            setError(error.response?.data?.message || "Failed to reset password");
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Reset Your Password
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth  // Ensures the text field takes the full width of its container
                        id="new-password"
                        label="New Password"
                        name="newPassword"
                        autoComplete="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        sx={{ mb: 2 }}  // Adds bottom margin for spacing
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth  // Ensures the text field takes the full width of its container
                        id="confirm-new-password"
                        label="Confirm New Password"
                        name="confirmNewPassword"
                        autoComplete="new-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        sx={{ mb: 2 }}  // Adds bottom margin for spacing
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Reset Password
                    </Button>
                    {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
                </Box>
            </Box>
            <Snackbar
                open={success}
                autoHideDuration={6000}
                message="Password reset successfully. You will be redirected to login."
            />
        </Container>
    );
}

export default ResetPassword;
