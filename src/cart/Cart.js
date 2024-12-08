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
} from '@mui/material';
import Header from "../header/Header";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        try {
            const response = await axios.get('/cart/1'); // Replace '1' with user ID dynamically
            setCartItems(response.data);
            calculateTotalPrice(response.data);
        } catch (error) {
            console.error("Error fetching cart items:", error);
        }
    };

    const calculateTotalPrice = (items) => {
        const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        setTotalPrice(total);
    };

    const handleRemoveItem = async (id) => {
        try {
            await axios.delete(`/cart/1/item/${id}`); // Replace '1' with user ID dynamically
            fetchCartItems(); // Refresh cart items
        } catch (error) {
            console.error("Error removing item:", error);
        }
    };

    const handleUpdateQuantity = async (id, action) => {
        const updatedQuantity = cartItems.find(item => item.id === id).quantity +
            (action === 'increment' ? 1 : -1);
        if (updatedQuantity <= 0) return;

        try {
            await axios.put(`/cart/1/item/${id}`, { quantity: updatedQuantity });
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
                        {cartItems.map((item) => (
                            <Card key={item.id} sx={{ marginBottom: 2 }}>
                                <CardContent>
                                    <Typography variant="h6">{item.name}</Typography>
                                    <Typography color="textSecondary">
                                        Birim Fiyat: {item.price} TL
                                    </Typography>
                                    <Typography color="textSecondary">
                                        Miktar: {item.quantity}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        onClick={() => handleUpdateQuantity(item.id, 'decrement')}
                                    >
                                        -
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={() => handleUpdateQuantity(item.id, 'increment')}
                                    >
                                        +
                                    </Button>
                                    <Button
                                        size="small"
                                        color="error"
                                        onClick={() => handleRemoveItem(item.id)}
                                    >
                                        Ürünü Kaldır
                                    </Button>
                                </CardActions>
                            </Card>
                        ))}
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
