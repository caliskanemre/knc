// HeroSection.js
import React from 'react';
import { Box, useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import backgroundImageDesktop from '../background6.jpg'; // Desktop image
import backgroundImageMobile from './../images/kapak2.png'; // Mobile image

export default function HeroSection() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detect mobile screen

    return (
        <Box
            sx={{
                width: '100%',
                // Hero height: smaller for mobile, larger for desktop
                height: { xs: '200px', sm: '300px', md: '450px' },
                backgroundImage: `url(${isMobile ? backgroundImageMobile : backgroundImageDesktop})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                // Optional: overlay to darken or colorize the image
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {/* OPTIONAL Overlay */}
            <Box
                sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0
                }}
            />
            {/* Hero Text */}

        </Box>

    );
}
