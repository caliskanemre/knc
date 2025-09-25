import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [imageLoaded, setImageLoaded] = useState(false);

    const tTitle = t('heroTitle');
    const tSubtitle = t('heroSubtitle');
    const heroTitle = tTitle === 'heroTitle' ? 'Hayalinizdeki Kına Gecesi' : tTitle;

    // Responsive görsel URL'leri - farklı boyutlarda optimize edilmiş versiyonlar
    const mobileImageUrl = "https://d2830psw11bu27.cloudfront.net/sade-mobile.webp";
    const desktopImageUrl = "https://d2830psw11bu27.cloudfront.net/sade.webp";

    // Critical resources preload için React.useEffect kullan
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = isMobile ? mobileImageUrl : desktopImageUrl;
        link.fetchPriority = 'high';
        document.head.appendChild(link);

        // Görselin zaten yüklenmiş olup olmadığını kontrol et
        const img = new Image();
        img.onload = () => setImageLoaded(true);
        img.onerror = () => setImageLoaded(true); // Hata durumunda da göster
        img.src = isMobile ? mobileImageUrl : desktopImageUrl;

        return () => {
            // Cleanup - sadece hala document.head'de varsa kaldır
            if (document.head.contains(link)) {
                document.head.removeChild(link);
            }
        };
    }, [isMobile, mobileImageUrl, desktopImageUrl]);

    // Timeout ile fallback - eğer 2 saniye içinde yüklenmezse göster
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!imageLoaded) {
                setImageLoaded(true);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [imageLoaded]);

    return (
        <Box
            sx={{
                position: 'relative',
                height: { xs: '30vh', md: '50vh' },
                width: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                color: 'white',
                padding: theme.spacing(2),
                backgroundColor: '#f0f0f0',
            }}
        >
            {/* LCP PERFORMANS OPTİMİZASYONU - Picture element */}
            <Box
                component="picture"
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1,
                }}
            >
                <Box
                    component="source"
                    media="(max-width: 599px)"
                    srcSet={mobileImageUrl}
                    type="image/webp"
                />
                <Box
                    component="source"
                    media="(min-width: 600px)"
                    srcSet={desktopImageUrl}
                    type="image/webp"
                />
                <Box
                    component="img"
                    src={isMobile ? mobileImageUrl : desktopImageUrl}
                    alt="Kına gecesi organizasyonu"
                    fetchpriority="high"
                    loading="eager"
                    decoding="async"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: imageLoaded ? 1 : 0,
                        transition: 'opacity 0.3s ease-in-out',
                    }}
                    onLoad={() => {
                        setImageLoaded(true);
                    }}
                    onError={() => {
                        setImageLoaded(true); // Hata durumunda da göster
                    }}
                />
            </Box>

            {/* Loading placeholder */}
            {!imageLoaded && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#C84B31',
                        backgroundImage: 'linear-gradient(45deg, #C84B31 25%, transparent 25%), linear-gradient(-45deg, #C84B31 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #C84B31 75%), linear-gradient(-45deg, transparent 75%, #C84B31 75%)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                        opacity: 0.1,
                        zIndex: 1,
                    }}
                />
            )}

            {/* Content overlay */}
            <Box sx={{ position: 'relative', zIndex: 2 }}>
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
                    {tSubtitle}
                </Typography>
            </Box>
        </Box>
    );
}
