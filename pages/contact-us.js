import React, { useState } from 'react';
import Head from 'next/head';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';

export default function ContactUsPage() {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept-Language': i18n.language === 'en' ? 'en' : 'tr' },
        body: JSON.stringify(formData)
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <>
      <Head>
        <title>{t('contact_us.title')} | Kınasepeti</title>
        <meta name="description" content={t('contact_us.description') || 'Kınasepeti ile iletişime geçin. Sorularınız için bize ulaşın.'} />

        {/* Open Graph meta tags */}
        <meta property="og:site_name" content="Kınasepeti" />
        <meta property="og:title" content={`${t('contact_us.title')} | Kınasepeti`} />
        <meta property="og:description" content={t('contact_us.description') || 'Kınasepeti ile iletişime geçin.'} />
        <meta property="og:type" content="website" />
      </Head>
      <main>
        <Container sx={{ py: 6 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('contact_us.title')}
          </Typography>
          <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 520 }}>
            <TextField name="name" label={t('Name')} value={formData.name} onChange={onChange} fullWidth required margin="normal" />
            <TextField name="email" type="email" label={t('Email')} value={formData.email} onChange={onChange} fullWidth required margin="normal" />
            <TextField name="message" label={t('Your Message')} value={formData.message} onChange={onChange} fullWidth required margin="normal" multiline rows={4} />
            <Box sx={{ mt: 2 }}>
              <Button type="submit" variant="contained">{t('Send')}</Button>
            </Box>
            {status === 'success' && (
              <Typography color="success.main" sx={{ mt: 2 }}>{t('Message sent successfully', 'Mesaj başarıyla gönderildi')}</Typography>
            )}
            {status === 'error' && (
              <Typography color="error.main" sx={{ mt: 2 }}>{t('There was an error sending the message', 'Mesaj gönderilirken hata oluştu')}</Typography>
            )}
          </Box>

          <Box sx={{ mt: 5 }}>
            <Typography variant="h6" gutterBottom>{t('company_name')}</Typography>
            <Typography variant="body1" gutterBottom>{t('Phone')}: +90 534 829 08 66</Typography>
            <Typography variant="body1" gutterBottom>
              Yukarı Pazarcı Mah. 4005 sok. Fettah Kaya İş Merkezi No. 5/Z01, Manavgat / Antalya
            </Typography>
            <Box component="iframe" sx={{ width: '100%', maxWidth: 600, height: 300, border: 0 }}
                 src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d230.72800106050315!2d31.448723186392876!3d36.78840467823479!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2see!4v1741204055421!5m2!1sen!2see"
                 allowFullScreen="" loading="lazy" title={t('Company Location')} />
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="body2">© {currentYear} Kınasepeti. {t('All rights reserved.')}</Typography>
          </Box>
        </Container>
      </main>
    </>
  );
}
