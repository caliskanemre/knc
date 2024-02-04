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
import {CardHeader, ListItemButton} from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import BackgroundGallery from "./shared/BackgroundGallery";

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
                                    <Card sx={{ height: '90%', display: 'flex', flexDirection: 'column' }}>
                                        <Link to={`/events/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <CardHeader
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
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography>
                                                {item.description}
                                            </Typography>
                                        </CardContent>
                                        <CardActions disableSpacing>
                                            <ExpandMore
                                                expand={expanded}
                                                onClick={handleExpandClick}
                                                aria-expanded={expanded}
                                                aria-label="show more"
                                            >
                                                <ExpandMoreIcon />
                                            </ExpandMore>
                                        </CardActions>
                                        <Collapse in={expanded} timeout="auto" unmountOnExit>
                                            <CardContent>
                                                {/* Place additional details here */}
                                                {item.additionalDetails && (
                                                    <>
                                                        <Typography paragraph>Additional Details: {item.additionalDetails}</Typography>
                                                        {/* Include other details you want to show in expanded section */}
                                                    </>
                                                )}
                                            </CardContent>
                                        </Collapse>
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
                    Footer
                </Typography>
                <Typography
                    variant="subtitle1"
                    align="center"
                    color="text.secondary"
                    component="p"
                >
                    Something here to give the footer a purpose!
                </Typography>
          {/*      <Copyright />*/}
            </Box>
            {/* End footer */}
        </ThemeProvider>
    );
}


