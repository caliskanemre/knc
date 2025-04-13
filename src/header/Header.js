import React, {useEffect, useState} from 'react';
import {NavLink, useLocation, useNavigate} from 'react-router-dom';
import './css/Header.css';
import SearchImage from "../images/urunAra.png";
import ProductsSubHeader from "../activity/ProductsSubHeader";
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
import LoginIcon from '@mui/icons-material/Login';
import {useAuth} from "../auth/AuthProvider";
import MenuIcon from '@mui/icons-material/Menu';
import ProductsSubHeaderMobile from "../activity/ProductsSubHeaderMobile";
import {Helmet} from "react-helmet";
import {useTranslation} from "react-i18next";

const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

export default function Header() {
  const { isLoggedIn, setIsLoggedIn, username, setUsername } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  // Mevcut dil parametresini al
  const currentLang = location.pathname.split('/')[1] || 'tr';

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    setSelectedLanguage(language);
    // Mevcut yolu dil önekiyle güncelle
    const newPath = location.pathname.replace(/^\/(en|tr)/, `/${language}`) || `/${language}`;
    navigate(newPath);
  };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

  const handleNavigation = (path) => {
    navigate(`/${currentLang}${path}`);
    setMobileMenuOpen(false);
  };

  const handleFetchFavorites = async () => {
    try {
      navigate(`/${currentLang}/users/favorites`);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    }
  };

  const handleMyOrders = async () => {
    try {
      navigate(`/${currentLang}/my-orders`);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
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
        <title>{t('site_title')}</title>
        <meta name="description" content={t('site_description')} />
        <meta name="keywords" content={t('site_keywords')} />
        <link rel="canonical" href={`${window.location.origin}/${currentLang}${location.pathname.replace(/^\/(en|tr)/, '')}`} />
        <link rel="alternate" hreflang="tr" href={`${window.location.origin}/tr${location.pathname.replace(/^\/(en|tr)/, '')}`} />
        <link rel="alternate" hreflang="en" href={`${window.location.origin}/en${location.pathname.replace(/^\/(en|tr)/, '')}`} />
        <link rel="alternate" hreflang="x-default" href={`${window.location.origin}/tr${location.pathname.replace(/^\/(en|tr)/, '')}`} />
      </Helmet>

      <AppBar position="relative" style={{ backgroundColor: 'white' }}>
        <Toolbar>
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

          {!isMobile && (
            <>
              <NavLink to={`/${currentLang}/search`} className="nav-link">
                <img src={SearchImage} alt="Search events" style={{ cursor: 'pointer' }} />
              </NavLink>
              <ProductsSubHeader />
              <NavLink to={`/${currentLang}/articles`} className="nav-link" style={{ fontFamily: "'Playfair Display', serif" }}>
                {t('Articles')}
              </NavLink>
              <NavLink to={`/${currentLang}/about-us`} className="nav-link" style={{ fontFamily: "'Playfair Display', serif" }}>
                {t('How it works')}
              </NavLink>
              <NavLink to={`/${currentLang}/privacy-policy`} className="nav-link" style={{ fontFamily: "'Playfair Display', serif" }}>
                {t('Privacy Policy')}
              </NavLink>
              <NavLink to={`/${currentLang}/contact-us`} className="nav-link" style={{ fontFamily: "'Playfair Display', serif" }}>
                {t('Contact Us')}
              </NavLink>
            </>
          )}


                    {isMobile && (
                        <Drawer anchor="left" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} sx={{ '& .MuiDrawer-paper': { width: { xs: '50%', sm: '400px' } } }}>
                            <List>
                                <Typography variant="h1" component="h1" onClick={() => handleNavigation('/')} style={{ /* Mevcut stil */ }}>
                                    Kınasepeti
                                </Typography>
                                <ListItem button onClick={() => handleNavigation('/articles')}>
                                    <ListItemText
                                        primary={t('Articles')}
                                        primaryTypographyProps={{ style: { fontFamily: "'Playfair Display', serif", fontSize: '1.2rem' } }}
                                    />
                                </ListItem>
                                {/* Diğer mobil menü öğeleri benzer şekilde güncellenir */}
                            </List>
                        </Drawer>
                    )}

                    <Box flexGrow={1}/>

                    <IconButton
                        aria-label="Instagram"
                        href="https://www.instagram.com/knc_kina_organizasyon" // Kendi Instagram URL'nizi ekleyin
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            color: 'black',
                            marginLeft: '10px',
                            '&:hover': { color: '#8B0000' },
                        }}
                    >
                        {/* Instagram SVG İkonu */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            style={{ marginRight: '10px' }} // İkon ve metin arasında boşluk
                        >
                            <defs>
                                <linearGradient id="instaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#feda75' }} />
                                    <stop offset="20%" style={{ stopColor: '#fa7e1e' }} />
                                    <stop offset="40%" style={{ stopColor: '#d62976' }} />
                                    <stop offset="60%" style={{ stopColor: '#962fbf' }} />
                                    <stop offset="100%" style={{ stopColor: '#4f5bd5' }} />
                                </linearGradient>
                            </defs>
                            <path
                                fill="url(#instaGradient)"
                                d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.326 3.608 1.301.975.975 1.24 2.242 1.301 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.326 2.633-1.301 3.608-.975.975-2.242 1.24-3.608 1.301-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.326-3.608-1.301-.975-.975-1.24-2.242-1.301-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.326-2.633 1.301-3.608.975-.975 2.242-1.24 3.608-1.301 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.67.014-4.947.072-1.277.058-2.153.28-2.92.599-.79.33-1.454.794-2.118 1.458-.664.664-1.128 1.328-1.458 2.118-.319.767-.541 1.643-.599 2.92-.058 1.277-.072 1.688-.072 4.947s.014 3.67.072 4.947c.058 1.277.28 2.153.599 2.92.33.79.794 1.454 1.458 2.118.664.664 1.328 1.128 2.118 1.458.767.319 1.643.541 2.92.599 1.277.058 1.688.072 4.947.072s3.67-.014 4.947-.072c1.277-.058 2.153-.28 2.92-.599.79-.33 1.454-.794 2.118-1.458.664-.664 1.128-1.328 1.458-2.118.319-.767.541-1.643.599-2.92.058-1.277.072-1.688.072-4.947s-.014-3.67-.072-4.947c-.058-1.277-.28-2.153-.599-2.92-.33-.79-.794-1.454-1.458-2.118-.664-.664-1.328-1.128-2.118-1.458-.767-.319-1.643-.541-2.92-.599-1.277-.058-1.688-.072-4.947-.072z"
                            />
                            <path
                                fill="url(#instaGradient)"
                                d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z"
                            />
                            <circle fill="url(#instaGradient)" cx="18.406" cy="5.594" r="1.44" />
                        </svg>
                    </IconButton>

                    {/* Cart Icon */}
                    <IconButton
                        aria-label="cart"
                        sx={{
                            color: 'black',
                            marginLeft: '10px',
                            '&:hover': {color: '#8B0000'},
                        }}
                        onClick={() => handleNavigation('/cart')}
                    >
                        <ShoppingBagOutlinedIcon sx={{fontSize: 30}}/>
                    </IconButton>

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
                src={'/images/default-avatar.png'}
              ></Avatar>
              <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMyOrders}>{t('My Orders')}</MenuItem>
                <MenuItem onClick={handleFetchFavorites}>{t('Favorites')}</MenuItem>
                <MenuItem onClick={handleLogout}>{t('Logout')}</MenuItem>
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
                            '& .MuiDrawer-paper': {width: {xs: '50%', sm: '400px'}},
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
                            <ListItem
                                button
                                component="a"
                                href="https://www.instagram.com/knc_kina_organizasyon" // Kendi Instagram URL'nizi ekleyin
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Box display="flex" alignItems="center">
                                    {/* Renkli Instagram SVG İkonu */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        style={{ marginRight: '10px' }} // İkon ve metin arasında boşluk
                                    >
                                        <defs>
                                            <linearGradient id="instaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" style={{ stopColor: '#feda75' }} />
                                                <stop offset="20%" style={{ stopColor: '#fa7e1e' }} />
                                                <stop offset="40%" style={{ stopColor: '#d62976' }} />
                                                <stop offset="60%" style={{ stopColor: '#962fbf' }} />
                                                <stop offset="100%" style={{ stopColor: '#4f5bd5' }} />
                                            </linearGradient>
                                        </defs>
                                        <path
                                            fill="url(#instaGradient)"
                                            d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.326 3.608 1.301.975.975 1.24 2.242 1.301 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.326 2.633-1.301 3.608-.975.975-2.242 1.24-3.608 1.301-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.326-3.608-1.301-.975-.975-1.24-2.242-1.301-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.326-2.633 1.301-3.608.975-.975 2.242-1.24 3.608-1.301 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.67.014-4.947.072-1.277.058-2.153.28-2.92.599-.79.33-1.454.794-2.118 1.458-.664.664-1.128 1.328-1.458 2.118-.319.767-.541 1.643-.599 2.92-.058 1.277-.072 1.688-.072 4.947s.014 3.67.072 4.947c.058 1.277.28 2.153.599 2.92.33.79.794 1.454 1.458 2.118.664.664 1.328 1.128 2.118 1.458.767.319 1.643.541 2.92.599 1.277.058 1.688.072 4.947.072s3.67-.014 4.947-.072c1.277-.058 2.153-.28 2.92-.599.79-.33 1.454-.794 2.118-1.458.664-.664 1.128-1.328 1.458-2.118.319-.767.541-1.643.599-2.92.058-1.277.072-1.688.072-4.947s-.014-3.67-.072-4.947c-.058-1.277-.28-2.153-.599-2.92-.33-.79-.794-1.454-1.458-2.118-.664-.664-1.328-1.128-2.118-1.458-.767-.319-1.643-.541-2.92-.599-1.277-.058-1.688-.072-4.947-.072z"
                                        />
                                        <path
                                            fill="url(#instaGradient)"
                                            d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z"
                                        />
                                        <circle fill="url(#instaGradient)" cx="18.406" cy="5.594" r="1.44" />
                                    </svg>
                                    <ListItemText
                                        primary="Instagram"
                                        primaryTypographyProps={{ style: { fontSize: '1.2rem' } }}
                                    />
                                </Box>
                            </ListItem>

                            <ListItem button onClick={() => handleNavigation('/search')}>
                                <Box display="flex" alignItems="center">
                                    <i className="fas fa-search"></i>
                                    <ListItemText
                                        primary={t('Search')}
                                        primaryTypographyProps={{
                                            style: {fontSize: '1.2rem', marginLeft: '10px'},
                                        }}
                                    />
                                </Box>
                            </ListItem>

                            <ProductsSubHeaderMobile/>
                            <ListItem button onClick={() => handleNavigation('/articles')}>
                                <ListItemText
                                    primary={t('Articles')}
                                    primaryTypographyProps={{style: {fontSize: '1.2rem'}}}
                                />
                            </ListItem>

                            <ListItem button onClick={() => handleNavigation('/about-us')}>
                                <ListItemText
                                    primary={t('How it works')}
                                    primaryTypographyProps={{style: {fontSize: '1.2rem'}}}
                                />
                            </ListItem>
                            <ListItem button onClick={() => handleNavigation('/privacy-policy')}>
                                <ListItemText
                                    primary={t('Privacy Policy')}
                                    primaryTypographyProps={{style: {fontSize: '1.2rem'}}}
                                />
                            </ListItem>
                            <ListItem button onClick={() => handleNavigation('/contact-us')}>
                                <ListItemText
                                    primary={t('Contact Us')}
                                    primaryTypographyProps={{style: {fontSize: '1.2rem'}}}
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
                    <Register open={openRegisterDialog} handleClose={handleCloseRegisterDialog}/>
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
