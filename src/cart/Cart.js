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
    CircularProgress,
} from '@mui/material';
import Header from "../header/Header";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

const Cart = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [email, setEmail] = useState('');
    const [guestToken] = useState(localStorage.getItem('guestToken') || generateUUID());
    const [previousCartItems, setPreviousCartItems] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Toast Message State
    const [toastMessage, setToastMessage] = useState('');
    const [toastSeverity, setToastSeverity] = useState("success");
    const [toastOpen, setToastOpen] = useState(false);

    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const discountRate = 20;

    // Para birimi ve kur - Backend'den gelen fiyatı olduğu gibi göster
    const [currency] = useState(() => {
        try {
            const saved = localStorage.getItem('currency');
            if (saved === 'TRY' || saved === 'EUR') return saved;
        } catch (_) {}
        const lang = (i18n?.language || '').toLowerCase();
        return lang.startsWith('tr') ? 'TRY' : 'EUR';
    });
    const eurToTry = parseFloat(process.env.REACT_APP_EUR_TO_TRY) || 36; // Varsayılan kur

    const formatPrice = (amount, isTR) => {
        const symbol = isTR ? '₺' : '€';
        const num = Number(amount) || 0;
        return `${num.toFixed(2)} ${symbol}`;
    };


    // Generate UUID for guest token
    function generateUUID() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    useEffect(() => {
        // Ensure guest token is stored
        if (!localStorage.getItem('guestToken')) {
            localStorage.setItem('guestToken', guestToken);
        }
        // Para birimini sakla
        try { localStorage.setItem('currency', currency); } catch (_) {}

        const initializeCart = async () => {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    if (decodedToken?.sub && decodedToken.sub.includes('@')) {
                        setEmail(decodedToken.sub);
                        await syncLocalCartToServer(decodedToken.sub);
                        await fetchCartItems();
                    }
                } catch (error) {
                    console.error("Error decoding JWT token:", error);
                    showToast(t("Error initializing cart"), "error");
                    await fetchGuestCart(); // Fallback to guest cart
                }
            } else {
                await fetchGuestCart();
            }
            setIsLoading(false);
        };

        initializeCart();
    }, []);

    const fetchGuestCart = async () => {
        try {
            const response = await axios.get(`${baseURL}/cart/guest`, {
                headers: { 'X-Guest-Token': guestToken },
            });
            const serverCart = response.data || [];
            const normalizedServerCart = serverCart.map(item => ({
                ...item,
                price: parseFloat(item.price) || 0,
                // Currency bilgisini güvence altına al
                currency: item.currency || (item.is_turkey_user ? 'TRY' : 'EUR'),
            }));
            setCartItems(normalizedServerCart);
            calculateTotalPrice(normalizedServerCart);
            localStorage.setItem('cart', JSON.stringify(normalizedServerCart)); // Sync localStorage
        } catch (error) {
            console.error("Error fetching guest cart:", error.response?.data || error.message);
            const localCart = JSON.parse(localStorage.getItem('cart')) || [];
            const normalizedCart = localCart.map(item => ({
                ...item,
                price: parseFloat(item.price) || 0,
                // Local cart'ta da currency bilgisini güvence altına al
                currency: item.currency || (item.is_turkey_user ? 'TRY' : 'EUR'),
            }));
            setCartItems(normalizedCart);
            calculateTotalPrice(normalizedCart);
            if (localCart.length > 0) {
                await syncGuestCart(normalizedCart);
            }
        }
    };

    const syncGuestCart = async (items) => {
        if (isSyncing) return;
        setIsSyncing(true);
        try {

            const normalizedItems = items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: parseFloat(item.price) || 0,
                title: item.title,
                image: item.image,
                orderNote: item.orderNote,
                currency: item.currency || (item.is_turkey_user ? 'TRY' : 'EUR'), // Currency bilgisini ekle
                is_turkey_user: item.is_turkey_user // IP bazlı bilgiyi ekle
            }));
            const response = await axios.post(`${baseURL}/cart/guest`, normalizedItems, {
                headers: { 'X-Guest-Token': guestToken },
            });
            const serverCart = response.data || [];
            const normalizedServerCart = serverCart.map(item => ({
                ...item,
                price: parseFloat(item.price) || 0,
            }));
            setCartItems(normalizedServerCart);
            calculateTotalPrice(normalizedServerCart);
            localStorage.setItem('cart', JSON.stringify(normalizedServerCart));
        } catch (error) {
            console.error("Error syncing guest cart:", error.response?.data || error.message);
            showToast(t("Error syncing guest cart"), "error");
        } finally {
            setIsSyncing(false);
        }
    };

    const syncLocalCartToServer = async (userEmail) => {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (localCart.length === 0) return;

        try {
            // Currency bilgisini belirle
            let syncCurrency = currency; // State'den al
            if (localCart.length > 0 && localCart[0].currency) {
                syncCurrency = localCart[0].currency;
            }

            // Yeni sync endpoint'ini kullan
            const response = await axios.post(`${baseURL}/cart/${encodeURIComponent(userEmail)}/sync`, localCart, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    currency: syncCurrency
                }
            });

            // Sync edilen cart'ı state'e set et
            const syncedCart = response.data || [];
            const normalizedCart = syncedCart.map(item => ({
                ...item,
                price: parseFloat(item.price) || 0,
            }));
            setCartItems(normalizedCart);
            calculateTotalPrice(normalizedCart);

            // Local cart'ı temizle
            localStorage.removeItem('cart');
        } catch (error) {
            console.error("Error syncing local cart to server:", error.response?.data || error.message);
            showToast(t("Error syncing cart"), "error");
        }
    };

    const fetchCartItems = async () => {
        if (!email) return;

        try {
            const response = await axios.get(`${baseURL}/cart/${encodeURIComponent(email)}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const items = (response.data ?? []).map(item => ({
                ...item,
                price: parseFloat(item.price) || 0,
            }));
            setCartItems(items);
            calculateTotalPrice(items);

            if (previousCartItems.length < items.length) {
                const newItem = items.find(item => !previousCartItems.some(prev => (prev.productId || prev.id) === (item.productId || item.id)));
                if (newItem && window.gtag) {
                    const isTR = !!newItem.is_turkey_user;
                    const currencyCode = isTR ? 'TRY' : 'EUR';
                    window.gtag('event', 'conversion', {
                        'send_to': 'AW-16834301094/UmqFCIDEyq0aEKaZnNs-',
                        'value': newItem.price,
                        'currency': currencyCode,
                        'event_callback': () => {
                            console.log('Add to Cart conversion tracked');
                        }
                    });
                }
            }
            setPreviousCartItems(items);
        } catch (error) {
            console.error("Error fetching cart items:", error);
            setCartItems([]);
            setTotalPrice(0);
            showToast(t("Error fetching cart"), "error");
        }
    };

    const calculateTotalPrice = (items) => {
        // Sepetteki ürünleri tek bir 'reduce' döngüsüyle topla
        const total = items.reduce((acc, item) => {
            // Her bir ürün için para birimini kontrol et
            const isTR = item.currency === 'TL' || item.currency === 'TRY' || !!item.is_turkey_user;

            // Ürünün birim fiyatını doğru para birimine göre belirle
            // Not: Backend'den gelen 'price' zaten toplam fiyatsa, quantity'e bölerek birim fiyatı buluruz.
            const unitPrice = isTR
                ? (item.tl_price ?? item.price) / item.quantity
                : (item.eur_price ?? item.price) / item.quantity;

            // Toplama mevcut ürünün toplam fiyatını ekle
            return acc + (unitPrice || 0) * item.quantity;
        }, 0); // Başlangıç değeri 0

        // İndirim uygula ve sonucu döndür
        const discountedTotal = total * (1 - discountRate / 100);
        setTotalPrice(discountedTotal);
    };

    const handleRemoveItem = async (id) => {
        const originalItems = [...cartItems];
        const updatedItems = cartItems.filter(item => (item.productId || item.id) !== id);

        if (email) {
            try {
                await axios.delete(`${baseURL}/cart/${encodeURIComponent(email)}/item/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setCartItems(updatedItems);
                setPreviousCartItems(updatedItems);
                calculateTotalPrice(updatedItems);
                showToast(t("Item removed from cart"), "success");
            } catch (error) {
                console.error("Error removing item:", error.response?.data || error.message);
                setCartItems(originalItems);
                showToast(error.response?.data?.message || t("Error removing item"), "error");
            }
        } else {
            try {
                await axios.delete(`${baseURL}/cart/guest/item/${id}`, {
                    headers: { 'X-Guest-Token': guestToken },
                });
                setCartItems(updatedItems);
                setPreviousCartItems(updatedItems);
                calculateTotalPrice(updatedItems);
                localStorage.setItem('cart', JSON.stringify(updatedItems));
                showToast(t("Item removed from cart"), "success");
            } catch (error) {
                console.error("Error removing guest item:", error.response?.data || error.message);
                setCartItems(originalItems);
                localStorage.setItem('cart', JSON.stringify(originalItems));
                showToast(error.response?.data?.message || t("Error removing item"), "error");
            }
        }
    };

    const handleUpdateQuantity = async (id, action) => {
        const productIndex = cartItems.findIndex(item => (item.productId || item.id) === id);
        if (productIndex === -1) return;

        const product = cartItems[productIndex];
        const updatedQuantity = product.quantity + (action === 'increment' ? 1 : -1);

        if (updatedQuantity <= 0) return;

        // Backend orijinal fiyat bekliyor, indirim backend'de uygulanıyor
        const unitPrice = product.price / product.quantity; // Mevcut toplam fiyattan birim fiyatı hesapla
        const updatedItems = [...cartItems];
        updatedItems[productIndex] = {
            ...product,
            quantity: updatedQuantity,
            price: unitPrice * updatedQuantity, // Toplam fiyat = birim fiyat * yeni miktar
        };
        setCartItems(updatedItems);
        calculateTotalPrice(updatedItems);

        if (email) {
            try {
                const cartItemDTO = {
                    productId: id,
                    quantity: updatedQuantity,
                    price: unitPrice * updatedQuantity, // Backend'e toplam fiyat gönder
                    title: product.title,
                    image: product.image,
                    orderNote: product.orderNote,
                    currency: product.currency || (product.is_turkey_user ? 'TRY' : 'EUR'), // Currency bilgisini koru
                    is_turkey_user: product.is_turkey_user // IP bazlı bilgiyi koru
                };
                await axios.put(`${baseURL}/cart/${encodeURIComponent(email)}/item/${id}`, cartItemDTO, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                showToast(t("Quantity updated"), "success");
            } catch (error) {
                console.error("Error updating quantity:", error);
                if (error.response?.status === 500 && error.response?.data?.includes('Invalid price')) {
                    showToast(t('Price validation failed. Please refresh the page and try again.'), 'error');
                    fetchCartItems();
                } else {
                    fetchCartItems();
                    showToast(error.response?.data || t("Error updating quantity"), "error");
                }
            }
        } else {
            try {
                await syncGuestCart(updatedItems);
                showToast(t("Quantity updated"), "success");
            } catch (error) {
                console.error("Error updating guest quantity:", error);
                if (error.response?.status === 500 && error.response?.data?.includes('Invalid price')) {
                    showToast(t('Price validation failed. Please refresh the page and try again.'), 'error');
                }
                fetchGuestCart();
                showToast(t("Error updating quantity"), "error");
            }
        }
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            showToast(t("Cart is empty. Please add items to your cart."), "warning");
            return;
        }

        try {
            const headers = email
                ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
                : { 'X-Guest-Token': guestToken };
            const validateUrl = email
                ? `${baseURL}/cart/validate/${encodeURIComponent(email)}`
                : `${baseURL}/cart/guest/validate`;
            console.log("Validating cart with URL:", validateUrl, "Headers:", headers); // Debug log
            const response = await axios.post(validateUrl, cartItems, { headers });
            console.log("Validation response:", response.data); // Debug log
            if (response.data.valid) {
                const lang = i18n.language || 'tr';
                console.log("Guest checkout - Navigating to:", `/${lang}/payment`, "with state:", { totalPrice, cartItems, email, guestToken, currency, eurToTry }); // Debug log
                navigate(`/${lang}/payment`, { state: { totalPrice, cartItems, email, guestToken, currency, eurToTry } });
                console.log("Guest checkout - Navigation called successfully"); // Debug log
            } else {
                showToast(response.data.message || t("Cart validation failed"), "error");
            }
        } catch (error) {
            console.error("Error validating guest cart:", error.response?.data || error.message);
            showToast(error.response?.data?.message || t("Error validating cart"), "error");
        }
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
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Typography
                            variant="h4"
                            component="h1"
                            gutterBottom
                            sx={{
                                fontFamily: 'var(--font-heading)',
                                fontWeight: 'var(--fw-bold)',
                                color: '#2c2c2c',
                                letterSpacing: 'var(--ls-tight)',
                                textAlign: 'center',
                                mb: 3
                            }}
                        >
                            {t("My Cart")}
                        </Typography>
                        <Divider sx={{ marginBottom: 2 }} />

                        {cartItems.length > 0 ? (
                            <List>
                                {cartItems.map((item) => {
                                    const isTR = (item.currency === 'TL' || item.currency === 'TRY') || !!item.is_turkey_user; // Main.js ve toplam ile aynı mantık
                                    const id = item.productId || item.id;

                                    // Fiyat hesaplama - currency'ye göre doğru fiyatı kullan
                                    let unitPrice;
                                    if (isTR) {
                                        unitPrice = (item.tl_price ?? item.price) / item.quantity || 0;
                                    } else {
                                        unitPrice = (item.eur_price ?? item.price) / item.quantity || 0;
                                    }
                                    const totalPrice = unitPrice * item.quantity;

                                    const originalImageUrl = item.image || 'https://via.placeholder.com/100x100?text=No+Image';
                                    const smallImageUrl = originalImageUrl.replace(/([^/]+)$/, 'small_$1');
                                    const mediumImageUrl = originalImageUrl.replace(/([^/]+)$/, 'medium_$1');
                                    const largeImageUrl = originalImageUrl.replace(/([^/]+)$/, 'large_$1');

                                    return (
                                        <Card
                                            key={id}
                                            sx={{
                                                marginBottom: 2,
                                                borderRadius: 2,
                                                boxShadow: 2,
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    boxShadow: 4,
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ p: 3 }}>
                                                <a href={`/products/detail/${id}/${encodeURIComponent(item.title || '')}`}>
                                                    <CardMedia
                                                        component="img"
                                                        image={smallImageUrl}
                                                        srcSet={`
                                                            ${smallImageUrl} 100w,
                                                            ${mediumImageUrl} 200w,
                                                            ${largeImageUrl} 300w
                                                        `}
                                                        sizes="(max-width: 600px) 100px, 300px"
                                                        alt={item.title || t("Product Image")}
                                                        sx={{
                                                            width: '100px',
                                                            height: '100px',
                                                            objectFit: 'cover',
                                                            borderRadius: 1,
                                                            mb: 2
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontFamily: 'var(--font-heading)',
                                                            fontWeight: 'var(--fw-semibold)',
                                                            color: '#2c2c2c',
                                                            letterSpacing: 'var(--ls-tight)',
                                                            mb: 1
                                                        }}
                                                    >
                                                        {item.title}
                                                    </Typography>
                                                </a>
                                                <Typography
                                                    color="textSecondary"
                                                    sx={{
                                                        fontFamily: 'var(--font-ui)',
                                                        fontSize: '0.9rem',
                                                        mb: 0.5
                                                    }}
                                                >
                                                    {t("Unit Price")}: {formatPrice(unitPrice, isTR)}
                                                </Typography>
                                                <Typography
                                                    color="textSecondary"
                                                    sx={{
                                                        fontFamily: 'var(--font-ui)',
                                                        fontSize: '0.9rem',
                                                        mb: 0.5
                                                    }}
                                                >
                                                    {t("Quantity")}: {item.quantity}
                                                </Typography>
                                                <Typography
                                                    color="textSecondary"
                                                    sx={{
                                                        fontFamily: 'var(--font-ui)',
                                                        fontSize: '0.9rem',
                                                        mb: 1
                                                    }}
                                                >
                                                    {t("Total Price")}: <s>{formatPrice(totalPrice, isTR)}</s> →
                                                    <strong style={{
                                                        color: '#1976d2',
                                                        fontWeight: 'var(--fw-semibold)'
                                                    }}>
                                                        {formatPrice(totalPrice * (1 - discountRate / 100), isTR)}
                                                    </strong>
                                                </Typography>
                                                {item.orderNote && (
                                                    <Typography
                                                        color="textSecondary"
                                                        sx={{
                                                            fontStyle: 'italic',
                                                            marginTop: 1,
                                                            fontFamily: 'var(--font-primary)',
                                                            fontSize: '0.85rem',
                                                            lineHeight: 1.5
                                                        }}
                                                    >
                                                        {t("Note")}: {item.orderNote}
                                                    </Typography>
                                                )}
                                            </CardContent>
                                            <CardActions sx={{ p: 2, pt: 0 }}>
                                                <Button
                                                    size="small"
                                                    onClick={() => handleUpdateQuantity(id, 'decrement')}
                                                    sx={{
                                                        fontFamily: 'var(--font-ui)',
                                                        fontWeight: 'var(--fw-bold)',
                                                        minWidth: 40
                                                    }}
                                                >
                                                    -
                                                </Button>
                                                <Button
                                                    size="small"
                                                    onClick={() => handleUpdateQuantity(id, 'increment')}
                                                    sx={{
                                                        fontFamily: 'var(--font-ui)',
                                                        fontWeight: 'var(--fw-bold)',
                                                        minWidth: 40
                                                    }}
                                                >
                                                    +
                                                </Button>
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleRemoveItem(id)}
                                                    sx={{
                                                        fontFamily: 'var(--font-ui)',
                                                        fontWeight: 'var(--fw-medium)',
                                                        letterSpacing: 'var(--ls-normal)'
                                                    }}
                                                >
                                                    {t("Remove Item")}
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    );
                                })}
                            </List>
                        ) : (
                            <Typography
                                sx={{
                                    textAlign: 'center',
                                    fontFamily: 'var(--font-primary)',
                                    fontSize: '1.1rem',
                                    color: 'text.secondary',
                                    py: 4
                                }}
                            >
                                {t("Your cart is empty")}
                            </Typography>
                        )}

                        <Divider sx={{ marginY: 2 }} />

                        <Typography
                            variant="h5"
                            component="h2"
                            sx={{
                                fontFamily: 'var(--font-heading)',
                                fontWeight: 'var(--fw-bold)',
                                color: '#2c2c2c',
                                textAlign: 'center',
                                mb: 3
                            }}
                        >
                            {t("Total")}: {formatPrice(totalPrice,
                            // Sepette ürün varsa ilk ürünün para birimini kontrol et, yoksa 'false' (EUR) varsay
                            cartItems.length > 0 ? (cartItems[0].currency === 'TL' || cartItems[0].currency === 'TRY' || !!cartItems[0].is_turkey_user) : false
                        )}
                        </Typography>

                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{
                                marginTop: 2,
                                py: 2,
                                fontFamily: 'var(--font-ui)',
                                fontWeight: 'var(--fw-semibold)',
                                letterSpacing: 'var(--ls-wide)',
                                textTransform: 'uppercase',
                                borderRadius: 2,
                                fontSize: '1.1rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                                }
                            }}
                            disabled={cartItems.length === 0}
                            onClick={handleCheckout}
                        >
                            {t("Proceed to Checkout")}
                        </Button>
                    </>
                )}
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

