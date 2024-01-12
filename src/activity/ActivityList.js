import React, {useEffect, useState} from 'react';
import Axios from 'axios';
import Header from "../header/Header";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import {Avatar, Button, CardHeader} from "@mui/material";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import {Link, useParams} from "react-router-dom";
import ActivitySubHeader from "./ActivitySubHeader";
import CampingIcon2 from "./camping2.jpg"
import wellness from "./wellness.jpg"
import winter from "./winter.png"
import swimming from "./swim.png"
import park from "./park.png"
import nature from "./nature2.jpg"
import naturalPark from "./natural_park.png"
import museumIcon from "./img_1.png"

const ActivityList = () => {
    const { type } = useParams();
    const [activities, setActivities] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);


    useEffect(() => {
        // Reset states when type changes
        setActivities([]);
        setPage(0);
        setHasMore(true);

        // Define a separate function to fetch activities
        const fetchInitialActivities = async () => {
            try {
                let fetchUrl = type === undefined
                    ? `https://activenty-bb26d9089082.herokuapp.com/activities/all?page=0&size=20`
                    : `https://activenty-bb26d9089082.herokuapp.com/activities/${type}?page=0&size=20`;

                const response = await Axios.get(fetchUrl);
                setActivities(response.data.content);
                setHasMore(response.data.totalPages > 1);
            } catch (error) {
                console.error('Error fetching initial activities:', error);
            }
        };

        // Fetch initial activities for the new type
        fetchInitialActivities();
    }, [type]);
    const loadMoreActivities = async () => {
        try {
            let nextPage = page + 1;
            let fetchUrl = type === undefined
                ? `https://activenty-bb26d9089082.herokuapp.com/all?page=${nextPage}&size=20`
                : `https://activenty-bb26d9089082.herokuapp.com/activities/${type}?page=${nextPage}&size=20`;

            const response = await Axios.get(fetchUrl);
            setActivities(prevActivities => [...prevActivities, ...response.data.content]);
            setHasMore(response.data.totalPages > nextPage + 1);
            setPage(nextPage);
        } catch (error) {
            console.error('Error fetching more activities:', error);
        }
    };
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

    return (
        <div className="activity-list">
            <Header/>
            <ActivitySubHeader/>
            <Container sx={{ py: 9 }} maxWidth="xl">
                <Grid container spacing={4}>
                    {activities.map((item) => {
                        return (
                            <Grid item key={item.id} xs={12} sm={6} md={3}>
                                <Card sx={{ height: '90%', display: 'flex', flexDirection: 'column' }}>
                                    <div  style={{display: 'flex', flexDirection: 'row'}}>
                                        <Avatar sx={{ bgcolor: 'primary.main', fontSize: '0.7rem', marginLeft: '5px', marginTop: '10px' }}>
                                            <img src={activityIcons[item.activity_type.toLocaleLowerCase()]} alt={`${item.activity_type} Icon`} style={{ width: '100%', height: '100%' }} />
                                        </Avatar>
                                        <CardHeader style={{display:'top', height:'40px'}}
                                            title={item.title}
                                        />
                                    </div>
                                    <Link to={`/activities/detail/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <CardMedia
                                                component="div"
                                                sx={{ pt: '56.25%' }}
                                                image={item.activity_cover_photo}
                                        />
                                    </Link>
                                    <CardContent sx={{ flexGrow: 1, maxHeight:'100px'}}>
                                        <Typography>
                                            {item.activity_description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
                {hasMore && (
                    <Button onClick={loadMoreActivities}>Load More</Button>
                )}
            </Container>
        </div>
    );
};


export default ActivityList;
