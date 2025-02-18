import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./css/SearchPage.css";
import Header from "../header/Header";
import {
    Avatar,
    Button,
    Card,
    CardMedia,
    Container,
    Grid,
    IconButton,
    Menu,
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useAuth } from "../auth/AuthProvider";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import EventSearchButtons from "./EventSearchButtons";

// Helper function to generate a prefixed image URL (e.g., "small_", "medium_", "large_")
const getPrefixedImage = (url, prefix) => {
    if (!url) return url;
    return url.replace(/([^/]+)$/, `${prefix}_$1`);
};

const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLocation, setSearchLocation] = useState('');
    const [eventResult, setEventResult] = useState([]);
    const [activityResult, setActivityResult] = useState([]);
    const [allResult, setAllResult] = useState({ event: [], activity: [] });
    const [eventPage, setEventPage] = useState(0);
    const [hasMoreEvents, setHasMoreEvents] = useState(false);
    const [hasMoreActivity, setHasMoreActivity] = useState(false);
    const [activityPage, setActivityPage] = useState(0);
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const location = useLocation();
    const [openMenuEventId, setOpenMenuEventId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const { toggleFavorite, favorites, isLoggedIn } = useAuth();
    const [openDialog, setOpenDialog] = useState(false);

    // Restore search state from navigation if available
    useEffect(() => {
        if (location.state && location.state.fromDetails) {
            const { fromSearch } = location.state.fromDetails;
            if (fromSearch) {
                setSearchQuery(fromSearch.searchQuery);
                setSearchLocation(fromSearch.searchLocation);
                setAllResult(fromSearch.allResult);
                // Optionally restore pagination states here
            }
        }
    }, [location]);

    // Favorite action for events: if not favorited, open menu; otherwise, toggle favorite
    const handleClick = (eventId) => {
        if (isLoggedIn) {
            const isAlreadyFavoritedEvent = favorites.favoriteEvents
                .map(event => event.id)
                .includes(eventId);
            if (!isAlreadyFavoritedEvent) {
                setOpenMenuEventId(eventId);
            } else {
                handleFavoriteClick(eventId, '');
            }
        } else {
            handleOpenDialog();
        }
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseNotification = (eventId, notificationType) => {
        // Set the notification preference based on user selection and call favorite toggle
        handleFavoriteClick(eventId, notificationType);
        setOpenMenuEventId(null);
    };

    const handleCloseFavoriteDialog = () => {
        setOpenDialog(false);
    };

    const handleFavoriteClick = (eventId, notificationType) => {
        const isFavorite = favorites.favoriteEvents
            .map(event => event.id)
            .includes(eventId);
        toggleFavorite(eventId, isFavorite, "event", notificationType);
        setSnackbarMessage(isFavorite ? 'Removed from favorites' : 'Added to favorites');
        setSnackbarOpen(true);
    };

    // For activity favorites, use a simpler toggle
    const handleFavoriteActivityClick = (activityId) => {
        toggleFavorite(
            activityId,
            favorites.favoriteActivities.map(activity => activity.id).includes(activityId),
            "activity"
        );
    };

    // Start a new search
    const handleNewSearch = (term) => {
        setEventPage(0);
        setActivityPage(0);
        setEventResult([]);
        setActivityResult([]);
        setAllResult({ event: [], activity: [] });
        setSearchQuery(term);
        handleSearch({ query: term });
    };

    const getDynamicFontSize = (title) => {
        if (title.length < 10) return "1.8rem";
        if (title.length < 20) return "1.5rem";
        return "1.2rem";
    };

    const updateFilteredEvents = (filteredEvents) => {
        setAllResult(prev => ({
            ...prev,
            event: [...prev.event, ...filteredEvents]
        }));
    };

    async function extractedEvent(options) {
        const {
            query = searchQuery,
            location: loc = searchLocation,
            eventPageNumber = eventPage,
        } = options;
        const eventSize = 20;
        try {
            const eventResponse = await axios.get(`${baseURL}/products/searchByFts`, {
                params: {
                    query,
                    location: loc,
                    page: eventPageNumber,
                    size: eventSize
                }
            });
            const events = eventResponse.data.content;
            setEventResult(prev => [...prev, ...events]);
            setAllResult(prev => ({
                ...prev,
                event: [...prev.event, ...events]
            }));
            if (events.length === eventSize) {
                setEventPage(prev => prev + 1);
                setHasMoreEvents(true);
            } else {
                setHasMoreEvents(false);
            }
        } catch (error) {
            console.error('Error loading more events:', error);
        }
        return { eventSize };
    }

    const totalResults = eventResult.length + activityResult.length;
    const handleSearch = async (options = {}) => {
        await extractedEvent(options);
        // (You can add an analogous extraction for activities if needed)
    };

    // Combine event and activity results into one array and add a type property
    const combinedResults = [
        ...(Array.isArray(allResult.event)
            ? allResult.event.map(item => ({ ...item, type: 'events' }))
            : []),
        ...(Array.isArray(allResult.activity)
            ? allResult.activity.map(item => ({ ...item, type: 'activities' }))
            : []),
    ];

    return (
        <div>
            <Helmet>
                <title>{searchQuery ? `${searchQuery} - Search Results | Kına Sepeti` : 'Search | Kına Sepeti'}</title>
                <meta
                    name="description"
                    content={`Ürün ara ${searchQuery ? searchQuery : 'your interests'} on Kına Sepeti.`}
                />
                <meta name="robots" content="noindex, follow" />
                <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
            </Helmet>
            <Header />

            <div className="parent-container">
                <div className="search-page">
                    <div className="location-input">
                        <input
                            type="text"
                            placeholder="Ürün ara!"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleNewSearch(e.target.value);
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={() => handleNewSearch(searchQuery)}
                            className="search-button"
                        >
                            Ara
                        </Button>
                    </div>

                    <div className="filters">
                        <EventSearchButtons
                            handleNewSearch={handleNewSearch}
                            updateFilteredEvents={updateFilteredEvents}
                            setSearchQuery={setSearchQuery}
                        />
                    </div>

                    <div className="recent-searches">
                        <h2>Popüler Aramalar</h2>
                        <ul>
                            <li><h6>Duvak</h6></li>
                            <li><h6>Halay Mendili</h6></li>
                            <li><h6>Çiçek</h6></li>
                            <li><h6>Tef</h6></li>
                            <li><h6>Sepet</h6></li>
                            <li><h6>Örtü</h6></li>
                        </ul>
                    </div>
                </div>
                {searchQuery && (
                    <Typography variant="h6" style={{ textAlign: 'center', margin: '20px 0' }}>
                        {totalResults === 0 ? `Ürün bulunamadı` : `"${searchQuery}" ile alakalı ${totalResults} sonuç bulundu`}
                    </Typography>
                )}
            </div>

            <Container sx={{ py: 9 }} maxWidth="xl">
                <Grid container spacing={4}>
                    {combinedResults.map((item) => {
                        // Determine if item is already favorited based on its type
                        const isAlreadyFavorited =
                            item.type === 'events'
                                ? favorites.favoriteEvents?.some(event => event.id === item.id)
                                : favorites.favoriteActivities?.some(activity => activity.id === item.id);

                        // Use different handlers for events vs. activities
                        const handleFavClick =
                            item.type === 'events'
                                ? () => handleClick(item.id)
                                : () => handleFavoriteActivityClick(item.id);

                        // Determine link and image source based on type
                        const detailLink = `/products/detail/${item.id}/${item.title}`;
                        const originalImage = (item.photos && item.photos[0] ? item.photos[0].photo : '');

                        // Generate prefixed image URLs
                        const smallImageUrl = getPrefixedImage(originalImage, 'small');
                        const mediumImageUrl = getPrefixedImage(originalImage, 'medium');
                        const largeImageUrl = getPrefixedImage(originalImage, 'large');

                        return (
                            <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                                <Card
                                    sx={{
                                        height: { xs: 'auto', md: '350px' },
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative'
                                    }}
                                >
                                    <a href={detailLink} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </a>
                                    <Box sx={{ p: 2, flex: 1 }}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontSize: getDynamicFontSize(item.title),
                                                fontWeight: 500,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {item.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.date}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {item.type === 'activities' ? item.activity_location : item.place}
                                            </Typography>
                                        </Box>
                                        {/* If price is available, show pricing & discount info */}
                                        {item.price && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                <Typography
                                                    sx={{
                                                        textDecoration: 'line-through',
                                                        color: 'gray',
                                                        mr: 1,
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    {Math.floor(item.price)} TL
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        color: '#1976d2',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    {Math.floor(item.price * 0.8)} TL
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
                                    </Box>
                                    <IconButton
                                        id={item.type === 'events' ? `favorite-icon-${item.id}` : undefined}
                                        aria-label="add to favorites"
                                        onClick={handleFavClick}
                                        sx={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            backgroundColor: 'rgba(255,255,255,0.7)',
                                            borderRadius: '50%',
                                            padding: '6px',
                                            zIndex: 3,
                                        }}
                                    >
                                        {isAlreadyFavorited ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                                    </IconButton>
                                    {/* For events, show the menu if open */}
                                    {item.type === 'events' && openMenuEventId === item.id && (
                                        <Menu
                                            id="simple-menu"
                                            anchorEl={document.getElementById(`favorite-icon-${item.id}`)}
                                            keepMounted
                                            open={true}
                                            onClose={() => setOpenMenuEventId(null)}
                                        >
                                            {/* Add menu items here if needed */}
                                        </Menu>
                                    )}
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
                {(hasMoreEvents || hasMoreActivity) && (eventPage > 0 || activityPage > 0) && (
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                        <Button
                            onClick={handleSearch}
                            variant="contained"
                            color="primary"
                            style={{ textTransform: 'none', fontSize: '16px', padding: '10px 20px' }}
                        >
                            Daha Fazla
                        </Button>
                    </div>
                )}
            </Container>
            <Dialog open={openDialog} onClose={handleCloseFavoriteDialog}>
                <DialogTitle>{"Just a moment!"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Login please...
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseFavoriteDialog} color="primary" autoFocus>
                        Got it, thanks!
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default SearchPage;
