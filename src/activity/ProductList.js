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
import i18n from "i18next";

// Generate UUID for guest token
const generateUUID = () => {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
};

// Fiyat formatlama (dönüşüm yok) - Main.js ile uyumlu gösterim
const formatPrice = (amount, isTR) => {
    const symbol = isTR ? '₺' : '€';
    const num = Number(amount) || 0;
    return `${num.toFixed(2)} ${symbol}`;
};

const ProductList = () => {
    const { type } = useParams();
    const [activities, setActivities] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [guestToken] = useState(localStorage.getItem('guestToken') || generateUUID());
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const [openFilterDialog, setOpenFilterDialog] = useState(false);
    const { t } = useTranslation();
    const [filters, setFilters] = useState({});
    const listRef = useRef(null);
    const { toggleFavorite, favorites, isLoggedIn, token } = useAuth();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

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

    const removeFilter = (filterType) => {
        setFilters(currentFilters => {
            const newFilters = { ...currentFilters };
            delete newFilters[filterType];
            fetchInitialActivities();
            return newFilters;
        });
    };

    const fetchInitialActivities = async () => {
        try {
            // Sadece header ile dil gönderiyoruz
            let fetchUrl = type === undefined
                ? `${baseURL}/products/all?page=0&size=20`
                : `${baseURL}/products/${type}?page=0&size=20`;

            const response = await Axios.get(fetchUrl, {
                headers: {
                    'Accept-Language': i18n.language === 'en' ? 'en' : 'tr'
                }
            });
            const fetchedActivities = response.data.content;
            setActivities(fetchedActivities);
            setHasMore(response.data.totalPages > 1);
        } catch (error) {
            console.error('Error fetching activities with photos:', error);
            setSnackbarMessage(t('Error fetching products'));
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    useEffect(() => {
        const fetchActivities = async () => {
            setActivities([]);
            setPage(0);
            setHasMore(true);
            await fetchInitialActivities();

            const savedScrollPosition = sessionStorage.getItem('activityListScrollPosition');
            if (savedScrollPosition && listRef.current) {
                listRef.current.scrollTop = parseInt(savedScrollPosition, 10);
            }
        };

        fetchActivities();
    }, [type, guestToken, i18n.language]);

    useEffect(() => {
        const saveScrollPosition = () => {
            if (listRef.current) {
                sessionStorage.setItem('activityListScrollPosition', listRef.current.scrollTop.toString());
            }
        };

        window.addEventListener('beforeunload', saveScrollPosition);
        return () => {
            window.removeEventListener('beforeunload', saveScrollPosition);
        };
    }, []);

    // Sync local favorites to server on login - Promise.all ile düzgün async handling
    useEffect(() => {
        const syncFavorites = async () => {
            if (isLoggedIn && token) {
                const localFavorites = JSON.parse(localStorage.getItem('favorites')) || [];

                const syncPromises = localFavorites
                    .filter(favorite => favorite && favorite.id && !favorites.favoriteProducts?.some(product => product.id === favorite.id))
                    .map(async (favorite) => {
                        try {
                            await toggleFavorite(favorite.id, false, "product");
                        } catch (error) {
                            console.error("Error syncing favorite:", error);
                            setSnackbarMessage(t('Error syncing favorites'));
                            setSnackbarSeverity("error");
                            setSnackbarOpen(true);
                        }
                    });

                await Promise.all(syncPromises);

                if (localFavorites.length > 0) {
                    localStorage.removeItem('favorites');
                }
            }
        };

        syncFavorites();
    }, [isLoggedIn, token, favorites, toggleFavorite, t]);

    const handleCloseFilterDialog = () => {
        setOpenFilterDialog(false);
    };

    const loadMoreActivities = async () => {
        try {
            let nextPage = page + 1;
            // Sadece header ile dil gönderiyoruz
            let fetchUrl = type === undefined
                ? `${baseURL}/products/all?page=${nextPage}&size=20`
                : `${baseURL}/products/${type}?page=${nextPage}&size=20`;

            const response = await Axios.get(fetchUrl, {
                headers: {
                    'Accept-Language': i18n.language === 'en' ? 'en' : 'tr'
                }
            });
            setActivities(prevActivities => [...prevActivities, ...response.data.content]);
            setHasMore(response.data.totalPages > nextPage + 1);
            setPage(nextPage);
        } catch (error) {
            console.error('Error fetching more activities:', error);
            setSnackbarMessage(t('Error fetching more products'));
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    // Helper function to get a prefixed image URL
    const getPrefixedImage = (url, prefix) => {
        if (!url) return url;
        return url.replace(/([^/]+)$/, `${prefix}_$1`);
    };

    return (
        <div className="activity-list" ref={listRef}>
            <Helmet>
                <title>{type ? `${type} Products` : t('All Products')} - Kina Sepeti</title>
                <meta
                    name="description"
                    content={`Explore ${type ? type : 'all'} products on Kina Sepeti. Find henna nights, products.`}
                />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
            </Helmet>
            <Header />

            <Container sx={{ py: 9 }} maxWidth="xl">
                <Stack direction="row" spacing={1} justifyContent="flex-end" padding="5px">
                    {Object.entries(filters).map(([filterType, filterValue]) => (
                        <Chip
                            key={filterType}
                            label={`${filterType}: ${typeof filterValue === 'object' ? filterValue.name : filterValue}`}
                            onDelete={() => removeFilter(filterType)}
                            color="secondary"
                        />
                    ))}
                </Stack>
                <Grid container spacing={4}>
                    {activities.map((item) => {
                        const isAlreadyFavorited = isLoggedIn
                            ? favorites.favoriteProducts?.some(product => product.id === item.id)
                            : (JSON.parse(localStorage.getItem('favorites')) || []).some(fav => fav.id === item.id);

                        // Pricing and discount logic - Main.js ile uyumlu
                        const itemCurrency = item.currency || 'EUR';
                        const isTR = (itemCurrency === 'TL' || itemCurrency === 'TRY') || !!item.is_turkey_user;
                        const baseOriginal = isTR ? (item.tl_price ?? item.price) : (item.eur_price ?? item.price);
                        const originalPriceNum = Number(baseOriginal) || 0;
                        const discountPercent = 20;
                        const discountedPriceNum = originalPriceNum * (1 - discountPercent / 100);

                        // Build image URLs with prefixes
                        const originalImageUrl = item.photos[0]?.photo || '';
                        const smallImageUrl = getPrefixedImage(originalImageUrl, 'small');
                        const mediumImageUrl = getPrefixedImage(originalImageUrl, 'medium');
                        const largeImageUrl = getPrefixedImage(originalImageUrl, 'large');

                        return (
                            <Grid item key={item.id} xs={6} sm={6} md={4} lg={3}>
                                <Card sx={{
                                    height: { xs: 'auto', md: '350px' },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative'
                                }}>
                                    <a href={`/${i18n.language}/products/detail/${item.id}/${encodeURIComponent(item.title || 'product')}`}
                                       style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <CardMedia
                                            component="img"
                                            image={smallImageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                                            srcSet={`
                                                ${smallImageUrl} 400w,
                                                ${mediumImageUrl} 800w,
                                                ${largeImageUrl} 1200w
                                            `}
                                            sizes="(max-width: 600px) 400px, (max-width: 960px) 800px, 1200px"
                                            alt={item.title || 'Product'}
                                            sx={{
                                                width: '100%',
                                                height: { xs: 140, md: 200 },
                                                objectFit: 'cover'
                                            }}
                                        />
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
                                            {/* Pricing & Discount Section */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                <Typography
                                                    sx={{
                                                        textDecoration: 'line-through',
                                                        color: 'gray',
                                                        mr: 1,
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    {formatPrice(originalPriceNum, isTR)}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        color: '#1976d2',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    {formatPrice(discountedPriceNum, isTR)}
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
                                        </Box>
                                    </a>
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
                                        {isAlreadyFavorited ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                                    </IconButton>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
                {hasMore && (
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                        <Button
                            onClick={loadMoreActivities}
                            variant="contained"
                            color="primary"
                            style={{ textTransform: 'none', fontSize: '16px', padding: '10px 20px' }}
                        >
                            {t("Load More")}
                        </Button>
                    </div>
                )}
            </Container>
            <ActivityFilter
                openFilterDialog={openFilterDialog}
                handleCloseFilterDialog={handleCloseFilterDialog}
                type={type}
                applyFilter={applyFilter}
            />
            <SwipeableDrawer
                anchor="bottom"
                open={openFilterDialog}
                onClose={handleCloseFilterDialog}
                onOpen={() => setOpenFilterDialog(true)}
                ModalProps={{
                    keepMounted: true,
                }}
            >
                <ActivityFilter
                    openFilterDialog={openFilterDialog}
                    handleCloseFilterDialog={handleCloseFilterDialog}
                    type={type}
                    applyFilter={applyFilter}
                />
            </SwipeableDrawer>
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

export default ProductList;
