import React, {useEffect, useState} from 'react';
import {Box, Button, Typography} from '@mui/material';
import {useLocation, useNavigate} from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const [isLoading, setIsLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const paymentId = queryParams.get('payment_id'); // Extract payment ID from URL

        if (paymentId) {
            checkPaymentStatus(paymentId); // Verify payment status with backend
        } else {
            setPaymentStatus('failed'); // If no payment ID, mark as failed
            setIsLoading(false);
        }
    }, [location]);

    const checkPaymentStatus = async (paymentId) => {
        try {
            const response = await axios.get(`${baseURL}/api/orders/status`, {
                params: { paymentId },
            });

            if (response.data.status === 'completed') {
                setPaymentStatus('completed');
                setTimeout(() => {
                    navigate('/');
                }, 3000); // ✅ Redirect after 3 seconds
            } else {
                setPaymentStatus('failed');
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
            setPaymentStatus('failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ textAlign: 'center', padding: 4 }}>
                <Typography variant="h6">Ödeme durumu kontrol ediliyor...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ textAlign: 'center', padding: 4 }}>
            {paymentStatus === 'completed' ? (
                <>
                    <Typography variant="h4">Ödeme Başarılı!</Typography>
                    <Typography>Alışverişiniz için teşekkür ederiz.</Typography>
                    <Button variant="contained" onClick={() => navigate('/')}>
                        Ana Sayfaya Dön
                    </Button>
                </>
            ) : (
                <>
                    <Typography variant="h4">Ödeme Başarısız</Typography>
                    <Typography>Ödeme sırasında bir sorun oluştu. Lütfen tekrar deneyin.</Typography>
                    <Button variant="contained" onClick={() => navigate('/payment')}>
                        Tekrar Dene
                    </Button>
                </>
            )}
        </Box>
    );
};

export default PaymentSuccess;
