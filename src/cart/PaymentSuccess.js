import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [timeoutReached, setTimeoutReached] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const orderId = queryParams.get('orderId'); // Ensure this matches what Revolut sends

        if (!orderId) {
            setPaymentStatus('failed');
            setLoading(false);
            return;
        }

        const interval = setInterval(() => {
            checkPaymentStatus(orderId);
        }, 3000); // Poll every 3 seconds

        // Set a timeout to stop polling after 30 seconds
        const timeout = setTimeout(() => {
            setTimeoutReached(true);
            clearInterval(interval);
            setLoading(false);
        }, 30000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [location]);

    const checkPaymentStatus = async (orderId) => {
        try {
            const response = await axios.get(`${baseURL}/api/payment/status`, {
                params: { orderId },
            });

            const status = response.data.status;
            setPaymentStatus(status);

            if (status === 'completed') {
                setLoading(false);
                setTimeout(() => {
                    navigate('/');
                }, 3000); // Redirect after 3 seconds
            } else if (status === 'failed') {
                setLoading(false);
            } else {
                // Keep polling for 'pending' or 'not_found'
                console.log(`Payment status still ${status}, continuing to poll...`);
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
            setPaymentStatus('failed');
            setLoading(false);
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            {loading ? (
                <h2>⏳ Ödeme durumu kontrol ediliyor...</h2>
            ) : paymentStatus === 'completed' ? (
                <>
                    <h2>✅ Ödeme Başarılı!</h2>
                    <p>Teşekkürler! Ana sayfaya yönlendiriliyorsunuz...</p>
                </>
            ) : paymentStatus === 'failed' || timeoutReached ? (
                <>
                    <h2>❌ Ödeme Başarısız</h2>
                    <p>Ödeme onaylanamadı. Lütfen tekrar deneyin.</p>
                    <button onClick={() => navigate('/payment')}>Tekrar Dene</button>
                </>
            ) : (
                <>
                    <h2>⏳ Ödeme onaylanıyor...</h2>
                    <p>Lütfen bekleyin, işlem tamamlanıyor...</p>
                </>
            )}
        </div>
    );
};

export default PaymentSuccess;
