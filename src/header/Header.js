import React, {useEffect, useState} from 'react';
import {NavLink, useNavigate} from 'react-router-dom';
import './css/Header.css';
import SearchImage from "../images/search.png";
import ActivitySubHeader from "../activity/ActivitySubHeader";
import Login from "../login/Login";
import {
    AppBar, Avatar,
    Box,
    Button,
    Dialog,
    DialogContent,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemText, Menu, MenuItem,
    Toolbar,
    Typography
} from "@mui/material";
import Register from "../login/Register";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import {useAuth} from "../auth/AuthProvider";
import MenuIcon from '@mui/icons-material/Menu';
import ActivitySubHeaderMobile from "../activity/ActivitySubHeaderMobile";
import {Helmet} from "react-helmet";


const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

export default function Header() {
    const { isLoggedIn, setIsLoggedIn, username, setUsername } = useAuth();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const navigate = useNavigate();
    const keywords = "event, activity, tallinn, concert, museums, nearest, spa";
    const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
    const [openLoginDialog, setOpenLoginDialog] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [authToken, setAuthToken] = useState(null);


    // Function to handle fetching favorites when "Favorites" menu item is clicked

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

        const handleNavigation = (path) => {
        navigate(path);
        setMobileMenuOpen(false); // Close the drawer when an item is clicked
        }
        const handleFetchFavorites = async () => {
            try {
                // Set the token in a global state or context
                navigate('/users/favorites'); // Navigate to the favorites component
            } catch (error) {
                console.error('Failed to fetch favorites:', error);
            }
        };
        const handleOpenRegisterDialog = () => setOpenRegisterDialog(true);
        const handleCloseRegisterDialog = () => setOpenRegisterDialog(false);
        const handleOpenLoginDialog = () => setOpenLoginDialog(true);
        const handleCloseLoginDialog = () => setOpenLoginDialog(false);


        const handleMenuClick = (event) => {
            setAnchorEl(event.currentTarget);
        };

        const handleMenuClose = () => {
            setAnchorEl(null);
        };

        const handleLogout = () => {
            localStorage.removeItem('token');
            // Implement logout functionality here
            setIsLoggedIn(false);
            setUsername('');
            handleMenuClose();
        };

        const handleLoginSuccess = (data) => {
            // Process login success, e.g., storing the token, updating user state
            console.log('Login successful with data:', data);
            // Close the login dialog
            setIsLoggedIn(true);
            setOpenLoginDialog(false);
            // Update any other state or perform actions needed after login
        };

        return (
            <>
                <Helmet>
                    <title>Activenty - Discover Local Events and Activities</title>
                    <meta name="description"
                          content="Discover local events and activities with Activenty! Explore concerts, outdoor adventures, and cultural experiences. Start your next adventure today."/>
                    <meta name="keywords" content={keywords}/>
                    <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`}/>
                </Helmet>
                <AppBar position="relative" style={{backgroundColor: 'white'}}>
                    <Toolbar>
                        {isMobile && (
                            <IconButton edge="start" color="black" aria-label="menu"
                                        onClick={() => setMobileMenuOpen(true)}>
                                <MenuIcon/>
                            </IconButton>
                        )}
                        {!isMobile && (
                            <Typography variant="h1" component="h1" style={{
                                cursor: 'pointer',
                                color: 'darkorange',
                                fontSize: isMobile ? '3rem' : '2.5rem',
                                fontWeight: 'bold'
                            }} onClick={() => handleNavigation('/')}>
                                αctiventy
                            </Typography>
                        )}
                        {isMobile && (
                            <Typography variant="h1" component="h1" sx={{
                                flexGrow: 1,
                                cursor: 'pointer',
                                color: 'darkorange',
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                marginRight: isMobile ? '-260px' : '0', // Offset the width of the IconButton
                            }} onClick={() => handleNavigation('/')}>
                                αctiventy
                            </Typography>
                        )}
                        {!isMobile && (
                            <>
                                <NavLink to="/search" className="nav-link">
                                    <img src={SearchImage} alt="Search events" style={{cursor: 'pointer'}}/>
                                </NavLink>
                                <NavLink to="/events" className="nav-link">
                                    Events
                                </NavLink>
                                <ActivitySubHeader/>
                                <NavLink to="/ideal-for" className="nav-link">
                                    AI Assistant
                                </NavLink>
                            </>
                        )}
                        <Box flexGrow={1}/>
                        {!isLoggedIn ? (
                            <>
                                <IconButton aria-label="register" sx={{color: 'black'}} onClick={handleOpenRegisterDialog}>
                                    <PersonAddIcon/>
                                </IconButton>
                                <IconButton aria-label="login" sx={{color: 'black'}} onClick={handleOpenLoginDialog}>
                                    <LoginIcon/>
                                </IconButton>
                            </>
                        ) : (
                            <div>
                                <Avatar sx={{
                                    bgcolor: 'grey.300', // Neutral background color
                                    color: 'blue', // Text color
                                    fontSize: '1rem',
                                    marginLeft: '8px',
                                    border: '2px solid', // Border thickness
                                    borderColor: 'primary.main', // Theme-based color for the border
                                }} onClick={handleMenuClick}>
                                    {username[0].toUpperCase()} {/* Display the first letter of the username */}
                                </Avatar>

                                <Menu
                                    id="simple-menu"
                                    anchorEl={anchorEl}
                                    keepMounted
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                                    <MenuItem onClick={handleFetchFavorites}>Favorites</MenuItem>
                                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                                </Menu>
                            </div>
                        )}
                    </Toolbar>
                    {isMobile && (
                        <Drawer anchor="left" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
                            <List>
                                <Typography variant="h2" component="h2" sx={{
                                    flexGrow: 1,
                                    cursor: 'pointer',
                                    color: 'darkorange',
                                    fontSize: '1.3rem',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                }} onClick={() => handleNavigation('/')}>
                                    αctiventy
                                </Typography>
                                <ListItem button onClick={() => handleNavigation('/search')}>
                                    <Box display="flex" alignItems="center" marg>
                                        <i className="fas fa-search"></i>
                                        <ListItemText primary="Search" style={{marginLeft: '10px'}}/>
                                    </Box>
                                </ListItem>
                                <ListItem button onClick={() => handleNavigation('/ideal-for')}>
                                    <ListItemText primary="AI Assistant"/>
                                </ListItem>
                                <ListItem button onClick={() => handleNavigation('/events')}>
                                    <ListItemText primary="Events"/>
                                </ListItem>
                                <ActivitySubHeaderMobile/>

                                {/* Add more mobile navigation items as needed */}
                            </List>
                        </Drawer>
                    )}
                </AppBar>
                <Dialog open={openRegisterDialog} onClose={handleCloseRegisterDialog}>
                    <DialogContent>
                        <Register open={openRegisterDialog} handleClose={handleCloseRegisterDialog}/>
                    </DialogContent>
                </Dialog>
                <Dialog open={openLoginDialog} onClose={handleCloseLoginDialog}>
                    <DialogContent>
                        <Login open={openLoginDialog} handleClose={handleCloseLoginDialog}
                               onLoginSuccess={handleLoginSuccess}/>
                    </DialogContent>
                </Dialog>
            </>
        );
}
