import React, { useState } from 'react';
import {
    Box,
    Typography,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    Button,
    Divider,
} from '@mui/material';
import axios from 'axios';
import Header from "../header/Header";

const Payment = () => {
    const [paymentMethod, setPaymentMethod] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        cardNumber: '',
        expiry: '',
        cvv: '',
        email: '',
    });
    const [shippingAddress, setShippingAddress] = useState({
        addressLine1: '',
        addressLine2: '',
        city: '',
        postalCode: '',
        country: '',
    });

    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const [amount] = useState(10000); // in cents (e.g., 100.00)
    const [currency] = useState('EUR');

    // Handle payment method selection
    const handlePaymentChange = (event) => {
        setPaymentMethod(event.target.value);
    };

    // Handle input changes
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleShippingAddressChange = (event) => {
        const { name, value } = event.target;
        setShippingAddress((prev) => ({ ...prev, [name]: value }));
    };

    // Submit payment
    const handlePaymentSubmit = async () => {
        if (!paymentMethod) {
            alert('Lütfen bir ödeme yöntemi seçiniz.');
            return;
        }

        // Build the payment payload
        const paymentData = {
            amount,
            currency,
            paymentMethod,
            shippingAddress,
        };

        try {
            const response = await axios.post(`${baseURL}/api/payment`, paymentData);

            if (response.status === 200) {
                const revolutData = response.data;
                if (revolutData.checkout_url) {
                    // Redirect the user to Revolut's checkout page
                    window.location.href = revolutData.checkout_url;
                } else {
                    alert('Ödeme oluşturuldu, ancak checkout_url alınamadı.');
                }
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Ödeme sırasında bir hata oluştu. ' + (error.response?.data?.error || ''));
        }
    };

    return (
        <div>
            <Header />
            <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Ödeme Sayfası
                </Typography>
                <Divider sx={{ marginBottom: 2 }} />

                <FormControl component="fieldset" sx={{ marginBottom: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Ödeme Yöntemi Seçin
                    </Typography>
                    <RadioGroup value={paymentMethod} onChange={handlePaymentChange}>
                        <FormControlLabel
                            value="bank_transfer"
                            control={<Radio />}
                            label="Havale/EFT"
                        />
                        <FormControlLabel
                            value="paypal"
                            control={<Radio />}
                            label="PayPal"
                        />
                        <FormControlLabel
                            value="credit_card"
                            control={<Radio />}
                            label="Kredi Kartı"
                        />
                    </RadioGroup>
                </FormControl>

                {paymentMethod === 'credit_card' && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Kredi Kartı Bilgileri
                        </Typography>
                        <TextField
                            fullWidth
                            label="Kart Üzerindeki İsim"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            sx={{ mb: 1 }}
                        />
                        <TextField
                            fullWidth
                            label="Kart Numarası"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            sx={{ mb: 1 }}
                        />
                        <TextField
                            fullWidth
                            label="Son Kullanma Tarihi (MM/YY)"
                            name="expiry"
                            value={formData.expiry}
                            onChange={handleInputChange}
                            sx={{ mb: 1 }}
                        />
                        <TextField
                            fullWidth
                            label="CVV"
                            name="cvv"
                            type="password"
                            value={formData.cvv}
                            onChange={handleInputChange}
                        />
                    </Box>
                )}

                <Box sx={{ marginTop: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Teslimat Adresi
                    </Typography>
                    <TextField
                        fullWidth
                        label="Adres Satırı 1"
                        name="addressLine1"
                        value={shippingAddress.addressLine1}
                        onChange={handleShippingAddressChange}
                        sx={{ mb: 1 }}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Adres Satırı 2"
                        name="addressLine2"
                        value={shippingAddress.addressLine2}
                        onChange={handleShippingAddressChange}
                        sx={{ mb: 1 }}
                    />
                    <TextField
                        fullWidth
                        label="Şehir"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleShippingAddressChange}
                        sx={{ mb: 1 }}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Posta Kodu"
                        name="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={handleShippingAddressChange}
                        sx={{ mb: 1 }}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Ülke"
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleShippingAddressChange}
                        sx={{ mb: 1 }}
                        required
                    />
                </Box>

                <Divider sx={{ marginY: 3 }} />

                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handlePaymentSubmit}
                >
                    Ödemeyi Tamamla
                </Button>
            </Box>
        </div>
    );
};

export default Payment;
