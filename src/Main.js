import * as React from 'react';
import {useEffect, useState} from 'react';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import Axios from 'axios';
import Header from "./header/Header";
import backgroundImage from './background6.jpg';
import {Avatar, CardHeader, IconButton, Snackbar} from "@mui/material";
import BackgroundGallery from "./shared/BackgroundGallery";
import {Helmet} from "react-helmet";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import {useAuth} from "./auth/AuthProvider";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import BackgroundGalleryDetails from "./shared/BackgroundGalleryDetails";
import veil from "./images/veil.jpg";
import tamborine from "./images/tamborine.jpg";
import hennaset from "./images/hennaset.jpg";
import handkerchief from "./images/mendil.jpg";
import gift from "./images/gift.jpg";
import ornament from "./images/ornament.jpg";
import flower from "./images/flower.jpg";
import souvenir from "./images/souvenir.jpg";

const defaultTheme = createTheme();
const deneme = []
deneme.push(backgroundImage)

const PAGE_SIZE = 20;

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

    const activityIcons = {
        veil: veil,
        tamborine: tamborine,
        hennaset: hennaset,
        handkerchief: handkerchief,
        gift: gift,
        ornament: ornament,
        flower: flower,
        souvenir: souvenir,
    };

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
        toggleFavorite(productId, isFavorite, "product");
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

    const getDynamicFontSize = (title) => {
        if (title.length < 10) return "1.6rem";
        if (title.length < 30) return "1.3rem";
        if (title.length < 50) return "1.1rem";
        return "0.85rem";
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
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <BackgroundGallery images={[backgroundImage]} />
                    </Grid>
                </Grid>
                <Container sx={{ py: 9 }} maxWidth="xl">
                    <Grid container spacing={4}>
                        {products.map((item) => (
                            <Grid item key={item.id} xs={6} sm={6} md={4} lg={3}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative',
                                    }}
                                >
                                    <a
                                        href={`/products/detail/${item.id}`}
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        {/* Image */}
                                        <CardMedia
                                            component="img"
                                            image={item.photos[0]?.photo || ''}
                                            alt={item.title}
                                            sx={{ width: '100%', height: 140, objectFit: 'cover' }}
                                        />
                                    </a>
                                    {/* Title, Description, and Price */}
                                    <Box sx={{ padding: 2 }}>
                                        {/* Title */}
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

                                        {/* Short Description */}
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
                                            {item.description || 'No description available.'}
                                        </Typography>

                                        {/* Price */}
                                        <Typography
                                            sx={{
                                                textAlign: 'left',
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                color: 'gray',
                                                mt: 1,
                                            }}
                                        >
                                            {Math.floor(item.price) || '0'} TL
                                        </Typography>
                                    </Box>

                                    {/* Favorite Icon */}
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
                                            zIndex: 2,
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
                        ))}
                    </Grid>


                    {hasMore && (
                        <Button
                            onClick={handleLoadMore}
                            variant="contained"
                            sx={{ marginTop: '20px' }}
                        >
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
