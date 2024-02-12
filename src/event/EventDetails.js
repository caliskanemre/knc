import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import Axios from "axios";
import Header from "../header/Header";
import MapForEvent from "./MapForEvent";
import "./EventDetails.css";
import {Button} from "@mui/material";
import BackgroundGallery from "../shared/BackgroundGallery";
import {Helmet} from "react-helmet";

const EventDetails = () => {
    const { eventId } = useParams();
    const { eventName } = useParams();
    const [event, setEvent] = useState(null);
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const [isMapOpen, setIsMapOpen] = useState(false);

    const toggleMap = () => {
        setIsMapOpen(!isMapOpen);
        console.log("Map Open State:", !isMapOpen); // This should log true/false alternately on each click
    };


    useEffect(() => {
        // Make an HTTP GET request to fetch events from the backend
        Axios.get(`${baseURL}/events/${eventName}`)
            .then((response) => {
                setEvent(response.data);
            })
            .catch((error) => {
                console.error('Error fetching events:', error);
            });
    }, [eventName]); // Include eventId as a dependency in useEffect

    if (event === null) {
        return <div>Loading...</div>;
    }

    return (
        <div className="event-details" style={{ textAlign: 'center', position: 'relative' }}>
            <Helmet>
                <title>{event.title} - Event Details | Activenty</title>
                <meta name="description" content={`Learn more about ${event.title}, happening on ${event.date}.`} />
                <link rel="canonical" href={`${window.location.origin}/events/${eventName}`} />
                {/* Open Graph / Facebook */}
                <meta property="og:title" content={event.title} />
                <meta property="og:description" content={event.description} />
                <meta property="og:image" content={event.photo} />
                <meta property="og:url" content={`${window.location.origin}/events/${eventName}`} />
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={event.title} />
                <meta name="twitter:description" content={event.description} />
                <meta name="twitter:image" content={event.photo} />
                {/* Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "http://schema.org",
                        "@type": "Event",
                        "name": event.title,
                        "startDate": event.dateFrom,
                        "endDate": event.dateTo,
                        "location": {
                            "@type": "Place",
                            "name": event.place,
                            // Include additional location details if available
                        },
                        "image": [
                            event.photo
                            // Include additional image URLs if available
                        ],
                        "description": event.description
                    })}
                </script>
            </Helmet>

            <Header/>
            {event.photo && (
                <div style={{ position: 'relative' }}>
                    {/* Background overlay */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%', // Cover 100% on mobile
                            height: '100%',
                            zIndex: 1, // Make sure it's above the images
                        }}

                    >

                    </div>
                    {/* Concatenate photo URLs into a single array */}
                    <img src={event.photo} alt="Event" className="event-photo" />
                </div>
            )}
            <div className="event-container">
                <div className="event">
                    <p>{event.date}</p>
                    <h2>{event.title}</h2>
                    <p>About the event: {event.description}</p>
                    <p>Place: {event.place}</p>
                    <Button onClick={toggleMap} className="toggle-map-button">Show Map</Button>
                </div>
                <div className={`map ${isMapOpen ? 'show' : ''}`}>
                    <MapForEvent event={event} />
                </div>
            </div>

        </div>
    );
};

export default EventDetails;