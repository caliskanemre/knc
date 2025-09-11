import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import Axios from "axios";
import Header from "../header/Header";
import './css/ActivityDetails.css';
import {
    Button,
    IconButton,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Snackbar,
    Alert,
    CircularProgress,
    AccordionDetails,
    debounce,
    Box,
    Grid,
    useTheme,
    useMediaQuery
} from "@mui/material";
import { Helmet } from "react-helmet";
import axios from "axios";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { jwtDecode } from "jwt-decode";
import {
    FacebookIcon,
    FacebookShareButton,
    TelegramIcon,
    TelegramShareButton,
    WhatsappIcon,
    WhatsappShareButton
} from "react-share";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useAuth } from "../auth/AuthProvider";
import { useTranslation } from "react-i18next";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Footer from "../Footer";

function generateUUID() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

const getPrefixedImage = (url, prefix) => {
    if (!url) return url;
    return url.replace(/([^/]+)$/, `${prefix}_$1`);
};

const ProductDetails = () => {
    const { id, title } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [orderNote, setOrderNote] = useState("");
    const [guestToken] = useState(localStorage.getItem('guestToken') || generateUUID());

    const { token, isLoggedIn, favorites, toggleFavorite } = useAuth();
    const { t } = useTranslation();
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Fiyat formatlama (dönüşüm yok, yalnızca sembol)
    const formatPrice = (amount, isTR) => {
        const symbol = isTR ? '₺' : '€';
        const num = Number(amount) || 0;
        return `${num.toFixed(2)} ${symbol}`;
    };

    useEffect(() => {
        Axios.get(`${baseURL}/products/detail/${id}/${title}`)
            .then((response) => {
                setProduct(response.data);
            })
            .catch((error) => {
                console.error('Error fetching product:', error);
                showSnackbar(t("Failed to load product") + " ❌", "error");
            });
    }, [id, title, baseURL]);

    // Set default selected image
    useEffect(() => {
        if (product && product.photos && product.photos.length > 0) {
            setSelectedImage(product.photos[0].photo);
        }
    }, [product]);

    // Fetch similar products
    useEffect(() => {
        if (product && product.category) {
            fetchSimilarProducts(product.category);
        }
    }, [product]);

    const fetchSimilarProducts = async (typeValue) => {
        if (!typeValue) return;
        try {
            const response = await Axios.get(`${baseURL}/products/${typeValue}?page=0&size=5`);
            const fetched = response.data.content || [];
            const filtered = fetched.filter((p) => p.id !== product.id);
            setSimilarProducts(filtered);
        } catch (error) {
            console.error('Error fetching similar products:', error);
        }
    };

    const handleFavoriteClick = async () => {
        if (!product || !product.id) {
            showSnackbar(t("Cannot add to favorites: Product not loaded"), "error");
            return;
        }

        if (isLoggedIn && token) {
            // Logged-in user: Use toggleFavorite
            const isAlreadyFavorited = favorites.favoriteProducts?.some((fav) => fav.id === product.id);
            toggleFavorite(product.id, isAlreadyFavorited, "product");
            showSnackbar(isAlreadyFavorited ? t("Removed from favorites") + " ❌" : t("Added to favorites") + " ❤️", "success");
        } else {
            // Guest user: Update localStorage and sync with backend
            let localFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const isAlreadyFavorited = localFavorites.some(fav => fav.id === product.id);

            if (isAlreadyFavorited) {
                // Remove from favorites
                localFavorites = localFavorites.filter(fav => fav.id !== product.id);
                try {
                    await axios.delete(`${baseURL}/users/guest/favorites/${product.id}`, {
                        headers: { 'X-Guest-Token': guestToken },
                    });
                    localStorage.setItem('favorites', JSON.stringify(localFavorites));
                    showSnackbar(t("Removed from favorites") + " ❌", "success");
                } catch (error) {
                    console.error("Error removing guest favorite:", error.response?.data || error.message);
                    showSnackbar(t("Error removing from favorites"), "error");
                }
            } else {
                // Add to favorites
                const favoriteItem = {
                    id: product.id,
                    title: product.title || product.name || "Unknown",
                    price: product.price || 0,
                    photos: product.photos || [],
                    date: product.date || "",
                    activity_location: product.activityLocation || product.location || "",
                };
                localFavorites.push(favoriteItem);
                try {
                    await axios.post(`${baseURL}/users/guest/favorites/${product.id}`, {}, {
                        headers: { 'X-Guest-Token': guestToken },
                    });
                    localStorage.setItem('favorites', JSON.stringify(localFavorites));
                    showSnackbar(t("Added to favorites") + " ❤️", "success");
                } catch (error) {
                    console.error("Error adding guest favorite:", error.response?.data || error.message);
                    showSnackbar(t("Error adding to favorites"), "error");
                }
            }
        }
    };

    const handleSnackbarClose = () => setSnackbarOpen(false);

    if (product === null) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <CircularProgress />
            </div>
        );
    }

    // Discount Logic
    const discountPercent = 20;
    const originalPrice = Math.floor(product.price); // Backend için EUR baz (fallback)

    // UI fiyatları
    const isTR = !!product.is_turkey_user;
    const uiBaseOriginal = isTR ? (product.tl_price ?? product.price) : (product.eur_price ?? product.price);
    const displayOriginalPrice = Number(uiBaseOriginal) || 0;
    const displayDiscountedPrice = displayOriginalPrice * (1 - discountPercent / 100);

    const addToCart = debounce(async () => {
        if (!product || quantity <= 0) {
            showSnackbar(t('Invalid quantity'), 'warning');
            return;
        }

        const cartItem = {
            productId: product.id,
            quantity,
            price: originalPrice * quantity, // Backend EUR bekliyor varsayımı ile
            title: product.name || product.title,
            image: product.imageUrl || (product.photos && product.photos[0]?.photo),
            orderNote,
            currency: isTR ? 'TRY' : 'EUR', // Currency bilgisini ekle
            is_turkey_user: isTR // IP bazlı bilgiyi de ekle
        };

        try {
            const token = localStorage.getItem('token');
            const guestToken = localStorage.getItem('guestToken');
            const requestId = crypto.randomUUID();

            if (token) {
                const email = jwtDecode(token).sub;
                await axios.post(`${baseURL}/cart/${encodeURIComponent(email)}`, cartItem, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'X-Request-ID': requestId
                    },
                });
            } else {
                let localCart = JSON.parse(localStorage.getItem('cart')) || [];
                const existingItem = localCart.find(item => item.productId === cartItem.productId);
                if (existingItem) {
                    existingItem.quantity += cartItem.quantity;
                    existingItem.price = originalPrice * existingItem.quantity;
                    existingItem.orderNote = orderNote || existingItem.orderNote;
                } else {
                    localCart.push(cartItem);
                }
                localStorage.setItem('cart', JSON.stringify(localCart));

                await axios.post(`${baseURL}/cart/guest`, localCart, {
                    headers: {
                        'X-Guest-Token': guestToken,
                        'X-Request-ID': requestId
                    },
                });
            }

            // Google Ads conversion tracking - UI para birimine göre
            if (window.gtag) {
                window.gtag('event', 'add_to_cart', {
                    'send_to': 'AW-16834301094/UmqFCIDEyq0aEKaZnNs-',
                    'value': parseFloat(displayDiscountedPrice * quantity),
                    'currency': isTR ? 'TRY' : 'EUR',
                    'items': [{
                        'id': product.id,
                        'name': cartItem.title,
                        'quantity': quantity
                    }]
                });
                console.log("Google Ads 'add_to_cart' gönderildi:", {
                    id: product.id,
                    price: displayDiscountedPrice * quantity,
                    currency: isTR ? 'TRY' : 'EUR'
                });
            }

            // Sepet güncellendiğini bildir
            window.dispatchEvent(new Event('cartUpdated'));

            showSnackbar(t('Item added to cart'), 'success');
        } catch (error) {
            console.error('Error adding to cart:', error);
            if (error.response?.status === 500 && error.response?.data?.includes('Invalid price')) {
                showSnackbar(t('Price validation failed. Please refresh the page and try again.'), 'error');
            } else {
                showSnackbar(t('Error adding to cart'), 'error');
            }
        }
    }, 500);

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    // Emoji'leri encoding'den bağımsız oluştur
    const EMOJI = {
        bag: String.fromCodePoint(0x1F6CD, 0xFE0F),
        box: String.fromCodePoint(0x1F4E6),
        money: String.fromCodePoint(0x1F4B0),
        calendar: String.fromCodePoint(0x1F4C5),
    };

    const handleWhatsAppOrder = () => {
        if (!product || quantity <= 0) {
            showSnackbar(t('Invalid product or quantity'), 'warning');
            return;
        }

        // WhatsApp mesajı oluştur
        const isTR = !!product.is_turkey_user;
        const uiBaseOriginal = isTR ? (product.tl_price ?? product.price) : (product.eur_price ?? product.price);
        const displayOriginalPrice = Number(uiBaseOriginal) || 0;
        const displayDiscountedPrice = displayOriginalPrice * (1 - discountPercent / 100);
        const totalDiscountedPrice = displayDiscountedPrice * quantity;

        const orderSummary = `\u2022 ${product.title} - ${quantity} adet - ${formatPrice(totalDiscountedPrice, isTR)}${orderNote ? ` (Not: ${orderNote})` : ''}`;

        // Emojileri String.fromCodePoint ile kullan
        const message = `${EMOJI.bag} Yeni Siparis:\n\n` +
            `${EMOJI.box} Urun:\n${orderSummary}\n\n` +
            `${EMOJI.money} Toplam: ${formatPrice(totalDiscountedPrice, isTR)}\n\n` +
            `${EMOJI.calendar} Siparis Tarihi: ${new Date().toLocaleString('tr-TR')}`;
        const phoneNumber = '905348290866'; // Buraya WhatsApp numaranızı yazın
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank');

        showSnackbar(t('Redirecting to WhatsApp...'), 'info');
    };

    const shareUrl = window.location.href;
    const shareMessage = `${product.title} - Check out this product!`;

    const isAlreadyFavorited = isLoggedIn
        ? favorites.favoriteProducts?.some((fav) => fav.id === product.id)
        : (JSON.parse(localStorage.getItem('favorites')) || []).some(fav => fav.id === product.id);

    // Modal open/close
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Split the description into lines for the accordion
    const descriptionLines = product.description
        ? product.description.split("\n").filter((line) => line.trim() !== "")
        : [];

    return (
        <div className="activity-details-container">
            <Helmet>
                <title>{product.title} - Product Details | Kina Sepeti</title>
                <meta
                    name="description"
                    content={`Discover more about ${product.title}. Contact: ${product.product_email || 'N/A'} | ${product.product_phone || 'N/A'}`}
                />
                <link
                    rel="canonical"
                    href={`${window.location.origin}${window.location.pathname}`}
                />
                <meta property="og:title" content={product.title} />
                <meta
                    property="og:description"
                    content={product.description || 'Learn more about this product.'}
                />
                <meta
                    property="og:image"
                    content={
                        product.photos && product.photos.length > 0
                            ? getPrefixedImage(product.photos[0].photo, 'small')
                            : undefined
                    }
                />
                <meta
                    property="og:url"
                    content={`${window.location.origin}${window.location.pathname}`}
                />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={product.title} />
                <meta
                    name="twitter:description"
                    content={product.description || 'Learn more about this product.'}
                />
                <meta
                    name="twitter:image"
                    content={
                        product.photos && product.photos.length > 0
                            ? getPrefixedImage(product.photos[0].photo, 'small')
                            : undefined
                    }
                />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "http://schema.org",
                        "@type": "TouristAttraction",
                        "name": product.title,
                        "description": product.description,
                        "image": product.photos ? product.photos.map(photo => photo.photo) : [],
                        "location": {
                            "@type": "Place",
                            "name": product.location,
                        },
                        "offers": {
                            "@type": "Offer",
                            "price": product.price,
                        },
                        "telephone": product.product_phone,
                        "email": product.product_email,
                        "url": product.product_website,
                        "publisher": {
                            "@type": "Organization",
                            "name": "Kina Sepeti",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://kinasepeti.com/logo.png"
                            }
                        }
                    })}
                </script>
            </Helmet>

            <Header />
            <Box sx={{
                px: { xs: 1, sm: 2, md: 3 },
                py: { xs: 1, sm: 2 },
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <Typography
                    variant="h4"
                    component="h2"
                    sx={{
                        mb: { xs: 2, sm: 3 },
                        fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                        textAlign: { xs: 'center', md: 'left' },
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 'var(--fw-semibold)',
                        letterSpacing: 'var(--ls-tight)',
                        color: '#2c2c2c'
                    }}
                >

                </Typography>

                <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                    {/* Left Section - Image */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            {selectedImage && (
                                <Box
                                    component="img"
                                    src={getPrefixedImage(selectedImage, 'small')}
                                    srcSet={`
                                        ${getPrefixedImage(selectedImage, 'small')} 400w,
                                        ${getPrefixedImage(selectedImage, 'medium')} 800w,
                                        ${getPrefixedImage(selectedImage, 'large')} 1200w
                                    `}
                                    sizes="(max-width: 600px) 400px, (max-width: 960px) 800px, 1200px"
                                    alt="Selected"
                                    onClick={openModal}
                                    sx={{
                                        width: '100%',
                                        maxWidth: { xs: '100%', sm: '400px', md: '500px' },
                                        height: 'auto',
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        mb: 2,
                                        boxShadow: 2,
                                        '&:hover': {
                                            boxShadow: 4,
                                            transform: 'scale(1.02)',
                                            transition: 'all 0.3s ease'
                                        }
                                    }}
                                />
                            )}

                            {/* Thumbnail Container */}
                            {product.photos && product.photos.length > 0 && (
                                <Box sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 1,
                                    justifyContent: 'center',
                                    maxWidth: '100%'
                                }}>
                                    {product.photos.map((photo, index) => (
                                        <Box
                                            key={index}
                                            component="img"
                                            src={getPrefixedImage(photo.photo, 'small')}
                                            alt={`Thumbnail ${index}`}
                                            onClick={() => setSelectedImage(photo.photo)}
                                            sx={{
                                                width: { xs: 60, sm: 80, md: 100 },
                                                height: { xs: 60, sm: 80, md: 100 },
                                                objectFit: 'cover',
                                                borderRadius: 1,
                                                cursor: 'pointer',
                                                border: selectedImage === photo.photo ? '3px solid #1976d2' : '1px solid #ccc',
                                                '&:hover': {
                                                    border: '2px solid #1976d2',
                                                    transform: 'scale(1.05)',
                                                    transition: 'all 0.2s ease'
                                                }
                                            }}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Grid>

                    {/* Right Section - Product Info */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ p: { xs: 1, sm: 2 } }}>
                            <Typography
                                variant="h4"
                                component="h1"
                                className="product-title"
                                sx={{
                                    mb: 2,
                                    fontSize: { xs: '1.4rem', sm: '1.6rem', md: '1.8rem' },
                                    fontFamily: 'var(--font-heading)',
                                    fontWeight: 'var(--fw-semibold)',
                                    letterSpacing: 'var(--ls-tight)',
                                    lineHeight: 1.3,
                                    color: '#2c2c2c'
                                }}
                            >
                                {product.title}
                            </Typography>

                            {/* Price Section */}
                            {product.price && (

                                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                    <Typography className="price" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontSize: { xs: '1.1rem', sm: '1.25rem' }, fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-medium)' }}>
                                        {formatPrice(displayOriginalPrice, isTR)}
                                    </Typography>
                                    <Typography className="price" sx={{ color: 'primary.main', fontWeight: 'var(--fw-semibold)', fontSize: { xs: '1.3rem', sm: '1.5rem' }, fontFamily: 'var(--font-ui)' }}>
                                        {formatPrice(displayDiscountedPrice, isTR)}
                                    </Typography>
                                    <Box sx={{ backgroundColor: 'error.main', color: 'white', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.8rem', fontWeight: 'var(--fw-bold)', fontFamily: 'var(--font-ui)', letterSpacing: 'var(--ls-wide)' }}>
                                        {discountPercent}% OFF
                                    </Box>
                                </Box>
                            )}

                            {/* Quantity Control */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                mb: 3
                            }}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
                                    sx={{
                                        minWidth: { xs: 40, sm: 44 },
                                        height: { xs: 40, sm: 44 },
                                        fontSize: { xs: '1.1rem', sm: '1.2rem' },
                                        fontFamily: 'var(--font-ui)',
                                        fontWeight: 'var(--fw-bold)'
                                    }}
                                >
                                    -
                                </Button>
                                <Typography sx={{
                                    fontSize: { xs: '1.1rem', sm: '1.2rem' },
                                    fontWeight: 'var(--fw-semibold)',
                                    minWidth: 30,
                                    textAlign: 'center',
                                    fontFamily: 'var(--font-ui)'
                                }}>
                                    {quantity}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    onClick={() => setQuantity((prev) => prev + 1)}
                                    sx={{
                                        minWidth: { xs: 40, sm: 44 },
                                        height: { xs: 40, sm: 44 },
                                        fontSize: { xs: '1.1rem', sm: '1.2rem' },
                                        fontFamily: 'var(--font-ui)',
                                        fontWeight: 'var(--fw-bold)'
                                    }}
                                >
                                    +
                                </Button>
                            </Box>

                            {/* Order Note Section */}
                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    component="label"
                                    htmlFor="order-note"
                                    sx={{
                                        fontWeight: 'var(--fw-semibold)',
                                        display: 'block',
                                        mb: 1,
                                        fontFamily: 'var(--font-ui)',
                                        fontSize: '0.95rem',
                                        letterSpacing: 'var(--ls-normal)'
                                    }}
                                >
                                    {t("Order Note (Optional)")}
                                </Typography>
                                <Box
                                    component="textarea"
                                    id="order-note"
                                    value={orderNote}
                                    onChange={(e) => setOrderNote(e.target.value)}
                                    placeholder={t("Add any special instructions for your order...")}
                                    sx={{
                                        width: '100%',
                                        minHeight: { xs: 60, sm: 80 },
                                        border: '1px solid #ccc',
                                        borderRadius: 1,
                                        p: 1,
                                        fontSize: { xs: '0.9rem', sm: '1rem' },
                                        fontFamily: 'var(--font-primary)',
                                        letterSpacing: 'var(--ls-normal)',
                                        lineHeight: 1.5,
                                        resize: 'vertical',
                                        '&:focus': {
                                            outline: 'none',
                                            borderColor: 'primary.main'
                                        }
                                    }}
                                />
                            </Box>

                            {/* Add to Cart Button */}
                            <Button
                                onClick={() => addToCart(quantity)}
                                variant="contained"
                                color="success"
                                startIcon={<ShoppingCartIcon />}
                                fullWidth
                                sx={{
                                    mb: 2,
                                    py: { xs: 1.5, sm: 2 },
                                    fontSize: { xs: '1rem', sm: '1.1rem' },
                                    fontWeight: 'var(--fw-semibold)',
                                    fontFamily: 'var(--font-ui)',
                                    letterSpacing: 'var(--ls-wide)',
                                    textTransform: 'uppercase',
                                    borderRadius: 2,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                                    }
                                }}
                            >
                                {t('Add to Cart')}
                            </Button>

                            {/* WhatsApp Order Button */}
                            <Button
                                onClick={handleWhatsAppOrder}
                                variant="outlined"
                                color="success"
                                fullWidth
                                sx={{
                                    mb: 2,
                                    py: { xs: 1.5, sm: 2 },
                                    fontSize: { xs: '1rem', sm: '1.1rem' },
                                    fontWeight: 'var(--fw-semibold)',
                                    fontFamily: 'var(--font-ui)',
                                    letterSpacing: 'var(--ls-wide)',
                                    textTransform: 'uppercase',
                                    borderRadius: 2,
                                    borderColor: '#25D366',
                                    color: '#25D366',
                                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.15)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: '#25D366',
                                        color: 'white',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 20px rgba(37, 211, 102, 0.3)'
                                    }
                                }}
                                startIcon={<span style={{ fontSize: '1.2rem' }}>📱</span>}
                            >
                                {t('Order via WhatsApp')}
                            </Button>

                            {/* Product Type */}
                            {product.type && (
                                <Typography sx={{
                                    mb: 2,
                                    color: 'text.secondary',
                                    fontFamily: 'var(--font-primary)',
                                    fontSize: '0.9rem',
                                    letterSpacing: 'var(--ls-normal)'
                                }}>
                                    <strong style={{ fontWeight: 'var(--fw-semibold)' }}>Type:</strong> {product.type}
                                </Typography>
                            )}

                            {/* Share Buttons */}
                            <Box sx={{
                                display: 'flex',
                                gap: { xs: 1, sm: 2 },
                                justifyContent: { xs: 'center', md: 'flex-start' },
                                mb: 2
                            }}>
                                <WhatsappShareButton
                                    url={shareUrl}
                                    title={shareMessage}
                                    separator=":: "
                                    className="share-btn"
                                >
                                    <WhatsappIcon size={isMobile ? 28 : 32} round />
                                </WhatsappShareButton>
                                <TelegramShareButton
                                    url={shareUrl}
                                    title={shareMessage}
                                    className="share-btn"
                                >
                                    <TelegramIcon size={isMobile ? 28 : 32} round />
                                </TelegramShareButton>
                                <FacebookShareButton
                                    url={shareUrl}
                                    quote={shareMessage}
                                    className="share-btn"
                                >
                                    <FacebookIcon size={isMobile ? 28 : 32} round />
                                </FacebookShareButton>
                            </Box>

                            {/* Favorite Button */}
                            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                                <IconButton
                                    aria-label="add to favorites"
                                    onClick={handleFavoriteClick}
                                    sx={{
                                        color: isAlreadyFavorited ? 'error.main' : 'action.disabled',
                                        fontSize: { xs: '2rem', sm: '2.5rem' }
                                    }}
                                >
                                    {isAlreadyFavorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                </IconButton>
                            </Box>

                            {/* Description Accordion */}
                            {descriptionLines.length > 0 && (
                                <Box sx={{ mt: 3, width: '100%' }}>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{
                                            fontFamily: 'var(--font-heading)',
                                            fontWeight: 'var(--fw-semibold)',
                                            letterSpacing: 'var(--ls-tight)',
                                            color: '#2c2c2c'
                                        }}
                                    >
                                        Ürün Açıklaması
                                    </Typography>
                                    <AccordionDetails sx={{ px: 0 }}>
                                        {descriptionLines.map((line, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    mb: 1
                                                }}
                                            >
                                                <CheckCircleOutlineIcon
                                                    sx={{
                                                        color: 'success.main',
                                                        mr: 1,
                                                        fontSize: '1.2rem'
                                                    }}
                                                />
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontFamily: 'var(--font-primary)',
                                                        lineHeight: 1.6,
                                                        letterSpacing: 'var(--ls-normal)'
                                                    }}
                                                >
                                                    {line}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </AccordionDetails>
                                </Box>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content">
                        <img
                            src={getPrefixedImage(selectedImage, 'large')}
                            srcSet={`
                                ${getPrefixedImage(selectedImage, 'small')} 400w,
                                ${getPrefixedImage(selectedImage, 'medium')} 800w,
                                ${getPrefixedImage(selectedImage, 'large')} 1200w
                            `}
                            sizes="(max-width: 600px) 400px, (max-width: 960px) 800px, 1200px"
                            alt="Full Size"
                            className="modal-image"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {similarProducts.length > 0 && (
                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <h2>{t("Similar Products")}</h2>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            gap: '20px',
                            padding: '10px 20px'
                        }}
                    >
                        {similarProducts.map((sp) => {
                            const spIsTR = !!(sp.is_turkey_user ?? product?.is_turkey_user);
                            const spBaseOriginal = spIsTR ? (sp.tl_price ?? sp.price) : (sp.eur_price ?? sp.price);
                            const spOriginalNum = Number(spBaseOriginal) || 0;
                            const spOriginal = sp.photos?.[0]?.photo || "https://via.placeholder.com/300x200?text=No+Image";
                            return (
                                <Card key={sp.id} style={{ marginRight: '30px', minWidth: '200px', maxWidth: '300px', textAlign: 'center', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                                    <CardMedia
                                        component="img"
                                        alt={sp.title}
                                        height="140"
                                        image={getPrefixedImage(spOriginal, 'small')}
                                        srcSet={`
                                            ${getPrefixedImage(spOriginal, 'small')} 400w,
                                            ${getPrefixedImage(spOriginal, 'medium')} 800w,
                                            ${getPrefixedImage(spOriginal, 'large')} 1200w
                                        `}
                                        sizes="(max-width: 600px) 400px, (max-width: 960px) 800px, 1200px"
                                    />
                                    <CardContent>
                                        <Typography variant="subtitle1" component="div">
                                            {sp.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatPrice(spOriginalNum, spIsTR)}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            sx={{ mt: 1 }}
                                            onClick={() => window.open(`/products/detail/${sp.id}/${sp.title}`, "_blank")}
                                        >
                                            {t("View")}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

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

            <Footer />
        </div>
    );
};

export default ProductDetails;
