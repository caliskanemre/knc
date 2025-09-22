import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Container, CssBaseline, Typography, Card, CardContent, CardMedia, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../src/auth/AuthProvider';

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

export default function CartPage() {
  const { isLoggedIn, username } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        let data = [];
        if (isLoggedIn && username) {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
          const res = await axios.get(`${baseURL}/cart/${encodeURIComponent(username)}`, { headers: { Authorization: `Bearer ${token}` } });
          data = Array.isArray(res.data) ? res.data : [];
        } else {
          const guestToken = typeof window !== 'undefined' ? localStorage.getItem('guestToken') : '';
          if (guestToken) {
            const res = await axios.get(`${baseURL}/cart/guest`, { headers: { 'X-Guest-Token': guestToken } });
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
  }, [isLoggedIn, username]);

  return (
    <>
      <Head>
        <title>Sepetim | Kına Sepeti</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Sepetim</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}><CircularProgress /></Box>
        ) : items.length === 0 ? (
          <Typography>Sepetiniz boş.</Typography>
        ) : (
          items.map((item) => {
            const id = item.productId || item.id;
            const img = item.image || 'https://via.placeholder.com/120x120?text=No+Image';
            const title = item.title || item.name || 'Ürün';
            return (
              <Card key={id} sx={{ display: 'flex', mb: 2 }}>
                <CardMedia component="img" sx={{ width: 120 }} image={img} alt={title} />
                <CardContent>
                  <Typography variant="h6">{title}</Typography>
                  <Typography color="text.secondary">Adet: {item.quantity || 0}</Typography>
                </CardContent>
              </Card>
            );
          })
        )}
      </Container>
    </>
  );
}

