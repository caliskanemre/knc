// src/shared/HeroSection.js

import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

// mobileImageUrl ve desktopImageUrl prop'larının .webp uzantısız geldiğini varsayalım
// Örn: "https://d2830psw11bu27.cloudfront.net/sade-mobile"
export default function HeroSection({ isMobile, heroTitle, heroSubtitle, mobileImageUrl, desktopImageUrl }) {
    const theme = useTheme();

    // Resimlerin hem webp hem de jpg versiyonlarının olduğunu varsayıyoruz.
    const mobileImageBaseUrl = "https://d2830psw11bu27.cloudfront.net/sade";
    const desktopImageBaseUrl = "https://d2830psw11bu27.cloudfront.net/small_sade";


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
                    srcSet={`${mobileImageBaseUrl}.webp`} // Varsa .webp uzantılı URL
                    type="image/webp"
                />
                <source
                    media="(max-width: 599px)"
                    srcSet={`${mobileImageBaseUrl}.jpg`} // Varsa .jpg uzantılı URL
                    type="image/jpeg"
                />

                {/* Masaüstü için: Önce WebP'yi dene, desteklemiyorsa JPG'yi kullan */}
                <source
                    media="(min-width: 600px)"
                    srcSet={`${desktopImageBaseUrl}.webp`} // Varsa .webp uzantılı URL
                    type="image/webp"
                />
                <source
                    media="(min-width: 600px)"
                    srcSet={`${desktopImageBaseUrl}.jpg`} // Varsa .jpg uzantılı URL
                    type="image/jpeg"
                />

                {/* En son fallback: Hiçbiri olmazsa veya picture desteklenmiyorsa bunu yükle */}
                <Box
                    component="img"
                    src={`${desktopImageBaseUrl}.jpg`} // En uyumlu formatı fallback yapın
                    alt={heroTitle || "Kına gecesi organizasyonu"}
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

            {/* 3. İÇERİK (YAZI) KATMANI: Resmin üzerinde durması için 'zIndex: 2' olmalı. 'position: relative' olması zIndex'in çalışmasını sağlar. */}
            <Box sx={{
                position: 'relative',
                zIndex: 2  // <- BU ÇOK ÖNEMLİ
            }}>
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
