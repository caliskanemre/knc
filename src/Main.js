import * as React from 'react';
import {useEffect, useState} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {Link} from "react-router-dom";
import {createTheme, styled, ThemeProvider} from '@mui/material/styles';
import Axios from 'axios';
import Header from "./header/Header";
import backgroundImage from './background2.png';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import {Avatar, CardHeader, ListItemButton} from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import BackgroundGallery from "./shared/BackgroundGallery";
import PinDropIcon from "@mui/icons-material/PinDrop";

/*function Copyright() {
    return (
        <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://mui.com/">
                Your Website
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}*/
const ExpandMore = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));
const defaultTheme = createTheme();
const deneme = []
deneme.push(backgroundImage);
export default function Main () {
    const [events, setEvents] = useState([]);
    const [expanded, setExpanded] = React.useState(false);

    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

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

    const getDynamicFontSize = (title) => {
        if (title.length < 10) return "1.6rem";
        if (title.length < 30) return "1.3rem"
        return "1rem"; // Fallback font size
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <CssBaseline />
            <Header/>
            <main>
                {/* Hero unit */}
                <Grid container spacing={3}> {/* Maintains the outer grid container */}
                    <Grid item xs={12}> {/* Allows the grid item to span the full width */}
                        <BackgroundGallery images={deneme}/>
                    </Grid>
                </Grid>

                <Container sx={{ py: 9 }} maxWidth="xl">
                    <Grid container spacing={4}>
                        {events.map((item) => {

                            return (
                                <Grid item key={item.id} xs={12} sm={6} md={3}>
                                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <a href={`/event/${item.id}`} target="_blank" style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                                <Avatar sx={{ bgcolor: 'darkorange', fontSize: '1rem', marginLeft: '5px', marginTop: '15px' }}>
                                                    event
                                                </Avatar>
                                                <CardHeader
                                                    style={{ display: 'top', height: '100px' }}
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
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Container>
            </main>
            {/* Footer */}
            <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">
                <Typography variant="h6" align="center" gutterBottom>
                    activenty
                </Typography>
                <Typography
                    variant="subtitle1"
                    align="center"
                    color="text.secondary"
                    component="p"
                >
                    All rights reserved @2024 Activenty
                </Typography>
          {/*      <Copyright />*/}
            </Box>
            {/* End footer */}
        </ThemeProvider>
    );
}


