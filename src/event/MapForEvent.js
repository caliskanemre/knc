import React, {useEffect, useState} from 'react';
import {GoogleMap, Marker} from '@react-google-maps/api';

const MapForEvent = ({event}) => {
    const [map, setMap] = useState(null);
    const [markerPosition, setMarkerPosition] = useState(null);

    const mapContainerStyle = {
        width: '100%',
        height: '400px',
    };

    useEffect(() => {
        if (!window.google || !window.google.maps) {
            console.error("Google Maps API not loaded");
            return;
        }

        if (event) {
            // Check if lat and lon are available
            if (event.lat && event.lon) {
                setMarkerPosition({
                    lat: parseFloat(event.lat),
                    lng: parseFloat(event.lon)
                });
            }
        }
    }, [event]);

    useEffect(() => {
        if (map && markerPosition) {
            map.setZoom(10);
            map.setCenter(markerPosition);

            const marker = new window.google.maps.Marker({
                position: markerPosition,
                map: map,
                title: event.place,
            });

            const infoWindow = new window.google.maps.InfoWindow({
                content: event.title,
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
            >
                {markerPosition && (
                    <Marker
                        position={markerPosition}
                        title={event.title}
                    />
                )}
            </GoogleMap>
        </div>
    );
};

export default MapForEvent;
