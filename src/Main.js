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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { Helmet } from 'react-helmet';
import Axios from 'axios';

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useAuth } from './auth/AuthProvider';
import Header from './header/Header';
import HeroSection from './shared/HeroSection';
import {useTranslation} from "react-i18next";

const defaultTheme = createTheme();
const PAGE_SIZE = 20;

// Helper function to get a prefixed image URL (e.g., "small_", "medium_", "large_")
const getPrefixedImage = (url, prefix) => {
    if (!url) return url;
    return url.replace(/([^/]+)$/, `${prefix}_$1`);
};

export default function Main() {
    const [products, setProducts] = useState([]);
    const [localFavorites, setLocalFavorites] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const { t} = useTranslation();
    const { favorites, isLoggedIn, toggleFavorite } = useAuth();
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    // Sync local favorites with global favorites
    useEffect(() => {
        setLocalFavorites(favorites.favoriteProducts?.map((fav) => fav.id) || []);
    }, [favorites]);

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
        }
    };

    useEffect(() => {
        fetchProducts(0); // Initial fetch
    }, []);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setLoading(true);
            fetchProducts(page + 1).finally(() => setLoading(false));
            setPage((prev) => prev + 1);
        }
    };

    const handleFavoriteClick = (productId) => {
        if (!isLoggedIn) {
            setOpenDialog(true);
            return;
        }

        const isFavorite = localFavorites.includes(productId);
        toggleFavorite(productId, isFavorite, 'product');
        setLocalFavorites((prev) =>
            isFavorite ? prev.filter((id) => id !== productId) : [...prev, productId]
        );

        setSnackbarMessage(isFavorite ? 'Removed from favorites' : 'Added to favorites');
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Helmet>
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
            </Helmet>
            <CssBaseline />
            <Header />

            <main>
                {/* 💫 NEW Responsive Hero Section */}
                <HeroSection />
                {/* Product Grid */}
                <Container sx={{ py: 9 }} maxWidth="xl">
                    <Grid container spacing={4}>
                        {products.map((item) => {
                            // Define the discount percentage (can be dynamic per product)
                            const discountPercent = 20; // Example: fixed 20% discount
                            const originalPrice = Number(item.price).toFixed(2);
                            const discountedPrice = (item.price * (1 - discountPercent / 100)).toFixed(2);

                            // Build image URLs using prefixes
                            const originalPhoto = item.photos[0]?.photo || '';
                            const smallImageUrl = getPrefixedImage(originalPhoto, 'small');
                            const mediumImageUrl = getPrefixedImage(originalPhoto, 'medium');
                            const largeImageUrl = getPrefixedImage(originalPhoto, 'large');

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
                                            href={`/products/detail/${item.id}`}
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
                                                alt={item.short_description}
                                                title={item.title}
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
                                                {item.title}
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
                                                {item.short_description || 'No description available.'}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                {/* Original Price with Strikethrough */}
                                                <Typography
                                                    sx={{
                                                        textDecoration: 'line-through',
                                                        color: 'gray',
                                                        mr: 1,
                                                    }}
                                                >
                                                    {originalPrice} €
                                                </Typography>
                                                {/* Discounted Price */}
                                                <Typography
                                                    sx={{
                                                        color: '#1976d2',
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    {discountedPrice} €
                                                </Typography>
                                                {/* Discount Badge */}
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
                                            {localFavorites.includes(item.id) ? (
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
                            Load More
                        </Button>
                    )}
                </Container>

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    message={snackbarMessage}
                />

                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>{"Login Required"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {t('Please log in to add this product to your favorites')}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} autoFocus>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </main>

            {/* Footer */}
            {/* Footer */}
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
                        href="https://www.instagram.com/knc_kina_organizasyon" // Buraya kendi Instagram URL'nizi ekleyin
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: 'text.secondary' }}
                    >
                        {/* Instagram SVG İkonu */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            style={{ marginRight: '10px' }} // İkon ve metin arasında boşluk
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
