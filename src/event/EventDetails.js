import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import Axios from "axios";
import Header from "../header/Header";
import MapForEvent from "./MapForEvent";
import "./EventDetails.css";
import {Button} from "@mui/material";
import {Helmet} from "react-helmet";
import {
    FacebookIcon,
    FacebookShareButton,
    TelegramIcon,
    TelegramShareButton,
    WhatsappIcon,
    WhatsappShareButton
} from "react-share";
import Linkify from 'react-linkify';
import DOMPurify from 'dompurify';

const EventDetails = () => {
    const { eventName } = useParams(); // Combined the two useParams calls into one
    const { eventId} = useParams(); // Combined the two useParams calls into one
    const [event, setEvent] = useState(null);
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const [isMapOpen, setIsMapOpen] = useState(false);
    const isMobile = window.innerWidth <= 768;
    const [showConsentModal, setShowConsentModal] = useState(false); // State to control consent modal visibility

    useEffect(() => {

        Axios.get(`${baseURL}/events/${eventId}/${encodeURIComponent(eventName)}`)
            .then((response) => {
                setEvent(response.data);
            })
            .catch((error) => {
                console.error('Error fetching event details:', error);
            });
    }, [eventName, eventId]);

    const createMarkup = (text) => {
        const sanitizedText = DOMPurify.sanitize(text).replace(/(\r\n|\n|\r)/gm, '<br />');
        return { __html: sanitizedText };
    };


    const toggleMap = () => {
        setIsMapOpen(!isMapOpen);
    };

    useEffect(() => {
        Axios.get(`${baseURL}/events/${eventId}/${encodeURIComponent(eventName)}`)
            .then((response) => {
                setEvent(response.data);
            })
            .catch((error) => {
                console.error('Error fetching event details:', error);
            });
    }, [eventName]);

    if (event === null) {
        return <div>Loading...</div>;
    }
    const shareUrl = window.location.href;
    const shareMessage = `${event.title} - Check out this event on Activenty!`;
    // Improved alt text for the event photo
    const altText = `${event.title} in ${event.place}`;

    return (
        <div className="event-details" style={{ textAlign: 'center', position: 'relative' }}>
            <Helmet>
                <title>{`${event.title} - Event Details | Activenty`}</title>
                <meta name="description" content={`Learn more about ${event.title}, happening on ${event.date}, at ${event.place}.`} />
                <link rel="canonical" href={`${window.location.origin}/events/${eventName}`} />
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="event" />
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
                            "name": event.place
                        },
                        "image": [event.photo],
                        "description": event.description,
                        "publisher": {
                            "@type": "Organization",
                            "name": "Activenty",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://www.activenty.com/logo512.png"
                            }
                        }
                    })}
                </script>
            </Helmet>

            <Header />
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
                    <h4>{event.date}</h4>
                    <h4>Category: {event.type}</h4>
                    <h1>{event.title}</h1>
                    <div>
                        <p>About the event:</p>
                        <Linkify>
                            <div dangerouslySetInnerHTML={createMarkup(event.description)} />
                        </Linkify>
                    </div>
                    <h4>Attendee Suggestions: {event.idealFor}</h4>
                    {event.contact && <h4>contact: {event.contact}</h4>}
                    <h4>Place: {event.place}</h4>
                    {event.price && <h5>Price: {event.price}</h5>}
                    <h5><a href={event.externalLink} target="_blank">{event.externalLink}</a></h5>
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
                    <MapForEvent event={event} />
                </div>
            </div>

        </div>
    );
};

export default EventDetails;