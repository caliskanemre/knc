// src/shared/HeroSection.js

import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

// 🚀 REFAKTÖR: Bileşen artık client-side logic içermiyor. Sadece aldığı prop'ları gösteriyor.
export default function HeroSection({ isMobile, heroTitle, heroSubtitle, mobileImageUrl, desktopImageUrl }) {
    const theme = useTheme();

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
                {/* Mobil için: Önce WebP'yi dene, desteklemiyorsa JPG'yi kullan */}
                <source
                    media="(max-width: 599px)"
                    srcSet={mobileImageUrl}
                    type="image/webp"
                />
                <source
                    media="(min-width: 600px)"
                    srcSet={desktopImageUrl}
                    type="image/webp"
                />
                <Box
                    component="img"
                    src={desktopImageUrl} // Fallback için masaüstü versiyonu
                    alt={heroTitle || "Kına gecesi organizasyonu"}
                    // Bu prop'lar tarayıcıya en öncelikli olarak bu resmi indirmesini söyler
                    fetchPriority="high"
                    loading="eager"
                    decoding="async"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            </Box>

            {/* İçerik */}
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
                    {heroSubtitle}
                </Typography>
            </Box>
        </Box>
    );
}
