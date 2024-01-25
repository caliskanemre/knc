import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Dialog, DialogTitle, DialogContent } from '@material-ui/core';
import {useNavigate} from "react-router-dom";

const ActivityListMap = ({ isGoogleMapsApiLoaded, userLocation, markers, center }) => {
    const [mapOpen, setMapOpen] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const navigate = useNavigate();
    const mapContainerStyle = {
        width: '100%',
        height: '400px', // Adjust as needed
    };

    const handleCloseMapDialog = () => {
        setMapOpen(false);
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
            navigate(`/activities/detail/${activity.id}`);
        }
    };

    return (
        isGoogleMapsApiLoaded() ? (
            <Dialog
                open={mapOpen}
                onClose={handleCloseMapDialog}
                aria-labelledby="map-dialog-title"
                fullWidth
                maxWidth="lg"
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
                        {/* Markers and InfoWindow here */}
                    </GoogleMap>
                </DialogContent>
            </Dialog>
        ) : (
            <div>Loading Maps...</div>
        )
    );
};

export default ActivityListMap;
