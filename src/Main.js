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
                            const discountPercent = 20; // For example, 20% discount

                            // Calculate prices
                            const originalPrice = Math.floor(item.price);
                            const discountedPrice = Math.floor(item.price * (1 - discountPercent / 100));

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
                                                alt={item.title}
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
                                                {item.shortDescription || 'No description available.'}
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
                                                    {originalPrice} TL
                                                </Typography>
                                                {/* Discounted Price */}
                                                <Typography
                                                    sx={{
                                                        color: '#1976d2',
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    {discountedPrice} TL
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
                            Please log in to add this product to your favorites.
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
            <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">
                <Typography variant="h6" align="center" gutterBottom>
                    Kına Sepeti
                </Typography>
                <Typography variant="subtitle1" align="center" color="text.secondary" component="p">
                    All rights reserved © 2025 Kına Sepeti
                </Typography>
            </Box>
        </ThemeProvider>
    );
}
