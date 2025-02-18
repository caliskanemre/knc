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
} from '@mui/material';
import Header from "../header/Header";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

// Helper function to generate a prefixed image URL (e.g., "small_", "medium_", "large_")
const getPrefixedImage = (url, prefix) => {
    if (!url) return url;
    return url.replace(/([^/]+)$/, `${prefix}_$1`);
};

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [username, setUsername] = useState(''); // To store the username dynamically

    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    // Step 1: Extract the username from the token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUsername(decodedToken.sub); // Assuming 'sub' contains the username
        }
    }, []);

    // Step 2: Fetch cart items only when username is available
    useEffect(() => {
        if (username) {
            fetchCartItems();
        }
    }, [username]);

    const fetchCartItems = async () => {
        try {
            const response = await axios.get(`${baseURL}/cart/${username}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setCartItems(response.data);
            calculateTotalPrice(response.data);
        } catch (error) {
            console.error("Error fetching cart items:", error);
        }
    };

    const calculateTotalPrice = (items) => {
        const total = items.reduce((acc, item) => acc + item.price, 0);
        setTotalPrice(total);
    };

    const handleRemoveItem = async (id) => {
        try {
            await axios.delete(`${baseURL}/cart/${username}/item/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            fetchCartItems();
        } catch (error) {
            console.error("Error removing item:", error);
        }
    };

    const handleUpdateQuantity = async (id, action) => {
        const updatedQuantity = cartItems.find(product => product.productId === id).quantity +
            (action === 'increment' ? 1 : -1);
        if (updatedQuantity <= 0) return;

        try {
            await axios.put(`${baseURL}/cart/${username}/item/${id}`, { quantity: updatedQuantity }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            fetchCartItems();
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    const handleCheckout = () => {
        navigate('/payment');
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
                            // Use the helper function to generate optimized image URLs
                            const originalImage = item.image;
                            const smallImageUrl = getPrefixedImage(originalImage, 'small');
                            const mediumImageUrl = getPrefixedImage(originalImage, 'medium');
                            const largeImageUrl = getPrefixedImage(originalImage, 'large');

                            return (
                                <Card key={item.productId} sx={{ marginBottom: 2 }}>
                                    <CardContent>
                                        <CardMedia
                                            component="img"
                                            image={smallImageUrl} // Default to small image
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
                                        <Typography color="textSecondary">
                                            Birim Fiyat: {(item.price / item.quantity).toFixed(2)} TL
                                        </Typography>
                                        <Typography color="textSecondary">
                                            Miktar: {item.quantity}
                                        </Typography>
                                        <Typography color="textSecondary">
                                            Toplam Fiyat: {item.price} TL
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            onClick={() => handleUpdateQuantity(item.productId, 'decrement')}
                                        >
                                            -
                                        </Button>
                                        <Button
                                            size="small"
                                            onClick={() => handleUpdateQuantity(item.productId, 'increment')}
                                        >
                                            +
                                        </Button>
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => handleRemoveItem(item.productId)}
                                        >
                                            Ürünü Kaldır
                                        </Button>
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
                    Toplam: {totalPrice} TL
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
        </div>
    );
};

export default Cart;
