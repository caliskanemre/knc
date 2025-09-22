import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { Container, CssBaseline, Typography, Card, CardContent, CardMedia, Box, CircularProgress, Button, Divider } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../src/auth/AuthProvider';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

export default function CartPage() {
  const { isLoggedIn, username } = useAuth();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        let data = [];
        if (isLoggedIn && username) {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
          const res = await axios.get(`${baseURL}/cart/${encodeURIComponent(username)}`, { headers: { Authorization: `Bearer ${token}`, 'Accept-Language': i18n.language?.startsWith('en') ? 'en' : 'tr' } });
          data = Array.isArray(res.data) ? res.data : [];
        } else {
          const guestToken = typeof window !== 'undefined' ? localStorage.getItem('guestToken') : '';
          if (guestToken) {
            const res = await axios.get(`${baseURL}/cart/guest`, { headers: { 'X-Guest-Token': guestToken, 'Accept-Language': i18n.language?.startsWith('en') ? 'en' : 'tr' } });
            data = Array.isArray(res.data) ? res.data : [];
          }
        }
        if (!cancelled) setItems(data);
      } catch (e) {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [isLoggedIn, username, i18n.language]);

  const totals = useMemo(() => {
    const total = (items || []).reduce((acc, it) => acc + (Number(it.price) || 0), 0);
    const discountRate = 0.20;
    const discounted = total * (1 - discountRate);
    return { total, discounted, discountRate };
  }, [items]);

  const formatPrice = (amount, currencyCode) => {
    const isTR = currencyCode === 'TRY' || currencyCode === 'TL';
    const symbol = isTR ? '₺' : '€';
    const num = Number(amount) || 0;
    return `${num.toFixed(2)} ${symbol}`;
  };

  const detectCurrency = () => {
    const first = items?.[0];
    if (!first) return 'EUR';
    if (first.currency) return first.currency;
    return first.is_turkey_user ? 'TRY' : 'EUR';
  };

  const onCheckout = async () => {
    // Doğrudan ödeme sayfasına yönlendir; sayfa kendi içinde sepeti tekrar doğrular
    router.push('/payment');
  };

  return (
    <>
      <Head>
        <title>{t('My Cart', 'Sepetim')} | Kına Sepeti</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>{t('My Cart', 'Sepetim')}</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}><CircularProgress /></Box>
        ) : items.length === 0 ? (
          <Typography>{t('Your cart is empty.', 'Sepetiniz boş.')}</Typography>
        ) : (
          <>
            {(items || []).map((item) => {
              const id = item.productId || item.id;
              const img = item.image || item.photos?.[0]?.photo || 'https://via.placeholder.com/120x120?text=No+Image';
              const title = item.title || item.name || 'Ürün';
              const currency = item.currency || (item.is_turkey_user ? 'TRY' : 'EUR');
              return (
                <Card key={id} sx={{ display: 'flex', mb: 2 }}>
                  <CardMedia component="img" sx={{ width: 120 }} image={img} alt={title} />
                  <CardContent>
                    <Typography variant="h6" noWrap>{title}</Typography>
                    <Typography color="text.secondary">{t('Quantity', 'Adet')}: {item.quantity || 0}</Typography>
                    <Typography color="text.secondary">{t('Price', 'Fiyat')}: {formatPrice(item.price, currency)}</Typography>
                  </CardContent>
                </Card>
              );
            })}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('Subtotal', 'Ara Toplam')}: {formatPrice(totals.total, detectCurrency())}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('Discount', 'İndirim')}: %{Math.round(totals.discountRate * 100)}
                </Typography>
                <Typography variant="h6">
                  {t('Total', 'Toplam')}: {formatPrice(totals.discounted, detectCurrency())}
                </Typography>
              </Box>
              <Button variant="contained" size="large" onClick={onCheckout}>{t('Proceed to Checkout', 'Ödemeye Geç')}</Button>
            </Box>
          </>
        )}
      </Container>
    </>
  );
}
