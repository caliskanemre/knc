// src/shared/HeroSection.js

import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

// mobileImageUrl ve desktopImageUrl prop'larının .webp uzantısız geldiğini varsayalım
// Örn: "https://d2830psw11bu27.cloudfront.net/sade-mobile"
export default function HeroSection({ isMobile, heroTitle, heroSubtitle, mobileImageUrl, desktopImageUrl }) {
    const theme = useTheme();

    // Resimlerin hem webp hem de jpg versiyonlarının olduğunu varsayıyoruz.
    const mobileImageBaseUrl = "https://d2830psw11bu27.cloudfront.net/sade";
    const desktopImageBaseUrl = "https://d2830psw11bu27.cloudfront.net/sade";


    return (
        <Box
            sx={{
                position: 'relative',
                height: { xs: '30vh', md: '50vh' },
                // ... diğer stiller aynı kalacak
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

            {/* İçerik (değişiklik yok) */}
            <Box sx={{ position: 'relative', zIndex: 2 }}>
                {/* ... */}
            </Box>
        </Box>
    );
}
