import React, { useEffect, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Helmet } from 'react-helmet';
import Axios from 'axios';
import axios from 'axios';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useAuth } from './auth/AuthProvider';
import Header from './header/Header';
import HeroSection from './shared/HeroSection';
import { useTranslation } from "react-i18next";
import Footer from "./Footer";

const theme = createTheme({
    typography: {
        fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
        h6: {
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700,
            fontSize: '1.25rem',
        },
        productTitle: {
            fontFamily: '"Playfair Display", serif',
            fontWeight: 700,
            fontSize: '1.25rem',
        }
    },
    palette: {
        primary: {
            main: '#C84B31',
        },
        secondary: {
            main: '#ECDCCB',
        },
    },
});

const PAGE_SIZE = 20;

// Helper function to generate a prefixed image URL (e.g., "small_", "medium_", "large_")
const getPrefixedImage = (url, prefix) => {
    if (!url) return url;
    return url.replace(/([^/]+)$/, `${prefix}_$1`);
};

// Generate UUID for guest token
const generateUUID = () => {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
};

export default function Main() {
    const [products, setProducts] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [guestToken] = useState(localStorage.getItem('guestToken') || generateUUID());
    const { t, i18n } = useTranslation();
    const { favorites, isLoggedIn, toggleFavorite, token } = useAuth();
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    // Get current locale from i18next
    const getCurrentLocale = () => {
        const currentLang = i18n.language || 'tr';
        return currentLang.split('-')[0]; // 'tr-TR' -> 'tr'
    };

    // Helper function to get localized product name
    const getLocalizedName = (item) => {
        const locale = getCurrentLocale();
        if (locale === 'en' && item.nameEn) {
            return item.nameEn;
        }
        return item.name || item.title;
    };

    // Helper function to get localized description
    const getLocalizedDescription = (item) => {
        const locale = getCurrentLocale();
        if (locale === 'en' && item.descriptionEn) {
            return item.descriptionEn;
        }
        if (locale === 'en' && item.shortDescriptionEn) {
            return item.shortDescriptionEn;
        }
        return item.description || item.shortDescription;
    };

    // Helper function to format price with currency
    const formatPrice = (item) => {
        // Backend otomatik olarak doğru fiyatı döner (TL veya EUR)
        if (item && (item.price || item.tlPrice)) {
            // TL fiyatı varsa TL kullan, yoksa EUR
            if (item.tlPrice) {
                return `${Math.floor(item.tlPrice)} ₺`;
            } else {
                return `${Math.floor(item.price)} €`;
            }
        }
        return '';
    };

    // Helper function to format discounted price
    const formatDiscountedPrice = (item, discountPercent = 20) => {
        if (item.tlPrice) {
            return `${Math.floor(item.tlPrice * (1 - discountPercent / 100))} ₺`;
        } else if (item.price) {
            return `${Math.floor(item.price * (1 - discountPercent / 100))} €`;
        }
        return '';
    };

    // Fetch products
    const fetchProducts = async (pageNum) => {
        try {
            const locale = getCurrentLocale();
            const response = await Axios.get(`${baseURL}/products/all`, {
                params: {
                    page: pageNum,
                    size: PAGE_SIZE,
                    locale: locale // Backend otomatik olarak currency tespit edecek
                },
            });

            const data = response.data;
            if (pageNum === 0) {
                setProducts(data.content);
            } else {
                setProducts(prev => [...prev, ...data.content]);
            }
            setHasMore(!data.last);
        } catch (error) {
            console.error('Error fetching products:', error);
            showSnackbar(t('Error loading products'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchProducts(0);
    }, [baseURL, i18n.language]);

    const loadMore = () => {
        if (hasMore && !loading) {
            setLoading(true);
            const nextPage = page + 1;
            setPage(nextPage);
            fetchProducts(nextPage);
        }
    };

    const handleFavoriteClick = async (productId) => {
        if (!productId || typeof productId !== 'number') {
            showSnackbar(t('Cannot add to favorites: Invalid product'), 'error');
            return;
        }

        const product = products.find(p => p.id === productId);
        if (!product) {
            showSnackbar(t('Cannot add to favorites: Product not found'), 'error');
            return;
        }

        if (isLoggedIn && token) {
            const isAlreadyFavorited = favorites.favoriteEvents?.some(p => p.id === productId);
            try {
                await toggleFavorite(productId, isAlreadyFavorited, 'event');
                showSnackbar(
                    isAlreadyFavorited ? t('Removed from favorites') + ' ❌' : t('Added to favorites') + ' ❤️',
                    'success'
                );
            } catch (error) {
                console.error('Error syncing favorite to server:', error);
                showSnackbar(t('Error syncing favorites'), 'error');
            }
        } else {
            // Guest user: Manage local storage favorites
            let localFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const isAlreadyFavorited = localFavorites.some(fav => fav.id === productId);

            if (isAlreadyFavorited) {
                localFavorites = localFavorites.filter(fav => fav.id !== productId);
                try {
                    await axios.delete(`${baseURL}/users/guest/favorites/${productId}`, {
                        headers: { 'X-Guest-Token': guestToken },
                    });
                    localStorage.setItem('favorites', JSON.stringify(localFavorites));
                    showSnackbar(t('Removed from favorites') + ' ❌', 'info');
                } catch (error) {
                    console.error("Error removing guest favorite:", error.response?.data || error.message);
                    showSnackbar(t('Error removing from favorites'), 'error');
                }
            } else {
                const favoriteItem = {
                    id: product.id,
                    title: getLocalizedName(product),
                    name: getLocalizedName(product),
                    price: product.price,
                    tlPrice: product.tlPrice,
                    product_photos: product.product_photos || [],
                    date: product.date || "",
                    activity_location: product.activityLocation || product.location || "",
                };
                localFavorites.push(favoriteItem);
                try {
                    await axios.post(`${baseURL}/users/guest/favorites/${productId}`, {}, {
                        headers: { 'X-Guest-Token': guestToken },
                    });
                    localStorage.setItem('favorites', JSON.stringify(localFavorites));
                    showSnackbar(t('Added to favorites') + ' ❤️', 'success');
                } catch (error) {
                    console.error("Error adding guest favorite:", error.response?.data || error.message);
                    showSnackbar(t('Error adding to favorites'), 'error');
                }
            }
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const getDynamicFontSize = (title) => {
        if (title.length < 10) return "1.5rem";
        if (title.length < 20) return "1.3rem";
        return "1.1rem";
    };

    const discountPercent = 20;

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Helmet>
                <title>Kına Sepeti - Kına Gecesi İçin Özel Ürünler</title>
                <meta name="description" content="Kına geceniz için özel tasarlanmış ürünler. Kına takıları, çeyiz, süsleme malzemeleri ve daha fazlası." />
                <meta name="keywords" content="kına, kına gecesi, kına takısı, çeyiz, düğün" />
                <link rel="canonical" href={window.location.origin} />
            </Helmet>
            <Header />
            <HeroSection />

            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography variant="h3" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
                    {t('Öne Çıkan Ürünler')}
                </Typography>

                <Grid container spacing={3}>
                    {products.map((product) => {
                        // Check if product is favorited
                        const isProductFavorited = isLoggedIn
                            ? favorites.favoriteEvents?.some(event => event.id === product.id)
                            : JSON.parse(localStorage.getItem('favorites') || '[]').some(fav => fav.id === product.id);

                        // Backend'ten gelen product_photos array'ini kullan
                        const originalImage = (product.product_photos && product.product_photos[0]
                            ? product.product_photos[0].photoUrl
                            : product.imageUrl);

                        // Generate prefixed image URLs
                        const smallImageUrl = getPrefixedImage(originalImage, 'small');
                        const mediumImageUrl = getPrefixedImage(originalImage, 'medium');
                        const largeImageUrl = getPrefixedImage(originalImage, 'large');

                        return (
                            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                                <Card sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'scale(1.02)'
                                    }
                                }}>
                                    <a href={`/products/detail/${product.id}/${getLocalizedName(product)}`} style={{ textDecoration: 'none' }}>
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={smallImageUrl}
                                            srcSet={`
                                                ${smallImageUrl} 400w,
                                                ${mediumImageUrl} 800w,
                                                ${largeImageUrl} 1200w
                                            `}
                                            sizes="(max-width: 600px) 400px, (max-width: 960px) 800px, 1200px"
                                            alt={getLocalizedName(product)}
                                            loading="lazy"
                                        />
                                    </a>
                                    <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography
                                            variant="h6"
                                            component="h3"
                                            sx={{
                                                fontSize: getDynamicFontSize(getLocalizedName(product)),
                                                fontWeight: 600,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                mb: 1
                                            }}
                                        >
                                            {getLocalizedName(product)}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                                            {getLocalizedDescription(product)}
                                        </Typography>

                                        {/* Fiyat bilgisini göster */}
                                        {(product.price || product.tlPrice) && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Typography
                                                    sx={{
                                                        textDecoration: 'line-through',
                                                        color: 'gray',
                                                        mr: 1,
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    {formatPrice(product)}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        color: '#1976d2',
                                                        fontWeight: 'bold',
                                                        fontSize: '1rem'
                                                    }}
                                                >
                                                    {formatDiscountedPrice(product, discountPercent)}
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        backgroundColor: 'red',
                                                        color: 'white',
                                                        px: 1,
                                                        py: 0.5,
                                                        borderRadius: 1,
                                                        ml: 1,
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    20%
                                                </Box>
                                            </Box>
                                        )}

                                        <Button
                                            variant="contained"
                                            color="primary"
                                            fullWidth
                                            href={`/products/detail/${product.id}/${getLocalizedName(product)}`}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            {t('Detayları Görüntüle')}
                                        </Button>
                                    </Box>

                                    <IconButton
                                        aria-label="add to favorites"
                                        onClick={() => handleFavoriteClick(product.id)}
                                        sx={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            backgroundColor: 'rgba(255,255,255,0.8)',
                                            borderRadius: '50%',
                                            padding: '6px',
                                            zIndex: 2,
                                            '&:hover': {
                                                backgroundColor: 'rgba(255,255,255,0.9)'
                                            }
                                        }}
                                    >
                                        {isProductFavorited ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                                    </IconButton>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>

                {hasMore && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Button
                            variant="contained"
                            onClick={loadMore}
                            disabled={loading}
                            sx={{ textTransform: 'none' }}
                        >
                            {loading ? t('Yükleniyor...') : t('Daha Fazla Yükle')}
                        </Button>
                    </Box>
                )}

                {products.length === 0 && !loading && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                            {t('Hiç ürün bulunamadı')}
                        </Typography>
                    </Box>
                )}
            </Container>

            <Footer />

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
}
