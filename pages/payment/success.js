import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Container, Typography, Box, CircularProgress, Button } from '@mui/material';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import axios from 'axios';
import { useRouter } from 'next/router';

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { width, height } = useWindowSize();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [orderDetails, setOrderDetails] = useState(null);
  const [conversionSent, setConversionSent] = useState(false);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/payment/latest-order`);
        if (res.data && res.data.orderId) {
          setOrderDetails(res.data);
        } else {
          setStatus('failed');
          setLoading(false);
        }
      } catch (e) {
        setStatus('failed');
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  useEffect(() => {
    if (!orderDetails) return;
    const interval = setInterval(async () => {
      try {
        const resp = await axios.get(`${baseURL}/api/payment/status`, { params: { orderId: orderDetails.orderId } });
        const st = resp.data?.status || 'pending';
        setStatus(st);
        if (st === 'completed' || st === 'failed') {
          setLoading(false);
        }
      } catch (e) {
        setStatus('failed');
        setLoading(false);
      }
    }, 3000);
    const timeout = setTimeout(() => {
      setLoading(false);
      if (status !== 'completed') setStatus('failed');
      clearInterval(interval);
    }, 30000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [orderDetails]);

  useEffect(() => {
    if (status === 'completed' && !conversionSent && orderDetails) {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        try {
          window.gtag('event', 'conversion', {
            send_to: 'AW-16834301094',
            value: orderDetails.totalValue,
            currency: orderDetails.currency,
            transaction_id: orderDetails.orderId
          });
          setConversionSent(true);
        } catch {}
      }
      setTimeout(() => router.push('/'), 5000);
    }
  }, [status, orderDetails, conversionSent, router]);

  return (
    <>
      <Head>
        <title>Ödeme Başarılı | Kına Sepeti</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
        {status === 'completed' && (
          <Confetti width={width} height={height} numberOfPieces={300} recycle={false} />
        )}
        {loading ? (
          <>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Ödeme durumu kontrol ediliyor...</Typography>
          </>
        ) : status === 'completed' ? (
          <>
            <Typography variant="h4" gutterBottom>✅ Ödeme Başarılı!</Typography>
            <Typography>Ana sayfaya yönlendiriliyorsunuz...</Typography>
          </>
        ) : status === 'failed' ? (
          <>
            <Typography variant="h4" gutterBottom>❌ Ödeme Başarısız</Typography>
            <Typography sx={{ mb: 2 }}>Ödeme onaylanamadı. Lütfen tekrar deneyin.</Typography>
            <Button variant="contained" onClick={() => router.push('/payment')}>Tekrar Dene</Button>
          </>
        ) : (
          <>
            <Typography variant="h5">Ödeme onaylanıyor...</Typography>
          </>
        )}
      </Container>
    </>
  );
}

