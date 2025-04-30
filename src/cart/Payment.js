import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Divider,
    Snackbar,
    Alert,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Grid,
} from '@mui/material';
import axios from 'axios';
import Header from '../header/Header';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Payment = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    // Initialize from location.state or localStorage
    const { totalPrice: basePrice = 0, cartItems = [], email: userEmail = '', guestToken = '' } = location.state || {};
    const checkoutData = JSON.parse(localStorage.getItem('checkoutData')) || {};
    const initialBasePrice = basePrice || checkoutData.totalPrice || 0;
    const initialGuestToken = guestToken || checkoutData.guestToken || localStorage.getItem('guestToken') || '';

    const [cartItemsState, setCartItemsState] = useState(
        cartItems.length > 0 ? cartItems : checkoutData.cartItems || []
    );
    const [basePriceState, setBasePriceState] = useState(initialBasePrice);

    const discountRate = 20;
    const discountedBasePrice = parseFloat(basePriceState) * (1 - discountRate / 100);

    const [shippingCost, setShippingCost] = useState(0);
    const [finalPrice, setFinalPrice] = useState(discountedBasePrice + shippingCost);

    // Shipping address state
    const [shippingAddress, setShippingAddress] = useState({
        name: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        postalCode: '',
        country: '',
        guestEmail: userEmail || '',
    });

    const [currency] = useState('EUR');
    const [revolutOrderId, setRevolutOrderId] = useState(null);

    // Snackbar State
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    // List of shipping countries & costs
    const shippingCountries = [
        { code: 'TR', name: 'Türkiye', cost: 0 },
        { code: 'AL', name: 'Albania', cost: 12.99 },
        { code: 'AT', name: 'Austria', cost: 12.99 },
        { code: 'AU', name: 'Australia', cost: 49.99 },
        { code: 'BA', name: 'Bosnia and Herzegovina', cost: 12.99 },
        { code: 'BE', name: 'Belgium', cost: 12.99 },
        { code: 'BG', name: 'Bulgaria', cost: 12.99 },
        { code: 'BY', name: 'Belarus', cost: 12.99 },
        { code: 'CA', name: 'Canada', cost: 19.99 },
        { code: 'CH', name: 'Switzerland', cost: 12.99 },
        { code: 'CY', name: 'Cyprus', cost: 12.99 },
        { code: 'CZ', name: 'Czech Republic', cost: 12.99 },
        { code: 'DE', name: 'Germany', cost: 12.99 },
        { code: 'DK', name: 'Denmark', cost: 12.99 },
        { code: 'EE', name: 'Estonia', cost: 12.99 },
        { code: 'ES', name: 'Spain', cost: 12.99 },
        { code: 'FI', name: 'Finland', cost: 12.99 },
        { code: 'FR', name: 'France', cost: 12.99 },
        { code: 'GR', name: 'Greece', cost: 12.99 },
        { code: 'HR', name: 'Croatia', cost: 12.99 },
        { code: 'HU', name: 'Hungary', cost: 12.99 },
        { code: 'IE', name: 'Ireland', cost: 13.99 },
        { code: 'IS', name: 'Iceland', cost: 17.99 },
        { code: 'IT', name: 'Italy', cost: 12.99 },
        { code: 'LI', name: 'Liechtenstein', cost: 12.99 },
        { code: 'LT', name: 'Lithuania', cost: 12.99 },
        { code: 'LU', name: 'Luxembourg', cost: 12.99 },
        { code: 'LV', name: 'Latvia', cost: 12.99 },
        { code: 'MD', name: 'Moldova', cost: 12.99 },
        { code: 'ME', name: 'Montenegro', cost: 12.99 },
        { code: 'MK', name: 'North Macedonia', cost: 12.99 },
        { code: 'MT', name: 'Malta', cost: 12.99 },
        { code: 'NL', name: 'Netherlands', cost: 12.99 },
        { code: 'NO', name: 'Norway', cost: 12.99 },
        { code: 'PL', name: 'Poland', cost: 12.99 },
        { code: 'PT', name: 'Portugal', cost: 12.99 },
        { code: 'RO', name: 'Romania', cost: 12.99 },
        { code: 'RS', name: 'Serbia', cost: 12.99 },
        { code: 'RU', name: 'Russia', cost: 14.99 },
        { code: 'SE', name: 'Sweden', cost: 12.99 },
        { code: 'SI', name: 'Slovenia', cost: 12.99 },
        { code: 'SK', name: 'Slovakia', cost: 12.99 },
        { code: 'UA', name: 'Ukraine', cost: 12.99 },
        { code: 'UK', name: 'United Kingdom', cost: 12.99 },
        { code: 'US', name: 'USA', cost: 14.99 },
    ];


    const handleShippingAddressChange = (event) => {
        const { name, value } = event.target;
        setShippingAddress((prev) => ({ ...prev, [name]: value }));
    };
    const handleCountrySelect = (event) => {
        const selectedCountryCode = event.target.value;
        const foundCountry = shippingCountries.find((c) => c.code === selectedCountryCode);
        const cost = foundCountry ? foundCountry.cost : 0;
        setShippingAddress((prev) => ({ ...prev, country: selectedCountryCode }));
        setShippingCost(cost);
    };


    useEffect(() => {
        const fetchGuestCart = async () => {
            if (!userEmail && initialGuestToken && cartItemsState.length === 0) {
                try {
                    const response = await axios.get(`${baseURL}/cart/guest`, {
                        headers: { 'X-Guest-Token': initialGuestToken },
                    });
                    const guestCartItems = response.data || [];
                    if (guestCartItems.length > 0) {
                        const newTotalPrice = guestCartItems.reduce(
                            (total, item) => total + item.price * item.quantity,
                            0
                        );
                        setCartItemsState(guestCartItems);
                        setBasePriceState(newTotalPrice);
                        setFinalPrice(newTotalPrice * (1 - discountRate / 100) + shippingCost);
                        localStorage.setItem(
                            'checkoutData',
                            JSON.stringify({
                                ...checkoutData,
                                cartItems: guestCartItems,
                                totalPrice: newTotalPrice,
                                guestToken: initialGuestToken,
                            })
                        );
                    } else {
                        showSnackbar(t('Cart is empty. Please add items to your cart.'), 'warning');
                        setTimeout(() => navigate('/cart'), 2000);
                    }
                } catch (error) {
                    console.error('Error fetching guest cart:', error);
                    showSnackbar(t('Error fetching cart. Please try again.'), 'error');
                    setTimeout(() => navigate('/cart'), 2000);
                }
            } else if (cartItemsState.length === 0) {
                showSnackbar(t('Cart is empty. Please add items to your cart.'), 'warning');
                setTimeout(() => navigate('/cart'), 2000);
            }
        };

        fetchGuestCart();
    }, [cartItemsState, basePriceState, shippingCost, initialGuestToken, userEmail, navigate]);

    const validateFields = () => {
        const missingFields = [];
        if (!shippingAddress.name) missingFields.push(t('Full Name'));
        if (!shippingAddress.addressLine1) missingFields.push(t('Address Line 1'));
        if (!shippingAddress.city) missingFields.push(t('City'));
        if (!shippingAddress.postalCode) missingFields.push(t('Postal Code'));
        if (!shippingAddress.country) missingFields.push(t('Country'));
        if (!userEmail && !shippingAddress.guestEmail) missingFields.push(t('Email'));

        if (missingFields.length > 0) {
            showSnackbar(`${t('Please fill in the missing fields')}: ${missingFields.join(', ')}`, 'warning');
            return false;
        }
        return true;
    };

    useEffect(() => {
        setFinalPrice(parseFloat(basePriceState) * (1 - discountRate / 100) + parseFloat(shippingCost));
    }, [basePriceState, shippingCost]);

    // Update handlePaymentSubmit to use cartItemsState
    const handlePaymentSubmit = async () => {
        if (cartItemsState.length === 0) {
            showSnackbar(t('Cart is empty'), 'warning');
            return;
        }

        if (!validateFields()) return;

        const amountInCents = Math.round(finalPrice * 100);
        const paymentData = {
            amount: amountInCents,
            currency,
            shippingAddress: {
                name: shippingAddress.name,
                addressLine1: shippingAddress.addressLine1,
                addressLine2: shippingAddress.addressLine2,
                city: shippingAddress.city,
                postalCode: shippingAddress.postalCode,
                country: shippingAddress.country,
            },
            email: userEmail || shippingAddress.guestEmail,
        };

        try {
            const headers = userEmail
                ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
                : { 'X-Guest-Token': initialGuestToken };
            const response = await axios.post(`${baseURL}/api/payment`, paymentData, { headers });
            console.log("🚀 Payment API Response:", response.data);

            if (response.status === 200 && response.data.checkout_url) {
                const revolutOrderId = new URL(response.data.checkout_url).searchParams.get("order_id");
                setRevolutOrderId(revolutOrderId);
                console.log("✅ Revolut Order ID:", revolutOrderId);

                showSnackbar(t('Payment process started!'), 'success');
                window.location.href = response.data.checkout_url;
            } else {
                showSnackbar(t('Payment created but checkout_url not received!'), 'error');
                console.error("❌ checkout_url not received, response:", response.data);
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            showSnackbar(t('Error occurred during payment!'), 'error');
        }
    };

    // Update placeOrderAfterPayment to use cartItemsState
    const placeOrderAfterPayment = async (revolutOrderId) => {
        if (!revolutOrderId) return;

        const normalizedCartItems = cartItemsState.map((item) => ({
            ...item,
            price: parseFloat(item.price) || 0,
        }));

        const orderData = {
            guestEmail: userEmail || shippingAddress.guestEmail,
            shippingAddressLine1: shippingAddress.addressLine1,
            shippingAddressLine2: shippingAddress.addressLine2 || "",
            city: shippingAddress.city,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country,
            totalPrice: finalPrice,
            paymentMethod: "Revolut",
            items: normalizedCartItems,
        };

        try {
            const url = userEmail ? `${baseURL}/orders/${userEmail}` : `${baseURL}/orders/guest`;
            const headers = userEmail
                ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
                : { 'X-Guest-Token': initialGuestToken };
            const response = await axios.post(url, orderData, {
                headers,
                params: { revolutOrderId }
            });

            if (response.status === 200) {
                // Check payment status to trigger guest cart clearing
                if (!userEmail) {
                    await axios.get(`${baseURL}/api/payment/status?orderId=${revolutOrderId}`, {
                        headers: { 'X-Guest-Token': initialGuestToken }
                    });
                }

                showSnackbar(t('Your order has been successfully created!'), 'success');
                // Clear carts
                if (userEmail) {
                    await axios.delete(`${baseURL}/cart/${userEmail}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                } else {
                    localStorage.removeItem('cart');
                    localStorage.removeItem('guestToken');
                    localStorage.removeItem('checkoutData');
                }
                navigate('/my-orders');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            showSnackbar(t('Error occurred while creating order!'), 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => setSnackbarOpen(false);

    return (
        <div>
            <Header />
            <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 2 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <section id="shipping-information">
                            <Typography variant="h4" component="h1" gutterBottom>
                                {t('Shipping Information')}
                            </Typography>
                            <Divider sx={{ marginBottom: 2 }} />
                            <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    {t('Shipping Address')}
                                </Typography>
                                <TextField
                                    fullWidth
                                    label={t('Full Name')}
                                    name="name"
                                    value={shippingAddress.name}
                                    onChange={handleShippingAddressChange}
                                    sx={{ mb: 1 }}
                                    required
                                />
                                {!userEmail && (
                                    <TextField
                                        fullWidth
                                        label={t('Email')}
                                        name="guestEmail"
                                        value={shippingAddress.guestEmail}
                                        onChange={handleShippingAddressChange}
                                        sx={{ mb: 1 }}
                                        required
                                    />
                                )}
                                <TextField
                                    fullWidth
                                    label={t('Address Line 1')}
                                    name="addressLine1"
                                    value={shippingAddress.addressLine1}
                                    onChange={handleShippingAddressChange}
                                    sx={{ mb: 1 }}
                                    required
                                />
                                <TextField
                                    fullWidth
                                    label={t('Address Line 2')}
                                    name="addressLine2"
                                    value={shippingAddress.addressLine2}
                                    onChange={handleShippingAddressChange}
                                    sx={{ mb: 1 }}
                                />
                                <TextField
                                    fullWidth
                                    label={t('City')}
                                    name="city"
                                    value={shippingAddress.city}
                                    onChange={handleShippingAddressChange}
                                    sx={{ mb: 1 }}
                                    required
                                />
                                <TextField
                                    fullWidth
                                    label={t('Postal Code')}
                                    name="postalCode"
                                    value={shippingAddress.postalCode}
                                    onChange={handleShippingAddressChange}
                                    sx={{ mb: 1 }}
                                    required
                                />
                                <FormControl fullWidth sx={{ mb: 2 }} required>
                                    <InputLabel id="country-select-label">{t('Country')}</InputLabel>
                                    <Select
                                        labelId="country-select-label"
                                        id="country-select"
                                        name="country"
                                        label={t('Country')}
                                        value={shippingAddress.country}
                                        onChange={handleCountrySelect}
                                        variant="outlined"
                                    >
                                        <MenuItem value="">
                                            <em>{t('Select')}</em>
                                        </MenuItem>
                                        {shippingCountries.map((country) => (
                                            <MenuItem key={country.code} value={country.code}>
                                                {country.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </section>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <section id="payment-information">
                            <Typography variant="h4" component="h1" gutterBottom>
                                {t('Payment Information')}
                            </Typography>
                            <Divider sx={{ marginBottom: 2 }} />
                            <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    {t('Order Summary')}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    {t('Items Total')}: {parseFloat(basePriceState).toFixed(2)} €
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    {t('Shipping Cost')}: <strong>{parseFloat(shippingCost).toFixed(2)} €</strong>
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="h6">
                                    {t('Total')}: <strong>{parseFloat(finalPrice).toFixed(2)} €</strong>
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    sx={{ mt: 2 }}
                                    onClick={handlePaymentSubmit}
                                    disabled={cartItemsState.length === 0}
                                >
                                    {t('Proceed to Payment')}
                                </Button>
                            </Box>
                        </section>
                    </Grid>
                </Grid>
            </Box>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};
export default Payment;