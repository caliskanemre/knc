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
import Header from '../header/Header';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { t } from 'i18next';

const Cart = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [email, setEmail] = useState('');
    const [previousCartItems, setPreviousCartItems] = useState([]);
    const [toastMessage, setToastMessage] = useState('');
    const [toastSeverity, setToastSeverity] = useState('success');
    const [toastOpen, setToastOpen] = useState(false);

    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const discountRate = 20;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                if (decodedToken?.sub && decodedToken.sub.includes('@')) {
                    setEmail(decodedToken.sub);
                }
            } catch (error) {
                console.error('Error decoding JWT token:', error);
            }
        }
    }, []);

    useEffect(() => {
        if (email) {
            fetchCartItems();
        }
    }, [email]);

    const fetchCartItems = async () => {
        if (!email) return;

        try {
            const response = await axios.get(`${baseURL}/cart/${encodeURIComponent(email)}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const items = response.data ?? [];
            setCartItems(items);
            calculateTotalPrice(items);
            setPreviousCartItems(items);
        } catch (error) {
            console.error('Error fetching cart items:', error);
            setCartItems([]);
            setTotalPrice(0);
        }
    };

    const calculateTotalPrice = (items) => {
        const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const discountedTotal = total * (1 - discountRate / 100);
        setTotalPrice(discountedTotal);
        console.log('Calculated Total Price:', discountedTotal); // Debug log
    };

    const handleRemoveItem = async (id) => {
        if (!email) return;
        try {
            await axios.delete(`${baseURL}/cart/${email}/item/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const updatedItems = cartItems.filter(item => (item.productId || item.id) !== id);
            setCartItems(updatedItems);
            setPreviousCartItems(updatedItems);
            calculateTotalPrice(updatedItems);
            showToast('Ürün sepetten kaldırıldı! 🗑️', 'success');
        } catch (error) {
            console.error('Error removing item:', error);
            showToast('Ürün kaldırılamadı! ❌', 'error');
        }
    };

    const handleUpdateQuantity = async (id, action) => {
        const productIndex = cartItems.findIndex(item => (item.productId || item.id) === id);
        if (productIndex === -1) return;

        const product = cartItems[productIndex];
        const updatedQuantity = product.quantity + (action === 'increment' ? 1 : -1);

        if (updatedQuantity <= 0) return;

        const updatedItems = [...cartItems];
        updatedItems[productIndex] = { ...product, quantity: updatedQuantity };
        setCartItems(updatedItems);
        calculateTotalPrice(updatedItems);

        try {
            await axios.put(`${baseURL}/cart/${email}/item/${id}`, { quantity: updatedQuantity }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            showToast('Ürün miktarı güncellendi! 🛒', 'success');
        } catch (error) {
            console.error('Error updating quantity:', error);
            fetchCartItems();
            showToast('Miktar güncellenemedi! ❌', 'error');
        }
    };

    const handleCheckout = () => {
        console.log('Navigating to payment with totalPrice:', totalPrice); // Debug log
        const lang = location.pathname.split('/')[1] || 'tr'; // Extract language
        navigate(`/${lang}/payment`, { state: { totalPrice } });
    };

    const showToast = (message, severity) => {
        setToastMessage(message);
        setToastSeverity(severity);
        setToastOpen(true);
    };

    return (
        <div>
            <Header />
            <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 2 }}>
                <Typography variant='h4' component='h1' gutterBottom>
                    {t('My Cart')}
                </Typography>
                <Divider sx={{ marginBottom: 2 }} />

                {cartItems.length > 0 ? (
                    <List>
                        {cartItems.map((item) => {
                            const id = item.productId || item.id;
                            const originalImageUrl = item.image;
                            const smallImageUrl = originalImageUrl ? originalImageUrl.replace(/([^/]+)$/, 'small_$1') : '';
                            return (
                                <Card key={id} sx={{ marginBottom: 2 }}>
                                    <CardContent>
                                        <CardMedia
                                            component='img'
                                            image={smallImageUrl}
                                            alt={item.title || 'Ürün Resmi'}
                                            sx={{ width: '100px', height: '100px' }}
                                        />
                                        <Typography variant='h6'>{item.title}</Typography>
                                        <Typography color='textSecondary'>
                                            Birim Fiyat: {(item.price).toFixed(2)} €
                                        </Typography>
                                        <Typography color='textSecondary'>
                                            Miktar: {item.quantity}
                                        </Typography>
                                        <Typography color='textSecondary'>
                                            Toplam Fiyat: <strong>{((item.price * item.quantity) * (1 - discountRate / 100)).toFixed(2)} €</strong>
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button size='small' onClick={() => handleUpdateQuantity(id, 'decrement')}>-</Button>
                                        <Button size='small' onClick={() => handleUpdateQuantity(id, 'increment')}>+</Button>
                                        <Button size='small' color='error' onClick={() => handleRemoveItem(id)}>Ürünü Kaldır</Button>
                                    </CardActions>
                                </Card>
                            );
                        })}
                    </List>
                ) : (
                    <Typography>Sepetiniz boş.</Typography>
                )}

                <Divider sx={{ marginY: 2 }} />

                <Typography variant='h5' component='h2'>
                    Toplam: {totalPrice.toFixed(2)} €
                </Typography>

                <Button
                    variant='contained'
                    color='primary'
                    fullWidth
                    sx={{ marginTop: 2 }}
                    disabled={cartItems.length === 0}
                    onClick={handleCheckout}
                >
                    Alışverişi Tamamla
                </Button>
            </Box>

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
        </div>
    );
};

export default Cart;