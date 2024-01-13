import React, { useState } from 'react';
import axios from 'axios';
import "./SearchPage.css";
import Header from "../header/Header";
import { Button, CardHeader } from "@mui/material";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { Link } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState('');
    const [eventResult, setEventResult] = useState([]);
    const [activityResult, setActivityResult] = useState([]);
    const [viewType, setViewType] = useState('events');

    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    const handleSearch = async () => {
        const page = 0;
        const size = 20;
        // const sort = 'activity_name,desc';

        try {
            const eventResponse = await axios.get(`${baseURL}/events/search`, {
                params: {
                    query: searchQuery,
                    location: location,
                    page: page,
                    size: size
                    // sort: sort
                }
            });
            setEventResult(eventResponse.data.content);
            console.log(`Searching for ${searchQuery} in ${location}`);
        } catch (error) {
            console.error('Error during search:', error);
        }

        try {
            const activityResponse = await axios.get(`${baseURL}/activities/search`, {
                params: {
                    query: searchQuery,
                    location: location,
                    page: page,
                    size: size
                    // sort: sort
                }
            });
            setActivityResult(activityResponse.data.content);
            console.log(`Searching for ${searchQuery} in ${location}`);
        } catch (error) {
            console.error('Error during search:', error);
        }
    };

    const toggleView = () => {
        setViewType(viewType === 'events' ? 'activities' : 'events');
    };

    return (
        <div>
            <Header/>

            <div className="parent-container">
                <div className="search-page">

              {/*      <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search for anything"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button onClick={handleSearch}>🔍</Button>
                    </div>*/}

                    <div className="location-input">
                        <input
                            type="text"
                            placeholder="Tallinn"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button onClick={handleSearch}>Search</Button>
                    </div>

                    <div className="filters">
                        <Button>Online</Button>
                        <Button>Today</Button>
                        <Button>This weekend</Button>
                        <Button>Free</Button>
                        <Button>Music</Button>
                        <Button>Food & Drink</Button>
                    </div>

                    <div className="recent-searches">
                        <h2>Recent and popular searches</h2>
                        <ul>
                            <li>Tallinn</li>
                            <li>new-years-eve-parties</li>
                        </ul>
                    </div>
                </div>

            </div>
            <div className="toggle-switch">
                <Button onClick={toggleView}>
                    {viewType === 'events' ? 'Show Activities' : 'Show Events'}
                </Button>
            </div>
            <Container sx={{ py: 9 }} maxWidth="xl">
                <Grid container spacing={4}>
                    {viewType === 'events' ? (
                        eventResult.map((item) => (
                                    <Grid item key={item.id} xs={12} sm={6} md={3}>

                                        <Card sx={{ height: '90%', display: 'flex', flexDirection: 'column' }}>
                                            <Link to={`/events/detail/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <CardHeader style={{display:'top', height:'40px'}}
                                                            action={
                                                                <IconButton aria-label="settings">
                                                                    <MoreVertIcon />
                                                                </IconButton>
                                                            }
                                                            title={item.title}
                                                            subheader={item.date}

                                                />
                                            </Link>
                                            <Link to={`/events/detail/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <CardMedia
                                                    component="div"
                                                    sx={{ pt: '56.25%' }}
                                                    image={item.photo}
                                                />
                                            </Link>
                                            <CardContent sx={{ flexGrow: 1, maxHeight:'100px'}}>
                                                <Typography>
                                                    {item.description}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                        ))
                    ) : (
                        activityResult.map((item) => (
                                    <Grid item key={item.id} xs={12} sm={6} md={3}>

                                        <Card sx={{ height: '90%', display: 'flex', flexDirection: 'column' }}>
                                            <Link to={`/activities/detail/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <CardHeader style={{display:'top', height:'40px'}}
                                                            action={
                                                                <IconButton aria-label="settings">
                                                                    <MoreVertIcon />
                                                                </IconButton>
                                                            }
                                                            title={item.title}
                                                            subheader={item.date}

                                                />
                                            </Link>
                                            <Link to={`/activities/detail/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <CardMedia
                                                    component="div"
                                                    sx={{ pt: '56.25%' }}
                                                    image={item.photo}
                                                />
                                            </Link>
                                            <CardContent sx={{ flexGrow: 1, maxHeight:'100px'}}>
                                                <Typography>
                                                    {item.description}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                        ))
                    )}
                </Grid>
            </Container>
        </div>
    );
};

export default SearchPage;