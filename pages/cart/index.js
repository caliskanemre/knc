import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { Container, CssBaseline, Typography, Card, CardContent, CardMedia, Box, CircularProgress, Button, Divider, CardActions, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../src/auth/AuthProvider';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

function generateUUID() {
  try {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
      );
    }
  } catch (_) { /* ignore */ }
  const ts = Date.now().toString(16);
  const rnd = Math.floor(Math.random() * 1e16).toString(16);
  return `${ts}-${rnd}-${ts.slice(-4)}-${rnd.slice(-4)}-${ts}${rnd}`.slice(0, 36);
}

export default function CartPage() {
  const { isLoggedIn, username } = useAuth();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('info');

  const showToast = (message, severity = 'info') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  // Ensure guest token exists for guest users
  useEffect(() => {
    if (!isLoggedIn) {
      const existing = typeof window !== 'undefined' ? localStorage.getItem('guestToken') : '';
      if (!existing) {
        const g = generateUUID();
        if (typeof window !== 'undefined') localStorage.setItem('guestToken', g);
      }
    }
  }, [isLoggedIn]);

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
        if (!cancelled) {
          setItems([]);
          showToast(t('Failed to load cart.', 'Sepet yüklenemedi.'), 'error');
        }
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

  // Guest cart sync helper (restore)
  const syncGuestCart = async (newItems) => {
    const guestToken = typeof window !== 'undefined' ? localStorage.getItem('guestToken') : '';
    if (!guestToken) return;
    const normalized = (newItems || []).map(item => ({
      productId: item.productId || item.id,
      quantity: Number(item.quantity) || 1,
      price: Number(item.price) || 0,
      title: item.title || item.name,
      image: item.image || item.photos?.[0]?.photo,
      orderNote: item.orderNote,
      currency: item.currency || (item.is_turkey_user ? 'TRY' : 'EUR'),
      is_turkey_user: item.is_turkey_user
    }));
    try {
      const res = await axios.post(`${baseURL}/cart/guest`, normalized, { headers: { 'X-Guest-Token': guestToken } });
      const serverCart = Array.isArray(res.data) ? res.data : [];
      setItems(serverCart);
      try { if (typeof window !== 'undefined') localStorage.setItem('cart', JSON.stringify(serverCart)); } catch(_) {}
    } catch (err) {
      showToast(err?.response?.data?.message || t('Error syncing guest cart', 'Misafir sepeti eşitlenemedi'), 'error');
    }
  };

  // Remove item from cart (fix endpoints)
  const handleRemoveItem = async (id) => {
    const before = [...items];
    const newItems = (items || []).filter(it => (it.productId || it.id) !== id);
    setItems(newItems);
    try {
      if (isLoggedIn && username) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
        await axios.delete(`${baseURL}/cart/${encodeURIComponent(username)}/item/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        showToast(t('Item removed from cart', 'Ürün sepetten kaldırıldı'), 'success');
      } else {
        const guestToken = typeof window !== 'undefined' ? localStorage.getItem('guestToken') : '';
        await axios.delete(`${baseURL}/cart/guest/item/${id}`, { headers: { 'X-Guest-Token': guestToken } });
        try { if (typeof window !== 'undefined') localStorage.setItem('cart', JSON.stringify(newItems)); } catch(_) {}
        showToast(t('Item removed from cart', 'Ürün sepetten kaldırıldı'), 'success');
      }
    } catch (err) {
      setItems(before);
      showToast(err?.response?.data?.message || t('Error removing item', 'Ürün kaldırılırken hata'), 'error');
    }
  };

  // Update quantity +/- (restore correct logic)
  const handleUpdateQuantity = async (id, action) => {
    const idx = items.findIndex(it => (it.productId || it.id) === id);
    if (idx === -1) return;
    const current = items[idx];
    const currQty = Math.max(1, Number(current.quantity) || 1);
    const nextQty = action === 'increment' ? currQty + 1 : currQty - 1;
    if (nextQty <= 0) return;

    const unitPrice = (Number(current.price) || 0) / currQty || 0;
    const updated = { ...current, quantity: nextQty, price: unitPrice * nextQty };
    const newItems = [...items];
    newItems[idx] = updated;
    setItems(newItems);

    try {
      if (isLoggedIn && username) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
        const dto = {
          productId: id,
          quantity: nextQty,
          price: unitPrice * nextQty,
          title: current.title || current.name,
          image: current.image || current.photos?.[0]?.photo,
          orderNote: current.orderNote,
          currency: current.currency || (current.is_turkey_user ? 'TRY' : 'EUR'),
          is_turkey_user: current.is_turkey_user
        };
        await axios.put(`${baseURL}/cart/${encodeURIComponent(username)}/item/${id}`, dto, { headers: { Authorization: `Bearer ${token}` } });
        showToast(t('Quantity updated', 'Adet güncellendi'), 'success');
      } else {
        await syncGuestCart(newItems);
        showToast(t('Quantity updated', 'Adet güncellendi'), 'success');
      }
    } catch (err) {
      // Try to refetch on failure
      try {
        if (isLoggedIn && username) {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
          const res = await axios.get(`${baseURL}/cart/${encodeURIComponent(username)}`, { headers: { Authorization: `Bearer ${token}`, 'Accept-Language': i18n.language?.startsWith('en') ? 'en' : 'tr' } });
          setItems(Array.isArray(res.data) ? res.data : []);
        } else {
          const guestToken = typeof window !== 'undefined' ? localStorage.getItem('guestToken') : '';
          const res = await axios.get(`${baseURL}/cart/guest`, { headers: { 'X-Guest-Token': guestToken, 'Accept-Language': i18n.language?.startsWith('en') ? 'en' : 'tr' } });
          const data = Array.isArray(res.data) ? res.data : [];
          setItems(data);
          try { if (typeof window !== 'undefined') localStorage.setItem('cart', JSON.stringify(data)); } catch(_) {}
        }
      } catch(_) {}
      showToast(err?.response?.data?.message || t('Error updating quantity', 'Adet güncellenemedi'), 'error');
    }
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
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" noWrap>{title}</Typography>
                    <Typography color="text.secondary">{t('Quantity', 'Adet')}: {item.quantity || 0}</Typography>
                    <Typography color="text.secondary">{t('Price', 'Fiyat')}: {formatPrice(item.price, currency)}</Typography>
                  </CardContent>
                  <CardActions sx={{ alignItems: 'center' }}>
                    <Button size="small" onClick={() => handleUpdateQuantity(id, 'decrement')} disabled={(Number(item.quantity) || 0) <= 1}>-</Button>
                    <Button size="small" onClick={() => handleUpdateQuantity(id, 'increment')}>+</Button>
                    <Button size="small" color="error" onClick={() => handleRemoveItem(id)}>{t('Remove', 'Kaldır')}</Button>
                  </CardActions>
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

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity={toastSeverity} sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
