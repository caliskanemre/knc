import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import Axios from "axios";
import Header from "../header/Header";
import MapForEvent from "./MapForEvent";
import "./event.css";

const EventDetails = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);

    useEffect(() => {
        // Make an HTTP GET request to fetch events from the backend
        Axios.get(`http://localhost:8080/events/eventId?eventId=${eventId}`)
            .then((response) => {
                setEvent(response.data);
            })
            .catch((error) => {
                console.error('Error fetching events:', error);
            });
    }, [eventId]); // Include eventId as a dependency in useEffect

    if (event === null) {
        return <div>Loading...</div>;
    }

    return (
        <div className="event-details" style={{ textAlign: 'left', position: 'relative' }}>
            <Header/>
            {event.photo && (
                <div className="event-photo-container">
                    <div className="event-photo-overlay"></div>
                    <img src={event.photo} alt="Event" className="event-photo" />
                </div>
            )}
            <div className="event-detail-container">
                <div className="event-info">
                    <p>{event.date}</p>
                    <h2>{event.title}</h2>
                    <p>About the event: {event.description}</p>
                    <p>Location: {event.location}</p>
                    <p>Type: {event.type}</p>
                    <p>Start Date: {event.dateFrom}</p>
                    <p>End Date: {event.dateTo}</p>
                    <p>Place: {event.place}</p>
                    <p>Going: {event.going}</p>
                    <p>Interested: {event.interested}</p>
                </div>
                <div className="event-map">
                    <MapForEvent event={event} />
                </div>
            </div>

        </div>
    );
};

export default EventDetails;