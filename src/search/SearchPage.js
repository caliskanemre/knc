import React, {useEffect, useState} from 'react';
import axios from 'axios';
import "./css/SearchPage.css";
import Header from "../header/Header";
import {Avatar, Button, CardHeader, Divider, IconButton, Menu, MenuItem} from "@mui/material";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import {useLocation} from "react-router-dom";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import BackgroundGallery from "../shared/BackgroundGallery";
import CampingIcon2 from "../images/camping_summer2.jpg";
import wellness from "../images/wellness_green2.png";
import winter from "../images/winter_green.jpeg";
import swimming from "../images/summer_green3.jpg";
import park from "../images/park_green.jpg";
import nature from "../images/nature2.jpg";
import naturalPark from "../images/park_green2.png";
import museumIcon from "../images/green_museum.png";
import EventSearchButtons from "./EventSearchButtons";
import PinDropIcon from "@mui/icons-material/PinDrop";
import {Helmet} from "react-helmet";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import LandscapeIcon from "@mui/icons-material/Landscape";
import ScienceIcon from "@mui/icons-material/Science";
import SchoolIcon from "@mui/icons-material/School";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import PaletteIcon from "@mui/icons-material/Palette";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {useAuth} from "../auth/AuthProvider";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import backgroundImage from "../images/background256.png";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";

const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLocation, setSearchLocation] = useState('');
    const [eventResult, setEventResult] = useState([]);
    const [activityResult, setActivityResult] = useState([]);
    const [allResult, setAllResult] = useState({event: [], activity: []});
    const [eventPage, setEventPage] = useState(0);
    const [hasMoreEvents, setHasMoreEvents] = useState(0);
    const [hasMoreActivity, setHasMoreActivity] = useState(0);
    const [activityPage, setActivityPage] = useState(0);
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const location = useLocation();
    const [notificationPref, setNotificationPref] = useState('');
    const [openMenuEventId, setOpenMenuEventId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const { toggleFavorite, favorites, isLoggedIn } = useAuth();
    const [openDialog, setOpenDialog] = useState(false);
    const deneme = []
    deneme.push(backgroundImage);

    // Function to navigate to the details page

    const activityIcons = {
        camping: CampingIcon2,
        health: wellness,
        winter: winter,
        summer: swimming,
        park: park,
        nature: nature,
        national: naturalPark,
        museum: museumIcon
    };

    const handleClick = (eventId) => {
        if (isLoggedIn) {
            const isAlreadyFavoritedEvent = favorites.favoriteEvents.map(event => event.id).includes(eventId);
            if (!isAlreadyFavoritedEvent) {
                setOpenMenuEventId(eventId); // Open the menu for this event
            } else {
                handleFavoriteClick(eventId, '');
            }
        }else{
            handleOpenDialog();
        }
    };
    const handleOpenDialog = () => {
        setOpenDialog(true);
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
        const isFavorite = favorites.favoriteEvents.map(event => event.id).includes(eventId);
        toggleFavorite(eventId, isFavorite, "event", notificationType);
        // Set the Snackbar message and open it
        setSnackbarMessage(isFavorite ? 'Removed from favorites' : 'Added to favorites');
        setSnackbarOpen(true);
    };


    useEffect(() => {
        // Check if there's state available from navigation
        if (location.state && location.state.fromDetails) {
            const {fromSearch} = location.state.fromDetails;
            if (fromSearch) {
                // Restore the search state
                setSearchQuery(fromSearch.searchQuery);
                setSearchLocation(fromSearch.searchLocation);
                setAllResult(fromSearch.allResult);
                // Optionally, restore pagination states if they were part of the state
            }
        }
    }, [location]);

    const handleFavoriteEventClick = (eventId) => {
        toggleFavorite(eventId, favorites.favoriteEvents.map(event => event.id).includes(eventId), "event");
    };

    const handleFavoriteActivityClick = (activityId) => {
        toggleFavorite(activityId, favorites.favoriteActivities.map(activity => activity.id).includes(activityId), "activity");
    };

    const handleNewSearch = (term) => {
        // Reset states for a new search

        setEventPage(0);
        setActivityPage(0);
        setEventResult([]);
        setActivityResult([]);
        setAllResult({event: [], activity: []});

        setSearchQuery(term)
        // Then call handleSearch to perform the new search
        handleSearch({query: term});
    };

    const getDynamicFontSize = (title) => {
        if (title.length < 10) return "1.8rem";
        if (title.length < 20) return "1.5rem"
        return "1.2rem"; // Fallback font size
    };

    const updateFilteredEvents = (filteredEvents) => {
        setAllResult(prevAllResult => ({
            ...prevAllResult,
            event: [...prevAllResult.event, ...filteredEvents]
        }));
    };

    async function extractedEvent(options) {
        const {
            query = searchQuery, // Fallback to searchQuery if no query is provided in options
            location = searchLocation, // Fallback to searchLocation if no location is provided in options
            eventPageNumber = eventPage, // Fallback to eventPage if no eventPageNumber is provided in options
        } = options;


        const eventSize = 20; // Number of items per page

        try {
            const eventResponse = await axios.get(`${baseURL}/events/search`, {
                params: {
                    query: query,
                    location: location,
                    page: eventPageNumber,
                    size: eventSize
                }
            });
            const events = eventResponse.data.content;
            setEventResult(prevEvents => [...prevEvents, ...events]);
            setAllResult(prevAllResult => ({
                ...prevAllResult,
                event: [...prevAllResult.event, ...events]
            }));
            if (events.length === eventSize) {
                setEventPage(prevPage => prevPage + 1);
                setHasMoreEvents(true);
            } else {
                setHasMoreEvents(false); // No more events to load
            }
        } catch (error) {
            console.error('Error loading more events:', error);
        }
        return {eventSize};
    }

    async function extractedActivity(options) {
        const {
            query = searchQuery, // Fallback to searchQuery if no query is provided in options
            location = searchLocation, // Fallback to searchLocation if no location is provided in options
            activityPageNumber = activityPage, // Fallback to eventPage if no eventPageNumber is provided in options
        } = options;

        try {
            const activityResponse = await axios.get(`${baseURL}/activities/search`, {
                params: {
                    query: query,
                    location: location,
                    page: activityPageNumber,
                    size: 20
                }
            });

            setActivityResult(prevActivities => [...prevActivities, ...activityResponse.data.content]);
            setAllResult(prevAllResult => ({
                ...prevAllResult,
                activity: [...prevAllResult.activity, ...activityResponse.data.content]
            }));
            if (activityResult.length === 20) {
                setActivityPage(prevPage => prevPage + 1);
                setHasMoreActivity(true);
            } else {
                setHasMoreActivity(false); // No more events to load
            }
        } catch (error) {
            console.error('Error loading more activities:', error);
        }
    }

    const totalResults = eventResult.length + activityResult.length;
    const handleSearch = async (options = {}) => {
        await extractedEvent(options);
        await extractedActivity(options);
    };

    const combinedResults = [
        ...(Array.isArray(allResult.event) ? allResult.event.map(item => ({...item, type: 'events'})) : []),
        ...(Array.isArray(allResult.activity) ? allResult.activity.map(item => ({...item, type: 'activities'})) : [])
    ];

    const eventIcons = {
        "music & concerts": <MusicNoteIcon/>,
        "outdoor & adventure": <LandscapeIcon/>,
        "tech & innovation": <ScienceIcon/>,
        "education": <SchoolIcon/>,
        "children": <ChildCareIcon/>,
        "arts & culture": <PaletteIcon/>,
        "other": <HelpOutlineIcon/>,
    };


    return (
        <div>
            <Helmet>
                <title>{searchQuery ? `${searchQuery} - Search Results | Kına Sepeti` : 'Search | Kına Sepeti'}</title>
                <meta name="description"
                      content={`Ürün ara ${searchQuery ? searchQuery : 'your interests'} on Kına Sepeti.`}/>
                <meta name="robots" content="noindex, follow"/>
                <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`}/>
            </Helmet>
            <Header/>

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
                            variant="contained" // Add a background
                            onClick={() => handleNewSearch(searchQuery)} // Pass the current searchQuery state
                            className="search-button" // Add a class for styling
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
                    <Typography variant="h6" style={{textAlign: 'center', margin: '20px 0'}}>
                        {totalResults === 0 ? `Ürün bulunamadı` : `"${searchQuery}" ile alakalı ${totalResults} bulundu`}
                    </Typography>
                )}

            </div>
            <Container sx={{py: 9}} maxWidth="xl">
                <Grid container spacing={4}>
                    {combinedResults.map((item, index) => {
                        // Determine if the item is already favorited, taking into account the item type
                        const isAlreadyFavorited = item.type === 'events'
                            ? favorites.favoriteEvents?.some(event => event.id === item.id)
                            : favorites.favoriteActivities?.some(activity => activity.id === item.id);

                        return (
                            <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                                <Card sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                                    {item.type === 'activities' ? (
                                        <>
                                            <a href={`/activities/detail/${item.id}/${item.title}`}
                                               style={{textDecoration: 'none', color: 'inherit'}}>
                                                <div style={{
                                                    textDecoration: 'none',
                                                    color: 'inherit',
                                                    cursor: 'pointer'
                                                }}>
                                                    <div style={{display: 'flex', flexDirection: 'row'}}>
                                                        <Avatar sx={{
                                                            bgcolor: 'primary.main',
                                                            fontSize: '0.7rem',
                                                            marginLeft: '5px',
                                                            marginTop: '10px'
                                                        }}>
                                                            <img src={activityIcons[item.activity_type.toLowerCase()]}
                                                                 alt={`${item.activity_type} Icon`}
                                                                 style={{width: '100%', height: '100%'}}/>
                                                        </Avatar>
                                                        <CardHeader
                                                            style={{display: 'top', height: '45px'}}
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
                                                            subheader={
                                                                <div>
                                                                    <div>{item.date}</div>
                                                                    {/* First line of subheader */}
                                                                    <div>
                                                                        <PinDropIcon style={{
                                                                            fontSize: '1rem',
                                                                            verticalAlign: 'bottom'
                                                                        }}/> {item.activity_location}
                                                                    </div>
                                                                </div>
                                                            }
                                                            subheaderTypographyProps={{
                                                                component: 'div',
                                                                style: {fontSize: '11px'}
                                                            }}
                                                        />
                                                    </div>
                                                    <BackgroundGallery
                                                        images={item.photos.map((photo) => photo.photo)}/>
                                                </div>
                                            </a>
                                            <IconButton
                                                aria-label="add to favorites"
                                                onClick={() => handleFavoriteActivityClick(item.id)}
                                            >
                                                {isAlreadyFavorited ? <FavoriteIcon color="error"/> :
                                                    <FavoriteBorderIcon/>}
                                            </IconButton>
                                        </>
                                    ) : (
                                        <>
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
                                                                {item.title}
                                                            </div>
                                                        }
                                                        titleTypographyProps={{style: {fontSize: getDynamicFontSize(item.title)}}}
                                                        subheader={
                                                            <div>
                                                                <div>{item.date}</div>
                                                                <div>
                                                                    <PinDropIcon style={{
                                                                        fontSize: '1rem',
                                                                        verticalAlign: 'bottom'
                                                                    }}/> {item.place}
                                                                </div>
                                                            </div>
                                                        }
                                                        subheaderTypographyProps={{
                                                            component: 'div',
                                                            style: {fontSize: '11px'}
                                                        }}
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
                                            >
                                                <Typography style={{ padding: '10px 16px' }} variant="subtitle1" component="div">
                                                    Do you want to get any notification?
                                                </Typography>
                                                <Divider />
                                                <MenuItem onClick={() => handleCloseNotification(item.id, '2')}>
                                                    2hrs before
                                                </MenuItem>
                                                <MenuItem onClick={() => handleCloseNotification(item.id, '24')}>
                                                    24hrs before
                                                </MenuItem>
                                                <MenuItem onClick={() => handleCloseNotification(item.id, 'Week')}>
                                                    Week before
                                                </MenuItem>
                                                <MenuItem onClick={() => handleCloseNotification(item.id, 'No')}>
                                                    No need notification
                                                </MenuItem>
                                                {/* Add more MenuItem components as needed */}
                                            </Menu>
                                        </>
                                    )}
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
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
            {hasMoreEvents || hasMoreActivity && (eventPage > 0 || activityPage > 0) && (
                <div style={{display: 'flex', justifyContent: 'center', margin: '20px 0'}}>
                    <Button
                        onClick={handleSearch}
                        variant="contained"
                        color="primary"
                        style={{textTransform: 'none', fontSize: '16px', padding: '10px 20px'}}
                    >
                        Daha Fazla
                    </Button>
                </div>
            )}
        </div>
    );
};

export default SearchPage;