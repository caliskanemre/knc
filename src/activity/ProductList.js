import React, { useEffect, useRef, useState } from 'react';
import Axios from 'axios';
import Header from "../header/Header";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from '@mui/material/CardMedia';
import {
    Button,
    Chip,
    DialogContent,
    DialogTitle,
    IconButton,
    Snackbar,
    Stack,
    SwipeableDrawer,
    useMediaQuery,
    useTheme,
    Box
} from "@mui/material";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useNavigate, useParams } from "react-router-dom";
import veil from "../images/veil.jpg";
import tamborine from "../images/tamborine.jpg";
import hennaset from "../images/hennaset.jpg";
import gift from "../images/gift.jpg";
import ornament from "../images/ornament.jpg";
import handkerchief from "../images/mendil.jpg";
import souvenir from "../images/souvenir.jpg";
import flower from "../images/flower.jpg";
import { ActivityFilter } from "../filter/ActivityFilter";
import { Helmet } from "react-helmet";
import { useAuth } from "../auth/AuthProvider";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Dialog from "@mui/material/Dialog";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import {useTranslation} from "react-i18next";

const ProductList = () => {
    const { type } = useParams();
    const [activities, setActivities] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const [openFilterDialog, setOpenFilterDialog] = useState(false);
    const { t} = useTranslation();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [filters, setFilters] = useState([]);
    const listRef = useRef(null);
    const { toggleFavorite, favorites, isLoggedIn } = useAuth();
    const [openDialog, setOpenDialog] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    useNavigate();

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

    const handleFavoriteClick = (productId) => {
        if (isLoggedIn) {
            const isFavorite = favorites.favoriteProducts?.map(product => product.id).includes(productId) || false;
            toggleFavorite(productId, isFavorite, "activity");
            setSnackbarMessage(isFavorite ? 'Removed from favorites' : 'Added to favorites');
            setSnackbarOpen(true);
        } else {
            handleOpenDialog();
        }
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
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
            let fetchUrl = type === undefined
                ? `${baseURL}/products/all?page=0&size=20`
                : `${baseURL}/products/${type}?page=0&size=20`;

            const response = await Axios.get(fetchUrl);
            const fetchedActivities = response.data.content;
            setActivities(fetchedActivities);
            setHasMore(response.data.totalPages > 1);
        } catch (error) {
            console.error('Error fetching activities with photos:', error);
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
    }, [type]);

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

    const handleCloseFilterDialog = () => {
        setOpenFilterDialog(false);
    };

    const loadMoreActivities = async () => {
        try {
            let nextPage = page + 1;
            let fetchUrl = type === undefined
                ? `${baseURL}/products/all?page=${nextPage}&size=20`
                : `${baseURL}/products/${type}?page=${nextPage}&size=20`;

            const response = await Axios.get(fetchUrl);
            setActivities(prevActivities => [...prevActivities, ...response.data.content]);
            setHasMore(response.data.totalPages > nextPage + 1);
            setPage(nextPage);
        } catch (error) {
            console.error('Error fetching more activities:', error);
        }
    };

    // Optional: If you still need category icons elsewhere, keep this.
    return (
        <div className="activity-list" ref={listRef}>
            <Helmet>
                <title>{type ? `${type} Products` : 'All Products'} - Kina Sepeti</title>
                <meta name="description"
                      content={`Explore ${type ? type : 'all'} products on Kina Sepeti. Find henna nights, products.`} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
            </Helmet>
            <Header />

            <Container sx={{ py: 9 }} maxWidth="xl">
                <Typography variant="h2" component="div" style={{ fontSize: '2rem', marginBottom: '20px' }}>
                    {type} {Object.keys(filters).length > 0 ?
                    Object.entries(filters).map(([filterType, filterValue]) => {
                        if (typeof filterValue === 'object' && filterValue !== null) {
                            return filterValue.name;
                        } else {
                            return filterValue;
                        }
                    }).join(', ') : ''}
                </Typography>

                <Stack direction="row" spacing={1} justifyContent="flex-end" padding="5px">
                    {Object.entries(filters).map(([filterType, filterValue]) => (
                        <Chip
                            key={filterType}
                            label={`${filterType}: ${filterValue}`}
                            onDelete={() => removeFilter(filterType)}
                            color="secondary"
                        />
                    ))}
                </Stack>
                <Grid container spacing={4}>
                    {activities.map((item) => {
                        const isAlreadyFavorited = favorites.favoriteProducts?.map(product => product.id).includes(item.id);

                        // Pricing and discount logic (adjust if needed)
                        const discountPercent = 20; // Example: fixed 20% discount
                        const originalPrice = Math.floor(item.price);
                        const discountedPrice = Math.floor(item.price * (1 - discountPercent / 100));

                        // Build image URLs with prefixes
                        const originalImageUrl = item.photos[0]?.photo || '';
                        const smallImageUrl = originalImageUrl ? originalImageUrl.replace(/([^/]+)$/, 'small_$1') : '';
                        const mediumImageUrl = originalImageUrl ? originalImageUrl.replace(/([^/]+)$/, 'medium_$1') : '';
                        const largeImageUrl = originalImageUrl ? originalImageUrl.replace(/([^/]+)$/, 'large_$1') : '';

                        return (
                            <Grid item key={item.id} xs={6} sm={6} md={4} lg={3}>
                                <Card sx={{
                                    height: { xs: 'auto', md: '350px' },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative'
                                }}>
                                    <a href={`/products/detail/${item.id}`}
                                       style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <CardMedia
                                            component="img"
                                            image={smallImageUrl} // Default to small image
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
                                                objectFit: 'cover'
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
                                                {originalPrice} €
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    color: '#1976d2',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.9rem'
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
                            Load More
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
                fullScreen={fullScreen}
                ModalProps={{
                    keepMounted: true,
                }}
            >
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    message={snackbarMessage}
                />
            </SwipeableDrawer>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{"Just a moment!"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t("We noticed you're interested in saving favorites. That's great! To keep track of your favorite events and activities, please log in or sign up. It's quick and easy!")}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary" autoFocus>
                        Got it, thanks!
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ProductList;
