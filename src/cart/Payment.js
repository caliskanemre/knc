import React, {useEffect, useState} from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Divider,
    Snackbar,
    Alert,
} from '@mui/material';
import axios from 'axios';
import Header from "../header/Header";
import { useAuth } from "../auth/AuthProvider";
import { useLocation } from 'react-router-dom'; // ✅ Import useLocation to get totalPrice
import RevolutCheckout from '@revolut/checkout';

const Payment = () => {
    const { username } = useAuth();
    const location = useLocation();
    const totalPrice = location.state?.totalPrice || 0; // ✅ Retrieve totalPrice from Cart

    const [shippingAddress, setShippingAddress] = useState({
        name: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        postalCode: '',
        country: '',
    });

    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const [currency] = useState('EUR');

    // Snackbar State
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    const handleShippingAddressChange = (event) => {
        const { name, value } = event.target;
        setShippingAddress((prev) => ({ ...prev, [name]: value }));
    };

    const validateFields = () => {
        const missingFields = [];
        if (!shippingAddress.name) missingFields.push("İsim Soyisim");
        if (!shippingAddress.addressLine1) missingFields.push("Adres Satırı 1");
        if (!shippingAddress.city) missingFields.push("Şehir");
        if (!shippingAddress.postalCode) missingFields.push("Posta Kodu");
        if (!shippingAddress.country) missingFields.push("Ülke");

        if (missingFields.length > 0) {
            showSnackbar(`Lütfen eksik alanları doldurun: ${missingFields.join(', ')}`, "warning");
            return false;
        }
        return true;
    };

    const handlePaymentSubmit = async () => {
        if (!username) {
            showSnackbar("Kullanıcı adı bulunamadı. Lütfen giriş yapın! 🔐", "warning");
            return;
        }

        if (!validateFields()) return;

        const paymentData = {
            amount: totalPrice * 100, // Convert to cents for backend
            currency,
            shippingAddress,
            username,
        };

        try {
            const response = await axios.post(`${baseURL}/api/payment`, paymentData);

            if (response.status === 200) {
                const revolutData = response.data;
                showSnackbar("Ödeme işlemi başlatıldı! 🛒", "success");

                // Expecting token and order_id from backend
                const { token, order_id } = revolutData;

                if (token) {
                    const revolutCheckout = await RevolutCheckout(token, 'sandbox');
                    revolutCheckout.payWithPopup({
                        onSuccess: () => {
                            showSnackbar("Ödeme başarıyla tamamlandı! 🎉", "success");
                            window.location.href = "/payment-success?order_id=" + order_id;
                        },
                        onError: (error) => {
                            showSnackbar("Ödeme sırasında hata oluştu! ❌ " + error.message, "error");
                        },
                        onCancel: () => {
                            showSnackbar("Ödeme iptal edildi! 🚫", "warning");
                        },
                    });
                } else {
                    showSnackbar("Ödeme token'ı alınamadı! ⚠️", "error");
                }
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            showSnackbar("Ödeme sırasında bir hata oluştu! ❌", "error");
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
            <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Teslimat Bilgileri
                </Typography>
                <Divider sx={{ marginBottom: 2 }} />

                {/* Display Total Price */}
                <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 2 }}>
                    Ödenecek Tutar: {totalPrice.toFixed(2)} €
                </Typography>

                {/* Shipping Address Section */}
                <Box sx={{ marginTop: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Teslimat Adresi
                    </Typography>
                    <TextField fullWidth label="İsim Soyisim" name="name" value={shippingAddress.name} onChange={handleShippingAddressChange} sx={{ mb: 1 }} required />
                    <TextField fullWidth label="Adres Satırı 1" name="addressLine1" value={shippingAddress.addressLine1} onChange={handleShippingAddressChange} sx={{ mb: 1 }} required />
                    <TextField fullWidth label="Adres Satırı 2" name="addressLine2" value={shippingAddress.addressLine2} onChange={handleShippingAddressChange} sx={{ mb: 1 }} />
                    <TextField fullWidth label="Şehir" name="city" value={shippingAddress.city} onChange={handleShippingAddressChange} sx={{ mb: 1 }} required />
                    <TextField fullWidth label="Posta Kodu" name="postalCode" value={shippingAddress.postalCode} onChange={handleShippingAddressChange} sx={{ mb: 1 }} required />
                    <TextField fullWidth label="Ülke" name="country" value={shippingAddress.country} onChange={handleShippingAddressChange} sx={{ mb: 1 }} required />
                </Box>

                <Divider sx={{ marginY: 3 }} />
                <Button variant="contained" color="primary" fullWidth onClick={handlePaymentSubmit}>
                    Ödeme sayfasına geç
                </Button>
            </Box>
            <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Payment;
