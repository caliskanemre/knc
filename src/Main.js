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
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAuth } from './auth/AuthProvider';
import Header from './header/Header';
import HeroSection from './shared/HeroSection';
import { useTranslation } from "react-i18next";

const defaultTheme = createTheme();
const PAGE_SIZE = 20;

// Helper function to get a prefixed image URL (e.g., "small_", "medium_", "large_")
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
    const [guestToken, setGuestToken] = useState(localStorage.getItem('guestToken') || generateUUID());
    const { t } = useTranslation();
    const { favorites, isLoggedIn, toggleFavorite, token } = useAuth();
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    // Fetch products
    const fetchProducts = async (pageNum) => {
        try {
            const response = await Axios.get(`${baseURL}/products/all`, {
                params: {
                    page: pageNum,
                    size: PAGE_SIZE,
                    sort: 'interested,desc',
                },
            });

            const { content, totalPages } = response.data || {};
            if (content) {
                setProducts((prev) => [...prev, ...content]);
                setHasMore(pageNum + 1 < totalPages);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setSnackbarMessage(t('Error fetching products'));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    useEffect(() => {
        fetchProducts(0); // Initial fetch
    }, []);

    useEffect(() => {
        // Store guest token
        localStorage.setItem('guestToken', guestToken);

        // Sync local favorites to server on login
        if (isLoggedIn && token) {
            const localFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
            localFavorites.forEach(async (favorite) => {
                if (favorite && favorite.id && !favorites.favoriteProducts?.some(product => product.id === favorite.id)) {
                    try {
                        await toggleFavorite(favorite.id, false, 'product');
                    } catch (error) {
                        console.error('Error syncing favorite:', error);
                        setSnackbarMessage(t('Error syncing favorites'));
                        setSnackbarSeverity('error');
                        setSnackbarOpen(true);
                    }
                }
            });
            localStorage.removeItem('favorites');
        }
    }, [isLoggedIn, token, favorites, toggleFavorite, t, guestToken]);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setLoading(true);
            fetchProducts(page + 1).finally(() => setLoading(false));
            setPage((prev) => prev + 1);
        }
    };

    const handleFavoriteClick = async (productId) => {
        if (!productId || typeof productId !== 'number') {
            setSnackbarMessage(t('Cannot add to favorites: Invalid product'));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        // Find the product to get its details
        const product = products.find(p => p.id === productId);
        if (!product) {
            setSnackbarMessage(t('Cannot add to favorites: Product not found'));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        if (isLoggedIn && token) {
            // Logged-in user: Use toggleFavorite
            const isAlreadyFavorited = favorites.favoriteProducts?.some(p => p.id === productId);
            try {
                await toggleFavorite(productId, isAlreadyFavorited, 'product');
                setSnackbarMessage(isAlreadyFavorited ? t('Removed from favorites') + ' ❌' : t('Added to favorites') + ' ❤️');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
            } catch (error) {
                console.error('Error syncing favorite to server:', error);
                setSnackbarMessage(t('Error syncing favorites'));
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        } else {
            // Guest user: Update localStorage and sync with backend
            let localFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const isAlreadyFavorited = localFavorites.some(fav => fav.id === productId);

            if (isAlreadyFavorited) {
                // Remove from favorites
                localFavorites = localFavorites.filter(fav => fav.id !== productId);
                try {
                    await axios.delete(`${baseURL}/users/guest/favorites/${productId}`, {
                        headers: { 'X-Guest-Token': guestToken },
                    });
                    localStorage.setItem('favorites', JSON.stringify(localFavorites));
                    setSnackbarMessage(t('Removed from favorites') + ' ❌');
                    setSnackbarSeverity('success');
                    setSnackbarOpen(true);
                } catch (error) {
                    console.error('Error removing guest favorite:', error.response?.data || error.message);
                    setSnackbarMessage(t('Error removing from favorites'));
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                }
            } else {
                // Add to favorites
                const favoriteItem = {
                    id: product.id,
                    title: product.title || product.name || 'Unknown',
                    price: product.price || 0,
                    photos: product.photos || [],
                    date: product.date || '',
                    activity_location: product.activityLocation || product.location || '',
                };
                localFavorites.push(favoriteItem);
                try {
                    await axios.post(`${baseURL}/users/guest/favorites/${productId}`, {}, {
                        headers: { 'X-Guest-Token': guestToken },
                    });
                    localStorage.setItem('favorites', JSON.stringify(localFavorites));
                    setSnackbarMessage(t('Added to favorites') + ' ❤️');
                    setSnackbarSeverity('success');
                    setSnackbarOpen(true);
                } catch (error) {
                    console.error('Error adding guest favorite:', error.response?.data || error.message);
                    setSnackbarMessage(t('Error adding to favorites'));
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                }
            }
        }
    };

    const addToCart = (productId, price, title, quantity) => {
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartItem = { productId, quantity, price, title, note: '' };
        const existingItemIndex = localCart.findIndex(item => item.productId === productId);
        if (existingItemIndex >= 0) {
            localCart[existingItemIndex].quantity += quantity;
        } else {
            localCart.push(cartItem);
        }
        localStorage.setItem('cart', JSON.stringify(localCart));
        setSnackbarMessage(t(`${quantity} adet "${title}" sepete eklendi!`));
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        if (isLoggedIn && token) {
            // Sync to server (requires email from useAuth)
            // Note: You'll need to add email to useAuth or fetch it from localStorage
            // Axios.post(`${baseURL}/cart/${email}`, cartItem, {
            //     headers: { Authorization: `Bearer ${token}` },
            // }).catch(error => {
            //     console.error('Error syncing cart:', error);
            //     setSnackbarMessage(t('Error syncing cart'));
            //     setSnackbarSeverity('error');
            //     setSnackbarOpen(true);
            // });
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Helmet>
                <title>{t('Kına Sepeti - Home')}</title>
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
            </Helmet>
            <CssBaseline />
            <Header />

            <main>
                <HeroSection />
                <Container sx={{ py: 9 }} maxWidth="xl">
                    <Grid container spacing={4}>
                        {products.map((item) => {
                            const discountPercent = 20;
                            const originalPrice = Number(item.price).toFixed(2);
                            const discountedPrice = (item.price * (1 - discountPercent / 100)).toFixed(2);

                            const originalPhoto = item.photos[0]?.photo || 'https://via.placeholder.com/300x200?text=No+Image';
                            const smallImageUrl = getPrefixedImage(originalPhoto, 'small');
                            const mediumImageUrl = getPrefixedImage(originalPhoto, 'medium');
                            const largeImageUrl = getPrefixedImage(originalPhoto, 'large');

                            const isAlreadyFavorited = isLoggedIn
                                ? favorites.favoriteProducts?.some(product => product.id === item.id)
                                : (JSON.parse(localStorage.getItem('favorites')) || []).some(fav => fav.id === item.id);

                            return (
                                <Grid item key={item.id} xs={6} sm={6} md={4} lg={3}>
                                    <Card
                                        sx={{
                                            height: { xs: 'auto', md: '350px' },
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative',
                                        }}
                                    >
                                        <a
                                            href={`/products/detail/${item.id}/${encodeURIComponent(item.title || 'product')}`}
                                            style={{ textDecoration: 'none', color: 'inherit' }}
                                        >
                                            <CardMedia
                                                component="img"
                                                image={smallImageUrl}
                                                srcSet={`
                                                    ${smallImageUrl} 400w,
                                                    ${mediumImageUrl} 800w,
                                                    ${largeImageUrl} 1200w
                                                `}
                                                sizes="(max-width: 600px) 400px, (max-width: 960px) 800px, 1200px"
                                                alt={item.short_description || item.title || 'Product'}
                                                title={item.title || 'Product'}
                                                sx={{
                                                    width: '100%',
                                                    height: { xs: 140, md: 200 },
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        </a>
                                        <Box sx={{ padding: 2, flex: 1 }}>
                                            <Typography
                                                sx={{
                                                    textAlign: 'left',
                                                    fontSize: '1rem',
                                                    fontWeight: 500,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {item.title || 'Unknown'}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    textAlign: 'left',
                                                    fontSize: '0.85rem',
                                                    color: 'text.secondary',
                                                    mt: 1,
                                                    overflow: 'hidden',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                            >
                                                {item.short_description || t('No description available.')}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                <Typography
                                                    sx={{
                                                        textDecoration: 'line-through',
                                                        color: 'gray',
                                                        mr: 1,
                                                    }}
                                                >
                                                    {originalPrice} €
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        color: '#1976d2',
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    {discountedPrice} €
                                                </Typography>
                                                {discountPercent >= 20 && (
                                                    <Box
                                                        sx={{
                                                            backgroundColor: 'red',
                                                            color: 'white',
                                                            px: 1,
                                                            py: 0.5,
                                                            borderRadius: 1,
                                                            ml: 1,
                                                            fontSize: '0.75rem',
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        {discountPercent}%
                                                    </Box>
                                                )}
                                            </Box>
                                            {/* <Button
                                                variant="outlined"
                                                color="success"
                                                startIcon={<ShoppingCartIcon />}
                                                onClick={() => addToCart(item.id, item.price, item.title, 1)}
                                                sx={{ mt: 1 }}
                                            >
                                                {t('Add to Cart')}
                                            </Button> */}
                                        </Box>
                                        <IconButton
                                            aria-label="add to favorites"
                                            onClick={() => handleFavoriteClick(item.id)}
                                            sx={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                                borderRadius: '50%',
                                                padding: '6px',
                                                zIndex: 3,
                                            }}
                                        >
                                            {isAlreadyFavorited ? (
                                                <FavoriteIcon color="error" />
                                            ) : (
                                                <FavoriteBorderIcon />
                                            )}
                                        </IconButton>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {hasMore && (
                        <Button onClick={handleLoadMore} variant="contained" sx={{ marginTop: '20px' }}>
                            {t('Load More')}
                        </Button>
                    )}
                </Container>

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
            </main>

            <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">
                <Typography variant="h6" align="center" gutterBottom>
                    Kına Sepeti
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary" component="p">
                        All rights reserved © 2025 Kına Sepeti
                    </Typography>
                    <IconButton
                        aria-label="Instagram"
                        href="https://www.instagram.com/knc_kina_organizasyon"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: 'text.secondary' }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            style={{ marginRight: '10px' }}
                        >
                            <defs>
                                <linearGradient id="instaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#feda75' }} />
                                    <stop offset="20%" style={{ stopColor: '#fa7e1e' }} />
                                    <stop offset="40%" style={{ stopColor: '#d62976' }} />
                                    <stop offset="60%" style={{ stopColor: '#962fbf' }} />
                                    <stop offset="100%" style={{ stopColor: '#4f5bd5' }} />
                                </linearGradient>
                            </defs>
                            <path
                                fill="url(#instaGradient)"
                                d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.326 3.608 1.301.975.975 1.24 2.242 1.301 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.326 2.633-1.301 3.608-.975.975-2.242 1.24-3.608 1.301-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.326-3.608-1.301-.975-.975-1.24-2.242-1.301-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.326-2.633 1.301-3.608.975-.975 2.242-1.24 3.608-1.301 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.67.014-4.947.072-1.277.058-2.153.28-2.92.599-.79.33-1.454.794-2.118 1.458-.664.664-1.128 1.328-1.458 2.118-.319.767-.541 1.643-.599 2.92-.058 1.277-.072 1.688-.072 4.947s.014 3.67.072 4.947c.058 1.277.28 2.153.599 2.92.33.79.794 1.454 1.458 2.118.664.664 1.328 1.128 2.118 1.458.767.319 1.643.541 2.92.599 1.277.058 1.688.072 4.947.072s3.67-.014 4.947-.072c1.277-.058 2.153-.28 2.92-.599.79-.33 1.454-.794 2.118-1.458.664-.664 1.128-1.328 1.458-2.118.319-.767.541-1.643.599-2.92.058-1.277.072-1.688.072-4.947s-.014-3.67-.072-4.947c-.058-1.277-.28-2.153-.599-2.92-.33-.79-.794-1.454-1.458-2.118-.664-.664-1.328-1.128-2.118-1.458-.767-.319-1.643-.541-2.92-.599-1.277-.058-1.688-.072-4.947-.072z"
                            />
                            <path
                                fill="url(#instaGradient)"
                                d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z"
                            />
                            <circle fill="url(#instaGradient)" cx="18.406" cy="5.594" r="1.44" />
                        </svg>
                    </IconButton>
                </Box>
            </Box>
        </ThemeProvider>
    );
}