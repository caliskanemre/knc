import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const tTitle = t('heroTitle');
    const tSubtitle = t('heroSubtitle');
    const heroTitle = tTitle === 'heroTitle' ? 'Hayalinizdeki Kına Gecesi' : tTitle;

    // Responsive görsel URL'leri - farklı boyutlarda optimize edilmiş versiyonlar
    const mobileImageUrl = "https://d2830psw11bu27.cloudfront.net/small_sade.webp"; // small/mobile
    const desktopImageUrl = "https://d2830psw11bu27.cloudfront.net/sade.webp"; // large/desktop
    const currentImageUrl = isMobile ? mobileImageUrl : desktopImageUrl;

    // Yalnız seçilen varyantı preload et (mobilde desktop israfı yok)
    useEffect(() => {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.href = currentImageUrl;
        preloadLink.fetchPriority = 'high';
        document.head.appendChild(preloadLink);

        const img = new Image();
        const handleLoad = () => {
            setImageLoaded(true);
            setImageError(false);
        };
        const handleError = () => {
            setImageError(true);
            setImageLoaded(true);
        };
        img.addEventListener('load', handleLoad);
        img.addEventListener('error', handleError);
        img.src = currentImageUrl;
        img.decoding = 'async';
        img.fetchPriority = 'high';

        return () => {
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
            try { document.head.removeChild(preloadLink); } catch(_) {}
        };
    }, [currentImageUrl]);

    // Aggressive fallback - 1.5 saniye sonra zorla göster
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!imageLoaded) {
                console.log('Hero image timeout, forcing display');
                setImageLoaded(true);
            }
        }, 1500);

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
                backgroundColor: '#C84B31', // Brand color fallback
            }}
        >
            {/* Arka plan: mobilde sadece küçük görsel kullanılacak */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: imageLoaded ? `url(${currentImageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: imageLoaded ? 1 : 0,
                    transition: 'opacity 0.45s ease',
                    zIndex: 1,
                }}
            />

            {/* Loading placeholder - Enhanced */}
            {!imageLoaded && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#C84B31',
                        backgroundImage: `
                            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)
                        `,
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            border: '3px solid rgba(255,255,255,0.3)',
                            borderTop: '3px solid white',
                            animation: 'spin 1s linear infinite',
                            '@keyframes spin': {
                                '0%': { transform: 'rotate(0deg)' },
                                '100%': { transform: 'rotate(360deg)' }
                            }
                        }}
                    />
                </Box>
            )}

            {/* Error state */}
            {imageError && imageLoaded && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#C84B31',
                        backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%)',
                        backgroundSize: '20px 20px',
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
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                        opacity: imageLoaded ? 1 : 0.9,
                        transition: 'opacity 0.3s ease-in-out',
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
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                        opacity: imageLoaded ? 1 : 0.9,
                        transition: 'opacity 0.3s ease-in-out',
                    }}
                >
                    {tSubtitle}
                </Typography>
            </Box>
        </Box>
    );
}
