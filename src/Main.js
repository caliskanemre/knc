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
import {Avatar, CardHeader, Divider, IconButton, Menu, MenuItem, Snackbar, Tooltip} from "@mui/material";
import BackgroundGallery from "./shared/BackgroundGallery";
import PinDropIcon from "@mui/icons-material/PinDrop";
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
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [expanded, setExpanded] = React.useState(false);
    const { toggleFavorite, favorites,isLoggedIn } = useAuth();
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const [openDialog, setOpenDialog] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [notificationPref, setNotificationPref] = useState('');
    const [openMenuEventId, setOpenMenuEventId] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleClick = (eventId) => {
        if (isLoggedIn) {
            const isAlreadyFavoritedEvent = favorites.favoriteProducts.map(event => event.id).includes(eventId);
            if (!isAlreadyFavoritedEvent) {
                setOpenMenuEventId(eventId); // Open the menu for this event
            } else {
                // If it's already a favorite, directly handle unfavoriting
                handleFavoriteClick(eventId, '');
            }
        }else{
            handleOpenDialog();
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);

        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleCloseNotification = (eventId, notificationType) => {
        setNotificationPref(notificationType); // Set the notification preference based on user selection
        handleFavoriteClick(eventId, notificationType); // Call with the event's ID and selected notification type
        setOpenMenuEventId(null); // Reset the state controlling the menu's visibility to close the menu
    };



    const handleCloseFavoriteDialog = () => {
        setOpenDialog(false);
    };
    const handleFavoriteClick = (eventId, notificationType) => {
        const isFavorite = favorites.favoriteProducts?.map(event => event.id).includes(eventId);
        toggleFavorite(eventId, isFavorite, "event", notificationType);
        // Set the Snackbar message and open it
        setSnackbarMessage(isFavorite ? 'Removed from favorites' : 'Added to favorites');
        setSnackbarOpen(true);
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };


    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setLoading(true);
            fetchProducts(page).finally(() => setLoading(false));
        }
    };

    const fetchProducts = async (pageNum) => {
        try {
            const response = await Axios.get(`${baseURL}/products/all`, {
                params: {
                    page: pageNum, // Current page number
                    size: PAGE_SIZE, // Number of items per page
                    sort: 'interested,desc', // Sorting criteria
                },
            });

            // Extract data and pagination metadata
            const { content, totalPages } = response.data || {};
            if (content && content.length > 0) {
                setProducts((prevProducts) => [...prevProducts, ...content]);
            }
            if (totalPages != null) {
                setHasMore(pageNum + 1 < totalPages);
            } else {
                console.error("Pagination metadata missing from response.");
            }

            // Determine if there are more pages to fetch
            setHasMore(pageNum + 1 < totalPages);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };


    useEffect(() => {
        fetchProducts(0); // Initial fetch on component mount
    }, []);

    const getDynamicFontSize = (title) => {
        if (title.length < 10) return "1.6rem"
        else if (title.length < 30) return "1.3rem"
        else if (title.length < 50) return "1.1rem"
        return "0.85rem"; // Fallback font size
    };

    const activityIcons = {
        veil: veil,
        tamborine: tamborine,
        hennaset: hennaset,
        handkerchief: handkerchief,
        gift: gift,
        ornament: ornament,
        flower: flower,
        souvenir: souvenir
    };



    return (
        <ThemeProvider theme={defaultTheme}>
            <Helmet>
                <meta name="robots" content="index, follow"/>
                <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`}/>
            </Helmet>
            <CssBaseline/>
            <Header/>
            <main>
                {/* Hero unit */}
                <Grid container spacing={3}>
                    {/* Conditionally render BackgroundGallery based on isMobile */}
                    {!isMobile && (
                        <Grid item xs={12}>
                            <BackgroundGallery images={[backgroundImage]} />
                        </Grid>
                    )}
                </Grid>


                <Container sx={{py: 9}} maxWidth="xl">
                    <Grid container spacing={4}>
                        {products.map((item) => {
                            const isAlreadyFavorited = favorites.favoriteProducts?.map(event => event.id).includes(item.id) ?? false;
                            return (
                                <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                        <a href={`/products/detail/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: 'primary.main',
                                                        fontSize: '0.7rem',
                                                        marginLeft: '8px',
                                                        marginTop: '5px',
                                                    }}
                                                >
                                                    <img
                                                        src={activityIcons[item.category.toLocaleLowerCase()]}
                                                        alt={`${item.category} Icon`}
                                                        style={{ width: '100%', height: '100%' }}
                                                    />
                                                </Avatar>
                                                <CardHeader
                                                    style={{ display: 'top', height: '50px' }}
                                                    title={
                                                        <Typography
                                                            style={{
                                                                maxWidth: '100%',
                                                                overflow: 'hidden',
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                textOverflow: 'ellipsis',
                                                                fontFamily: "'Great Vibes'", // Matching the header font
                                                                fontSize: getDynamicFontSize(item.title), // Dynamic font size for responsiveness
                                                                fontWeight: 700, // Bold for readability
                                                                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)', // Subtle shadow for depth
                                                            }}
                                                        >
                                                            {item.title}
                                                        </Typography>
                                                    }
                                                />
                                            </div>
                                        </a>
                                        <a href={`/products/detail/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <div style={{ position: 'relative', overflow: 'hidden' }}>
                                                {/* Image Section */}
                                                <CardMedia
                                                    component="div"
                                                    sx={{
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    <BackgroundGalleryDetails images={item.photos.map((photo) => photo.photo)} />

                                                </CardMedia>

                                                {/* Favorite Icon in Upper Right */}
                                                <IconButton
                                                    id={`favorite-icon-${item.id}`}
                                                    aria-label="add to favorites"
                                                    onClick={(event) => {
                                                        event.stopPropagation(); // Prevent click event from propagating to parent elements
                                                        event.preventDefault(); // Prevent default behavior
                                                        handleClick(item.id);
                                                    }}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: '8px',
                                                        right: '8px',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                                        borderRadius: '50%',
                                                        padding: '6px',
                                                        zIndex: 2, // Ensure it appears above the image
                                                    }}
                                                >
                                                    {isAlreadyFavorited ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                                                </IconButton>
                                            </div>
                                        </a>
                                    </Card>

                                </Grid>
                            );
                        })}
                    </Grid>

                    <Dialog open={openDialog} onClose={handleCloseFavoriteDialog}>
                        <DialogTitle>{"Just a moment!"}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                To start receiving AI-based recommendations tailored to your interests, please log in or sign up first. This way, you can get the best matches for products and easily manage your favorites. It's quick and straightforward to get started!
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseFavoriteDialog} color="primary" autoFocus>
                                Got it, thanks!
                            </Button>
                        </DialogActions>
                    </Dialog>

                </Container>
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    message={snackbarMessage}
                />
            </main>
            {/* Footer */}
            <Box sx={{bgcolor: 'background.paper', p: 6}} component="footer">
                <Typography variant="h6" align="center" gutterBottom>
                    Kına Sepeti
                </Typography>
                <Typography
                    variant="subtitle1"
                    align="center"
                    color="text.secondary"
                    component="p"
                >
                    All rights reserved @2025 Kına Sepeti
                </Typography>
                {/*      <Copyright />*/}
            </Box>


            {/* End footer */}
        </ThemeProvider>
    );
}


