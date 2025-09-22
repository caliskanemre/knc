import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Container, CssBaseline, Typography, Card, CardContent, CardMedia, Grid, Box, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../../src/auth/AuthProvider';

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

export default function FavoritesPage() {
  const { isLoggedIn, username, favorites: authFavorites } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        let data = [];
        if (isLoggedIn && username) {
          // Use backend to ensure fresh favorites
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
          const res = await axios.get(`${baseURL}/users/${encodeURIComponent(username)}/favorites`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          data = Array.isArray(res.data) ? res.data : [];
          // fallback to context if empty
          if (!data.length && authFavorites) {
            data = Array.isArray(authFavorites) ? authFavorites : (authFavorites.favoriteProducts || []);
          }
        } else {
          // Guest favorites
          const guestToken = typeof window !== 'undefined' ? localStorage.getItem('guestToken') : '';
          if (guestToken) {
            const res = await axios.get(`${baseURL}/users/guest/favorites`, { headers: { 'X-Guest-Token': guestToken } });
            data = Array.isArray(res.data) ? res.data : [];
          } else {
            // fallback to localStorage
            try {
              const stored = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('favorites') || '[]') : [];
              data = Array.isArray(stored) ? stored : [];
            } catch { data = []; }
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
  }, [isLoggedIn, username, authFavorites]);

  return (
    <>
      <Head>
        <title>Favorilerim | Kına Sepeti</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Favorilerim</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}><CircularProgress /></Box>
        ) : items.length === 0 ? (
          <Typography>Favori ürününüz bulunmuyor.</Typography>
        ) : (
          <Grid container spacing={2}>
            {items.map((item) => {
              const id = item.id || item.productId || item.activityId;
              const title = item.title || item.name || 'Ürün';
              const img = (item.photos && item.photos[0] && item.photos[0].photo) || item.image || 'https://via.placeholder.com/300x200?text=No+Image';
              return (
                <Grid item key={`${id}-${title}`} xs={12} sm={6} md={4} lg={3}>
                  <Card>
                    <CardMedia component="img" image={img} alt={title} sx={{ height: 180 }} />
                    <CardContent>
                      <Typography variant="subtitle1" noWrap>{title}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </>
  );
}

