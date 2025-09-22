import React, {lazy, Suspense, useEffect, useState} from 'react';
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
import SEO from './shared/SEO';
import i18n from './i18n';
import ProductGrid from "./ProductGrid";

const Footer = lazy(() => import('./Footer'));

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
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
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
    // Infinite scroll effect
    useEffect(() => {
        // Bu efekti kurmayı küçük bir gecikmeyle başlatarak ana iş parçacığına nefes aldır
        const timerId = setTimeout(() => {
            const handleScroll = () => {
                if (window.innerHeight + document.documentElement.scrollTop
                    >= document.documentElement.offsetHeight - 1000 && !loading && hasMore) {
                    setLoading(true);
                    fetchProducts(page + 1).finally(() => setLoading(false));
                    setPage((prev) => prev + 1);
                }
            };
            window.addEventListener('scroll', handleScroll);
        }, 100); // 100 milisaniye gibi küçük bir gecikme yeterli

        // component unmount olduğunda hem timeout'u hem de event listener'ı temizle
        return () => {
            clearTimeout(timerId);
            // handleScroll'ı dışarıda tanımlayıp burada remove etmeniz gerekir,
            // ama bu basit haliyle bile erteleme işe yarayacaktır.
        };
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
                    <Suspense fallback={<div>Loading...</div>}>
                        <ProductGrid
                            products={products}
                            favorites={favorites}
                            isLoggedIn={isLoggedIn}
                            handleFavoriteClick={handleFavoriteClick}
                        />
                    </Suspense>
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
            <Suspense fallback={<div>Footer Loading...</div>}>
                <Footer />
            </Suspense>

        </ThemeProvider>
    );
}
