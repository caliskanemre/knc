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
    CircularProgress,
} from '@mui/material';
import axios from 'axios';
import Header from '../header/Header';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Payment = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const { totalPrice: basePrice = 0, cartItems: initialCartItems = [], email: userEmail = '', guestToken = '', currency: currencyFromState = 'EUR', eurToTry: eurToTryFromState = 36 } = location.state || {};
    const initialGuestToken = guestToken || localStorage.getItem('guestToken') || '';

    const discountRate = 20;
    const [cartItems, setCartItems] = useState(initialCartItems);
    const [totalPrice, setTotalPrice] = useState(parseFloat(basePrice) * (1 - discountRate / 100));
    const [shippingCost, setShippingCost] = useState(0);
    const [finalPrice, setFinalPrice] = useState(totalPrice + shippingCost);
    const [isLoading, setIsLoading] = useState(false);
    const [, setGuestToken] = useState(initialGuestToken); // sadece setter kullanılıyor

    const [shippingAddress, setShippingAddress] = useState({
        name: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        postalCode: '',
        country: '',
        guestEmail: userEmail || '',
    });

    // Çoklu para birimi
    const [currency, setCurrency] = useState(currencyFromState === 'TRY' ? 'TRY' : 'EUR');
    const eurToTry = parseFloat(eurToTryFromState) || 36;

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    const formatPrice = (amount, currencyType) => {
        const symbol = currencyType === 'TRY' || currencyType === 'TL' ? '₺' : '€';
        const num = Number(amount) || 0;
        return `${num.toFixed(2)} ${symbol}`;
    };

    // Debug log for component mount and state
    useEffect(() => {
        console.log("Payment component mounted with location.state:", location.state);
        console.log("Initial cartItems:", initialCartItems, "userEmail:", userEmail, "guestToken:", initialGuestToken, "currency:", currency, "eurToTry:", eurToTry);
    }, []);

    // Generate UUID for guest token
    const generateUUID = () => {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    };

    // List of shipping countries & costs (EUR baz)
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

    useEffect(() => {
        const fetchGuestCart = async () => {
            if (!userEmail && initialGuestToken) {
                setIsLoading(true);
                try {
                    console.log("Guest checkout - Fetching guest cart with token:", initialGuestToken);
                    const response = await axios.get(`${baseURL}/cart/guest`, {
                        headers: { 'X-Guest-Token': initialGuestToken },
                    });
                    const guestCartItems = response.data || [];
                    console.log("Guest checkout - Guest cart response:", guestCartItems);
                    const normalizedCartItems = guestCartItems.map(item => ({
                        ...item,
                        price: parseFloat(item.price) || 0,
                    }));
                    setCartItems(normalizedCartItems);
                    calculateTotalPrice(normalizedCartItems);

                    // Para birimini belirle: önce item.currency, yoksa is_turkey_user'a bak
                    if (normalizedCartItems.length > 0) {
                        const firstItem = normalizedCartItems[0];
                        const itemCurrency = firstItem.currency;
                        if (itemCurrency === 'TL' || itemCurrency === 'TRY') {
                            setCurrency('TRY');
                        } else if (itemCurrency === 'EUR') {
                            setCurrency('EUR');
                        } else {
                            // Currency bilgisi yoksa is_turkey_user'a bak
                            setCurrency(!!firstItem.is_turkey_user ? 'TRY' : 'EUR');
                        }
                    }

                    if (normalizedCartItems.length === 0) {
                        console.log("Guest checkout - Redirecting to /cart: Guest cart is empty");
                        showSnackbar(t('Cart is empty. Please add items to your cart.'), 'warning');
                        setTimeout(() => navigate('/cart'), 2000);
                    }
                } catch (error) {
                    console.error('Guest checkout - Error fetching guest cart:', error.response?.data || error.message);
                    console.log("Guest checkout - Redirecting to /cart: Error fetching guest cart");
                    showSnackbar(t('Error fetching cart data'), 'error');
                    setTimeout(() => navigate('/cart'), 2000);
                } finally {
                    setIsLoading(false);
                }
            } else {
                console.log("Guest checkout - Using initialCartItems:", initialCartItems);
                setCartItems(initialCartItems);
                calculateTotalPrice(initialCartItems);

                // Para birimini belirle: önce item.currency, yoksa is_turkey_user'a bak
                if (initialCartItems.length > 0) {
                    const firstItem = initialCartItems[0];
                    const itemCurrency = firstItem.currency;
                    if (itemCurrency === 'TL' || itemCurrency === 'TRY') {
                        setCurrency('TRY');
                    } else if (itemCurrency === 'EUR') {
                        setCurrency('EUR');
                    } else {
                        // Currency bilgisi yoksa is_turkey_user'a bak
                        setCurrency(!!firstItem.is_turkey_user ? 'TRY' : 'EUR');
                    }
                }

                if (initialCartItems.length === 0 && !initialGuestToken) {
                    console.log("Guest checkout - Redirecting to /cart: No cart items and no guest token");
                    showSnackbar(t('Cart is empty. Please add items to your cart.'), 'warning');
                    setTimeout(() => navigate('/cart'), 2000);
                }
            }
        };

        fetchGuestCart();
    }, [initialGuestToken, userEmail, initialCartItems, navigate]);

    useEffect(() => {
        setFinalPrice(totalPrice + parseFloat(shippingCost));
    }, [totalPrice, shippingCost]);

    const calculateTotalPrice = (items) => {
        const total = items.reduce((acc, item) => acc + parseFloat(item.price), 0);
        const discountedTotal = total * (1 - discountRate / 100);
        setTotalPrice(discountedTotal);
    };

    const handleShippingAddressChange = (event) => {
        const { name, value } = event.target;
        setShippingAddress((prev) => ({ ...prev, [name]: value }));
    };

    const handleCountrySelect = (event) => {
        const selectedCountryCode = event.target.value;
        const foundCountry = shippingCountries.find((c) => c.code === selectedCountryCode);
        const cost = foundCountry ? foundCountry.cost : 0; // EUR baz
        setShippingAddress((prev) => ({ ...prev, country: selectedCountryCode }));
        setShippingCost(cost);
        if (selectedCountryCode === 'TR') setCurrency('TRY');
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateFields = () => {
        const missingFields = [];
        if (!shippingAddress.name) missingFields.push(t('Full Name'));
        if (!shippingAddress.addressLine1) missingFields.push(t('Address Line 1'));
        if (!shippingAddress.city) missingFields.push(t('City'));
        if (!shippingAddress.postalCode) missingFields.push(t('Postal Code'));
        if (!shippingAddress.country) missingFields.push(t('Country'));
        if (!userEmail && !shippingAddress.guestEmail) missingFields.push(t('Email'));
        if (!userEmail && shippingAddress.guestEmail && !validateEmail(shippingAddress.guestEmail)) {
            showSnackbar(t('Invalid email format'), 'warning');
            return false;
        }

        if (missingFields.length > 0) {
            showSnackbar(`${t('Please fill in the missing fields')}: ${missingFields.join(', ')}`, 'warning');
            return false;
        }
        return true;
    };

    const handlePaymentSubmit = async () => {
        if (cartItems.length === 0) {
            showSnackbar(t('Cart is empty'), 'warning');
            return;
        }

        if (!validateFields()) return;

        try {
            const headers = userEmail
                ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
                : { 'X-Guest-Token': initialGuestToken };
            const validateUrl = userEmail
                ? `${baseURL}/cart/validate/${encodeURIComponent(userEmail)}`
                : `${baseURL}/cart/guest/validate`;
            console.log("Guest checkout - Validating cart with URL:", validateUrl, "Headers:", headers, "Payload:", cartItems);
            const response = await axios.post(validateUrl, cartItems, { headers });
            console.log("Guest checkout - Validation response:", response.data);
            if (!response.data.valid) {
                showSnackbar(response.data.message, 'error');
                return;
            }

            const isTR = (shippingAddress.country === 'TR') || currency === 'TRY';

            if (isTR) {
                // TRY için direkt finalPrice'ı kuruş cinsinden gönder (çeviri yapma)
                const amountInKurus = Math.round(finalPrice * 100); // TRY kuruş
                const paymentDetails = {
                    amount: amountInKurus,
                    currency: 'TRY',
                    shippingAddress: {
                        name: shippingAddress.name,
                        addressLine1: shippingAddress.addressLine1,
                        addressLine2: shippingAddress.addressLine2,
                        city: shippingAddress.city,
                        postalCode: shippingAddress.postalCode,
                        country: shippingAddress.country,
                    },
                    email: userEmail || shippingAddress.guestEmail,
                    items: cartItems,
                };
                console.log('Initiating PayTR payment with data:', paymentDetails);
                const paytrResp = await axios.post(`${baseURL}/api/payment`, paymentDetails, { headers });
                const data = paytrResp.data || {};
                if (paytrResp.status === 200) {
                    const redirectUrl = data.checkout_url || data.url || data.gateway_url || data.iframe_url;
                    if (redirectUrl) {
                        showSnackbar(t('Payment process started!'), 'success');
                        window.location.href = redirectUrl;
                        return;
                    }
                }
                showSnackbar(t('Payment could not be initiated!'), 'error');
                return;
            }

            // EUR için direkt finalPrice'ı cent cinsinden gönder
            const amountInCents = Math.round(finalPrice * 100); // EUR cent
            const paymentData = {
                amount: amountInCents,
                currency: 'EUR',
                shippingAddress: {
                    name: shippingAddress.name,
                    addressLine1: shippingAddress.addressLine1,
                    addressLine2: shippingAddress.addressLine2,
                    city: shippingAddress.city,
                    postalCode: shippingAddress.postalCode,
                    country: shippingAddress.country,
                },
                email: userEmail || shippingAddress.guestEmail,
                items: cartItems,
            };

            console.log("Guest checkout - Initiating payment with data:", paymentData);
            const paymentResponse = await axios.post(`${baseURL}/api/payment`, paymentData, { headers });
            if (paymentResponse.status === 200 && paymentResponse.data.checkout_url) {
                showSnackbar(t('Payment process started!'), 'success');
                window.location.href = paymentResponse.data.checkout_url;
            } else {
                showSnackbar(t('Payment created but checkout_url not received!'), 'error');
            }
        } catch (error) {
            console.error('Guest checkout - Error processing payment:', error.response?.data || error.message);
            showSnackbar(error.response?.data?.message || t('Error occurred during payment!'), 'error');
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const revolutOrderIdFromURL = queryParams.get('order_id');
        const paymentStatus = queryParams.get('status');

        if (revolutOrderIdFromURL && paymentStatus === "success") {
            placeOrderAfterPayment(revolutOrderIdFromURL);
        }
    }, []);

    const placeOrderAfterPayment = async (revolutOrderId) => {
        if (!revolutOrderId) return;

        const normalizedCartItems = cartItems.map(item => ({
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
            const headers = userEmail ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : { 'X-Guest-Token': initialGuestToken };
            console.log("Guest checkout - Placing order with URL:", url, "Data:", orderData);
            const response = await axios.post(url, orderData, {
                headers,
                params: { revolutOrderId }
            });

            if (response.status === 200) {
                if (!userEmail) {
                    await axios.get(`${baseURL}/api/payment/status?orderId=${revolutOrderId}`, {
                        headers: { 'X-Guest-Token': initialGuestToken }
                    });
                }

                showSnackbar(t('Your order has been successfully created!'), 'success');

                // Admin bildirim emaili gönder
                try {
                    const adminNotificationData = {
                        customerEmail: userEmail || shippingAddress.guestEmail,
                        customerName: shippingAddress.name,
                        orderId: revolutOrderId,
                        totalAmount: finalPrice,
                        currency: currency,
                        shippingCountry: shippingAddress.country,
                        itemCount: cartItems.length
                    };

                    const adminHeaders = userEmail
                        ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
                        : { 'X-Guest-Token': initialGuestToken };

                    console.log("Sending admin notification email with data:", adminNotificationData);
                    await axios.post(`${baseURL}/api/notification/admin/new-order`, adminNotificationData, {
                        headers: adminHeaders
                    });
                    console.log("Admin notification email sent successfully");
                } catch (adminEmailError) {
                    console.error('Error sending admin notification email:', adminEmailError.response?.data || adminEmailError.message);
                    // Admin email hatası sipariş oluşturma sürecini durdurmasın
                }

                if (userEmail) {
                    await axios.delete(`${baseURL}/cart/${userEmail}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                } else {
                    localStorage.removeItem('cart');
                    localStorage.removeItem('guestToken');
                    const newGuestToken = generateUUID();
                    setGuestToken(newGuestToken);
                    localStorage.setItem('guestToken', newGuestToken);
                }
                navigate('/my-orders');
            }
        } catch (error) {
            console.error('Error placing order:', error.response?.data || error.message);
            showSnackbar(error.response?.data?.message || t('Error occurred while creating order!'), 'error');
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
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
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
                                            error={shippingAddress.guestEmail && !validateEmail(shippingAddress.guestEmail)}
                                            helperText={shippingAddress.guestEmail && !validateEmail(shippingAddress.guestEmail) ? t('Invalid email format') : ''}
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
                                        {t('Items Total')}: {formatPrice(parseFloat(totalPrice), currency)}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                        {t('Shipping Cost')}: <strong>{formatPrice(parseFloat(shippingCost), currency)}</strong>
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="h6">
                                        {t('Total')}: <strong>{formatPrice(parseFloat(finalPrice), currency)}</strong>
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        sx={{ mt: 2 }}
                                        onClick={handlePaymentSubmit}
                                        disabled={cartItems.length === 0 || isLoading}
                                    >
                                        {shippingAddress.country === 'TR' || currency === 'TRY' ? t('Proceed to Payment') + ' (PayTR)' : t('Proceed to Payment')}
                                    </Button>
                                </Box>
                            </section>
                        </Grid>
                    </Grid>
                )}
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
