import React, {useEffect, useState} from 'react';
import Axios from 'axios';
import Header from "../header/Header";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import {Avatar, Button, CardHeader, Dialog, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import {Link, useParams} from "react-router-dom";
import ActivitySubHeader from "./ActivitySubHeader";
import CampingIcon2 from "./camping2.jpg"
import wellness from "./wellness.jpg"
import winter from "./winter.png"
import swimming from "./swim.png"
import park from "./park.png"
import nature from "./nature2.jpg"
import naturalPark from "./nationalPark3.png"
import museumIcon from "./img_1.png"
import FilterListIcon from '@mui/icons-material/FilterList';
import {ActivityFilter} from "../filter/ActivityFilter";
import {MapRounded, Pin} from "@mui/icons-material";
import {MapFill} from "react-bootstrap-icons";
import {GoogleMap, Marker} from "@react-google-maps/api";

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

    useEffect(() => {
        // Reset states when type changes
        setActivities([]);
        setPage(0);
        setHasMore(true);


        const fetchInitialActivities = async () => {
            try {
                let fetchUrl = type === undefined
                    ? `${baseURL}/activities/all?page=0&size=20`
                    : `${baseURL}/activities/${type}?page=0&size=20`;

                const response = await Axios.get(fetchUrl);
                setActivities(response.data.content);
                setHasMore(response.data.totalPages > 1);
            } catch (error) {
                console.error('Error fetching initial activities:', error);
            }
        };

        // Fetch initial activities for the new type
        fetchInitialActivities();
    }, [type]);


    const handleOpenMapDialog = () => {
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

    return (
        <div className="activity-list">
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
                    startIcon={<MapRounded />}
                    onClick={handleOpenMapDialog}
                >
                    Activities Nearby
                </Button>
            </div>
            <Container sx={{ py: 9 }} maxWidth="xl">
                <Grid container spacing={4}>
                    {activities.map((item) => {
                        return (
                            <Grid item key={item.id} xs={12} sm={6} md={3}>
                                <Card sx={{ height: '90%', display: 'flex', flexDirection: 'column' }}>
                                    <div  style={{display: 'flex', flexDirection: 'row'}}>
                                        <Avatar sx={{ bgcolor: 'primary.main', fontSize: '0.7rem', marginLeft: '5px', marginTop: '10px' }}>
                                            <img src={activityIcons[item.activity_type.toLocaleLowerCase()]} alt={`${item.activity_type} Icon`} style={{ width: '100%', height: '100%' }} />
                                        </Avatar>
                                        <CardHeader style={{display:'top', height:'40px'}}
                                            title={item.title}
                                        />
                                    </div>
                                    <Link to={`/activities/detail/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <CardMedia
                                                component="div"
                                                sx={{ pt: '56.25%' }}
                                                image={item.activity_cover_photo}
                                        />
                                    </Link>
                                    <CardContent sx={{ flexGrow: 1, maxHeight:'100px'}}>
                                        <Typography>
                                            {item.activity_description}
                                        </Typography>
                                    </CardContent>
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
            <Button onClick={handleOpenFilterDialog}>Open Filter</Button>
            <ActivityFilter
                openFilterDialog={openFilterDialog}
                handleCloseFilterDialog={handleCloseFilterDialog}
            />

            <Dialog
                open={mapOpen}
                onClose={handleCloseMapDialog}
                aria-labelledby="map-dialog-title"
                fullWidth
                maxWidth="lg"
            >
                <DialogContent>
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        zoom={8}
                        center={userLocation || {center}}
                    >
                        {userLocation && (
                            <Marker
                                position={userLocation}
                                // Optionally, you can add an onClick handler for each Marker
                            />
                        )}
                    </GoogleMap>
                </DialogContent>
            </Dialog>
        </div>
    );
};


export default ActivityList;
