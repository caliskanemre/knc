import React, { useEffect, useState } from 'react';
import {GoogleMap, InfoWindow, Marker} from '@react-google-maps/api';

const MapForActivity = ({ activity }) => {
    const [map, setMap] = useState(null);
    const [markerPosition, setMarkerPosition] = useState(null);
    const [selectedMarker, setSelectedMarker] = useState(null);

    const handleMarkerClick = (marker) => {
        setSelectedMarker(marker);
    };


    const mapContainerStyle = {
        width: '100%',
        height: '400px',
    };

    useEffect(() => {
        if (!window.google || !window.google.maps) {
            console.error("Google Maps API not loaded");
            return;
        }

        if (activity) {
            // Check if lat and lon are available
            if (activity.lat && activity.lon) {
                setMarkerPosition({
                    lat: parseFloat(activity.lat),
                    lng: parseFloat(activity.lon)
                });
            }
        }
    }, [activity]);

    useEffect(() => {
        if (map && markerPosition) {
            map.setZoom(10);
            map.setCenter(markerPosition);

            const marker = new window.google.maps.Marker({
                position: markerPosition,
                map: map,
                title: activity.place,
            });

            const infoWindow = new window.google.maps.InfoWindow({
                content: activity.title,
            });

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });
        }
    }, [map, markerPosition]);

    return (
        <div>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={8}
                center={markerPosition || mapContainerStyle}
                onLoad={setMap}
                options={{ gestureHandling: 'greedy' }}
            >
                {markerPosition && (
                    <Marker
                        position={markerPosition}
                        title={activity.title}
                        onClick={() => handleMarkerClick(markerPosition)}
                    />
                )}

                {selectedMarker && (
                    <InfoWindow
                        position={selectedMarker}
                        onCloseClick={() => setSelectedMarker(null)}
                    >
                        <div>
                            <h2>{activity.title}</h2>
                            <p>
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMarker.lat},${selectedMarker.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Get Directions
                                </a>
                            </p>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
};

export default MapForActivity;
