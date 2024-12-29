import MusicNoteIcon from "@mui/icons-material/MusicNote";
import LandscapeIcon from "@mui/icons-material/Landscape";
import ScienceIcon from "@mui/icons-material/Science";
import SchoolIcon from "@mui/icons-material/School";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import PaletteIcon from "@mui/icons-material/Palette";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Header from "../header/Header";
import {Avatar, Button, CardHeader, IconButton} from "@mui/material";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import PinDropIcon from "@mui/icons-material/PinDrop";
import CardMedia from "@mui/material/CardMedia";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {useAuth} from "../auth/AuthProvider";
import BackgroundGallery from "../shared/BackgroundGallery";
import CampingIcon2 from "../images/camping_summer2.jpg";
import wellness from "../images/wellness_green2.png";
import winter from "../images/winter_green.jpeg";
import swimming from "../images/summer_green3.jpg";
import park from "../images/park_green.jpg";
import nature from "../images/nature2.jpg";
import naturalPark from "../images/park_green2.png";
import museumIcon from "../images/green_museum.png";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

const Favorites = () => {
    const { favorites, toggleFavorite, isLoggedIn, username } = useAuth(); // Use global favorites and toggle function
    const [eventPage, setEventPage] = useState(0);
    const [hasMoreEvents, setHasMoreEvents] = useState(0);

    const [hasMoreActivity, setHasMoreActivity] = useState(0);
    const [activityPage, setActivityPage] = useState(0);

    useEffect(() => {
        // Any additional logic to run on component mount or when favorites change
    }, [favorites]);

    const eventIcons = {
        "music & concerts": <MusicNoteIcon/>,
        "outdoor & adventure": <LandscapeIcon/>,
        "tech & innovation": <ScienceIcon/>,
        "education": <SchoolIcon/>,
        "children": <ChildCareIcon/>,
        "arts & culture": <PaletteIcon/>,
        "other": <HelpOutlineIcon/>,
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

    const getDynamicFontSize = (title) => {
        // Ensure title is a valid string or provide a default value
        title = title || ""; // Set title to an empty string if it's undefined or null
        if (title.length < 10) return "1.8rem";
        if (title.length < 20) return "1.5rem";
        return "1.2rem"; // Fallback font size
    };


    return (
        <div>
            <Header/>

            <Container sx={{py: 9}} maxWidth="xl">
                <Grid container spacing={4}>
                    {Array.isArray(favorites.favoriteProducts) && favorites.favoriteProducts.map((item, index) => {
                        const isAlreadyFavorited = favorites.favoriteActivities.map(product => product.id).includes(item.id);
                        return (
                            <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                                <Card sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                                        <a href={`/products/detail/${item.id}/${item.title}`}
                                           style={{textDecoration: 'none', color: 'inherit'}}>
                                            <div style={{textDecoration: 'none', color: 'inherit', cursor: 'pointer'}}>
                                                <div style={{display: 'flex', flexDirection: 'row'}}>
                                                    <Avatar sx={{
                                                        bgcolor: 'primary.main',
                                                        fontSize: '0.7rem',
                                                        marginLeft: '5px',
                                                        marginTop: '10px'
                                                    }}>
                                                        <img
                                                            src={item.activity_type?.toLowerCase() ? activityIcons[item.activity_type.toLowerCase()] : ""}
                                                            alt={`${item.activity_type} Icon`}
                                                            style={{ width: '100%', height: '100%' }}
                                                        />
                                                    </Avatar>
                                                    <CardHeader
                                                        style={{display: 'top', height: '45px'}}
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
                                                        titleTypographyProps={{style: {fontSize: getDynamicFontSize(item.title)}}}
                                                        subheader={
                                                            <div>
                                                                <div>{item.date}</div>
                                                                {/* First line of subheader */}
                                                                <div>
                                                                    <PinDropIcon style={{
                                                                        fontSize: '1rem',
                                                                        verticalAlign: 'bottom'
                                                                    }}/> {item.activity_location}
                                                                </div>
                                                            </div>
                                                        }
                                                        subheaderTypographyProps={{
                                                            component: 'div',
                                                            style: {fontSize: '11px'}
                                                        }}
                                                    />
                                                </div>
                                                <BackgroundGallery images={item.photos?.map((photo) => photo.photo)}/>

                                            </div>
                                        </a>
                                    <IconButton
                                        aria-label="add to favorites"
                                        sx={{ zIndex: 1 }} // Ensure the button is above other elements
                                        onClick={() => toggleFavorite(item.id, isAlreadyFavorited, "activity")}
                                    >
                                        {isAlreadyFavorited ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                                    </IconButton>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Container>
            {(hasMoreEvents || hasMoreActivity) && (eventPage > 0 || activityPage > 0) && (
                <div style={{display: 'flex', justifyContent: 'center', margin: '20px 0'}}>
                    <Button
                        variant="contained"
                        color="primary"
                        style={{textTransform: 'none', fontSize: '16px', padding: '10px 20px'}}
                    >
                        Load More
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Favorites;
