import React from 'react';
import Image from 'next/image';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const tTitle = t('heroTitle');
    const tSubtitle = t('heroSubtitle');
    const heroTitle = tTitle === 'heroTitle' ? 'Hayalinizdeki Kına Gecesi' : tTitle;
    const heroSubtitle = tSubtitle === 'heroSubtitle' ? 'En özel gününüz için ihtiyacınız olan her şey bir tık uzağınızda.' : tSubtitle;

    const imageUrl = 'https://d2830psw11bu27.cloudfront.net/sade.webp';

    return (
        <Box sx={{ position: 'relative', height: { xs: '30vh', md: '50vh' }, width: '100%', overflow: 'hidden' }}>
            <Image
                src={imageUrl}
                alt="Kına gecesi organizasyonu"
                fill
                priority
                sizes="(max-width: 600px) 100vw, 100vw"
                style={{ objectFit: 'cover', zIndex: 1 }}
              />

            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 2 }} />

            <Box sx={{ position: 'relative', zIndex: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: 'white', p: 2 }}>
                <Typography variant={isMobile ? 'h4' : 'h2'} component="h1" color="white" gutterBottom sx={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
                    {heroTitle}
                </Typography>
                <Typography color="white" variant={isMobile ? 'body1' : 'h6'} sx={{ mb: 4, maxWidth: '600px', textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
                    {heroSubtitle}
                </Typography>
            </Box>
        </Box>
    );
}
