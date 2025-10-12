// src/components/Footer.js
import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

export default function Footer() {
    const { t } = useTranslation();

    return (
        <Box
            component="footer"
            sx={{
                width: '100%',
                bgcolor: 'background.paper',
                borderTop: '1px solid #eee',
            }}
       >
            <Box sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 2, sm: 3 } }}>
                <Typography variant="body2" align="center" gutterBottom sx={{ fontWeight: 600 }}>
                    Kına Sepeti
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.secondary" component="p">
                        {t('All rights reserved © 2025 Kına Sepeti')}
                    </Typography>

                    {/* Visa-Mastercard görseli - public klasöründen */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Image
                            src="/logo_band_colored@1X.png"
                            alt="Visa, Mastercard, American Express, Troy logos"
                            width={120}
                            height={18}
                            style={{ height: '18px', width: 'auto' }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
