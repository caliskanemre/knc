import React, {useEffect, useRef, useState} from 'react';
import Axios from 'axios';
import Header from "../header/Header";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import {
    Avatar,
    Button,
    CardHeader, Chip,
    Dialog,
    DialogContent,
    DialogTitle, Stack,
    SwipeableDrawer,
    useMediaQuery,
    useTheme
} from "@mui/material";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import {Link, useNavigate, useParams} from "react-router-dom";
import CampingIcon2 from "../images/camping_summer2.jpg"
import wellness from "../images/wellness_green2.png"
import winter from "../images/winter_green.jpeg"
import swimming from "../images/summer_green3.jpg"
import park from "../images/park_green2.png"
import nature from "../images/nature2.jpg"
import naturalPark from "../images/park_green.jpg"
import museumIcon from "../images/green_museum.png"
import FilterListIcon from '@mui/icons-material/FilterList';
import {ActivityFilter} from "../filter/ActivityFilter";
import {MapOutlined, MapRounded} from "@mui/icons-material";
import {GoogleMap, InfoWindow, Marker, MarkerClusterer} from "@react-google-maps/api";
import BackgroundGallery from "../shared/BackgroundGallery";
import BackgroundGalleryDetails from "../shared/BackgroundGalleryDetails";
import PinDropIcon from "@mui/icons-material/PinDrop";
import {Helmet} from "react-helmet";


const mapContainerStyle = {
    width: '100%',
    height: '400px',
};

const center = {
    lat: 59.47, // Example latitude
    lng: 25.15, // Example longitude
};


const ActivityList = () => {
    const { type } = useParams();
    const [activities, setActivities] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const [openFilterDialog, setOpenFilterDialog] = useState(false);
    const [mapOpen, setMapOpen] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [isMapReady, setIsMapReady] = useState(false);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [filters, setFilters] = useState([]);
    const listRef = useRef(null);

    const isGoogleMapsApiLoaded = () => window.google && window.google.maps;

    const navigate = useNavigate();

    const applyFilter = (filterType, filterValue) => {
        // Add a new filter or update the existing one
        setFilters(currentFilters => ({
            ...currentFilters,
            [filterType]: filterValue
        }));
        // Trigger activity or event refetch with new filters here
    };

    const removeFilter = (filterType) => {
        setFilters(currentFilters => {
            const newFilters = { ...currentFilters };
            delete newFilters[filterType];
            fetchInitialActivities()
            return newFilters;
        });
        // Trigger activity or event refetch with updated filters here
    };
    const updateFilteredActivities = (filteredActivities) => {
        setActivities(filteredActivities);
    };

    const fetchInitialActivities = async () => {
        try {
            // Fetching the initial list of activities
            let fetchUrl = type === undefined
                ? `${baseURL}/activities/all?page=0&size=20`
                : `${baseURL}/activities/${type}?page=0&size=20`;

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
            await fetchInitialActivities(); // Ensure this function is awaited if it's asynchronous

            // Restore scroll position after data has loaded and the list is populated
            const savedScrollPosition = sessionStorage.getItem('activityListScrollPosition');
            if (savedScrollPosition && listRef.current) {
                listRef.current.scrollTop = parseInt(savedScrollPosition, 10);
            }
        };

        fetchActivities();
    }, [type]); // Dependency on 'type'

    useEffect(() => {
        const saveScrollPosition = () => {
            if (listRef.current) {
                sessionStorage.setItem('activityListScrollPosition', listRef.current.scrollTop.toString());
            }
        };

        // Consider when to save the scroll position. For SPA navigation, 'beforeunload' might not be sufficient.
        window.addEventListener('beforeunload', saveScrollPosition);
        // Additional events or actions to save scroll position can be added here.

        return () => {
            window.removeEventListener('beforeunload', saveScrollPosition);
            // Clean up other event listeners or actions if added.
        };
    }, []); // No dependencies, runs on mount and unmount


    const fetchPins = async (activityType) => {
        try {
            const response = await Axios.get(`${baseURL}/activities/pins/${activityType}`);
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
        // Assuming each activity has lat and lng properties
        setSelectedMarker({
            ...activity,
            position: {
                lat: parseFloat(activity.lat),
                lng: parseFloat(activity.lon)
            }
        });
    };

    const handleInfoWindowClick = (activity) => {
        if (activity && activity.id) {
            const fullUrl = window.location.origin + `/activities/detail/${activity.id}`;
            window.open(fullUrl, '_blank');
        }
    };
    const handleOpenMapDialog = async () => {
        await fetchPins(type);
        setMapOpen(true);
        askForUserLocation();
    };

    const handleCloseMapDialog = () => {
        setMapOpen(false);
    };

    const handleOpenFilterDialog = () => {
        setOpenFilterDialog(true);
    };

    const handleCloseFilterDialog = () => {
        setOpenFilterDialog(false);
    };
    const loadMoreActivities = async () => {
        try {
            let nextPage = page + 1;
            let fetchUrl = type === undefined
                ? `${baseURL}/all?page=${nextPage}&size=20`
                : `${baseURL}/activities/${type}?page=${nextPage}&size=20`;

            const response = await Axios.get(fetchUrl);
            setActivities(prevActivities => [...prevActivities, ...response.data.content]);
            setHasMore(response.data.totalPages > nextPage + 1);
            setPage(nextPage);
        } catch (error) {
            console.error('Error fetching more activities:', error);
        }
    };
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
    const getDynamicFontSize = (title) => {
        if (title.length < 10) return "1.8rem";
        if (title.length < 20) return "1.5rem"
        return "1.2rem"; // Fallback font size
    };

    return (
        <div className="activity-list"  ref={listRef}>
            <Helmet>
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
            </Helmet>
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
                <Grid container spacing={4}>

                    {activities.map((item) => {
                        return (
                            <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <a href={`/activities/detail/${item.id}/${item.title}`} target="_blank" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div  style={{display: 'flex', flexDirection: 'row'}}>
                                            <Avatar sx={{ bgcolor: 'primary.main', fontSize: '0.7rem', marginLeft: '8px', marginTop: '15px' }}>
                                                <img src={activityIcons[item.activity_type.toLocaleLowerCase()]} alt={`${item.activity_type} Icon`} style={{ width: '100%', height: '100%' }} />
                                            </Avatar>
                                            <CardHeader style={{height : '50px'}}
                                                titleTypographyProps={{ style: { fontSize: getDynamicFontSize(item.title) } }} // Adjust font size and line height as needed
                                                title={item.title}
                                                subheader={
                                                    <div>
                                                        <div>
                                                            <PinDropIcon style={{ fontSize: '1rem', verticalAlign: 'bottom' }} /> {item.activity_location}
                                                        </div>
                                                    </div>
                                                }
                                                subheaderTypographyProps={{ component: 'div', style: { fontSize: '12px' } }}
                                            />

                                         </div>
                                       <BackgroundGallery images={item.photos.map((photo) => photo.photo)} />
                                    </a>
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
                updateFilteredActivities={updateFilteredActivities}
            />
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
                            options={{ gestureHandling: 'greedy' }}
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
                                    position={selectedMarker.position} // Use the position from selectedMarker
                                    onCloseClick={() => setSelectedMarker(null)} // Reset selectedMarker state to null on close
                                >
                                    <div style={{ maxWidth: '150px'}}>
                                        <h4>{selectedMarker.title}</h4>
                                        <Button style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }} onClick={() => handleInfoWindowClick(selectedMarker)}>
                                            View Details
                                        </Button>
                                    </div>
                                </InfoWindow>
                            )}

                        </GoogleMap>
                    </DialogContent>
                </SwipeableDrawer>
            ) : (
                <div>Loading Maps...</div>
            )}
        </div>
    );
};


export default ActivityList;
