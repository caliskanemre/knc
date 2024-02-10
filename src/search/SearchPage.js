import React, {useEffect, useState} from 'react';
import axios from 'axios';
import "./SearchPage.css";
import Header from "../header/Header";
import {Avatar, Button, CardHeader} from "@mui/material";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import {useLocation, useNavigate} from "react-router-dom";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import BackgroundGallery from "../shared/BackgroundGallery";
import CampingIcon2 from "../images/camping_summer2.jpg";
import wellness from "../images/wellness_green2.png";
import winter from "../images/winter_green.jpeg";
import swimming from "../images/summer_green3.jpg";
import park from "../images/park_green.jpg";
import nature from "../images/nature2.jpg";
import naturalPark from "../images/park_green2.png";
import museumIcon from "../images/green_museum.png";
import * as events from "events";
import EventSearchButtons from "./EventSearchButtons";
import PinDropIcon from "@mui/icons-material/PinDrop";

const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLocation, setSearchLocation] = useState('');
    const [eventResult, setEventResult] = useState([]);
    const [activityResult, setActivityResult] = useState([]);
    const [allResult, setAllResult] = useState({ event: [], activity: [] });
    const [eventPage, setEventPage] = useState(0);
    const [hasMoreEvents, setHasMoreEvents] = useState(0);
    const [hasMoreActivity, setHasMoreActivity] = useState(0);
    const [activityPage, setActivityPage] = useState(0);
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const navigate = useNavigate();
    const location = useLocation();
        // Function to navigate to the details page

    const activityIcons = {
        camping: CampingIcon2,
        health: wellness,
        winter: winter,
        summer: swimming,
        park: park,
        nature: nature,
        national: naturalPark,
        museum: museumIcon
    };


    useEffect(() => {
        // Check if there's state available from navigation
        if (location.state && location.state.fromDetails) {
            const { fromSearch } = location.state.fromDetails;
            if (fromSearch) {
                // Restore the search state
                setSearchQuery(fromSearch.searchQuery);
                setSearchLocation(fromSearch.searchLocation);
                setAllResult(fromSearch.allResult);
                // Optionally, restore pagination states if they were part of the state
            }
        }
    }, [location]);

    const updateSearchQuery = () =>{
        handleNewSearch()
    }

    const handleNewSearch = (term) => {
        // Reset states for a new search

        setEventPage(0);
        setActivityPage(0);
        setEventResult([]);
        setActivityResult([]);
        setAllResult({ event: [], activity: [] });

        setSearchQuery(term)
        // Then call handleSearch to perform the new search
        handleSearch({ query: term });
    };

    const getDynamicFontSize = (title) => {
        if (title.length < 10) return "1.8rem";
        if (title.length < 20) return "1.5rem"
        return "1.2rem"; // Fallback font size
    };

    const updateFilteredEvents = (filteredEvents) => {
        setAllResult(prevAllResult => ({
            ...prevAllResult,
            event: [...prevAllResult.event, ...filteredEvents]
        }));
    };

    async function extractedEvent(options) {
        const {
            query = searchQuery, // Fallback to searchQuery if no query is provided in options
            location = searchLocation, // Fallback to searchLocation if no location is provided in options
            eventPageNumber = eventPage, // Fallback to eventPage if no eventPageNumber is provided in options
        } = options;


        const eventSize = 20; // Number of items per page

        try {
            const eventResponse = await axios.get(`${baseURL}/events/search`, {
                params: {
                    query: query,
                    location: location,
                    page: eventPageNumber,
                    size: eventSize
                }
            });
            const events = eventResponse.data.content;
            setEventResult(prevEvents => [...prevEvents, ...events]);
            setAllResult(prevAllResult => ({
                ...prevAllResult,
                event: [...prevAllResult.event, ...events]
            }));
            if (events.length === eventSize) {
                setEventPage(prevPage => prevPage + 1);
                setHasMoreEvents(true);
            } else {
                setHasMoreEvents(false); // No more events to load
            }
        } catch (error) {
            console.error('Error loading more events:', error);
        }
        return {eventSize};
    }

    async function extractedActivity(options) {
        const {
            query = searchQuery, // Fallback to searchQuery if no query is provided in options
            location = searchLocation, // Fallback to searchLocation if no location is provided in options
            activityPageNumber = activityPage, // Fallback to eventPage if no eventPageNumber is provided in options
        } = options;

        try {
            const activityResponse = await axios.get(`${baseURL}/activities/search`, {
                params: {
                    query: query,
                    location: location,
                    page: activityPageNumber,
                    size: 20
                }
            });

            setActivityResult(prevActivities => [...prevActivities, ...activityResponse.data.content]);
            setAllResult(prevAllResult => ({
                ...prevAllResult,
                activity: [...prevAllResult.activity, ...activityResponse.data.content]
            }));
            if (activityResult.length === 20) {
                setActivityPage(prevPage => prevPage + 1);
                setHasMoreActivity(true);
            } else {
                setHasMoreActivity(false); // No more events to load
            }
        } catch (error) {
            console.error('Error loading more activities:', error);
        }
    }

    const handleSearch = async (options = {}) => {
        await extractedEvent(options);
        await extractedActivity(options);
    };

    const combinedResults = [
        ...(Array.isArray(allResult.event) ? allResult.event.map(item => ({ ...item, type: 'events' })) : []),
        ...(Array.isArray(allResult.activity) ? allResult.activity.map(item => ({ ...item, type: 'activities' })) : [])
    ];

    return (
        <div>
            <Header/>

            <div className="parent-container">
                <div className="search-page">
                    <div className="location-input">
                        <input
                            type="text"
                            placeholder="Search event, activity, city etc"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleNewSearch(e.target.value);
                                }
                            }}
                        />
                        <Button
                            variant="contained" // Add a background
                            onClick={() => handleNewSearch(searchQuery)} // Pass the current searchQuery state
                            className="search-button" // Add a class for styling
                        >
                            Search
                        </Button>
                    </div>

                    <div className="filters">
                        <EventSearchButtons
                            handleNewSearch={handleNewSearch}
                            updateFilteredEvents={updateFilteredEvents}
                        />
                    </div>

                    <div className="recent-searches">
                        <h2>Recent and popular searches</h2>
                        <ul>
                            <li>Tallinn</li>
                            <li>Music</li>
                            <li>Spa</li>
                        </ul>
                    </div>
                </div>

            </div>
            <Container sx={{ py: 9 }} maxWidth="xl">
                <Grid container spacing={4}>
                    {combinedResults.map((item, index) => (
                        <Grid item key={index} xs={12} sm={6} md={3}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                {item.type === 'activities' ? (
                                    <a href={`/activities/detail/${item.id}`} target="_blank" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                <Avatar sx={{ bgcolor: 'primary.main', fontSize: '0.7rem', marginLeft: '5px', marginTop: '10px' }}>
                                                    <img src={activityIcons[item.activity_type.toLowerCase()]} alt={`${item.activity_type} Icon`} style={{ width: '100%', height: '100%' }} />
                                                </Avatar>
                                                <CardHeader
                                                    style={{ display: 'top', height: '45px' }}
                                                    title={
                                                        <div style={{
                                                            maxWidth: '100%', // Limit the width to the parent container
                                                            overflow: 'hidden', // Hide overflow
                                                            display: '-webkit-box', // Use webkit box model for line clamp
                                                            WebkitLineClamp: 2, // Limit to two lines
                                                            WebkitBoxOrient: 'vertical', // Set the orientation to vertical
                                                            textOverflow: 'ellipsis' // Add ellipsis to text overflow
                                                        }}>
                                                            {item.title}
                                                        </div>
                                                    }
                                                    titleTypographyProps={{ style: { fontSize: getDynamicFontSize(item.title) } }}
                                                    subheader={
                                                        <div>
                                                            <div>{item.date}</div> {/* First line of subheader */}
                                                            <div>
                                                                <PinDropIcon style={{ fontSize: '1rem', verticalAlign: 'bottom' }} /> {item.activity_location}
                                                            </div>
                                                        </div>
                                                    }
                                                    subheaderTypographyProps={{ component: 'div', style: { fontSize: '11px' } }}
                                                />
                                            </div>
                                            <BackgroundGallery images={item.photos.map((photo) => photo.photo)} />
                                        </div>
                                    </a>
                                ) : (
                                    <>
                                        <a href={`/event/${item.id}`} target="_blank" style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                <Avatar sx={{ bgcolor: 'darkorange', fontSize: '1rem', marginLeft: '5px', marginTop: '15px' }}>
                                                    event
                                                </Avatar>
                                                <CardHeader
                                                    style={{ display: 'top', maxHeight: '65px' }}
                                                    title={
                                                        <div style={{
                                                            maxWidth: '100%', // Limit the width to the parent container
                                                            overflow: 'hidden', // Hide overflow
                                                            display: '-webkit-box', // Use webkit box model for line clamp
                                                            WebkitLineClamp: 2, // Limit to two lines
                                                            WebkitBoxOrient: 'vertical', // Set the orientation to vertical
                                                            textOverflow: 'ellipsis' // Add ellipsis to text overflow
                                                        }}>
                                                            {item.title}
                                                        </div>
                                                    }
                                                    titleTypographyProps={{ style: { fontSize: getDynamicFontSize(item.title) } }}
                                                    subheader={
                                                        <div>
                                                            <div>{item.date}</div>
                                                            <div>
                                                                <PinDropIcon style={{ fontSize: '1rem', verticalAlign: 'bottom' }} /> {item.place}
                                                            </div>
                                                        </div>
                                                    }
                                                    subheaderTypographyProps={{ component: 'div', style: { fontSize: '11px' } }}
                                                />
                                            </div>
                                        </a>
                                        <a href={`/events/${item.id}`} target="_blank" style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <CardMedia
                                                component="div"
                                                sx={{ pt: '56.25%' }}
                                                image={item.photo}
                                            />
                                        </a>
                                    </>

                                )}

                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
            {hasMoreEvents || hasMoreActivity && (eventPage > 0 || activityPage > 0) && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                    <Button
                        onClick={handleSearch}
                        variant="contained"
                        color="primary"
                        style={{ textTransform: 'none', fontSize: '16px', padding: '10px 20px' }}
                    >
                        Load More
                    </Button>
                </div>
            )}
        </div>
    );
};

export default SearchPage;