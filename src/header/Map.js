import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import Axios from "axios";
import Header from "./Header";

const Map = () => {
    const [map, setMap] = useState(null);
    const [data, setData] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState([]);

    useEffect(() => {
        Axios.get('http://localhost:8080/events/all')
            .then((response) => {
                setData(response.data);
            })
            .catch((error) => {
                console.error('Error fetching events:', error);
            });
    }, []);

    const mapContainerStyle = {
        width: '100%',
        height: '400px',
    };

    const defaultCenter = {
        lat: 59.4,
        lng: 24,
    };

    useEffect(() => {
        if (!window.google || !window.google.maps) {
            console.error("Google Maps API not loaded");
            return;
        }

        if (map && data.length > 0) {
            map.setZoom(10);
            map.setCenter(defaultCenter);

            data.forEach((item) => {
                const marker = new window.google.maps.Marker({
                    position: { lat: parseFloat(item.lat), lng: parseFloat(item.lon) },
                    map: map,
                    title: item.title,
                });

                const infoWindow = new window.google.maps.InfoWindow({
                    content: item.title,
                });

                marker.addListener('click', () => {
                    setSelectedEvent(item);
                    infoWindow.open(map, marker);
                });
            });
        }
    }, [map, data]);

    return (
        <div>
            <Header/>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={8}
                center={defaultCenter}
                onLoad={setMap}
            >
                {data.map((item, index) => (
                    <Marker
                        key={index}
                        position={{ lat: parseFloat(item.lat), lng: parseFloat(item.lon) }}
                        title={item.title}
                    />
                ))}
            </GoogleMap>
        </div>
    );
};

export default Map;
