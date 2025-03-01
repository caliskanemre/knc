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

const MyOrders = () => {
  const { username, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

    const baseURL = process.env.REACT_APP_BASE_URL || "http://localhost:8080";

    useEffect(() => {
        if (username) {
            fetchUserOrders(username);
        }
    }, [username]);

  const fetchUserOrders = async (username) => {
    try {
      // Include auth token if the endpoint requires authentication
      const response = await axios.get(`${baseURL}/orders/user/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch user orders:", error);
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
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <React.Fragment key={order.id}>
                    {/* Main row for basic order info */}
                    <TableRow>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                      </TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>
                        {/* Use `totalPrice` from your API */}
                        {order.totalPrice?.toFixed(2)} €
                      </TableCell>
                      <TableCell>{order.paymentMethod}</TableCell>
                    </TableRow>

                    {/* Optional sub-row for order items */}
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
