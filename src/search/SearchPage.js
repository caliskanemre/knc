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

    const handleNewSearch = () => {
        // Reset states for a new search
        setEventPage(0);
        setActivityPage(0);
        setEventResult([]);
        setActivityResult([]);
        setAllResult({ event: [], activity: [] });

        // Then call handleSearch to perform the new search
        handleSearch();
    };

    const getDynamicFontSize = (title) => {
        if (title.length < 10) return "1.8rem";
        if (title.length < 20) return "1.5rem"
        return "1.2rem"; // Fallback font size
    };
    const goToDetails = (item) => {

        const basePath = item.type === 'activities' ? '/activities/detail' : '/events';

        navigate(`${basePath}/${item.id}`, { state: { fromSearch: { searchQuery, searchLocation, allResult } } });
    };

    const updateFilteredEvents = (filteredEvents) => {
        setAllResult(prevAllResult => ({
            ...prevAllResult,
            event: [...prevAllResult.event, ...filteredEvents]
        }));
    };

    async function extractedEvent(options) {
        const {
            query = searchQuery, // Use provided query or fallback to existing state
            location = searchLocation, // Use provided location or fallback to existing state
            eventPageNumber = eventPage, // Use provided eventPage or fallback to existing state
            activityPageNumber = activityPage // Use provided activityPage or fallback to existing state
        } = options;


        const eventSize = 20; // Number of items per page
        const activitySize = 20;

        try {
            const eventResponse = await axios.get(`${baseURL}/events/search`, {
                params: {
                    query: searchQuery,
                    location: searchLocation,
                    page: eventPage,
                    size: eventSize
                }
            });
            const events = eventResponse.data.content;
            setEventResult(prevEvents => [...prevEvents, ...eventResponse.data.content]);
            setAllResult(prevAllResult => ({
                ...prevAllResult,
                event: [...prevAllResult.event, ...eventResponse.data.content]
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
        return {eventSize, activitySize};
    }

    async function extractedActivity(activitySize, eventSize) {
        try {
            const activityResponse = await axios.get(`${baseURL}/activities/search`, {
                params: {
                    query: searchQuery,
                    location: searchLocation,
                    page: activityPage,
                    size: activitySize
                }
            });

            setActivityResult(prevActivities => [...prevActivities, ...activityResponse.data.content]);
            setAllResult(prevAllResult => ({
                ...prevAllResult,
                activity: [...prevAllResult.activity, ...activityResponse.data.content]
            }));
            if (events.length === eventSize) {
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
        await extractedActivity(20);
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
                                    handleNewSearch();
                                }
                            }}
                        />
                        <Button onClick={handleNewSearch}>Search</Button>
                    </div>

                    <div className="filters">
                        <EventSearchButtons
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
                        <Grid item key={index} xs={12} sm={6} md={3} onClick={() => goToDetails(item)}>
                            <Card sx={{ height: '89%', display: 'flex', flexDirection: 'column' }}>
                                {item.type === 'activities' ? (
                                    <div style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                                            <Avatar sx={{ bgcolor: 'primary.main', fontSize: '0.7rem', marginLeft: '5px', marginTop: '10px' }}>
                                                <img src={activityIcons[item.activity_type.toLowerCase()]} alt={`${item.activity_type} Icon`} style={{ width: '100%', height: '100%' }} />
                                            </Avatar>
                                            <CardHeader
                                                style={{ display: 'top', height: '40px' }}
                                                title={item.title}
                                                subheader={item.date}
                                            />
                                        </div>
                                        <BackgroundGallery images={item.photos.map((photo) => photo.photo)} />
                                        <CardContent sx={{ flexGrow: 1, maxHeight: '100px' }}>
                                            <Typography>
                                                {item.activity_description}
                                            </Typography>
                                        </CardContent>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }} onClick={() => goToDetails(item)}>
                                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                <Avatar sx={{ bgcolor: 'red', fontSize: '1rem', marginLeft: '5px', marginTop: '10px' }}>
                                                    event
                                                </Avatar>
                                                <CardHeader
                                                    style={{ display: 'top', height: '40px' }}
                                                    title={item.title}
                                                    subheader={item.date} subheaderTypographyProps={{ style: { fontSize: '11px' } }}
                                                    titleTypographyProps={{ style: { fontSize: getDynamicFontSize(item.title) } }}
                                                />
                                            </div>
                                            <div style={{ cursor: 'pointer' }} onClick={() => goToDetails(item)}>
                                                <CardMedia
                                                    component="div"
                                                    sx={{ pt: '56.25%' }}
                                                    image={item.photo}
                                                />
                                            </div>
                                        </div>
                                        <CardContent sx={{ flexGrow: 1, maxHeight: '100px' }}>
                                            <Typography>
                                                {item.description}
                                            </Typography>
                                        </CardContent>
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