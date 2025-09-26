import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  CircularProgress,
  Container,
  CssBaseline
} from '@mui/material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

export default function PaymentPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: ''
  });

  const [currency, setCurrency] = useState('EUR');
  const [shippingCost, setShippingCost] = useState(0);

  const discountRate = 0.20;

  const shippingCountries = [
    { code: 'TR', name: 'Türkiye', cost: 0 },
    { code: 'AL', name: 'Albania', cost: 12.99 },
    { code: 'AT', name: 'Austria', cost: 12.99 },
    { code: 'AU', name: 'Australia', cost: 49.99 },
    { code: 'BA', name: 'Bosnia and Herzegovina', cost: 12.99 },
    { code: 'BE', name: 'Belgium', cost: 12.99 },
    { code: 'BG', name: 'Bulgaria', cost: 12.99 },
    { code: 'BY', name: 'Belarus', cost: 12.99 },
    { code: 'CA', name: 'Canada', cost: 19.99 },
    { code: 'CH', name: 'Switzerland', cost: 12.99 },
    { code: 'CY', name: 'Cyprus', cost: 12.99 },
    { code: 'CZ', name: 'Czech Republic', cost: 12.99 },
    { code: 'DE', name: 'Germany', cost: 12.99 },
    { code: 'DK', name: 'Denmark', cost: 12.99 },
    { code: 'EE', name: 'Estonia', cost: 12.99 },
    { code: 'ES', name: 'Spain', cost: 12.99 },
    { code: 'FI', name: 'Finland', cost: 12.99 },
    { code: 'FR', name: 'France', cost: 12.99 },
    { code: 'GR', name: 'Greece', cost: 12.99 },
    { code: 'HR', name: 'Croatia', cost: 12.99 },
    { code: 'HU', name: 'Hungary', cost: 12.99 },
    { code: 'IE', name: 'Ireland', cost: 13.99 },
    { code: 'IS', name: 'Iceland', cost: 17.99 },
    { code: 'IT', name: 'Italy', cost: 12.99 },
    { code: 'LI', name: 'Liechtenstein', cost: 12.99 },
    { code: 'LT', name: 'Lithuania', cost: 12.99 },
    { code: 'LU', name: 'Luxembourg', cost: 12.99 },
    { code: 'LV', name: 'Latvia', cost: 12.99 },
    { code: 'MD', name: 'Moldova', cost: 12.99 },
    { code: 'ME', name: 'Montenegro', cost: 12.99 },
    { code: 'MK', name: 'North Macedonia', cost: 12.99 },
    { code: 'MT', name: 'Malta', cost: 12.99 },
    { code: 'NL', name: 'Netherlands', cost: 12.99 },
    { code: 'NO', name: 'Norway', cost: 12.99 },
    { code: 'PL', name: 'Poland', cost: 12.99 },
    { code: 'PT', name: 'Portugal', cost: 12.99 },
    { code: 'RO', name: 'Romania', cost: 12.99 },
    { code: 'RS', name: 'Serbia', cost: 12.99 },
    { code: 'RU', name: 'Russia', cost: 14.99 },
    { code: 'SE', name: 'Sweden', cost: 12.99 },
    { code: 'SI', name: 'Slovenia', cost: 12.99 },
    { code: 'SK', name: 'Slovakia', cost: 12.99 },
    { code: 'UA', name: 'Ukraine', cost: 12.99 },
    { code: 'UK', name: 'United Kingdom', cost: 12.99 },
    { code: 'US', name: 'USA', cost: 14.99 }
  ];

  const formatPrice = (amount, curr) => {
    const symbol = (curr === 'TRY' || curr === 'TL') ? '₺' : '€';
    const num = Number(amount) || 0;
    return `${num.toFixed(2)} ${symbol}`;
  };

  const getAvailableCountries = () => {
    if (currency === 'TRY' || currency === 'TL') return shippingCountries.filter(c => c.code === 'TR');
    return shippingCountries.filter(c => c.code !== 'TR');
  };

  const calculateShippingCost = useCallback((countryCode, currentTotal) => {
    if (!countryCode) return 0;
    const found = shippingCountries.find(c => c.code === countryCode);
    if (!found) return 0;
    if (currency === 'TRY' || currency === 'TL') {
      if (countryCode === 'TR') return currentTotal >= 500 ? 0 : 99;
      return 0;
    }
    if (countryCode === 'TR') return 0;
    return currentTotal >= 150 ? 0 : found.cost;
  }, [currency, shippingCountries]);

  const getFreeShippingInfo = (totalPrice) => {
    if (currency === 'TRY' || currency === 'TL') {
      const remaining = 500 - totalPrice;
      return { threshold: 500, remaining: remaining > 0 ? remaining : 0, isFree: totalPrice >= 500 };
    }
    const remaining = 150 - totalPrice;
    return { threshold: 150, remaining: remaining > 0 ? remaining : 0, isFree: totalPrice >= 150 };
  };

  const totals = useMemo(() => {
    const total = (cartItems || []).reduce((acc, it) => acc + (Number(it.price) || 0), 0);
    const discounted = total * (1 - discountRate);
    return { total, discounted };
  }, [cartItems]);

  useEffect(() => {
    // Sepeti client-side getir
    const run = async () => {
      try {
        setIsLoading(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
        if (token) {
          // email decode
          let email = '';
          try { email = JSON.parse(atob(token.split('.')[1] || ''))?.sub || ''; } catch {}
          if (email) {
            const res = await axios.get(`${baseURL}/cart/${encodeURIComponent(email)}`, { headers: { Authorization: `Bearer ${token}`, 'Accept-Language': i18n.language?.startsWith('en') ? 'en' : 'tr' } });
            const data = Array.isArray(res.data) ? res.data : [];
            setCartItems(data);
            const first = data[0];
            if (first) setCurrency(first.currency || (first.is_turkey_user ? 'TRY' : 'EUR'));
          }
        } else {
          const guestToken = typeof window !== 'undefined' ? localStorage.getItem('guestToken') : '';
          if (guestToken) {
            const res = await axios.get(`${baseURL}/cart/guest`, { headers: { 'X-Guest-Token': guestToken, 'Accept-Language': i18n.language?.startsWith('en') ? 'en' : 'tr' } });
            const data = Array.isArray(res.data) ? res.data : [];
            setCartItems(data);
            const first = data[0];
            if (first) setCurrency(first.currency || (first.is_turkey_user ? 'TRY' : 'EUR'));
          }
        }
      } catch (e) {
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [i18n.language]);

  useEffect(() => {
    // Currency TRY ise ülkeyi TR seç ve kargoyu güncelle
    if ((currency === 'TRY' || currency === 'TL') && !shippingAddress.country) {
      setShippingAddress(prev => ({ ...prev, country: 'TR' }));
      setShippingCost(calculateShippingCost('TR', totals.discounted));
    }
  }, [currency, totals.discounted, shippingAddress.country, calculateShippingCost]);

  const handleCountrySelect = (e) => {
    const code = e.target.value;
    setShippingAddress(prev => ({ ...prev, country: code }));
    setShippingCost(calculateShippingCost(code, totals.discounted));
    if (code === 'TR') setCurrency('TRY');
  };

  const onChange = (e) => setShippingAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const validateEmail = (mail) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(mail);

  const validateFields = () => {
    const missing = [];
    if (!shippingAddress.name) missing.push(t('Full Name'));
    if (!shippingAddress.addressLine1) missing.push(t('Address Line 1'));
    if (!shippingAddress.city) missing.push(t('City'));
    if (!shippingAddress.postalCode) missing.push(t('Postal Code'));
    if (!shippingAddress.country) missing.push(t('Country'));
    if (!validateEmail(shippingAddress.guestEmail || 'user@example.com')) {
      // guest veya login farkı gözetmeden basit email doğrulaması
    }
    if (missing.length) {
      setSnackbarMessage(`${t('Please fill in the missing fields')}: ${missing.join(', ')}`);
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!cartItems.length) {
      setSnackbarMessage(t('Cart is empty. Please add items to your cart.'));
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      router.push('/cart');
      return;
    }
    if (!validateFields()) return;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
      const headers = token ? { Authorization: `Bearer ${token}` } : { 'X-Guest-Token': (typeof window !== 'undefined' ? localStorage.getItem('guestToken') : '') };
      const validateUrl = token ? `${baseURL}/cart/validate/${encodeURIComponent(JSON.parse(atob(token.split('.')[1] || ''))?.sub || '')}` : `${baseURL}/cart/guest/validate`;
      const resp = await axios.post(validateUrl, cartItems, { headers });
      if (!resp.data?.valid) {
        setSnackbarMessage(resp.data?.message || t('Cart validation failed'));
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      const finalPrice = totals.discounted + Number(shippingCost || 0);
      if (currency === 'TRY' || currency === 'TL') {
        const payload = {
          amount: Math.round(finalPrice * 100),
          currency: 'TRY',
          shippingAddress: {
            name: shippingAddress.name,
            addressLine1: shippingAddress.addressLine1,
            addressLine2: shippingAddress.addressLine2,
            city: shippingAddress.city,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country,
          },
          email: token ? (JSON.parse(atob(token.split('.')[1] || ''))?.sub || '') : (shippingAddress.guestEmail || ''),
          items: cartItems
        };
        const paytr = await axios.post(`${baseURL}/api/payment`, payload, { headers });
        const url = paytr.data?.checkout_url || paytr.data?.url || paytr.data?.gateway_url || paytr.data?.iframe_url;
        if (url) {
          window.location.href = url;
          return;
        }
        setSnackbarMessage(t('Payment could not be initiated!'));
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      const payload = {
        amount: Math.round(finalPrice * 100),
        currency: 'EUR',
        shippingAddress: {
          name: shippingAddress.name,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
        },
        email: token ? (JSON.parse(atob(token.split('.')[1] || ''))?.sub || '') : (shippingAddress.guestEmail || ''),
        items: cartItems
      };
      const payment = await axios.post(`${baseURL}/api/payment`, payload, { headers });
      if (payment.status === 200 && payment.data?.checkout_url) {
        window.location.href = payment.data.checkout_url;
      } else {
        setSnackbarMessage(t('Payment created but checkout_url not received!'));
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (e) {
      setSnackbarMessage(e?.response?.data?.message || t('Error occurred during payment!'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const finalPrice = useMemo(() => totals.discounted + Number(shippingCost || 0), [totals.discounted, shippingCost]);

  return (
    <>
      <Head>
        <title>{t('Checkout')} | Kına Sepeti</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom>{t('Shipping Information')}</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2 }}>
                <TextField fullWidth label={t('Full Name')} name="name" value={shippingAddress.name} onChange={onChange} sx={{ mb: 1 }} required />
                <TextField fullWidth label={t('Email')} name="guestEmail" value={shippingAddress.guestEmail || ''} onChange={onChange} sx={{ mb: 1 }} required />
                <TextField fullWidth label={t('Address Line 1')} name="addressLine1" value={shippingAddress.addressLine1} onChange={onChange} sx={{ mb: 1 }} required />
                <TextField fullWidth label={t('Address Line 2')} name="addressLine2" value={shippingAddress.addressLine2} onChange={onChange} sx={{ mb: 1 }} />
                <TextField fullWidth label={t('City')} name="city" value={shippingAddress.city} onChange={onChange} sx={{ mb: 1 }} required />
                <TextField fullWidth label={t('Postal Code')} name="postalCode" value={shippingAddress.postalCode} onChange={onChange} sx={{ mb: 1 }} required />
                <FormControl fullWidth sx={{ mb: 2 }} required>
                  <InputLabel id="country-select-label">{t('Country')}</InputLabel>
                  {currency === 'TRY' || currency === 'TL' ? (
                    <Select labelId="country-select-label" id="country-select" name="country" label={t('Country')} value="TR" disabled>
                      <MenuItem value="TR">Türkiye</MenuItem>
                    </Select>
                  ) : (
                    <Select labelId="country-select-label" id="country-select" name="country" label={t('Country')} value={shippingAddress.country} onChange={handleCountrySelect}>
                      <MenuItem value=""><em>{t('Select')}</em></MenuItem>
                      {getAvailableCountries().map((c) => (
                        <MenuItem key={c.code} value={c.code}>{c.name}</MenuItem>
                      ))}
                    </Select>
                  )}
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom>{t('Payment Information')}</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2 }}>
                <Typography variant="h6" gutterBottom>{t('Order Summary')}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>{t('Items Total')}: {formatPrice(totals.discounted, currency)}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>{t('Shipping Cost')}: <strong>{formatPrice(shippingCost, currency)}</strong></Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6">{t('Total')}: <strong>{formatPrice(finalPrice, currency)}</strong></Typography>
                {(() => {
                  const info = getFreeShippingInfo(totals.discounted);
                  if (info.isFree) return (<Box sx={{ mt: 2, p: 1.5, bgcolor: '#e8f5e8', borderRadius: 1, border: '1px solid #4caf50' }}><Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>🎉 {t('Free shipping applied!')}</Typography></Box>);
                  if (info.remaining > 0) return (<Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff3e0', borderRadius: 1, border: '1px solid #ff9800' }}><Typography variant="body2" color="warning.main" sx={{ fontWeight: 'bold' }}>🚚 {formatPrice(info.remaining, currency)} {t('more for free shipping!')}</Typography><Typography variant="caption" color="text.secondary">{currency === 'TRY' || currency === 'TL' ? t('Free shipping on orders over 500 TL') : t('Free shipping on orders over 150 EUR')}</Typography></Box>);
                  return null;
                })()}
                <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handlePayment} disabled={cartItems.length === 0 || isLoading}>
                  {(shippingAddress.country === 'TR' || currency === 'TRY') ? `${t('Proceed to Payment')} (PayTR)` : t('Proceed to Payment')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
      </Container>
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
