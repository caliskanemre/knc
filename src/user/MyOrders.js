import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import axios from "axios";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TableHead,
    Paper,
    CircularProgress
} from "@mui/material";
import Header from "../header/Header";
import { useTranslation } from "react-i18next";

const MyOrders = () => {
  const { email, token } = useAuth();
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guestToken] = useState(localStorage.getItem('guestToken') || '');

  const baseURL = process.env.REACT_APP_BASE_URL || "http://localhost:8080";

  // Currency formatting function
  const formatPrice = (amount, currency) => {
    const symbol = currency === 'TRY' || currency === 'TL' ? '₺' : '€';
    const num = Number(amount) || 0;
    return `${num.toFixed(2)} ${symbol}`;
  };

  useEffect(() => {
    if (email && token) {
      // Authenticated user
      fetchUserOrders(email);
    } else if (guestToken) {
      // Guest user
      fetchGuestOrders();
    } else {
      setLoading(false);
      setError(t("No user information available"));
    }
  }, [email, token, guestToken]);

  const fetchUserOrders = async (email) => {
    try {
      const response = await axios.get(`${baseURL}/orders/user/${email}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch user orders:", error);
      setError(t("Error loading orders"));
    } finally {
      setLoading(false);
    }
  };

  const fetchGuestOrders = async () => {
    try {
      // Guest için latest-order endpoint'i guest token ile çağır
      const response = await axios.get(`${baseURL}/api/payment/latest-order`, {
        headers: {
          'X-Guest-Token': guestToken
        }
      });

      // Response tek bir order objesi ise array'e dönüştür
      const orderData = response.data;
      if (orderData) {
        setOrders(Array.isArray(orderData) ? orderData : [orderData]);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch guest orders:", error);
      if (error.response?.status === 401) {
        setError(t("Guest session expired. Please start a new order."));
      } else {
        setError(t("Error loading orders"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 2 }}>
        <Typography variant="h4" gutterBottom>
          Siparişlerim
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={5}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        ) : orders.length === 0 ? (
          <Typography variant="body1">
            Henüz siparişiniz yok.
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Order #</strong></TableCell>
                  <TableCell><strong>Tarih</strong></TableCell>
                  <TableCell><strong>Durum</strong></TableCell>
                  <TableCell><strong>Toplam</strong></TableCell>
                  <TableCell><strong>Ödeme Yöntemi</strong></TableCell>
                  <TableCell><strong>Kargo Durumu</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <TableRow>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                      </TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>
                        {order.totalPrice?.toFixed(2)} €
                      </TableCell>
                      <TableCell>{order.paymentMethod}</TableCell>
                      <TableCell>{order.cargoStatus}</TableCell>
                    </TableRow>
                    {order.orderItems && order.orderItems.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ backgroundColor: "#f9f9f9" }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                            Ürünler:
                          </Typography>
                          {order.orderItems.map((item, idx) => (
                            <Box key={idx} sx={{ pl: 2 }}>
                              <Typography variant="body2">
                                <strong>Ürün ID:</strong> {item.productId} |{" "}
                                <strong>Adet:</strong> {item.quantity} |{" "}
                                <strong>Fiyat:</strong> {item.price} €
                              </Typography>
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
      </Box>
    </>
  );
};

export default MyOrders;
