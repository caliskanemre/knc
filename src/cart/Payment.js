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
import Header from "../header/Header";
import axios from 'axios';

const Payment = () => {
    const [paymentMethod, setPaymentMethod] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        cardNumber: '',
        expiry: '',
        cvv: '',
        email: '',
    });

    // Ödeme seçimini değiştirme
    const handlePaymentChange = (event) => {
        setPaymentMethod(event.target.value);
    };

    // Form verilerini güncelleme
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePaymentSubmit = async () => {
        if (!paymentMethod) {
            alert('Lütfen bir ödeme yöntemi seçiniz.');
            return;
        }

        const paymentData = {
            paymentMethod,
            amount: 10000, // Example amount in cents
            currency: 'EUR', // Or your preferred currency
            cardDetails: {
                name: formData.name,
                number: formData.cardNumber,
                expiry: formData.expiry,
                cvv: formData.cvv,
            },
        };

        try {
            const response = await axios.post('/api/pay', paymentData);
            if (response.data.success) {
                alert(`Ödeme başarılı! Sipariş ID: ${response.data.paymentDetails.id}`);
            } else {
                alert('Ödeme başarısız. Lütfen tekrar deneyin.');
            }
        } catch (error) {
            console.error("Error processing payment:", error);
            alert('Ödeme sırasında bir hata oluştu.');
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
    
                {/* Kredi Kartı Detayları */}
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
                        />
                        <TextField
                            fullWidth
                            label="Kart Numarası"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                        />
                        <TextField
                            fullWidth
                            label="Son Kullanma Tarihi (MM/YY)"
                            name="expiry"
                            value={formData.expiry}
                            onChange={handleInputChange}
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
    
                {/* PayPal E-posta */}
                {paymentMethod === 'paypal' && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            PayPal Bilgileri
                        </Typography>
                        <TextField
                            fullWidth
                            label="PayPal E-posta"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </Box>
                )}

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
