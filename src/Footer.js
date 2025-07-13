// src/components/Footer.js
import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import paymentLogos from './images/logo_band_colored@1X.png'; // yol projene göre değişebilir


export default function Footer() {
    const { t } = useTranslation();

    return (
        <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">
            <Typography variant="h6" align="center" gutterBottom>
                Kına Sepeti
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" color="text.secondary" component="p">
                    {t('All rights reserved © 2025 Kına Sepeti')}
                </Typography>
                <IconButton
                    aria-label="Instagram"
                    href="https://www.instagram.com/knc_kina_organizasyon"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: 'text.secondary' }}
                >
                    {/* Instagram SVG (kodu burada olduğu gibi koruyabilirsiniz) */}
                    {/* ... */}
                </IconButton>

                {/* Yerel Visa-Mastercard görseli */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src= {paymentLogos}
                        alt="Visa, Mastercard, American Express, Troy logos"
                        style={{ height: '32px' }}
                    />
                </Box>
            </Box>
        </Box>
    );
}
