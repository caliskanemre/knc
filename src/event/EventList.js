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
    Chip,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
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
    const { type } = useParams();
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [mapOpen, setMapOpen] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [isMapReady, setIsMapReady] = useState(false);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [openFilterDialog, setOpenFilterDialog] = useState(false);
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const [filters, setFilters] = useState([]);
    const [sort, setSort] = useState('');
    const isGoogleMapsApiLoaded = () => window.google && window.google.maps;

    const navigate = useNavigate();

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

    const applyFilter = (filterType, filterValue) => {
        // Add a new filter or update the existing one
        setFilters(currentFilters => ({
            ...currentFilters,
            [filterType]: filterValue
        }));
        // Trigger activity or event refetch with new filters here
    };

    const updateFilteredEvents = (filteredEvents) => {
        setEvents(filteredEvents);
    };

    const handleCloseFilterDialog = () => {
        setOpenFilterDialog(false);
    };

    const fetchPins = async () => {
        try {
            const response = await Axios.get(`${baseURL}/events/pins`);
            const pinsData = response.data;
            prepareMarkers(pinsData);
        } catch (error) {
            console.error('Error fetching pins:', error);
        }
    };

    const prepareMarkers = (pins) => {
        if (!isGoogleMapsApiLoaded()) {
            console.error('Google Maps API is not loaded');
            return;
        }

        const tempMarkers = pins.map(pin => ({
            title: pin.title,
            id: pin.id,
            lat: parseFloat(pin.lat),
            lng: parseFloat(pin.lon)
        }));

        setMarkers(tempMarkers);
    };

    const handleInfoWindowClick = (event) => {
        if (event && event.id) {
            const fullUrl = window.location.origin + `/events/${event.id}`;
            window.open(fullUrl, '_blank');
        }
    };
    const handleOpenMapDialog = async () => {
        await fetchPins();
        setMapOpen(true);
        askForUserLocation();
    };

    const handleCloseMapDialog = () => {
        setMapOpen(false);
    };

    function askForUserLocation() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    resolve(userLocation); // Resolve the promise with the location
                },
                (error) => {
                    reject(error); // Reject the promise if there's an error
                }
            );
        });
    }
    const loadMoreEvents = async () => {
        try {
            let nextPage = page + 1;
            let fetchUrl = `${baseURL}/events/all?page=${nextPage}&size=20`;

            // Check if the current sort is 'near' and ensure userLocation is available
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

    const handleOpenFilterDialog = () => {
        setOpenFilterDialog(true);
    };
    const removeFilter = (filterType) => {
        setFilters(currentFilters => {
            const newFilters = { ...currentFilters };
            delete newFilters[filterType];
            //fetchInitialActivities()
            return newFilters;
        });
        // Trigger activity or event refetch with updated filters here
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

        if (sort === "near") {
            askForUserLocation().then((userLocation) => {
                // This code now waits for the user location to be fetched
                if (userLocation) {
                    url += `&lat=${encodeURIComponent(userLocation.lat)}&lon=${encodeURIComponent(userLocation.lng)}`;
                    // Make the HTTP GET request here using the updated URL
                    Axios.get(url)
                        .then((response) => {
                            setEvents(response.data.content);
                        })
                        .catch((error) => {
                            console.error('Error fetching events:', error);
                        });
                } else {
                    console.error('User location is not available.');
                    // Consider providing user feedback or defaulting to a different sort
                }
            }).catch((error) => {
                console.error('Error getting user location:', error);
                // Handle the error (e.g., user denied location access)
            });
        } else {
            url += `&sort=${encodeURIComponent(sort)}`;
            // Make the HTTP GET request here using the URL without location
            Axios.get(url)
                .then((response) => {
                    setEvents(response.data.content);
                })
                .catch((error) => {
                    console.error('Error fetching events:', error);
                });
        }
    };


    return (
        <div className="event-list">
            <Header/>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                <Button style={{ marginRight: '20px' }}
                        variant="outlined"
                        color="primary"
                        startIcon={<FilterListIcon />}
                        onClick={handleOpenFilterDialog}
                >
                    Filter
                </Button>

                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<MapOutlined />}
                    onClick={handleOpenMapDialog}
                >
                    Map
                </Button>
            </div>
            {/*<EventSubHeader/>*/}
            <Container sx={{ py: 9 }} maxWidth="xl">
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
                <Box display="flex" justifyContent="flex-end" p="5px">
                    <FormControl sx={{ m: 2, minWidth: 120 }}>
                        <InputLabel id="autowidth-label">Sort</InputLabel>
                        <Select
                            labelId="autowidth-label"
                            id="autowidth"
                            value={sort}
                            onChange={handleChangeSort}
                            autoWidth
                            label="Sort"
                        >
                            <MenuItem value={"interested"}>Popularity</MenuItem>
                            <MenuItem value={"near"}>Nearest</MenuItem>
                            <MenuItem value={"dateFrom"}>Date/Time</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Grid container spacing={4}>
                    {events.map((item) => {
                        return (
                            <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>

                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <a href={`/event/${item.id}`} target="_blank" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            <Avatar sx={{ bgcolor: 'darkorange', fontSize: '1rem', marginLeft: '5px', marginTop: '15px' }}>
                                                event
                                            </Avatar>
                                            <CardHeader
                                                style={{ display: 'top', maxHeight: '65px' }}
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
                                                titleTypographyProps={{ style: { fontSize: getDynamicFontSize(item.title) } }}
                                                subheader={
                                                    <div>
                                                        <div>{item.date}</div> {/* First line of subheader */}
                                                        <div>
                                                            <PinDropIcon style={{ fontSize: '1rem', verticalAlign: 'bottom' }} /> {item.place}
                                                        </div>
                                                    </div>
                                                }
                                                subheaderTypographyProps={{ component: 'div', style: { fontSize: '11px' } }}
                                            />
                                        </div>
                                    </a>
                                    <a href={`/events/${item.id}`} target="_blank" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <CardMedia
                                            component="div"
                                            sx={{ pt: '56.25%' }}
                                            image={item.photo}
                                        />
                                    </a>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
                {hasMore && (
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                        <Button
                            onClick={loadMoreEvents}
                            variant="contained"
                            color="primary"
                            style={{ textTransform: 'none', fontSize: '16px', padding: '10px 20px' }}
                        >
                            Load More
                        </Button>
                    </div>
                )}
                {isGoogleMapsApiLoaded() ? (
                    <SwipeableDrawer
                        anchor="bottom"
                        open={mapOpen}
                        onClose={handleCloseMapDialog}
                        onOpen={handleOpenMapDialog}
                        fullScreen={fullScreen}
                        ModalProps={{
                            keepMounted: true, // Better performance on mobile
                        }}
                    >
                        <DialogTitle id="map-dialog-title">Activities Map</DialogTitle>
                        <DialogContent>

                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                zoom={8}
                                center={userLocation || center}
                                onUnmount={() => setIsMapReady(false)}
                                options={{ gestureHandling: 'greedy' }}
                                onLoad={() => {
                                    setTimeout(() => {
                                        setIsMapReady(true);
                                    }, 2000); // 2 seconds delay
                                }}

                            >
                                {userLocation && (
                                    <Marker
                                        position={userLocation}
                                        icon={{
                                            path: "M0-48c-9,0-16,7-16,16s7,16,16,16,16-7,16-16-7-16-16-16z",
                                            fillColor: '#FF0000',
                                            fillOpacity: 1.0,
                                            scale: 0.5,
                                            strokeColor: '#000000',
                                            strokeWeight: 2,
                                        }}
                                    />
                                )}
                                {isMapReady && (
                                    <MarkerClusterer
                                        options={{ imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' }}
                                    >
                                        {(clusterer) =>
                                            markers.map((marker) => (
                                                <Marker
                                                    key={marker.id} // Use the unique id of the marker
                                                    position={{ lat: marker.lat, lng: marker.lng }} // Ensure position is an object with lat and lng
                                                    title={marker.title}
                                                    onClick={() => {
                                                        if (selectedMarker && selectedMarker.id === marker.id) {
                                                            // If the clicked marker's InfoWindow is already open, close it
                                                            setSelectedMarker(null);
                                                        } else {
                                                            // Otherwise, open the new InfoWindow
                                                            setSelectedMarker({
                                                                id: marker.id,
                                                                position: { lat: marker.lat, lng: marker.lng },
                                                                title: marker.title,
                                                            });
                                                        }
                                                    }}
                                                    clusterer={clusterer}
                                                />
                                            ))
                                        }
                                    </MarkerClusterer>
                                )}
                                {selectedMarker && (
                                    <InfoWindow
                                        position={selectedMarker.position}
                                        onCloseClick={() => setSelectedMarker(null)}
                                    >
                                        <div>
                                            <h3>{selectedMarker.title}</h3>
                                            <button onClick={() => handleInfoWindowClick(selectedMarker)}>
                                                View Details
                                            </button>
                                        </div>
                                    </InfoWindow>
                                )}

                            </GoogleMap>

                        </DialogContent>
                    </SwipeableDrawer> ) : (
                    <div>Loading Maps...</div>
                )}
            </Container>
            <EventFilter
                openFilterDialog={openFilterDialog}
                handleCloseFilterDialog={handleCloseFilterDialog}
                type={type}
                applyFilter={applyFilter}
                updateFilteredEvents={updateFilteredEvents}
            />
        </div>
    );
};

export default EventList;
