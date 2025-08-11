import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import './css/Header.css';
import SearchImage from '../images/urunAra.png';
import ProductsSubHeader from '../activity/ProductsSubHeader';
import Login from '../login/Login';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import {
  AppBar,
  Box,
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
  Tooltip,
  Typography,
  Avatar,
  Badge,
} from '@mui/material';
import Register from '../login/Register';
import { useAuth } from '../auth/AuthProvider';
import MenuIcon from '@mui/icons-material/Menu';
import LoginIcon from '@mui/icons-material/Login';
import ProductsSubHeaderMobile from '../activity/ProductsSubHeaderMobile';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

export default function Header() {
  const { isLoggedIn, setIsLoggedIn, username, setUsername } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth <= 1024);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
  const [policiesAnchorEl, setPoliciesAnchorEl] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [cartItemCount, setCartItemCount] = useState(0);

  // Mevcut dil parametresini al
  const currentLang = location.pathname.split('/')[1] || 'tr';

  // Fetch cart item count
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        let count = 0;
        if (isLoggedIn && username) {
          const response = await axios.get(`${baseURL}/cart/${encodeURIComponent(username)}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          count = response.data.reduce((acc, item) => acc + (item.quantity || 0), 0);
        } else {
          const guestToken = localStorage.getItem('guestToken');
          if (guestToken) {
            const response = await axios.get(`${baseURL}/cart/guest`, {
              headers: { 'X-Guest-Token': guestToken },
            });
            count = response.data.reduce((acc, item) => acc + (item.quantity || 0), 0);
          }
        }
        setCartItemCount(count);
      } catch (error) {
        console.error('Error fetching cart count:', error.response?.data || error.message);
        setCartItemCount(0);
      }
    };

    fetchCartCount();
  }, [isLoggedIn, username]);

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    setSelectedLanguage(language);
    const newPath = location.pathname.replace(/^\/(en|tr)/, `/${language}`) || `/${language}`;
    navigate(newPath);
    setLanguageAnchorEl(null);
    if (isMobile || isTablet) setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigation = (path) => {
    navigate(`/${currentLang}${path}`);
    setMobileMenuOpen(false);
    setAnchorEl(null);
    setPoliciesAnchorEl(null);
  };

  const handleFetchFavorites = () => {
    handleNavigation('/users/favorites');
    setAnchorEl(null);
  };

  const handleMyOrders = () => {
    handleNavigation('/my-orders');
    setAnchorEl(null);
  };

  // Register dialog
  const handleOpenRegisterDialog = () => setOpenRegisterDialog(true);
  const handleCloseRegisterDialog = () => setOpenRegisterDialog(false);

  // Login dialog
  const handleOpenLoginDialog = () => {
    setOpenLoginDialog(true);
    setAnchorEl(null);
  };
  const handleCloseLoginDialog = () => setOpenLoginDialog(false);

  // User menu
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Language menu
  const handleLanguageMenuClick = (event) => {
    setLanguageAnchorEl(event.currentTarget);
  };
  const handleLanguageMenuClose = () => {
    setLanguageAnchorEl(null);
  };

  // Policies menu
  const handlePoliciesMenuOpen = (event) => {
    setPoliciesAnchorEl(event.currentTarget);
  };
  const handlePoliciesMenuClose = () => {
    setPoliciesAnchorEl(null);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUsername('');
    setCartItemCount(0); // Reset cart count on logout
    handleMenuClose();
    handleNavigation('/');
  };

  const handleLoginSuccess = (data) => {
    console.log('Login successful with data:', data);
    setIsLoggedIn(true);
    setUsername(data.email || ''); // Assuming login response includes email
    setOpenLoginDialog(false);
  };

  return (
      <>
        <Helmet>
          <title>{t('site_title')}</title>
          <meta name="description" content={t('site_description')} />
          <meta name="keywords" content={t('site_keywords')} />
          <link
              rel="canonical"
              href={`${window.location.origin}/${currentLang}${location.pathname.replace(/^\/(en|tr)/, '')}`}
          />
          <link
              rel="alternate"
              hreflang="tr"
              href={`${window.location.origin}/tr${location.pathname.replace(/^\/(en|tr)/, '')}`}
          />
          <link
              rel="alternate"
              hreflang="en"
              href={`${window.location.origin}/en${location.pathname.replace(/^\/(en|tr)/, '')}`}
          />
          <link
              rel="alternate"
              hreflang="x-default"
              href={`${window.location.origin}/tr${location.pathname.replace(/^\/(en|tr)/, '')}`}
          />
        </Helmet>

        <AppBar position="relative" style={{ backgroundColor: 'white' }}>
          <Toolbar sx={{ px: { xs: 1, sm: 2, md: 3 }, minHeight: { xs: '56px', sm: '64px' } }}>
            {(isMobile || isTablet) && (
                <IconButton
                    edge="start"
                    aria-label="menu"
                    style={{ color: '#5D4037', marginRight: '8px' }}
                    onClick={() => setMobileMenuOpen(true)}
                >
                  <MenuIcon />
                </IconButton>
            )}

            {/* Brand Name - Desktop */}
            {!isMobile && !isTablet && (
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

            {/* Brand Name - Mobile & Tablet */}
            {(isMobile || isTablet) && (
                <Typography
                    variant="h1"
                    component="h1"
                    onClick={() => handleNavigation('/')}
                    style={{
                      cursor: 'pointer',
                      color: '#8B0000',
                      fontFamily: "'Dancing Script', cursive",
                      fontSize: isTablet ? '2.2rem' : '1.8rem',
                      fontWeight: isTablet ? 600 : 500,
                      letterSpacing: '0.03em',
                      lineHeight: 1.2,
                      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                      flexGrow: 1,
                    }}
                >
                  Kınasepeti
                </Typography>
            )}

            {!isMobile && !isTablet && (
                <>
                  <IconButton
                      aria-label="Instagram"
                      href="https://www.instagram.com/knc_kina_organizasyon"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'black',
                        marginLeft: '10px',
                        '&:hover': { color: '#8B0000' },
                      }}
                  >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        style={{ marginRight: '10px' }}
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
                  <NavLink to={`/${currentLang}/search`} className="nav-link">
                    <img src={SearchImage} alt="Search events" style={{ cursor: 'pointer' }} />
                  </NavLink>
                  <ProductsSubHeader />
                  <NavLink to={`/${currentLang}/articles`} className="nav-link" style={{ fontFamily: "'Lora', serif" }}>
                    {t('Articles')}
                  </NavLink>
                  <NavLink to={`/${currentLang}/about-us`} className="nav-link" style={{ fontFamily: "'Lora', serif" }}>
                    {t('How it works')}
                  </NavLink>
                  <NavLink
                      to="#"
                      className="nav-link"
                      onMouseEnter={handlePoliciesMenuOpen}
                  >
                    {t('Policies')}
                  </NavLink>
                  <Menu
                      anchorEl={policiesAnchorEl}
                      keepMounted
                      open={Boolean(policiesAnchorEl)}
                      onClose={handlePoliciesMenuClose}
                      onMouseLeave={handlePoliciesMenuClose}
                      PaperProps={{
                        sx: {
                          border: '1px solid #8B0000',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                          borderRadius: '8px',
                          bgcolor: 'white',
                          '& .MuiMenuItem-root': {
                            color: 'black',
                            fontFamily: "'Lora', serif !important",
                            padding: '8px 16px',
                            '&:hover': {
                              bgcolor: '#f5f5f5',
                              color: '#8B0000',
                            },
                          },
                        },
                      }}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                  >
                    <MenuItem onClick={() => handleNavigation('/privacy-policy')}>
                      <NavLink to={`/${currentLang}/privacy-policy`} className="nav-link">
                        {t('Privacy Policy')}
                      </NavLink>
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigation('/shipping-policy')}>
                      <NavLink to={`/${currentLang}/shipping-policy`} className="nav-link">
                        {t('shipping_policy.title')}
                      </NavLink>
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigation('/return-policy')}>
                      <NavLink to={`/${currentLang}/return-policy`} className="nav-link">
                        {t('return_policy.title')}
                      </NavLink>
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigation('/sales-agreement')}>
                      <NavLink to={`/${currentLang}/sales-agreement`} className="nav-link">
                        {t('sales_agreement.title')}
                      </NavLink>
                    </MenuItem>
                  </Menu>
                  <NavLink to={`/${currentLang}/contact-us`} className="nav-link">
                    {t('Contact Us')}
                  </NavLink>
                </>
            )}

            <Box flexGrow={1} />

            {/* Language Selector - Compact for tablet */}
            {(!isMobile && !isTablet) && (
                <Tooltip title="Select Language">
                  <IconButton
                      onClick={handleLanguageMenuClick}
                      aria-label="Select Language"
                      sx={{
                        padding: '4px',
                        marginLeft: '10px',
                        '&:hover': { backgroundColor: 'rgba(139, 0, 0, 0.1)' },
                      }}
                  >
                    <img
                        src={selectedLanguage === 'en' ? 'https://flagcdn.com/24x18/gb.png' : 'https://flagcdn.com/24x18/tr.png'}
                        alt={selectedLanguage === 'en' ? 'English' : 'Türkçe'}
                        style={{ width: '24px', height: '24px' }}
                    />
                  </IconButton>
                </Tooltip>
            )}

            {/* Cart Icon with Count */}
            <IconButton
                aria-label="cart"
                sx={{
                  color: 'black',
                  marginLeft: { xs: '5px', sm: '10px' },
                  '&:hover': { color: '#8B0000' },
                }}
                onClick={() => handleNavigation('/cart')}
            >
              <Badge badgeContent={cartItemCount} color="error">
                <ShoppingBagOutlinedIcon sx={{ fontSize: { xs: 24, sm: 30 } }} />
              </Badge>
            </IconButton>

            {/* Avatar with Menu - Compact for tablet */}
            <Tooltip title={isLoggedIn ? username : t('user_menu')}>
              <IconButton
                  onClick={handleMenuClick}
                  aria-label="user menu"
                  sx={{ marginLeft: { xs: '5px', sm: '10px' } }}
              >
                <Avatar
                    sx={{
                      bgcolor: 'white',
                      color: 'black',
                      width: { xs: 32, sm: 40 },
                      height: { xs: 32, sm: 40 },
                      border: '1px solid #8B0000',
                    }}
                >
                  {username ? (
                      username.charAt(0).toUpperCase()
                  ) : (
                      <LoginIcon sx={{ color: 'black', fontSize: { xs: 18, sm: 24 } }} />
                  )}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    border: '1px solid #8B0000', // Matches Avatar border
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Subtle shadow
                    bgcolor: 'white', // White background for menu
                    '& .MuiMenuItem-root': {
                      color: 'black',
                      fontFamily: "'Lora', serif !important",
                      padding: '8px 16px',
                      '&:hover': {
                        bgcolor: '#f5f5f5', // Light gray hover effect
                        color: '#8B0000', // Optional: red tint on hover to match theme
                      },
                    },
                  },
                }}
            >
              <MenuItem onClick={handleFetchFavorites}>
                <Typography sx={{ fontFamily: "'Lora', serif", color: 'black' }}>
                  {t('Favorites')}
                </Typography>
              </MenuItem>
              {isLoggedIn ? (
                  <>
                    <MenuItem onClick={handleMyOrders}>
                      <Typography sx={{ fontFamily: "'Lora', serif", color: 'black' }}>
                        {t('My Orders')}
                      </Typography>
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <Typography sx={{ fontFamily: "'Lora', serif", color: 'black' }}>
                        {t('Logout')}
                      </Typography>
                    </MenuItem>
                  </>
              ) : (
                  <MenuItem onClick={handleOpenLoginDialog}>
                    <Typography sx={{ fontFamily: "'Lora', serif", color: 'black' }}>
                      {t('Login')}
                    </Typography>
                  </MenuItem>
              )}
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Mobile & Tablet Drawer */}
        {(isMobile || isTablet) && (
            <Drawer
                anchor="left"
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                sx={{
                  '& .MuiDrawer-paper': {
                    width: {
                      xs: '70%',
                      sm: isTablet ? '50%' : '400px'
                    }
                  },
                }}
            >
              <List sx={{ padding: '16px' }}>
                {/* Drawer Brand Name */}
                <Typography
                    variant="h1"
                    component="h1"
                    onClick={() => handleNavigation('/')}
                    style={{
                      cursor: 'pointer',
                      color: '#8B0000',
                      fontFamily: "'Dancing Script', cursive",
                      fontSize: '1.8rem',
                      fontWeight: 700,
                      letterSpacing: '0.03em',
                      lineHeight: 1.2,
                      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                      paddingBottom: '16px',
                    }}
                >
                  Kınasepeti
                </Typography>

                {/* Instagram Link */}
                <ListItem
                    button
                    component="a"
                    href="https://www.instagram.com/knc_kina_organizasyon"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                  <Box display="flex" alignItems="center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        style={{ marginRight: '10px' }}
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
                    <ListItemText primary="Instagram" />
                  </Box>
                </ListItem>

                {/* Search Link */}
                <ListItem button onClick={() => handleNavigation('/search')}>
                  <Box display="flex" alignItems="center">
                    <i className="fas fa-search" style={{ marginRight: '10px' }}></i>
                    <ListItemText primary={t('Search')} />
                  </Box>
                </ListItem>

                {/* Products Submenu */}
                <ProductsSubHeaderMobile />

                {/* Articles */}
                <ListItem button onClick={() => handleNavigation('/articles')}>
                  <ListItemText primary={t('Articles')} />
                </ListItem>

                {/* About Us */}
                <ListItem button onClick={() => handleNavigation('/about-us')}>
                  <ListItemText primary={t('How it works')} />
                </ListItem>

                {/* Policies Submenu */}
                <ListItem button onClick={handlePoliciesMenuOpen}>
                  <ListItemText primary={t('Policies')} />
                </ListItem>
                <Menu
                    anchorEl={policiesAnchorEl}
                    keepMounted
                    open={Boolean(policiesAnchorEl)}
                    onClose={handlePoliciesMenuClose}
                    PaperProps={{
                      sx: {
                        border: '1px solid #8B0000',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        borderRadius: '8px',
                        bgcolor: 'white',
                        '& .MuiMenuItem-root': {
                          color: 'black',
                          fontFamily: "'Lora', serif !important",
                          padding: '8px 16px',
                          '&:hover': {
                            bgcolor: '#f5f5f5',
                            color: '#8B0000',
                          },
                        },
                      },
                    }}
                >
                  <MenuItem onClick={() => handleNavigation('/privacy-policy')}>
                    <NavLink to={`/${currentLang}/privacy-policy`} className="nav-link">
                      {t('Privacy Policy')}
                    </NavLink>
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigation('/shipping-policy')}>
                    <NavLink to={`/${currentLang}/shipping-policy`} className="nav-link">
                      {t('shipping_policy.title')}
                    </NavLink>
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigation('/return-policy')}>
                    <NavLink to={`/${currentLang}/return-policy`} className="nav-link">
                      {t('return_policy.title')}
                    </NavLink>
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigation('/sales-agreement')}>
                    <NavLink to={`/${currentLang}/sales-agreement`} className="nav-link">
                      {t('sales_agreement.title')}
                    </NavLink>
                  </MenuItem>
                </Menu>

                {/* Contact Us */}
                <ListItem button onClick={() => handleNavigation('/contact-us')}>
                  <ListItemText primary={t('Contact Us')} />
                </ListItem>

                {/* Favorites */}
                <ListItem button onClick={handleFetchFavorites}>
                  <ListItemText primary={t('Favorites')} />
                </ListItem>

                {isMobile && isLoggedIn ? (
                    <>
                      <ListItem button onClick={handleMyOrders}>
                        <ListItemText primary={t('My Orders')} />
                      </ListItem>
                      <ListItem button onClick={handleLogout}>
                        <ListItemText primary={t('Logout')} />
                      </ListItem>
                    </>
                ) : (
                    <ListItem button onClick={handleOpenLoginDialog}>
                      <ListItemText primary={t('Login')} />
                    </ListItem>
                )}

                <ListItem>
                  <Tooltip title={t('select_language')}>
                    <IconButton
                        onClick={handleLanguageMenuClick}
                        aria-label={t('select_language')}
                        sx={{
                          padding: '4px',
                          border: '2px solid #8B0000',
                          '&:hover': { backgroundColor: 'rgba(139, 0, 0, 0.1)' },
                        }}
                    >
                      <img
                          src={selectedLanguage === 'en' ? 'https://flagcdn.com/24x18/gb.png' : 'https://flagcdn.com/24x18/tr.png'}
                          alt={selectedLanguage === 'en' ? 'English' : 'Türkçe'}
                          style={{ width: '24px', height: '24px' }}
                      />
                    </IconButton>
                  </Tooltip>
                  <Menu
                      anchorEl={languageAnchorEl}
                      open={Boolean(languageAnchorEl)}
                      onClose={handleLanguageMenuClose}
                      PaperProps={{
                        sx: {
                          border: '1px solid #8B0000',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                          borderRadius: '8px',
                          bgcolor: 'white',
                          '& .MuiMenuItem-root': {
                            color: 'black',
                            fontFamily: "'Lora', serif !important",
                            padding: '8px 16px',
                            '&:hover': {
                              bgcolor: '#f5f5f5',
                              color: '#8B0000',
                            },
                          },
                        },
                      }}
                  >
                    <MenuItem onClick={() => changeLanguage('en')}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src="https://flagcdn.com/24x18/gb.png" alt="English" style={{ width: '24px', height: '24px' }} />
                        <Typography>
                          English
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem onClick={() => changeLanguage('tr')}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src="https://flagcdn.com/24x18/tr.png" alt="Türkçe" style={{ width: '24px', height: '24px' }} />
                        <Typography>
                          Türkçe
                        </Typography>
                      </Box>
                    </MenuItem>
                  </Menu>
                </ListItem>
              </List>
            </Drawer>
        )}

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

