import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import Axios from "axios";
import Header from "../header/Header";
import MapForActivity from "./MapForActivity";
import BackgroundGallery from "../shared/BackgroundGallery";
import './ActivityDetails.css';
import {Button} from "@mui/material";
import BackgroundGalleryDetails from "../shared/BackgroundGalleryDetails";
import {Helmet} from "react-helmet";

const ActivityDetails = () => {
    const { id } = useParams();
    const { title } = useParams();
    const [activity, setActivity] = useState(null);
    const [isMapOpen, setIsMapOpen] = useState(false);

    const isMobile = window.innerWidth <= 768;

    const toggleMap = () => {
        setIsMapOpen(!isMapOpen);
        console.log("Map Open State:", !isMapOpen); // This should log true/false alternately on each click
    };


    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    useEffect(() => {
        // Make an HTTP GET request to fetch events from the backend
        Axios.get(`${baseURL}/activities/detail/${id}/${title}`)
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
            <Helmet>
                <title>{activity.title} - Activity Details | Activenty</title>
                <meta name="description" content={`Discover more about ${activity.title} at ${activity.activity_location}. Contact: ${activity.activity_email || 'N/A'} | ${activity.activity_phone || 'N/A'}`} />
                <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
                {/* Open Graph / Facebook */}
                <meta property="og:title" content={activity.title} />
                <meta property="og:description" content={activity.activity_description || 'Learn more about this activity.'} />
                <meta property="og:image" content={(activity.photos.length > 0) ? activity.photos[0].photo : undefined} />
                <meta property="og:url" content={`${window.location.origin}${window.location.pathname}`} />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Activenty" />
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={activity.title} />
                <meta name="twitter:description" content={activity.activity_description || 'Learn more about this activity.'} />
                <meta name="twitter:image" content={(activity.photos.length > 0) ? activity.photos[0].photo : undefined} />
                {/* Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "http://schema.org",
                        "@type": "TouristAttraction", // Adjust based on the activity type
                        "name": activity.title,
                        "description": activity.activity_description,
                        "image": activity.photos.map(photo => photo.photo),
                        "location": {
                            "@type": "Place",
                            "name": activity.activity_location,
                            // Additional location details if available
                        },
                        "offers": {
                            "@type": "Offer",
                            "price": activity.activity_price,
                            // Additional offer details if available
                        },
                        "telephone": activity.activity_phone,
                        "email": activity.activity_email,
                        "url": activity.activity_website,
                        // Additional activity details if available
                    })}
                </script>
            </Helmet>

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
                    {isMobile ? (
                        <BackgroundGallery images={activity.photos.map((photo) => photo.photo)} />
                    ) : (
                        <BackgroundGalleryDetails images={activity.photos.map((photo) => photo.photo)} />
                    )}
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
                    {activity.activity_price && <p>Price: {activity.activity_price}</p>}
                    {isMobile && <Button onClick={toggleMap} className="toggle-map-button">Show Map</Button>}
                </div>
                <div className={`map ${isMapOpen ? 'show' : ''}`}>
                    <MapForActivity activity={activity} />
                </div>

            </div>
        </div>
    );
};

export default ActivityDetails;