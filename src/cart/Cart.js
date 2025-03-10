import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardActions,
    Typography,
    Divider,
    List,
    CardMedia,
    Snackbar,
    Alert,
} from '@mui/material';
import Header from "../header/Header";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [email, setEmail] = useState(''); // ✅ Define email & setEmail state

    // Toast Message State
    const [toastMessage, setToastMessage] = useState('');
    const [toastOpen, setToastOpen] = useState(false);

    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken?.sub && decodedToken.sub.includes('@')) { // ✅ Check if valid email
                    setEmail(decodedToken.sub);
                }
            } catch (error) {
                console.error("Error decoding JWT token:", error);
            }
        }
    }, []);

    useEffect(() => {
        if (email) { // ✅ Only fetch when email is set
            fetchCartItems();
        }
    }, [email]);

    const fetchCartItems = async () => {
        if (!email || !email.includes('@')) return; // ✅ Prevents invalid API calls

        try {
            const response = await axios.get(`${baseURL}/cart/${encodeURIComponent(email)}`, { // ✅ Ensures email is included
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            setCartItems(response.data ?? []);
            calculateTotalPrice(response.data);
        } catch (error) {
            console.error("Error fetching cart items:", error);
            setCartItems([]);
        }
    };

// Ensure this effect runs only when email is properly set
    useEffect(() => {
        if (email) {
            fetchCartItems();
        }
    }, [email]);

    const discountRate = 20; // Set discount rate (e.g., 20% discount)

    const calculateTotalPrice = (items) => {
        const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const discountedTotal = total * (1 - discountRate / 100); // Apply discount
        setTotalPrice(discountedTotal);
    };


    const handleRemoveItem = async (id) => {
    if (!email) return;
    try {
        await axios.delete(`${baseURL}/cart/${email}/item/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        fetchCartItems();
        showToast("Ürün sepetten kaldırıldı! 🗑️");
    } catch (error) {
        console.error("Error removing item:", error);
        showToast("Ürün kaldırılamadı! ❌");
    }
};

    const handleUpdateQuantity = async (id, action) => {
        const product = cartItems.find(product => product.productId === id);
        if (!product) return;

        const updatedQuantity = product.quantity + (action === 'increment' ? 1 : -1);
        if (updatedQuantity <= 0) return;

        try {
            await axios.put(`${baseURL}/cart/${email}/item/${id}`, { quantity: updatedQuantity }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            fetchCartItems();
            showToast(`Ürün miktarı güncellendi! 🛒`);
        } catch (error) {
            console.error("Error updating quantity:", error);
            showToast("Miktar güncellenemedi! ❌");
        }
    };

    const handleCheckout = () => {
        navigate('/payment', { state: { totalPrice } });
    };

    // Function to show toast message
    const showToast = (message) => {
        setToastMessage(message);
        setToastOpen(true);
    };

    return (
        <div>
            <Header />
            <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Sepetim
                </Typography>
                <Divider sx={{ marginBottom: 2 }} />

                {cartItems.length > 0 ? (
                    <List>
                        {cartItems.map((item) => {
                            const id = item.productId || item.id;
                            const originalImageUrl = item.image;
                            const smallImageUrl = originalImageUrl ? originalImageUrl.replace(/([^/]+)$/, 'small_$1') : '';
                            const mediumImageUrl = originalImageUrl ? originalImageUrl.replace(/([^/]+)$/, 'medium_$1') : '';
                            const largeImageUrl = originalImageUrl ? originalImageUrl.replace(/([^/]+)$/, 'large_$1') : '';

                            return (
                                <Card key={id} sx={{ marginBottom: 2 }}>
                                    <CardContent>
                                        <a href={`/products/detail/${id}`}>
                                            <CardMedia
                                                component="img"
                                                image={smallImageUrl}
                                                srcSet={`
                                                    ${smallImageUrl} 100w,
                                                    ${mediumImageUrl} 200w,
                                                    ${largeImageUrl} 300w
                                                `}
                                                sizes="(max-width: 600px) 100px, 300px"
                                                alt={item.title}
                                                sx={{ width: '100px', height: '100px' }}
                                            />
                                            <Typography variant="h6">{item.title}</Typography>
                                        </a>
                                        <Typography color="textSecondary">
                                            Birim Fiyat: {(item.price).toFixed(2)} €
                                        </Typography>
                                        <Typography color="textSecondary">
                                            Miktar: {item.quantity}
                                        </Typography>
                                        <Typography color="textSecondary">
                                            Toplam Fiyat: <s>{(item.price * item.quantity).toFixed(2)} €</s> →
                                            <strong>{((item.price * item.quantity) * (1 - discountRate / 100)).toFixed(2)} €</strong>
                                        </Typography>

                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" onClick={() => handleUpdateQuantity(id, 'decrement')}>-</Button>
                                        <Button size="small" onClick={() => handleUpdateQuantity(id, 'increment')}>+</Button>
                                        <Button size="small" color="error" onClick={() => handleRemoveItem(id)}>Ürünü Kaldır</Button>
                                    </CardActions>
                                </Card>
                            );
                        })}
                    </List>
                ) : (
                    <Typography>Sepetiniz boş.</Typography>
                )}

                <Divider sx={{ marginY: 2 }} />

                <Typography variant="h5" component="h2">
                    Toplam: {totalPrice.toFixed(2)} €
                </Typography>

                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ marginTop: 2 }}
                    disabled={cartItems.length === 0}
                    onClick={handleCheckout}
                >
                    Alışverişi Tamamla
                </Button>
            </Box>

            {/* Toast Notification */}
            <Snackbar
                open={toastOpen}
                autoHideDuration={3000}
                onClose={() => setToastOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setToastOpen(false)} severity="success" sx={{ width: '100%' }}>
                    {toastMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Cart;
