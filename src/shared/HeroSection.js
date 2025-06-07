import React from 'react';
import { Box, Typography, Button, useTheme, useMediaQuery } from '@mui/material';
// YENİ: Örnek video ve poster (kendi dosyalarınızla değiştirin)
import heroVideo from '../kina-video-2.mp4';
import videoPoster from './../images/kapak2.png'// Video yüklenemezse görünecek resim

export default function HeroSection() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box sx={{ position: 'relative', height: { xs: '30vh', md: '50vh' }, width: '100%', overflow: 'hidden' }}>
            <video
                autoPlay
                loop
                muted
                playsInline
                poster={videoPoster}
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    top: '50%',
                    left: '50%',
                    objectFit: 'cover', // Değişiklik burada: cover -> contain
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1,
                }}
            >
                <source src={heroVideo} type="video/mp4" />
                Tarayıcınız video etiketini desteklemiyor.
            </video>

            {/* YENİ: Karartma Efekti */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Yazının okunabilirliği için
                    zIndex: 2,
                }}
            />

            {/* YENİ: Yazı ve Buton Alanı */}
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
                    gutterBottom
                    sx={{
                        fontFamily: "'Dancing Script', cursive",
                        fontWeight: 700,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                    }}
                >
                    Hayalinizdeki Kına Gecesi
                </Typography>
                <Typography
                    variant={isMobile ? 'body1' : 'h6'}
                    sx={{
                        marginBottom: 4,
                        maxWidth: '600px',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                    }}
                >
                    En özel gününüz için ihtiyacınız olan her şey bir tık uzağınızda.
                </Typography>

            </Box>
        </Box>
    );
}
