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
import {
    FacebookIcon,
    FacebookShareButton,
    TelegramIcon,
    TelegramShareButton,
    WhatsappIcon,
    WhatsappShareButton
} from "react-share";

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

    const renderLink = (content) => {
        // Regex for detecting an email address
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Regex for detecting a URL (basic version for demonstration, can be expanded)
        const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

        if (emailRegex.test(content)) {
            // If content is an email address
            return <a href={`mailto:${content}`} style={{ textDecoration: 'none' }}>{content}</a>;
        } else if (urlRegex.test(content)) {
            // If content is a URL
            return <a href={content} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>Visit Website</a>;
        } else {
            // If content is neither, just display the content
            return <span>{content}</span>;
        }
    };

    const shareUrl = window.location.href;
    const shareMessage = `${activity.title} - Check out this event on Activenty!`;

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
                        "publisher": {
                            "@type": "Organization",
                            "name": "Activenty",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://activenty.com/logo.png"
                            }
                        }
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
                    <h1>{activity.title}</h1>
                    {activity.activity_description && <p>{activity.activity_description}</p>}
                    {activity.activity_location && (
                        <>
                            <h3>Location</h3>
                            <p>{activity.activity_location}</p>
                        </>
                    )}
                    {activity.activity_type && <p>Type: {activity.activity_type}</p>}
                    {activity.activity_open_from && <p>Open Time: {activity.activity_open_from}</p>}
                    {activity.activity_phone && (
                        <h4>
                            <a href={`tel:${activity.activity_phone}`} style={{ textDecoration: 'none' }}>
                                {activity.activity_phone}
                            </a>
                        </h4>
                    )}
                    {activity.activity_email && (
                        <h4>
                            {renderLink(activity.activity_email)}
                        </h4>
                    )}
                    {activity.activity_website && (
                        <h4>
                            {renderLink(activity.activity_website)}
                        </h4>
                    )}
                    {activity.activity_price && <h5>Price: {activity.activity_price}</h5>}
                    {isMobile && <Button onClick={toggleMap} className="toggle-map-button">Show Map</Button>}

                    <div className="share-buttons">
                        {/* WhatsApp Share Button */}
                        <WhatsappShareButton url={shareUrl} title={shareMessage} separator=":: "  style={{ marginRight: '10px' }}>
                            <WhatsappIcon size={32} round />
                        </WhatsappShareButton>
                        <TelegramShareButton url={shareUrl} title={shareMessage}   style={{ marginRight: '10px' }}>
                            <TelegramIcon size={32} round />
                        </TelegramShareButton>
                        <FacebookShareButton  url={shareUrl} title={shareMessage}  style={{ marginRight: '10px' }}>
                            <FacebookIcon size={32} round />
                        </FacebookShareButton>
                    </div>
                </div>
                <div className={`map ${isMapOpen ? 'show' : ''}`}>
                    <MapForActivity activity={activity} />
                </div>

            </div>
        </div>
    );
};

export default ActivityDetails;