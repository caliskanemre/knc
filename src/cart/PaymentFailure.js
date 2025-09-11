import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SEO from '../shared/SEO';

const PaymentFailure = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ textAlign: 'center', padding: 4 }}>
            <SEO title="Ödeme Başarısız | Kina Sepeti" description="Ödeme işlemi başarısız oldu." robots="noindex,nofollow" />
            <Typography variant="h4" gutterBottom>
                Ödeme Başarısız!
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 2 }}>
                Ödeme sırasında bir sorun oluştu. Lütfen tekrar deneyin.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/')}>
                Ana Sayfaya Dön
            </Button>
        </Box>
    );
};

export default PaymentFailure;
