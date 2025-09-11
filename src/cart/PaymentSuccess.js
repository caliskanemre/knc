import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Confetti from 'react-confetti';

// 2. Import the useWindowSize hook from react-use
import { useWindowSize } from 'react-use';
import SEO from '../shared/SEO';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

  // 3. Get the current window size (this automatically updates on resize)
  const { width, height } = useWindowSize();

  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [orderId, setOrderId] = useState(null);
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    fetchLatestOrderId();
  }, []);

  useEffect(() => {
    if (orderId) {
      const interval = setInterval(() => {
        checkPaymentStatus(orderId);
      }, 3000);

      const timeout = setTimeout(() => {
        setTimeoutReached(true);
        clearInterval(interval);
        setLoading(false);
      }, 30000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [orderId]);

  const fetchLatestOrderId = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/payment/latest-order`);
      if (response.data.orderId) {
        setOrderId(response.data.orderId);
      } else {
        setPaymentStatus('failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching order ID:', error);
      setPaymentStatus('failed');
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (orderId) => {
    try {
      const response = await axios.get(`${baseURL}/api/payment/status`, {
        params: { orderId },
      });

      const status = response.data.status;
      console.log('Payment status:', status); // Debug log
      setPaymentStatus(status);

      if (status === 'completed') {
        setLoading(false);
        console.log('Confetti should show now'); // Debug log
        setTimeout(() => {
          navigate('/');
        }, 5000);
      } else if (status === 'failed') {
        setLoading(false);
      } else {
        console.log(`Payment status is "${status}", will keep checking...`);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus('failed');
      setLoading(false);
    }
  };

  console.log('Window size:', { width, height }); // Debug log

  return (
    <div style={{ textAlign: 'center', padding: '20px', position: 'relative' }}>
      <SEO title="Ödeme Başarılı | Kina Sepeti" description="Ödeme işlemi başarıyla tamamlandı." robots="noindex,nofollow" />
      {paymentStatus === 'completed' && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={300}
          recycle={false} // Let it run once
        />
      )}

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
