// HeroSection.js
import React from 'react';
import { Box, Typography } from '@mui/material';
import backgroundImage from './../background6.jpg'; // Or any other

export default function HeroSection() {
    return (
        <Box
            sx={{
                width: '100%',
                // Hero height: smaller for mobile, larger for desktop
                height: { xs: '200px', sm: '300px', md: '450px' },
                backgroundImage: `url(${backgroundImage})`,
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
                    bgcolor: 'rgba(0, 0, 0, 0.4)', // translucent black
                    top: 0,
                    left: 0
                }}
            />
            {/* Hero Text */}

        </Box>

    );
}
