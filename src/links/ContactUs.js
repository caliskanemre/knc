import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button } from '@mui/material';
import Header from "../header/Header";

const ContactUs = () => {
    // Form verisi
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
        // Burada form verisini sunucuya veya e-posta servisine göndermek için gerekli işlemleri yapabilirsiniz.
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
                // Başarılı gönderim için mesaj göstermek vs.
            } else {
                console.error("Failed to send email.");
                // Başarısız gönderim için hata göstermek vs.
            }
        } catch (error) {
            console.error("There was an error sending the email: ", error);
            // Hata mesajı göstermek vs.
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
                        Bize Ulaşın
                    </Typography>
                    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '500px' }}>
                        <TextField
                            name="name"
                            label="İsim"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            required
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <TextField
                            name="email"
                            label="E-posta"
                            type="email"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <TextField
                            name="message"
                            label="Mesajınız"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            required
                            multiline
                            rows={4}
                            value={formData.message}
                            onChange={handleChange}
                        />
                        <Box textAlign='center' marginTop="20px">
                            <Button type="submit" variant="contained" color="primary">
                                Gönder
                            </Button>
                        </Box>
                    </form>

                    {/* Adres Bilgisi ve Google Haritalar iframe */}
                    <Box sx={{ marginTop: '40px', textAlign: 'center' }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                            KNC Kına Organizasyon
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Yukarı Pazarcı Mah. 4005 sok. Fettah Kaya İş Merkezi No. 5/Z01
                            Manavgat / Antalya
                        </Typography>
                        <Box
                            component="iframe"
                            sx={{ width: '100%', maxWidth: 600, height: 300, border: 0 }}
                            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d230.72800106050315!2d31.448723186392876!3d36.78840467823479!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2see!4v1741204055421!5m2!1sen!2see"
                            allowFullScreen=""
                            loading="lazy"
                            title="Firma Konumu"
                        />
                    </Box>

                    <Box sx={{ marginTop: '40px', fontSize: '0.8rem', opacity: 0.8 }}>
                        <Typography variant="body2">
                            © 2025 Kına Sepeti. Tüm hakları saklıdır.
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </div>
    );
};

export default ContactUs;
