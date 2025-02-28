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
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell>
                                            {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                                        </TableCell>
                                        <TableCell>{order.status}</TableCell>
                                        <TableCell>
                                            {order.totalAmount?.toFixed(2)} €
                                        </TableCell>
                                    </TableRow>
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
