// src/components/Footer.js
import React, { useEffect, useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import paymentLogos from './images/logo_band_colored@1X.png'; // yol projene göre değişebilir


export default function Footer() {
    const { t } = useTranslation();
    const rootRef = useRef(null);

    useEffect(() => {
        const updateVar = () => {
            const h = rootRef.current?.offsetHeight || 120;
            if (typeof document !== 'undefined') {
                document.documentElement.style.setProperty('--footer-h', `${h}px`);
                document.body.style.setProperty('--footer-h', `${h}px`);
            }
        };
        updateVar();
        window.addEventListener('resize', updateVar);

        // Dinamik yükseklik değişimleri için ResizeObserver
        let ro;
        if (typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(() => updateVar());
            if (rootRef.current) ro.observe(rootRef.current);
        }
        return () => {
            window.removeEventListener('resize', updateVar);
            if (ro) ro.disconnect();
        };
    }, []);

    return (
        <Box
            ref={rootRef}
            component="footer"
            sx={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                bgcolor: 'background.paper',
                borderTop: '1px solid #eee',
                zIndex: (theme) => theme.zIndex.appBar,
                // Hafif cam efekti
                backdropFilter: 'saturate(180%) blur(8px)'
            }}
        >
            <Box sx={{ p: 6 }}>
                <Typography variant="h6" align="center" gutterBottom>
                    Kına Sepeti
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle1" color="text.secondary" component="p">
                        {t('All rights reserved © 2025 Kına Sepeti')}
                    </Typography>


                    {/* Yerel Visa-Mastercard görseli */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <img
                            src={paymentLogos}
                            alt="Visa, Mastercard, American Express, Troy logos"
                            style={{ height: '32px' }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
