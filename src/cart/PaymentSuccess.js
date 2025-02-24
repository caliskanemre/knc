import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const orderId = queryParams.get('order_id'); // ✅ Get order ID from URL

        if (orderId) {
            const interval = setInterval(() => {
                checkPaymentStatus(orderId);
            }, 3000); // Poll every 3 seconds

            return () => clearInterval(interval); // Cleanup on unmount
        } else {
            setPaymentStatus('failed');
            setLoading(false);
        }
    }, [location]);

    const checkPaymentStatus = async (orderId) => {
        try {
            const response = await axios.get(`${baseURL}/api/payment/status`, {
                params: { orderId },
            });

            if (response.data.status === 'completed') {
                setPaymentStatus('completed');
                setTimeout(() => {
                    navigate('/');
                }, 3000); // ✅ Redirect after 3 seconds
            } else if (response.data.status === 'not_found') {
                setPaymentStatus('not_found');
            } else {
                setPaymentStatus('pending');
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
            setPaymentStatus('failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            {loading ? (
                <h2>Ödeme durumu kontrol ediliyor...</h2>
            ) : paymentStatus === 'completed' ? (
                <>
                    <h2>✅ Ödeme Başarılı!</h2>
                    <p>Teşekkürler! Ana sayfaya yönlendiriliyorsunuz...</p>
                </>
            ) : paymentStatus === 'pending' ? (
                <>
                    <h2>⏳ Ödeme onaylanıyor...</h2>
                    <p>Lütfen bekleyin, işlem tamamlanınca yönlendirileceksiniz.</p>
                </>
            ) : paymentStatus === 'not_found' ? (
                <>
                    <h2>⚠ Ödeme bilgisi bulunamadı</h2>
                    <p>Ödemeniz işlenmiyor olabilir.</p>
                </>
            ) : (
                <>
                    <h2>❌ Ödeme Başarısız</h2>
                    <button onClick={() => navigate('/payment')}>Tekrar Dene</button>
                </>
            )}
        </div>
    );
};

export default PaymentSuccess;
