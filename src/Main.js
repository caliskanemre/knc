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
deneme.push(backgroundImage);

const PAGE_SIZE = 20;

export default function Main() {
    const [products, setProducts] = useState([]);

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
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage);
    };

    const fetchProducts = async (pageNum) => {
        try {
            const response = await Axios.get(`${baseURL}/products/all`, {
                params: {
                    page: pageNum,
                    size: PAGE_SIZE,
                    sort: 'interested,desc',
                },
            });

            if (response.data.length > 0) {
                setProducts((prevProducts) => [...prevProducts, ...response.data]);
            }

            // Check if there are more products to fetch
            setHasMore(response.data.length === PAGE_SIZE);
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
                <Grid container spacing={3}> {/* Maintains the outer grid container */}
                    <Grid item xs={12}> {/* Allows the grid item to span the full width */}
                        <BackgroundGallery images={deneme}/>
                    </Grid>
                </Grid>

                <Container sx={{py: 9}} maxWidth="xl">
                    <Grid container spacing={4}>
                        {products.map((item) => {
                            const isAlreadyFavorited = favorites.favoriteProducts?.map(event => event.id).includes(item.id) ?? false;
                            return (
                                <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                                    <Card sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                                        <a href={`/products/detail/${item.id}`}
                                           style={{textDecoration: 'none', color: 'inherit'}}>
                                            <div style={{display: 'flex', flexDirection: 'row'}}>
                                                <Avatar sx={{
                                                    bgcolor: 'primary.main',
                                                    fontSize: '0.7rem',
                                                    marginLeft: '8px',
                                                    marginTop: '15px'
                                                }}>
                                                    <img src={activityIcons[item.category.toLocaleLowerCase()]}
                                                         alt={`${item.category} Icon`}
                                                         style={{width: '100%', height: '100%'}}
                                                         loading="lazy"/>
                                                </Avatar>
                                                <CardHeader
                                                    style={{display: 'top', height: '50px'}}
                                                    title={
                                                        <div style={{
                                                            maxWidth: '100%', // Limit the width to the parent container
                                                            overflow: 'hidden', // Hide overflow
                                                            display: '-webkit-box', // Use webkit box model for line clamp
                                                            WebkitLineClamp: 2, // Limit to two lines
                                                            WebkitBoxOrient: 'vertical', // Set the orientation to vertical
                                                            textOverflow: 'ellipsis' // Add ellipsis to text overflow
                                                        }}>
                                                            {item.title}
                                                        </div>
                                                    }
                                                    titleTypographyProps={{style: {fontSize: getDynamicFontSize(item.title)}}}

                                                />
                                            </div>
                                        </a>
                                        <a href={`/products/detail/${item.id}`}
                                           style={{textDecoration: 'none', color: 'inherit'}}>
                                            <CardMedia
                                                component="div"
                                                sx={{
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }} // Ensure the position is relative to position the image correctly
                                            >
                                                <BackgroundGalleryDetails images={item.photos.map((photo) => photo.photo)}/>
                                            </CardMedia>
                                        </a>
                                        <IconButton
                                            id={`favorite-icon-${item.id}`}
                                            aria-label="add to favorites"
                                            onClick={() => handleClick(item.id)}
                                        >
                                            {isAlreadyFavorited ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                                        </IconButton>

                                        <Menu
                                            id="simple-menu"
                                            anchorEl={document.getElementById(`favorite-icon-${item.id}`)} // Use the IconButton's id as the anchor
                                            keepMounted
                                            open={openMenuEventId === item.id}
                                            onClose={() => setOpenMenuEventId(null)} // Close the menu by resetting the state
                                        >
                                           
                                        </Menu>

                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                    {hasMore && (
                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            <Button variant="contained" onClick={handleLoadMore}>
                                Load More
                            </Button>
                        </Box>
                    )}
                    <Dialog open={openDialog} onClose={handleCloseFavoriteDialog}>
                        <DialogTitle>{"Just a moment!"}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                To start receiving AI-based recommendations tailored to your interests, please log in or sign up first. This way, you can get the best matches for events and activities and easily manage your favorites. It's quick and straightforward to get started!
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


