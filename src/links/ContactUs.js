import React, {useState} from 'react';
import { Container, Typography, Box, TextField, Button } from '@mui/material';
import Header from "../header/Header";

const ContactUs = () => {
    // Add form submission logic here
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        // Logic to send form data to the server or email service

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log("Email sent successfully!");
                // Handle successful email sending (e.g., showing a success message)
            } else {
                console.error("Failed to send email.");
                // Handle failure (e.g., showing an error message)
            }
        } catch (error) {
            console.error("There was an error sending the email: ", error);
            // Handle error (e.g., showing an error message)
        }
    };


    return (
        <div>
            <Header />
            <Container>
                <Box sx={{
                    marginTop: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Contact Us
                    </Typography>
                    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '500px' }}>
                        <TextField
                            label="Name"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Email"
                            type="email"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Message"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            required
                            multiline
                            rows={4}
                        />
                        <Box textAlign='center' marginTop="20px">
                            <Button type="submit" variant="contained" color="primary">
                                Send Message
                            </Button>
                        </Box>
                    </form>
                    <Box sx={{ marginTop: '40px', fontSize: '0.8rem', opacity: 0.8 }}>
                        <Typography variant="body2">
                            © 2025 Kına Sepeti. All rights reserved.
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </div>
    );
};

export default ContactUs;
