import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import Axios from "axios";
import Header from "../header/Header";
import MapForActivity from "./MapForActivity";
import BackgroundGallery from "../shared/BackgroundGallery";
import './ActivityDetails.css';
import {Button} from "@mui/material";

const ActivityDetails = () => {
    const { id } = useParams();
    const [activity, setActivity] = useState(null);
    const [isMapOpen, setIsMapOpen] = useState(false);

    const toggleMap = () => {
        setIsMapOpen(!isMapOpen);
        console.log("Map Open State:", !isMapOpen); // This should log true/false alternately on each click
    };


    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    useEffect(() => {
        // Make an HTTP GET request to fetch events from the backend
        Axios.get(`${baseURL}/activities/detail/${id}`)
            .then((response) => {
                setActivity(response.data);
            })
            .catch((error) => {
                console.error('Error fetching events:', error);
            });
    }, [id]); // Include eventId as a dependency in useEffect

    if (activity === null) {
        return <div>Loading...</div>;
    }

    return (
        <div className="event-details" style={{ textAlign: 'center', position: 'relative' }}>
            <Header/>

            {activity.photos.length > 0 && (
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
                    <BackgroundGallery images={activity.photos.map((photo) => photo.photo)} />
                </div>
            )}
            <div className="activity-container">
                <div className="activity">
                    <h2>{activity.title}</h2>
                    {activity.activity_description && <p>{activity.activity_description}</p>}
                    {activity.activity_location && <p>Location: {activity.activity_location}</p>}
                    {activity.activity_type && <p>Type: {activity.activity_type}</p>}
                    {activity.activity_open_from && <p>Open Time: {activity.activity_open_from}</p>}
                    {activity.activity_phone && <p>{activity.activity_phone}</p>}
                    {activity.activity_email && <p> {activity.activity_email}</p>}
                    {activity.activity_website && <p>{activity.activity_website}</p>}
                    {activity.activity_price && <p>{activity.activity_price}</p>}
                    <Button onClick={toggleMap} className="toggle-map-button">Show Map</Button>

                </div>
                <div className={`map ${isMapOpen ? 'show' : ''}`}>
                    <MapForActivity activity={activity} />
                </div>

            </div>
        </div>
    );
};

export default ActivityDetails;