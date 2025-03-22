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
import { useAuth } from '../auth/AuthProvider';
import { useLocation, useNavigate } from 'react-router-dom';

const Payment = () => {
    const { email } = useAuth(); // ✅ Use email instead of username
    const location = useLocation();
    const navigate = useNavigate();

    // Received from Cart (without shipping)
    const basePrice = location.state?.totalPrice || 0;
    const discountRate = 20; // %20 indirim
    const discountedBasePrice = basePrice * (1 - discountRate / 100);

    const [shippingCost, setShippingCost] = useState(0);

    const [finalPrice, setFinalPrice] = useState(discountedBasePrice + shippingCost);



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

    // Shipping address state
    const [shippingAddress, setShippingAddress] = useState({
        name: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        postalCode: '',
        country: '',
    });

    // Final computed price (basePrice + shippingCost)
    const [currency] = useState('EUR');

    const [revolutOrderId, setRevolutOrderId] = useState(null); // ✅ Stores Revolut Order ID

    useEffect(() => {
        setFinalPrice(basePrice + shippingCost);
    }, [basePrice, shippingCost]);

    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    // Snackbar State
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    // Handle form changes
    const handleShippingAddressChange = (event) => {
        const { name, value } = event.target;
        setShippingAddress((prev) => ({ ...prev, [name]: value }));
    };

    // Handle country selection from the dropdown
    const handleCountrySelect = (event) => {
        const selectedCountryCode = event.target.value;
        const foundCountry = shippingCountries.find((c) => c.code === selectedCountryCode);
        const cost = foundCountry ? foundCountry.cost : 0;
        setShippingAddress((prev) => ({ ...prev, country: selectedCountryCode }));
        setShippingCost(cost);
    };

    const validateFields = () => {
        const missingFields = [];
        if (!shippingAddress.name) missingFields.push(t('Full Name'));
        if (!shippingAddress.addressLine1) missingFields.push(t('Address Line 1'));
        if (!shippingAddress.city) missingFields.push(t('City'));
        if (!shippingAddress.postalCode) missingFields.push(t('Postal Code'));
        if (!shippingAddress.country) missingFields.push(t('Country'));

        if (missingFields.length > 0) {
            showSnackbar(`${t('Please fill in the missing fields')}: ${missingFields.join(', ')}`, 'warning');
            return false;
        }
        return true;
    };

    const handlePaymentSubmit = async () => {
        if (!email) {
            showSnackbar(t('User not found. Please log in!'), 'warning');
            return;
        }

        if (!validateFields()) return;

        const amountInCents = Math.round(finalPrice * 100);
        const paymentData = {
            amount: amountInCents,
            currency,
            shippingAddress,
            email, // ✅ Use email in request payload
        };

    try {
        const response = await axios.post(`${baseURL}/api/payment`, paymentData);

        console.log("🚀 Payment API Response:", response.data); // ✅ Debug Log

        if (response.status === 200 && response.data.checkout_url) {
            const revolutOrderId = new URL(response.data.checkout_url).searchParams.get("order_id"); // ✅ Extract order_id
            setRevolutOrderId(revolutOrderId);
            console.log("✅ Revolut Order ID:", revolutOrderId); // ✅ Debug Log

                showSnackbar(t('Payment process started!'), 'success');
                window.location.href = response.data.checkout_url;
            } else {
                showSnackbar(t('Payment created but checkout_url not received!'), 'error');
                console.error("❌ checkout_url alınamadı, response:", response.data);
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            showSnackbar(t('Error occurred during payment!'), 'error');
        }
    };

    /**
     * ✅ Step 2: Places Order in Backend After Payment is Authorized
     */
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const revolutOrderIdFromURL = queryParams.get('order_id');
        const paymentStatus = queryParams.get('status'); // "success" or "failed"

        if (revolutOrderIdFromURL && paymentStatus === "success") {
            setRevolutOrderId(revolutOrderIdFromURL);
            placeOrderAfterPayment(revolutOrderIdFromURL);
        }
    }, []);

    const placeOrderAfterPayment = async (revolutOrderId) => {
        if (!email || !revolutOrderId) return;

        const orderData = {
            totalPrice: finalPrice,
            paymentMethod: "Revolut",
            orderItems: [],
        };

        try {
            const response = await axios.post(
                `${baseURL}/orders/${email}?revolutOrderId=${revolutOrderId}`,
                orderData
            );

            if (response.status === 200) {
                showSnackbar(t('Your order has been successfully created!'), 'success');
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
                    {/* Shipping Information Section */}
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
                                        variant={'outlined'}
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

                    {/* Payment Information Section */}
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
                                    {t('Items Total')}: <s>{basePrice.toFixed(2)} €</s> →
                                    <strong>{discountedBasePrice.toFixed(2)} €</strong>
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1 }}>
                                    {t('Shipping Cost')}: <strong>{shippingCost.toFixed(2)} €</strong>
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="h6">
                                    {t('Total')}: <strong>{finalPrice.toFixed(2)} €</strong>
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    sx={{ mt: 2 }}
                                    onClick={handlePaymentSubmit}
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
