import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button } from '@mui/material';
import Header from "../header/Header";
import SEO from '../shared/SEO';
import { useTranslation } from 'react-i18next';

const ContactUs = () => {
    const { t, i18n } = useTranslation();
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
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': i18n.language === 'en' ? 'en' : 'tr'
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log("Email sent successfully!");
            } else {
                console.error("Failed to send email.");
            }
        } catch (error) {
            console.error("There was an error sending the email: ", error);
        }
    };

    const currentYear = new Date().getFullYear();

    return (
        <div>
            <SEO
                title={`${t('contact_us.title')} | Kina Sepeti`}
                description={t('contact_us.description')}
                type="website"
                structuredData={{
                  '@context': 'https://schema.org',
                  '@type': 'LocalBusiness',
                  name: 'Kina Sepeti',
                  image: 'https://www.kinasepeti.com/ksLogo.jpeg',
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: 'Yukarı Pazarcı Mah. 4005 sok. Fettah Kaya İş Merkezi No. 5/Z01',
                    addressLocality: 'Manavgat',
                    addressRegion: 'Antalya',
                    addressCountry: 'TR'
                  },
                  telephone: '+905348290866',
                  url: 'https://www.kinasepeti.com'
                }}
            />
            <Header />
            <Container>
                <Box sx={{
                    marginTop: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {t('contact_us.title')}
                    </Typography>
                    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '500px' }}>
                        <TextField
                            name="name"
                            label={t('Name')}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            required
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <TextField
                            name="email"
                            label={t('Email')}
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
                            label={t('Your Message')}
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
                                {t('Send')}
                            </Button>
                        </Box>
                    </form>

                    {/* Adres Bilgisi ve Google Haritalar iframe */}
                    <Box sx={{ marginTop: '40px', textAlign: 'center' }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                            {t('company_name')}
                        </Typography>
                        <Typography variant="body1"  gutterBottom>
                            {t('Phone')}:  +90 534 829 08 66
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
                            title={t('Company Location')}
                        />
                    </Box>

                    <Box sx={{ marginTop: '40px', fontSize: '0.8rem', opacity: 0.8 }}>
                        <Typography variant="body2">
                            © {currentYear} Kina Sepeti. {t('All rights reserved.')}
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </div>
    );
};

export default ContactUs;
