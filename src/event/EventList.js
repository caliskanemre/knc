import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import Header from "../header/Header";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import {CardHeader} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import {Link} from "react-router-dom";
import EventSubHeader from "./EventSubHeader";

const EventList = () => {
    const [events, setEvents] = useState([]);

    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    useEffect(() => {
        // Define the page and size for pagination
        const page = 0;
        const size = 20;

        // Define the sorting criteria
        const sort = 'interested,desc'; // This sorts the events by 'interest' in descending order

        // Make an HTTP GET request to fetch events from the backend
        Axios.get(`${baseURL}/events/all`, {
            params: {
                page: page,
                size: size,
                sort: sort
            }
        })
            .then((response) => {
                setEvents(response.data.content);
            })
            .catch((error) => {
                console.error('Error fetching events:', error);
            });
    }, []);


    return (
        <div className="event-list">
            <Header/>
            {/*<EventSubHeader/>*/}
            <Container sx={{ py: 9 }} maxWidth="xl">
                <Grid container spacing={4}>
                    {events.map((item) => {
                        return (
                            <Grid item key={item.id} xs={12} sm={6} md={3}>

                                <Card sx={{ height: '90%', display: 'flex', flexDirection: 'column' }}>
                                    <Link to={`/event/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                                    <Link to={`/events/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                        );
                    })}
                </Grid>
            </Container>
        </div>
    );
};

export default EventList;
