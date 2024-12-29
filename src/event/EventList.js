import React, {useEffect, useState} from 'react';
import Axios from 'axios';
import Header from "../header/Header";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import {
    Avatar,
    Button,
    CardHeader,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    Menu,
    MenuItem,
    Select,
    Snackbar,
    SwipeableDrawer,
    useMediaQuery,
    useTheme
} from "@mui/material";
import CardMedia from "@mui/material/CardMedia";
import {useNavigate, useParams} from "react-router-dom";
import {GoogleMap, InfoWindow, Marker, MarkerClusterer} from "@react-google-maps/api";
import FilterListIcon from "@mui/icons-material/FilterList";
import {MapOutlined} from "@mui/icons-material";
import {EventFilter} from "../filter/EventFilter";
import Box from "@mui/material/Box";
import PinDropIcon from '@mui/icons-material/PinDrop';
import {Helmet} from "react-helmet";
import Typography from "@mui/material/Typography";
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import LandscapeIcon from '@mui/icons-material/Landscape';
import ScienceIcon from '@mui/icons-material/Science';
import SchoolIcon from '@mui/icons-material/School';
import DanceIcon from '@mui/icons-material/LocalActivity';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import PaletteIcon from '@mui/icons-material/Palette';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import backgroundImage from "../images/background256.png";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import {useAuth} from "../auth/AuthProvider";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import {useTranslation} from "react-i18next";

const mapContainerStyle = {
    width: '100%',
    height: '400px',
};

const center = {
    lat: 59.47, // Example latitude
    lng: 25.15, // Example longitude
};

const EventList = () => {
    const [events, setEvents] = useState([]);
    const {type} = useParams();
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [userLocation] = useState(null);
    const theme = useTheme();
    const [openFilterDialog, setOpenFilterDialog] = useState(false);
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const [sort, setSort] = useState('');
    const { toggleFavorite, favorites, isLoggedIn } = useAuth();
    const [openDialog, setOpenDialog] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [openMenuEventId, setOpenMenuEventId] = useState(null);
    const { t, i18n } = useTranslation();


    const handleClick = (eventId) => {
        if (isLoggedIn) {
            const isAlreadyFavoritedEvent = favorites.favoriteEvents.map(event => event.id).includes(eventId);
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
        handleFavoriteClick(eventId, notificationType); // Call with the event's ID and selected notification type
        setOpenMenuEventId(null); // Reset the state controlling the menu's visibility to close the menu
    };



    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };
    const handleFavoriteClick = (eventId, notificationType) => {
        if (isLoggedIn) {
            const isFavorite = favorites.favoriteEvents.map(event => event.id).includes(eventId);
            toggleFavorite(eventId, isFavorite, "event", notificationType);
            // Set the Snackbar message and open it
            setSnackbarMessage(isFavorite ? 'Removed from favorites' : 'Added to favorites');
            setSnackbarOpen(true);
        } else {
            handleOpenDialog();
        }
    };
    
    useNavigate();
    const deneme = []
    deneme.push(backgroundImage);

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };


    useEffect(() => {
        // Define the page and size for pagination
        const page = 0;
        const size = 20;

        // Define the sorting criteria
        const sort = 'interested,desc'; // This sorts the events by 'interest' in descending order

        // Make an HTTP GET request to fetch events from the backend
        Axios.get(`${baseURL}/events/all`, {
            params: {
                page: page,
                size: size,
                sort: sort
            }
        })
            .then((response) => {
                setEvents(response.data.content);
            })
            .catch((error) => {
                console.error('Error fetching events:', error);
            });
    }, []);

    const updateFilteredEvents = (filteredEvents) => {
        setEvents(filteredEvents);
    };

    const handleCloseFilterDialog = () => {
        setOpenFilterDialog(false);
    };

    

 
    const loadMoreEvents = async () => {
        try {
            let nextPage = page + 1;
            let fetchUrl = `${baseURL}/events/all?page=${nextPage}&size=20`;

            if (sort === "near" && userLocation) {
                fetchUrl += `&lat=${encodeURIComponent(userLocation.lat)}&lon=${encodeURIComponent(userLocation.lng)}`;
            } else if (sort) { // For other sorts, append the sort parameter
                fetchUrl += `&sort=${encodeURIComponent(sort)}`;
            }

            const response = await Axios.get(fetchUrl);
            setEvents(prevEvents => [...prevEvents, ...response.data.content]);
            setHasMore(response.data.totalPages > nextPage + 1);
            setPage(nextPage);
        } catch (error) {
            console.error('Error fetching more activities:', error);
        }
    };

    const getDynamicFontSize = (title) => {
        if (title.length < 10) return "1.6rem";
        if (title.length < 30) return "1.3rem"
        return "1rem"; // Fallback font size
    };

    const handleChangeSort = async (event) => {
        setSort(event.target.value);

        const page = 0;
        const size = 20;
        const sort = event.target.value; // This sorts the events by 'interest' in descending order
        let url = `${baseURL}/events/all?page=${page}&size=${size}`;

            url += `&sort=${encodeURIComponent(sort)}`;
            // Make the HTTP GET request here using the URL without location
            Axios.get(url)
                .then((response) => {
                    setEvents(response.data.content);
                })
                .catch((error) => {
                    console.error('Error fetching events:', error);
                });
        
    };
    const eventIcons = {
        "music & concerts": <MusicNoteIcon/>,
        "outdoor & adventure": <LandscapeIcon/>,
        "tech & innovation": <ScienceIcon/>,
        "workshops & education": <SchoolIcon/>,
        "children": <ChildCareIcon/>,
        "exhibitions & art": <PaletteIcon/>,
        "miscellaneous": <HelpOutlineIcon/>,
        "theater & dance": <DanceIcon/>,
    };

    return (
        <div className="event-list">
            <Helmet>
                <meta name="robots" content="index, follow"/>
                <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`}/>
            </Helmet>
            <Header/>
            <Container sx={{py: 9}} maxWidth="xl">
                <Grid container spacing={4}>
                    {events.map((item) => {
                        const isAlreadyFavorited = favorites.favoriteEvents?.map(event => event.id).includes(item.id);
                        return (
                            <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>

                                <Card sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>

                                    <a href={`/events/${item.id}/${encodeURIComponent(item.title)}`}
                                       style={{textDecoration: 'none', color: 'inherit'}}>
                                        <div style={{display: 'flex', flexDirection: 'row'}}>
                                            <Avatar sx={{
                                                bgcolor: 'darkorange',
                                                fontSize: '0.7rem',
                                                marginLeft: '8px',
                                                marginTop: '15px'
                                            }}>
                                                {eventIcons[item.type.toLowerCase()]}
                                            </Avatar>

                                            <CardHeader
                                                style={{display: 'top', maxHeight: '65px'}}
                                                title={
                                                    <div style={{
                                                        maxWidth: '100%', // Limit the width to the parent container
                                                        overflow: 'hidden', // Hide overflow
                                                        display: '-webkit-box', // Use webkit box model for line clamp
                                                        WebkitLineClamp: 2, // Limit to two lines
                                                        WebkitBoxOrient: 'vertical', // Set the orientation to vertical
                                                        textOverflow: 'ellipsis' // Add ellipsis to text overflow
                                                    }}>
                                                        <Typography variant="h3" component="h3"
                                                                    style={{fontSize: '1.25rem'}}>
                                                            {item.title}
                                                        </Typography>
                                                    </div>
                                                }

                                                titleTypographyProps={{style: {fontSize: getDynamicFontSize(item.title)}}}
                                                
                                            />
                                        </div>
                                    </a>
                                    <a href={`/events/${item.id}/${encodeURIComponent(item.title)}`}
                                       style={{textDecoration: 'none', color: 'inherit'}}>
                                        <CardMedia
                                            component="div"
                                            sx={{
                                                pt: '56.25%',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }} // Ensure the position is relative to position the image correctly
                                        >
                                            <img
                                                src={item.photo}
                                                alt={item.title}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0
                                                }} // Full cover image
                                                onError={(e) => {
                                                    e.target.onerror = null; // Prevents looping
                                                    e.target.src = deneme[0]; // Assuming deneme[0] has the default image URL
                                                }}
                                            />

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
                                    />
                                      
                                </Card>
                            </Grid>

                        );
                    })}
                </Grid>
                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>{"Just a moment!"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            To start receiving AI-based recommendations tailored to your interests, please log in or sign up first. This way, you can get the best matches for events and activities and easily manage your favorites. It's quick and straightforward to get started!
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="primary" autoFocus>
                            Got it, thanks!
                        </Button>
                    </DialogActions>
                </Dialog>
                {hasMore && (
                    <div style={{display: 'flex', justifyContent: 'center', margin: '20px 0'}}>
                        <Button
                            onClick={loadMoreEvents}
                            variant="contained"
                            color="primary"
                            style={{textTransform: 'none', fontSize: '16px', padding: '10px 20px'}}
                        >
                            Load More
                        </Button>
                    </div>
                )}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    message={snackbarMessage}
                />
            </Container>
            <EventFilter
                openFilterDialog={openFilterDialog}
                handleCloseFilterDialog={handleCloseFilterDialog}
                type={type}
                updateFilteredEvents={updateFilteredEvents}
            />
        </div>
    );
};

export default EventList;
