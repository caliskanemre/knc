import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import Header from "../header/Header";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import {Button, CardHeader, DialogContent, DialogTitle, SwipeableDrawer, useMediaQuery, useTheme} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import {Link, useNavigate, useParams} from "react-router-dom";
import EventSubHeader from "./EventSubHeader";
import {GoogleMap, InfoWindow, Marker} from "@react-google-maps/api";
import FilterListIcon from "@mui/icons-material/FilterList";
import {MapOutlined} from "@mui/icons-material";


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

    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
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

    const fetchPins = async () => {
        try {
            const response = await Axios.get(`${baseURL}/events/pins/}`);
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

    const handleMarkerClick = (activity) => {
        setSelectedMarker({
            ...activity,
            position: {
                lat: parseFloat(activity.lat),
                lng: parseFloat(activity.lon)
            }
        });
    };


    const handleInfoWindowClick = (event) => {
        if (event && event.id) {
            navigate(`/events/detail/${event.id}`);
        }
    };
    const handleOpenMapDialog = async () => {
        // Fetch pins for the current activity type
        await fetchPins(type);
        setMapOpen(true);
        askForUserLocation();
    };

    const handleCloseMapDialog = () => {
        setMapOpen(false);
    };

    const askForUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                () => {
                    console.error('Error: The Geolocation service failed.');
                }
            );
        } else {
            console.error('Error: Your browser doesn\'t support geolocation.');
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
                <Grid container spacing={4}>
                    {events.map((item) => {
                        return (
                            <Grid item key={item.id} xs={12} sm={6} md={3}>

                                <Card sx={{ height: '90%', display: 'flex', flexDirection: 'column' }}>
                                    <Link to={`/event/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <CardHeader style={{display:'top', height:'40px'}}
                                            title={item.title}
                                            subheader={item.date}

                                        />
                                    </Link>
                                    <Link to={`/events/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <CardMedia
                                            component="div"
                                            sx={{ pt: '56.25%' }}
                                            image={item.photo}
                                        />
                                    </Link>
                                    <CardContent sx={{ flexGrow: 1, maxHeight:'100px'}}>
                                        <Typography>
                                            {item.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
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
                                {isMapReady && markers.map((marker, index) => {
                                    return (
                                        <Marker
                                            key={marker.id} // Assuming each activity has a unique id
                                            position={marker}
                                            title={marker.title}
                                            onClick={() => handleMarkerClick(marker)}
                                        />
                                    );
                                })}
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
        </div>
    );
};

export default EventList;
