import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
// Artık resmi buradan import etmiyoruz. CDN'den çekeceğiz.
// import bgImage from './../images/IMG_6719.JPG';

export default function HeroSection() {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const tTitle = t('heroTitle');
    const tSubtitle = t('heroSubtitle');
    const heroTitle = tTitle === 'heroTitle' ? 'Hayalinizdeki Kına Gecesi' : tTitle;
    const heroSubtitle = tSubtitle === 'heroSubtitle' ? 'En özel gününüz için ihtiyacınız olan her şey bir tık uzağınızda.' : tSubtitle;

    // Resmi bir CDN'den (içerik dağıtım ağı) çağırın. Örnek URL:
    const imageUrl = "https://d2830psw11bu27.cloudfront.net/sade.webp";

    return (
        <Box sx={{
            position: 'relative',
            height: { xs: '30vh', md: '50vh' },
            width: '100%',
            overflow: 'hidden',
            // Arkaplan resmini Box stilinden kaldırıyoruz.
        }}>
            {/* PERFORMANS İÇİN KRİTİK DEĞİŞİKLİK */}
            <img
                src={imageUrl}
                alt="Kına gecesi organizasyonu"
                // Bu nitelik, tarayıcıya bu resmin çok önemli olduğunu ve hemen indirmesi gerektiğini söyler.
                fetchpriority="high"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover', // background-size: cover ile aynı etkiyi yaratır.
                    zIndex: 1, // Yazıların ve karartma efektinin arkasında kalacak.
                }}
            />

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
