import React, { useEffect, useRef, useState } from 'react';
import Axios from 'axios';
import axios from 'axios';
import Header from "../header/Header";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from '@mui/material/CardMedia';
import {
    Button,
    Chip,
    IconButton,
    Snackbar,
    Stack,
    SwipeableDrawer,
    Box,
    Alert
} from "@mui/material";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useParams } from "react-router-dom";
import { ActivityFilter } from "../filter/ActivityFilter";
import { Helmet } from "react-helmet";
import { useAuth } from "../auth/AuthProvider";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useTranslation } from "react-i18next";
import Footer from "../Footer";

// Generate UUID for guest token
const generateUUID = () => {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
};

// Helper function to generate a prefixed image URL (e.g., "small_", "medium_", "large_")
const getPrefixedImage = (url, prefix) => {
    if (!url) return url;
    return url.replace(/([^/]+)$/, `${prefix}_$1`);
};

const ProductList = () => {
    const { type } = useParams();
    const [activities, setActivities] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [guestToken] = useState(localStorage.getItem('guestToken') || generateUUID());
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const [openFilterDialog, setOpenFilterDialog] = useState(false);
    const { t, i18n } = useTranslation();
    const [filters, setFilters] = useState({});
    const listRef = useRef(null);
    const { toggleFavorite, favorites, isLoggedIn, token } = useAuth();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

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

    const applyFilter = (filterType, filterValue) => {
        setFilters(currentFilters => ({
            ...currentFilters,
            [filterType]: filterValue
        }));
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleFavoriteClick = async (productId) => {
        if (!productId || typeof productId !== 'number') {
            setSnackbarMessage(t('Cannot add to favorites: Invalid product'));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        // Find the product to get its details
        const product = activities.find(p => p.id === productId);
        if (!product) {
            setSnackbarMessage(t('Cannot add to favorites: Product not found'));
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        if (isLoggedIn && token) {
            // Logged-in user: Use toggleFavorite
            const isAlreadyFavorited = favorites.favoriteEvents?.some(p => p.id === productId);
            try {
                await toggleFavorite(productId, isAlreadyFavorited, 'event');
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
            // Guest user: Manage local storage favorites
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
                    setSnackbarSeverity('info');
                    setSnackbarOpen(true);
                } catch (error) {
                    console.error("Error removing guest favorite:", error.response?.data || error.message);
                    setSnackbarMessage(t('Error removing from favorites'));
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                }
            } else {
                // Add to favorites
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
                    setSnackbarMessage(t('Added to favorites') + ' ❤️');
                    setSnackbarSeverity('success');
                    setSnackbarOpen(true);
                } catch (error) {
                    console.error("Error adding guest favorite:", error.response?.data || error.message);
                    setSnackbarMessage(t('Error adding to favorites'));
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                }
            }
        }
    };

    useEffect(() => {
        const locale = getCurrentLocale();
        Axios.get(`${baseURL}/products/${type}`, {
            params: {
                page,
                size: 20,
                locale: locale // Backend otomatik olarak currency tespit edecek
            }
        })
            .then((response) => {
                const data = response.data;
                if (page === 0) {
                    setActivities(data.content);
                } else {
                    setActivities(prevActivities => [...prevActivities, ...data.content]);
                }
                setHasMore(!data.last);
            })
            .catch((error) => {
                console.error(`Error fetching ${type}:`, error);
            });
    }, [type, page, baseURL, i18n.language]);

    const loadMore = () => {
        if (hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const resetActivities = () => {
        setActivities([]);
        setPage(0);
        setHasMore(true);
    };

    useEffect(() => {
        resetActivities();
    }, [type, filters]);

    const discountPercent = 20;

    return (
        <div>
            <Helmet>
                <title>{type ? `${type.charAt(0).toUpperCase() + type.slice(1)} | Kına Sepeti` : 'Products | Kına Sepeti'}</title>
                <meta name="description" content={`Browse our collection of ${type || 'products'} for your special occasions.`} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
            </Helmet>
            <Header />

            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
                    {type ? t(type.charAt(0).toUpperCase() + type.slice(1)) : t('All Products')}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setOpenFilterDialog(true)}
                        sx={{ textTransform: 'none' }}
                    >
                        {t('Filters')}
                    </Button>
                </Box>

                <Grid container spacing={3} ref={listRef}>
                    {activities.map((activity) => {
                        // Check if activity is favorited
                        const isActivityFavorited = isLoggedIn
                            ? favorites.favoriteEvents?.some(event => event.id === activity.id)
                            : JSON.parse(localStorage.getItem('favorites') || '[]').some(fav => fav.id === activity.id);

                        // Backend'ten gelen product_photos array'ini kullan
                        const originalImage = (activity.product_photos && activity.product_photos[0]
                            ? activity.product_photos[0].photoUrl
                            : activity.imageUrl);

                        // Generate prefixed image URLs
                        const smallImageUrl = getPrefixedImage(originalImage, 'small');
                        const mediumImageUrl = getPrefixedImage(originalImage, 'medium');
                        const largeImageUrl = getPrefixedImage(originalImage, 'large');

                        return (
                            <Grid item key={activity.id} xs={12} sm={6} md={4} lg={3}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                    <a href={`/products/detail/${activity.id}/${getLocalizedName(activity)}`} style={{ textDecoration: 'none' }}>
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
                                            alt={getLocalizedName(activity)}
                                        />
                                    </a>
                                    <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography variant="h6" component="h2" sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            mb: 1
                                        }}>
                                            {getLocalizedName(activity)}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
                                            {getLocalizedDescription(activity)}
                                        </Typography>

                                        {/* Fiyat bilgisini göster */}
                                        {(activity.price || activity.tlPrice) && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Typography
                                                    sx={{
                                                        textDecoration: 'line-through',
                                                        color: 'gray',
                                                        mr: 1,
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    {formatPrice(activity)}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        color: '#1976d2',
                                                        fontWeight: 'bold',
                                                        fontSize: '1rem'
                                                    }}
                                                >
                                                    {formatDiscountedPrice(activity, discountPercent)}
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
                                            href={`/products/detail/${activity.id}/${getLocalizedName(activity)}`}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            {t('View Details')}
                                        </Button>
                                    </Box>

                                    <IconButton
                                        aria-label="add to favorites"
                                        onClick={() => handleFavoriteClick(activity.id)}
                                        sx={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            backgroundColor: 'rgba(255,255,255,0.8)',
                                            borderRadius: '50%',
                                            padding: '6px',
                                            zIndex: 2,
                                        }}
                                    >
                                        {isActivityFavorited ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                                    </IconButton>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>

                {hasMore && activities.length > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Button
                            variant="contained"
                            onClick={loadMore}
                            sx={{ textTransform: 'none' }}
                        >
                            {t('Load More')}
                        </Button>
                    </Box>
                )}

                {activities.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                            {t('No products found')}
                        </Typography>
                    </Box>
                )}
            </Container>

            <SwipeableDrawer
                anchor="bottom"
                open={openFilterDialog}
                onClose={() => setOpenFilterDialog(false)}
                onOpen={() => setOpenFilterDialog(true)}
            >
                <Box sx={{ p: 2, minHeight: 300 }}>
                    <ActivityFilter applyFilter={applyFilter} />
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button onClick={() => setOpenFilterDialog(false)} variant="outlined">
                            {t('Close')}
                        </Button>
                    </Box>
                </Box>
            </SwipeableDrawer>

            <Footer />

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ProductList;

