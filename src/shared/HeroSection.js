import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import bgImage from './../images/IMG_6719.JPG';

export default function HeroSection() {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Çeviri hazır değilse key yerine fallback metin göster
    const tTitle = t('heroTitle');
    const tSubtitle = t('heroSubtitle');
    const heroTitle = tTitle === 'heroTitle' ? 'Hayalinizdeki Kına Gecesi' : tTitle;
    const heroSubtitle = tSubtitle === 'heroSubtitle' ? 'En özel gününüz için ihtiyacınız olan her şey bir tık uzağınızda.' : tSubtitle;

    return (
        <Box sx={{
            position: 'relative',
            height: { xs: '30vh', md: '50vh' },
            width: '100%',
            overflow: 'hidden',
            backgroundImage: `url(${bgImage || ''})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}>
            {/* Karartma Efekti */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    zIndex: 2,
                }}
            />

            {/* Yazı ve Buton Alanı */}
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    color: 'white',
                    padding: theme.spacing(2),
                }}
            >
                <Typography
                    variant={isMobile ? 'h4' : 'h2'}
                    component="h1"
                    color="white"
                    gutterBottom
                    sx={{
                        fontFamily: "'Dancing Script', cursive",
                        fontWeight: 700,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                    }}
                >
                    {heroTitle}
                </Typography>
                <Typography
                    color="white"
                    variant={isMobile ? 'body1' : 'h6'}
                    sx={{
                        marginBottom: 4,
                        maxWidth: '600px',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                    }}
                >
                    {heroSubtitle}
                </Typography>
            </Box>
        </Box>
    );
}
