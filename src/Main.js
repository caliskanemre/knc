import React, { useEffect, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Axios from 'axios';
import axios from 'axios';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useAuth } from './auth/AuthProvider';
import Header from './header/Header';
import HeroSection from './shared/HeroSection';
import { useTranslation } from "react-i18next";
import Footer from "./Footer";
import SEO from './shared/SEO';
import i18n from './i18n';

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

// Generate UUID for guest token
const generateUUID = () => {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
};

const getPrefixedImage = (url, prefix) => {
    if (!url) return url;
    return url.replace(/([^/]+)$/, `${prefix}_$1`);
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
    const { t } = useTranslation();
    const { favorites, isLoggedIn, toggleFavorite, token } = useAuth();
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    // Fiyat formatlama (dönüşüm yok)
    const formatPrice = (amount, isTR) => {
        const symbol = isTR ? '₺' : '€';
        const num = Number(amount) || 0;
        return `${num.toFixed(2)} ${symbol}`;
    };

    // Fetch products
    const fetchProducts = async (pageNum) => {
        try {
            const response = await Axios.get(`${baseURL}/products/all`, {
                params: {
                    page: pageNum,
                    size: PAGE_SIZE,
                },
                headers: {
                    'Accept-Language': i18n.language === 'en' ? 'en' : 'tr'
                }
            });

            const { content, totalPages } = response.data || {};
            if (content) {
                if (pageNum === 0) {
                    setProducts(content);
                } else {
                    setProducts((prev) => [...prev, ...content]);
                }
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
        // 1. ADIM: Sunucudan gelen veri var mı diye kontrol et
        // Sunucu Taraflı Oluşturma (SSR) sırasında server.js, veriyi bu global değişkene yazar.
        if (window.__INITIAL_DATA__ && window.__INITIAL_DATA__.products) {

            // 2. ADIM: Sunucudan gelen veriyi doğrudan state'e ata
            setProducts(window.__INITIAL_DATA__.products);
            setPage(0); // Sayfalamayı sıfırla
            setHasMore(true); // Daha fazla veri olabileceğini varsay

            // 3. ADIM: Tekrar kullanılmaması için veriyi temizle
            // Bu, kullanıcı sitede başka bir sayfaya gidip geri geldiğinde
            // gereksiz yere eski verinin kullanılmasını engeller.
            delete window.__INITIAL_DATA__.products;

        } else {
            // 4. ADIM: Sadece sunucudan veri gelmediyse API isteği yap
            // Bu blok, sayfa içi gezinmelerde (client-side navigation) çalışır.
            setProducts([]);
            setPage(0);
            setHasMore(true);
            fetchProducts(0);
        }
    }, [i18n.language]); // Dil değiştiğinde verinin yeniden çekilmesi doğru bir davranış

    // Infinite scroll effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop
                >= document.documentElement.offsetHeight - 1000 && !loading && hasMore) {
                setLoading(true);
                fetchProducts(page + 1).finally(() => setLoading(false));
                setPage((prev) => prev + 1);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, hasMore, page]);

    useEffect(() => {
        localStorage.setItem('guestToken', guestToken);

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

    const handleFavoriteClick = async (productId) => {
        if (!productId || typeof productId !== 'number') {
            setSnackbarMessage(t('Cannot add to favorites: Invalid product'));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        const product = products.find(p => p.id === productId);
        if (!product) {
            setSnackbarMessage(t('Cannot add to favorites: Product not found'));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        if (isLoggedIn && token) {
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
            let localFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const isAlreadyFavorited = localFavorites.some(fav => fav.id === productId);

            if (isAlreadyFavorited) {
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
                const favoriteItem = {
                    id: product.id,
                    title: product.productName || product.title || product.name || 'Unknown',
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

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <ThemeProvider theme={theme}>
            <SEO
                title={t('Kına Sepeti - Home')}
                description={t('Discover henna night products, accessories and inspirations for unforgettable celebrations.')}
                type="website"
            />
            <CssBaseline />
            <Header />

            <main>
                <HeroSection />
                <Container sx={{ py: 9 }} maxWidth="xl">
                    <Grid container spacing={4}>
                        {products.map((item) => {
                            const isTR = !!item.is_turkey_user;
                            const baseOriginal = isTR ? (item.tl_price ?? item.price) : (item.eur_price ?? item.price);
                            const originalPriceNum = Number(baseOriginal) || 0;
                            const discountPercent = 20;
                            const discountedPriceNum = originalPriceNum * (1 - discountPercent / 100);

                            const originalPhoto = item.photos[0]?.photo || 'https://via.placeholder.com/300x200?text=No+Image';
                            const smallImageUrl = getPrefixedImage(originalPhoto, 'small');

                            const isAlreadyFavorited = isLoggedIn
                                ? favorites.favoriteProducts?.some(product => product.id === item.id)
                                : (JSON.parse(localStorage.getItem('favorites')) || []).some(fav => fav.id === item.id);

                            const productTitle = item.productName || item.title || item.name || 'Unknown';
                            const productShortDesc = item.shortDescription;

                            return (
                                <Grid item key={item.id} xs={6} sm={6} md={4} lg={3}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            position: 'relative',
                                            boxShadow: 'none',
                                            '&:hover': {
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            }
                                        }}
                                    >
                                        <a
                                            href={`/${i18n.language}/products/detail/${item.id}/${encodeURIComponent(productTitle || 'product')}`}
                                            style={{ textDecoration: 'none', color: 'inherit' }}
                                        >
                                            <CardMedia
                                                component="img"
                                                image={smallImageUrl}
                                                alt={productTitle || 'Product'}
                                                title={productTitle || 'Product'}
                                                sx={{
                                                    width: '100%',
                                                    aspectRatio: '1 / 1',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                        </a>
                                        <Box sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <Typography
                                                sx={{
                                                    fontFamily: 'Montserrat, sans-serif',
                                                    fontWeight: 'bold',
                                                    fontSize: { xs: '1rem', sm: '1.1rem' },
                                                    lineHeight: 1.4,
                                                    textAlign: 'left',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                            >
                                                {productTitle}
                                            </Typography>
                                            {productShortDesc && (
                                                <Typography
                                                    sx={{
                                                        fontFamily: 'Montserrat, sans-serif',
                                                        fontWeight: 400,
                                                        fontSize: { xs: '0.85rem', sm: '0.95rem' },
                                                        color: 'text.secondary',
                                                        mt: 0.5,
                                                        textAlign: 'left',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                    }}
                                                >
                                                    {productShortDesc}
                                                </Typography>
                                            )}
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                                <Typography sx={{ fontWeight: 'bold', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                                    {formatPrice(discountedPriceNum, isTR)}
                                                </Typography>
                                                <Typography sx={{ textDecoration: 'line-through', color: 'gray', ml: 1, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                                                    {formatPrice(originalPriceNum, isTR)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <IconButton
                                            aria-label="add to favorites"
                                            onClick={() => handleFavoriteClick(item.id)}
                                            sx={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                                                borderRadius: '50%',
                                                padding: '6px',
                                                zIndex: 3,
                                            }}
                                        >
                                            {isAlreadyFavorited ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                                        </IconButton>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
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
            <Footer />
        </ThemeProvider>
    );
}
