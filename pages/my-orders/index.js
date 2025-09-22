import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Box, Container, CssBaseline, Typography, Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../src/auth/AuthProvider';

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

export default function MyOrdersPage() {
  const { isLoggedIn, username } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        let data = [];
        if (isLoggedIn && username) {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
          const res = await axios.get(`${baseURL}/orders/user/${encodeURIComponent(username)}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          data = Array.isArray(res.data) ? res.data : [];
        } else {
          const guestToken = typeof window !== 'undefined' ? localStorage.getItem('guestToken') : '';
          if (guestToken) {
            const res = await axios.get(`${baseURL}/api/payment/latest-order`, { headers: { 'X-Guest-Token': guestToken } });
            const order = res.data;
            data = order ? (Array.isArray(order) ? order : [order]) : [];
          }
        }
        if (!cancelled) setOrders(data);
      } catch (e) {
        if (!cancelled) setError('Siparişler yüklenirken hata oluştu.');
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
        <title>Siparişlerim | Kına Sepeti</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Siparişlerim</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}><CircularProgress /></Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : orders.length === 0 ? (
          <Typography>Henüz siparişiniz yok.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Order #</strong></TableCell>
                  <TableCell><strong>Tarih</strong></TableCell>
                  <TableCell><strong>Durum</strong></TableCell>
                  <TableCell><strong>Toplam</strong></TableCell>
                  <TableCell><strong>Ödeme</strong></TableCell>
                  <TableCell><strong>Kargo</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <TableRow>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('tr-TR') : '-'}</TableCell>
                      <TableCell>{order.status || '-'}</TableCell>
                      <TableCell>{typeof order.totalPrice === 'number' ? order.totalPrice.toFixed(2) : order.totalPrice} €</TableCell>
                      <TableCell>{order.paymentMethod || '-'}</TableCell>
                      <TableCell>{order.cargoStatus || '-'}</TableCell>
                    </TableRow>
                    {(order.orderItems || []).length > 0 && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Ürünler</Typography>
                          {(order.orderItems || []).map((it, idx) => (
                            <Box key={idx} sx={{ pl: 2 }}>
                              <Typography variant="body2">Ürün #{it.productId} • Adet: {it.quantity} • Fiyat: {it.price} €</Typography>
                            </Box>
                          ))}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </>
  );
}

