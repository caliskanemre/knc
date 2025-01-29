import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './css/Header.css';
import SearchImage from "../images/urunAra.png";
import ActivitySubHeader from "../activity/ActivitySubHeader";
import Login from "../login/Login";
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import {
    AppBar,
    Avatar,
    Box,
    Button,
    Dialog,
    DialogContent,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Typography
} from "@mui/material";
import Register from "../login/Register";
// import PersonAddIcon from '@mui/icons-material/PersonAdd'; // Removed
import LoginIcon from '@mui/icons-material/Login';
import { useAuth } from "../auth/AuthProvider";
import MenuIcon from '@mui/icons-material/Menu';
import ActivitySubHeaderMobile from "../activity/ActivitySubHeaderMobile";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

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
    const { t, i18n } = useTranslation();
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

    const changeLanguage = (language) => {
        i18n.changeLanguage(language);
        setSelectedLanguage(language);
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNavigation = (path) => {
        navigate(path);
        setMobileMenuOpen(false); // Close drawer after navigation
    };

    const handleFetchFavorites = async () => {
        try {
            navigate('/users/favorites');
        } catch (error) {
            console.error('Failed to fetch favorites:', error);
        }
    };

    // Register dialog
    const handleOpenRegisterDialog = () => setOpenRegisterDialog(true);
    const handleCloseRegisterDialog = () => setOpenRegisterDialog(false);

    // Login dialog
    const handleOpenLoginDialog = () => setOpenLoginDialog(true);
    const handleCloseLoginDialog = () => setOpenLoginDialog(false);

    // User menu
    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUsername('');
        handleMenuClose();
    };

    const handleLoginSuccess = (data) => {
        console.log('Login successful with data:', data);
        setIsLoggedIn(true);
        setOpenLoginDialog(false);
    };

    return (
        <>
            <Helmet>
                <title>Kına Sepeti - Personalized Wedding and Henna Gifts</title>
                <meta
                    name="description"
                    content="Find unique and personalized products for weddings and henna nights at KınaSepeti! Add names, dates, and custom designs to create unforgettable memories."
                />
                <meta name="keywords" content={keywords} />
                <link
                    rel="canonical"
                    href={`${window.location.origin}${window.location.pathname}`}
                />
            </Helmet>

            <AppBar position="relative" style={{ backgroundColor: 'white' }}>
                <Toolbar>
                    {/* Mobile Menu Button */}
                    {isMobile && (
                        <IconButton
                            edge="start"
                            aria-label="menu"
                            style={{ color: '#5D4037' }}
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

                    {/* Brand Name - Desktop */}
                    {!isMobile && (
                        <Typography
                            variant="h1"
                            component="h1"
                            onClick={() => handleNavigation('/')}
                            style={{
                                cursor: 'pointer',
                                color: '#8B0000',
                                fontFamily: "'Dancing Script', cursive",
                                fontSize: '2.5rem',
                                fontWeight: 700,
                                letterSpacing: '0.03em',
                                lineHeight: 1.2,
                                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                            }}
                        >
                            Kınasepeti
                        </Typography>
                    )}

                    {/* Brand Name - Mobile */}
                    {isMobile && (
                        <Typography
                            variant="h1"
                            component="h1"
                            onClick={() => handleNavigation('/')}
                            style={{
                                cursor: 'pointer',
                                color: '#8B0000',
                                fontFamily: "'Dancing Script', cursive",
                                fontSize: '2rem',
                                fontWeight: 500,
                                letterSpacing: '0.03em',
                                lineHeight: 1.2,
                                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                            }}
                        >
                            Kınasepeti
                        </Typography>
                    )}

                    {/* Desktop Menu Links */}
                    {!isMobile && (
                        <>
                            <NavLink to="/search" className="nav-link">
                                <img
                                    src={SearchImage}
                                    alt="Search events"
                                    style={{ cursor: 'pointer' }}
                                />
                            </NavLink>
                            <ActivitySubHeader />
                            {/* NEW Section for Articles */}
                            <NavLink to="/articles" className="nav-link">
                                {t('Articles')}
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

                    <Box flexGrow={1} />

                    {/* Cart Icon */}
                    <IconButton
                        aria-label="cart"
                        sx={{
                            color: 'black',
                            marginLeft: '10px',
                            '&:hover': { color: '#8B0000' },
                        }}
                        onClick={() => handleNavigation('/cart')}
                    >
                        <ShoppingBagOutlinedIcon sx={{ fontSize: 30 }} />
                    </IconButton>

                    {/* Login / User Menu */}
                    {!isLoggedIn ? (
                        <>
                            <IconButton
                                aria-label="login"
                                sx={{ color: 'black' }}
                                onClick={handleOpenLoginDialog}
                            >
                                <LoginIcon />
                            </IconButton>
                        </>
                    ) : (
                        <div>
                            <Avatar
                                sx={{
                                    bgcolor: 'grey.300',
                                    color: 'blue',
                                    fontSize: '1rem',
                                    marginLeft: '8px',
                                    border: '2px solid',
                                    borderColor: 'primary.main',
                                }}
                                onClick={handleMenuClick}
                            >
                                {username[0]?.toUpperCase()}
                            </Avatar>

                            <Menu
                                anchorEl={anchorEl}
                                keepMounted
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                            >
                                <MenuItem onClick={handleFetchFavorites}>Favoriler</MenuItem>
                                <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
                            </Menu>
                        </div>
                    )}
                </Toolbar>

                {/* Mobile Drawer */}
                {isMobile && (
                    <Drawer
                        anchor="left"
                        open={mobileMenuOpen}
                        onClose={() => setMobileMenuOpen(false)}
                        sx={{
                            '& .MuiDrawer-paper': { width: { xs: '50%', sm: '400px' } },
                        }}
                    >
                        <List>
                            {/* Drawer Brand Name */}
                            <Typography
                                variant="h1"
                                component="h1"
                                onClick={() => handleNavigation('/')}
                                style={{
                                    cursor: 'pointer',
                                    color: '#8B0000',
                                    fontFamily: "'Dancing Script', cursive",
                                    fontSize: '2rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.03em',
                                    lineHeight: 1.2,
                                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                                    paddingLeft: '16px',
                                }}
                            >
                                Kınasepeti
                            </Typography>

                            <ListItem button onClick={() => handleNavigation('/search')}>
                                <Box display="flex" alignItems="center">
                                    <i className="fas fa-search"></i>
                                    <ListItemText
                                        primary={t('Search')}
                                        primaryTypographyProps={{
                                            style: { fontSize: '1.2rem', marginLeft: '10px' },
                                        }}
                                    />
                                </Box>
                            </ListItem>

                            <ActivitySubHeaderMobile />
                            <ListItem button onClick={() => handleNavigation('/articles')}>
                                <ListItemText
                                    primary={t('Articles')}
                                    primaryTypographyProps={{ style: { fontSize: '1.2rem' } }}
                                />
                            </ListItem>

                            <ListItem button onClick={() => handleNavigation('/about-us')}>
                                <ListItemText
                                    primary={t('How it works')}
                                    primaryTypographyProps={{ style: { fontSize: '1.2rem' } }}
                                />
                            </ListItem>
                            <ListItem button onClick={() => handleNavigation('/privacy-policy')}>
                                <ListItemText
                                    primary={t('Privacy Policy')}
                                    primaryTypographyProps={{ style: { fontSize: '1.2rem' } }}
                                />
                            </ListItem>
                            <ListItem button onClick={() => handleNavigation('/contact-us')}>
                                <ListItemText
                                    primary={t('Contact Us')}
                                    primaryTypographyProps={{ style: { fontSize: '1.2rem' } }}
                                />
                            </ListItem>

                            {/* NEW "Articles" link in mobile menu */}


                            {/* Language Switch */}
                            <nav>
                                <Button color="primary" onClick={() => changeLanguage('en')}>
                                    EN
                                </Button>
                                <Button color="primary" onClick={() => changeLanguage('tr')}>
                                    TR
                                </Button>
                            </nav>
                        </List>
                    </Drawer>
                )}
            </AppBar>

            {/* Register Dialog */}
            <Dialog open={openRegisterDialog} onClose={handleCloseRegisterDialog}>
                <DialogContent>
                    <Register open={openRegisterDialog} handleClose={handleCloseRegisterDialog} />
                </DialogContent>
            </Dialog>

            {/* Login Dialog */}
            <Dialog open={openLoginDialog} onClose={handleCloseLoginDialog}>
                <DialogContent>
                    <Login
                        open={openLoginDialog}
                        handleClose={handleCloseLoginDialog}
                        onLoginSuccess={handleLoginSuccess}
                        handleOpenRegisterDialog={handleOpenRegisterDialog}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
