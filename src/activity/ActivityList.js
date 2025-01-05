import React, {useEffect, useRef, useState} from 'react';
import Axios from 'axios';
import Header from "../header/Header";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import {
    Avatar,
    Button,
    CardHeader,
    Chip,
    DialogContent,
    DialogTitle, IconButton, Snackbar,
    Stack,
    SwipeableDrawer,
    useMediaQuery,
    useTheme
} from "@mui/material";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import {useNavigate, useParams} from "react-router-dom";
import veil from "../images/veil.jpg"
import tamborine from "../images/tamborine.jpg"
import hennaset from "../images/hennaset.jpg"
import gift from "../images/gift.jpg"
import ornament from "../images/ornament.jpg"
import handkerchief from "../images/mendil.jpg"
import souvenir from "../images/souvenir.jpg"
import flower from "../images/flower.jpg"
import {ActivityFilter} from "../filter/ActivityFilter";
import {Helmet} from "react-helmet";
import {useAuth} from "../auth/AuthProvider";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Dialog from "@mui/material/Dialog";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import BackgroundGalleryDetails from "../shared/BackgroundGalleryDetails";

const ActivityList = () => {
    const {type} = useParams();
    const [activities, setActivities] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const [openFilterDialog, setOpenFilterDialog] = useState(false);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [filters, setFilters] = useState([]);
    const listRef = useRef(null);
    const { toggleFavorite, favorites, isLoggedIn } = useAuth();
    const [openDialog, setOpenDialog] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    useNavigate();
    const applyFilter = (filterType, filterValue) => {
        // Add a new filter or update the existing one
        setFilters(currentFilters => ({
            ...currentFilters,
            [filterType]: filterValue
        }));
        // Trigger activity or event refetch with new filters here
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleFavoriteClick = (productId) => {
        if (isLoggedIn) {
            const isFavorite = favorites.favoriteProducts?.map(product => product.id).includes(productId) || false;
            toggleFavorite(productId, isFavorite, "activity");
            // Set the Snackbar message and open it
            setSnackbarMessage(isFavorite ? 'Removed from favorites' : 'Added to favorites');
            setSnackbarOpen(true);
        } else {
            handleOpenDialog();
        }
    };


    const handleOpenDialog = () => {
        setOpenDialog(true);
    };


    const handleCloseDialog = () => {
        setOpenDialog(false);
    };


    const removeFilter = (filterType) => {
        setFilters(currentFilters => {
            const newFilters = {...currentFilters};
            delete newFilters[filterType];
            fetchInitialActivities()
            return newFilters;
        });
        // Trigger activity or event refetch with updated filters here
    };
    const updateFilteredActivities = (filteredActivities) => {
        setActivities(filteredActivities);
    };

    const fetchInitialActivities = async () => {
        try {
            // Fetching the initial list of activities
            let fetchUrl = type === undefined
                ? `${baseURL}/products/all?page=0&size=20`
                : `${baseURL}/products/${type}?page=0&size=20`;

            const response = await Axios.get(fetchUrl);
            const fetchedActivities = response.data.content;
            setActivities(fetchedActivities);
            setHasMore(response.data.totalPages > 1);

        } catch (error) {
            console.error('Error fetching activities with photos:', error);
        }
    };

    useEffect(() => {
        const fetchActivities = async () => {
            setActivities([]);
            setPage(0);
            setHasMore(true);
            await fetchInitialActivities(); // Ensure this function is awaited if it's asynchronous

            // Restore scroll position after data has loaded and the list is populated
            const savedScrollPosition = sessionStorage.getItem('activityListScrollPosition');
            if (savedScrollPosition && listRef.current) {
                listRef.current.scrollTop = parseInt(savedScrollPosition, 10);
            }
        };

        fetchActivities();
    }, [type]); // Dependency on 'type'

    useEffect(() => {
        const saveScrollPosition = () => {
            if (listRef.current) {
                sessionStorage.setItem('activityListScrollPosition', listRef.current.scrollTop.toString());
            }
        };

        // Consider when to save the scroll position. For SPA navigation, 'beforeunload' might not be sufficient.
        window.addEventListener('beforeunload', saveScrollPosition);
        // Additional events or actions to save scroll position can be added here.

        return () => {
            window.removeEventListener('beforeunload', saveScrollPosition);
            // Clean up other event listeners or actions if added.
        };
    }, []); // No dependencies, runs on mount and unmount
    
    const handleInfoWindowClick = (activity) => {
        if (activity && activity.id) {
            const fullUrl = window.location.origin + `/products/detail/${activity.id}/${activity.title}`;
            window.open(fullUrl, '_blank');
        }
    };

    const handleCloseFilterDialog = () => {
        setOpenFilterDialog(false);
    };
    const loadMoreActivities = async () => {
        try {
            let nextPage = page + 1;
            let fetchUrl = type === undefined
                ? `${baseURL}/products/all?page=${nextPage}&size=20`
                : `${baseURL}/products/${type}?page=${nextPage}&size=20`;

            const response = await Axios.get(fetchUrl);
            setActivities(prevActivities => [...prevActivities, ...response.data.content]);
            setHasMore(response.data.totalPages > nextPage + 1);
            setPage(nextPage);
        } catch (error) {
            console.error('Error fetching more activities:', error);
        }
    };
    const activityIcons = {
        veil: veil,
        tamborine: tamborine,
        hennaset: hennaset,
        handkerchief: handkerchief,
        gift: gift,
        ornament: ornament,
        flower: flower,
        souvenir: souvenir
    };
    
    const getDynamicFontSize = (title) => {
        if (title.length < 10) return "1.8rem";
        if (title.length < 20) return "1.5rem"
        if (title.length < 30) return "1.2rem"
        return "1rem"; // Fallback font size
    };

    return (
        <div className="activity-list" ref={listRef}>
            <Helmet>
                <title>{type ? `${type} Activities` : 'All Activities'} - Activenty</title>
                <meta name="description"
                      content={`Explore ${type ? type : 'all'} activities on Activenty. Find outdoor adventures, cultural experiences, and more.`}/>
                <meta name="robots" content="index, follow"/>
                <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`}/>
            </Helmet>
            <Header/>
            
            <Container sx={{py: 9}} maxWidth="xl">
                <Typography variant="h2" component="div" style={{fontSize: '2rem', marginBottom: '20px'}}>
                    {type}  {Object.keys(filters).length > 0 ?
                    Object.entries(filters).map(([filterType, filterValue]) => {
                        if (typeof filterValue === 'object' && filterValue !== null) {
                            return filterValue.name;
                        } else {
                            return filterValue;
                        }
                    }).join(', ') : ''}
                </Typography>

                <Stack direction="row" spacing={1} justifyContent="flex-end" padding="5px">
                    {Object.entries(filters).map(([filterType, filterValue]) => (
                        <Chip
                            key={filterType}
                            label={`${filterType}: ${filterValue}`}
                            onDelete={() => removeFilter(filterType)}
                            color="secondary"
                        />
                    ))}
                </Stack>
                <Grid container spacing={4}>

                    {activities.map((item) => {
                        const isAlreadyFavorited = favorites.favoriteProducts?.map(product => product.id).includes(item.id);
                        return (
                            <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                                <Card sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                                    <a href={`/products/detail/${item.id}`}
                                       style={{textDecoration: 'none', color: 'inherit'}}>
                                        <div style={{display: 'flex', flexDirection: 'row'}}>
                                            <Avatar sx={{
                                                bgcolor: 'primary.main',
                                                fontSize: '0.7rem',
                                                marginLeft: '8px',
                                                marginTop: '15px'
                                            }}>
                                              <img src={activityIcons[item.category.toLocaleLowerCase()]}
                                                     alt={`${item.category} Icon`}
                                                     style={{width: '100%', height: '100%'}}/>
                                            </Avatar>
                                            <CardHeader style={{height: '50px'}}
                                                        title={
                                                            <Typography
                                                                variant="h3"
                                                                component="h3"
                                                                style={{fontSize: getDynamicFontSize(item.title)}}
                                                            >
                                                                {item.title}
                                                            </Typography>
                                                        }
                                                        subheaderTypographyProps={{
                                                            component: 'div',
                                                            style: {fontSize: '12px'}
                                                        }}
                                            />

                                        </div>
                                        <BackgroundGalleryDetails images={item.photos.map((photo) => photo.photo)}/>
                                    </a>
                                    <IconButton
                                        aria-label="add to favorites"
                                        onClick={() => handleFavoriteClick(item.id)}
                                    >
                                        {isAlreadyFavorited ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                                    </IconButton>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>{"Just a moment!"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            We noticed you're interested in saving favorites. That's great! To keep track of your favorite events and activities, please log in or sign up. It's quick and easy!
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="primary" autoFocus>
                            Got it, thanks!
                        </Button>
                    </DialogActions>
                </Dialog>
                {hasMore && (
                    <div style={{display: 'flex', justifyContent: 'center', margin: '20px 0'}}>
                        <Button
                            onClick={loadMoreActivities}
                            variant="contained"
                            color="primary"
                            style={{textTransform: 'none', fontSize: '16px', padding: '10px 20px'}}
                        >
                            Load More
                        </Button>
                    </div>
                )}
            </Container>
            <ActivityFilter
                openFilterDialog={openFilterDialog}
                handleCloseFilterDialog={handleCloseFilterDialog}
                type={type}
                applyFilter={applyFilter}
            />
                <SwipeableDrawer
                    anchor="bottom"
                    fullScreen={fullScreen}
                    ModalProps={{
                        keepMounted: true, // Better performance on mobile
                    }}
                >
                    <Snackbar
                        open={snackbarOpen}
                        autoHideDuration={6000}
                        onClose={handleSnackbarClose}
                        message={snackbarMessage}
                    />
                </SwipeableDrawer>
        </div>
    );
};


export default ActivityList;
