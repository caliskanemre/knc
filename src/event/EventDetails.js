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
                <link rel="canonical" href={`${window.location.origin}/events/${eventName}`} />
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
                    <p>Type: {event.type}</p>
                    <p>Start Date: {event.dateFrom}</p>
                    <p>End Date: {event.dateTo}</p>
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