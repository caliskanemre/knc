import React, {useEffect, useState} from 'react';
import {NavLink, useNavigate} from 'react-router-dom';
import './css/Header.css';
import SearchImage from "../images/urunAra.png";
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
import {useTranslation} from "react-i18next";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';


const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

export default function Header() {
    const { isLoggedIn, setIsLoggedIn, username, setUsername } = useAuth();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const navigate = useNavigate();
    const keywords = "kına, wedding, personalized gifts, bride, groom, henna night, kına setleri";
    const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
    const [openLoginDialog, setOpenLoginDialog] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const { t, i18n } = useTranslation();
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

    const changeLanguage = (language) => {
        i18n.changeLanguage(language);
        setSelectedLanguage(language);
    };


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
                    <title>Kına Sepeti - Personalized Wedding and Henna Gifts</title>
                    <meta name="description"
                          content="Find unique and personalized products for weddings and henna nights at KınaSepeti! Add names, dates, and custom designs to create unforgettable memories."/>
                    <meta name="keywords" content={keywords}/>
                    <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`}/>
                </Helmet>
                <AppBar position="relative" style={{backgroundColor: 'white'}}>
                    <Toolbar>
                        {isMobile && (
                            <IconButton
                                edge="start"
                                aria-label="menu"
                                style={{color: '#5D4037' }} // Elegant brown tone for the menu icon
                                onClick={() => setMobileMenuOpen(true)}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                        {!isMobile && (
                            <Typography
                                variant="h1"
                                component="h1"
                                onClick={() => handleNavigation('/')}
                                style={{
                                    cursor: 'pointer',
                                    color: '#8B0000', // Deep maroon color for an elegant, traditional look
                                    fontFamily: "'Dancing Script', cursive", // Elegant script font
                                    fontSize: isMobile ? '3rem' : '2.5rem',
                                    fontWeight: 700, // Ensure boldness for better readability
                                    letterSpacing: '0.03em',
                                    lineHeight: 1.2,
                                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)' // Subtle shadow for depth
                                }}
                            >
                                KınaSepeti
                            </Typography>
                        )}
                        {isMobile && (
                            <Typography
                                variant="h1"
                                component="h1"
                                onClick={() => handleNavigation('/')}
                                style={{
                                    cursor: 'pointer',
                                    color: '#8B0000', // Deep maroon color for an elegant, traditional look
                                    fontFamily: "'Dancing Script', cursive", // Elegant script font
                                    fontSize: isMobile ? '3rem' : '2.5rem',
                                    fontWeight: 700, // Ensure boldness for better readability
                                    letterSpacing: '0.03em',
                                    lineHeight: 1.2,
                                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)' // Subtle shadow for depth
                                }}
                            >
                                KınaSepeti
                            </Typography>
                        )}
                        {!isMobile && (
                            <>
                                <NavLink to="/search" className="nav-link">
                                    <img src={SearchImage} alt="Search events" style={{cursor: 'pointer'}}/>
                                </NavLink>
                                <ActivitySubHeader/>
                               {/* <NavLink to="/events" className="nav-link">
                                    {t('Custom product')}
                                </NavLink>*/}
                                <NavLink to="/ideal-for" className="nav-link">
                                    {t('AI Assistant')}
                                </NavLink>
                                <NavLink to="/about-us" className="nav-link">
                                    {t('How it works')}
                                </NavLink>
                                <NavLink to="/privacy-policy" className="nav-link">
                                    {t('Privacy Policy')}
                                </NavLink>
                                <NavLink to="/contact-us" className="nav-link">
                                    {t('Contact Us')}
                                </NavLink>
                            </>
                        )}
                        <Box flexGrow={1}/>
                        <IconButton
                            aria-label="cart"
                            sx={{
                                color: 'black', // İkon rengi
                                marginLeft: '10px', // İkon ve diğer öğeler arasında boşluk
                            }}
                            onClick={() => handleNavigation('/cart')} // Sepetim sayfasına yönlendirme
                        >
                         {/*   <ShoppingCartIcon sx={{ fontSize: 30 }} /> */}
                        </IconButton>
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
                                    {/*<MenuItem onClick={handleMenuClose}>Profile</MenuItem>*/}
                                    <MenuItem onClick={handleFetchFavorites}>Favorites</MenuItem>
                                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                                </Menu>
                            </div>
                        )}
                    </Toolbar>
                    {isMobile && (
                        <Drawer
                            anchor="left"
                            open={mobileMenuOpen}
                            onClose={() => setMobileMenuOpen(false)}
                            sx={{
                                '& .MuiDrawer-paper': { width: { xs: '50%', sm: '400px' } }, // Responsive width
                            }}
                        >
                            <List>
                                <Typography
                                    variant="h1"
                                    component="h1"
                                    onClick={() => handleNavigation('/')}
                                    style={{
                                        cursor: 'pointer',
                                        color: '#8B0000', // Deep maroon color for an elegant, traditional look
                                        fontFamily: "'Dancing Script', cursive", // Elegant script font
                                        fontSize: isMobile ? '3rem' : '2.5rem',
                                        fontWeight: 700, // Ensure boldness for better readability
                                        letterSpacing: '0.03em',
                                        lineHeight: 1.2,
                                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)' // Subtle shadow for depth
                                    }}
                                >
                                    KınaSepeti
                                </Typography>

                                {/* ListItem with increased font size for "Search" */}
                                <ListItem button onClick={() => handleNavigation('/search')}>
                                    <Box display="flex" alignItems="center">
                                        <i className="fas fa-search"></i>
                                        <ListItemText
                                            primary={t('Search')}
                                            primaryTypographyProps={{
                                                style: {
                                                    fontSize: '1.2rem',
                                                    marginLeft: '10px'
                                                }
                                            }} // Increase font size
                                        />
                                    </Box>
                                </ListItem>

                                {/* Continue with other ListItems, adjusting font size similarly */}
                                {/*<ListItem button onClick={() => handleNavigation('/ideal-for')}>
                                    <ListItemText
                                        primary={t('AI Assistant')}
                                        primaryTypographyProps={{ style: { fontSize: '1.2rem' } }} // Increase font size
                                    />
                                </ListItem>*/}
                                {/*     <ListItem button onClick={() => handleNavigation('/events')}>
                                    <ListItemText
                                        primary={t('Events')}
                                        primaryTypographyProps={{ style: { fontSize: '1.2rem' } }} // Increase font size
                                    />
                                </ListItem>
*/}
                                <ActivitySubHeaderMobile/>

                                <ListItem button onClick={() => handleNavigation('/about-us')}>
                                    <ListItemText
                                        primary={t('How it works')}
                                        primaryTypographyProps={{style: {fontSize: '1.2rem'}}} // Increase font size
                                    />
                                </ListItem>
                                <ListItem button onClick={() => handleNavigation('/privacy-policy')}>
                                    <ListItemText
                                        primary={t('Privacy Policy')}
                                        primaryTypographyProps={{style: {fontSize: '1.2rem'}}} // Increase font size
                                    />
                                </ListItem>
                                <ListItem button onClick={() => handleNavigation('/contact-us')}>
                                    <ListItemText
                                        primary={t('Contact Us')}
                                        primaryTypographyProps={{style: {fontSize: '1.2rem'}}} // Increase font size
                                    />
                                </ListItem>
                                {/*
                                <ListItem button onClick={() => handleNavigation('/cart')}>
                                    <ShoppingCartIcon sx={{ fontSize: 24, marginRight: 1 }} />  İkon boyutunu ve sağ boşluğu ayarlayın
                                    <ListItemText
                                        primary={t('My Cart')} // Çok dilli destek için "Sepetim" çevirisi
                                        primaryTypographyProps={{ style: { fontSize: '1.2rem' } }}
                                    />
                                </ListItem>*/}

                                <nav>
                                    <Button color="primary" onClick={() => changeLanguage('en')}>EN</Button>
                                    <Button color="primary" onClick={() => changeLanguage('tr')}>TR</Button>
                                </nav>
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
