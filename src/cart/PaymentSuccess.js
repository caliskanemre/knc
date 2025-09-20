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

  // YENİ: Sipariş detaylarını ve etiket gönderim durumunu tutmak için state'ler
  const [orderDetails, setOrderDetails] = useState(null);
  const [conversionSent, setConversionSent] = useState(false); // Etiketin tekrar tekrar gönderilmesini engeller

  // DEĞİŞTİ: Artık sadece orderId değil, tüm sipariş detaylarını bekliyoruz.
  useEffect(() => {
    const fetchLatestOrderDetails = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/payment/latest-order`);
        if (response.data && response.data.orderId) {
          setOrderDetails(response.data); // Gelen tüm veriyi state'e ata
        } else {
          setPaymentStatus('failed');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setPaymentStatus('failed');
        setLoading(false);
      }
    };
    fetchLatestOrderDetails();
  }, []); // Sadece ilk render'da çalışır

  // DEĞİŞTİ: Ödeme durumu kontrolü ve dönüşüm etiketini tetikleme
  useEffect(() => {
    // Sadece sipariş detayları geldiyse devam et
    if (!orderDetails) {
      return;
    }

    const interval = setInterval(() => {
      checkPaymentStatus(orderDetails.orderId);
    }, 3000);

    const timeout = setTimeout(() => {
      setLoading(false);
      if (paymentStatus !== 'completed') {
        setPaymentStatus('failed'); // Timeout'a girerse başarısız say
      }
      clearInterval(interval);
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [orderDetails]); // orderDetails geldiğinde bu useEffect'i başlat

  // YENİ: Ödeme durumu "completed" olduğunda dönüşüm etiketini GÖNDER!
  useEffect(() => {
    // Durum "completed" ise VE etiket daha önce gönderilmediyse VE sipariş detayları varsa
    if (paymentStatus === 'completed' && !conversionSent && orderDetails) {

      console.log('Payment completed. Sending conversion tag to Google Ads...');

      // Google Ads'e dönüşüm olayını gönder
      if (typeof window.gtag === 'function') {
        try {
          window.gtag('event', 'conversion', {
            // ÖNEMLİ: Bu ID'yi Google Ads'ten aldığınız yeni etiket ID'si ile değiştirin
            'send_to': 'AW-16834301094',
            'value': orderDetails.totalValue,
            'currency': orderDetails.currency,
            'transaction_id': orderDetails.orderId
          });

          // Etiketin gönderildiğini işaretle
          setConversionSent(true);
          console.log('Conversion tag sent successfully:', orderDetails);

        } catch (error) {
          console.error('Failed to send conversion tag:', error);
        }
      }

      // 5 saniye sonra ana sayfaya yönlendir
      setTimeout(() => {
        navigate('/');
      }, 5000);
    }
  }, [paymentStatus, orderDetails, conversionSent]); // Bu değişkenler değiştiğinde çalışır

  const checkPaymentStatus = async (orderId) => {
    try {
      const response = await axios.get(`${baseURL}/api/payment/status`, {
        params: { orderId },
      });
      const status = response.data.status;
      setPaymentStatus(status);
      if (status === 'completed' || status === 'failed') {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus('failed');
      setLoading(false);
    }
  };


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
      ) : paymentStatus === 'failed' ? (
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
