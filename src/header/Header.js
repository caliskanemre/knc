import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import './css/Header.css';
import SearchImage from '../images/urunAra.png';
import ProductsSubHeader from '../activity/ProductsSubHeader';
import Login from '../login/Login';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import FavoriteIcon from '@mui/icons-material/FavoriteBorder';
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
} from '@mui/material';
import Register from '../login/Register';
import LoginIcon from '@mui/icons-material/Login';
import { useAuth } from '../auth/AuthProvider';
import MenuIcon from '@mui/icons-material/Menu';
import ProductsSubHeaderMobile from '../activity/ProductsSubHeaderMobile';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

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
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  // Mevcut dil parametresini al
  const currentLang = location.pathname.split('/')[1] || 'tr';

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    setSelectedLanguage(language);
    const newPath = location.pathname.replace(/^\/(en|tr)/, `/${language}`) || `/${language}`;
    navigate(newPath);
    setLanguageAnchorEl(null);
    if (isMobile) setMobileMenuOpen(false);
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

  // Language menu
  const handleLanguageMenuClick = (event) => {
    setLanguageAnchorEl(event.currentTarget);
  };
  const handleLanguageMenuClose = () => {
    setLanguageAnchorEl(null);
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
                      fontSize: '1.8rem', // Slightly smaller for mobile
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
                  <NavLink to={`/${currentLang}/articles`} className="nav-link" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {t('Articles')}
                  </NavLink>
                  <NavLink to={`/${currentLang}/about-us`} className="nav-link" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {t('How it works')}
                  </NavLink>
                  <NavLink to={`/${currentLang}/privacy-policy`} className="nav-link" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {t('Privacy Policy')}
                  </NavLink>
                  <NavLink to={`/${currentLang}/shipping-policy`} className="nav-link" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {t('shipping_policy.title')}
                  </NavLink>
                  <NavLink to={`/${currentLang}/return-policy`} className="nav-link" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {t('return_policy.title')}
                  </NavLink>
                  <NavLink to={`/${currentLang}/sales-agreement`} className="nav-link" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {t('sales_agreement.title')}
                  </NavLink>
                  <NavLink to={`/${currentLang}/contact-us`} className="nav-link" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {t('Contact Us')}
                  </NavLink>
                  {/* Language Switch - Desktop */}
                  <Tooltip title={t('select_language')}>
                    <IconButton
                        onClick={handleLanguageMenuClick}
                        aria-label={t('select_language')}
                        sx={{
                          padding: '4px',
                          marginLeft: '16px',
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
                        },
                      }}
                  >
                    <MenuItem onClick={() => changeLanguage('en')}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src="https://flagcdn.com/24x18/gb.png" alt="English" style={{ width: '24px', height: '24px' }} />
                        <Typography sx={{ fontFamily: "'Playfair Display', serif", color: '#5D4037' }}>
                          {t('English')}
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem onClick={() => changeLanguage('tr')}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src="https://flagcdn.com/24x18/tr.png" alt="Türkçe" style={{ width: '24px', height: '24px' }} />
                        <Typography sx={{ fontFamily: "'Playfair Display', serif", color: '#5D4037' }}>
                          {t('Türkçe')}
                        </Typography>
                      </Box>
                    </MenuItem>
                  </Menu>
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

            {/* Login/Heart Icon */}
            {false ? (
                <IconButton
                    aria-label="login"
                    sx={{ color: 'black' }}
                    onClick={handleOpenLoginDialog}
                >
                  <LoginIcon />
                </IconButton>
            ) : (
                <IconButton
                    aria-label="favorites"
                    sx={{
                      color: 'black',
                      marginLeft: '8px',
                      '&:hover': { color: '#8B0000' },
                    }}
                    onClick={handleFetchFavorites}
                >
                  <FavoriteIcon sx={{ fontSize: 30 }} />
                </IconButton>
            )}
          </Toolbar>
        </AppBar>

        {/* Mobile Drawer */}
        {isMobile && (
            <Drawer
                anchor="left"
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                sx={{
                  '& .MuiDrawer-paper': { width: { xs: '70%', sm: '400px' } },
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
                    <ListItemText
                        primary="Instagram"
                        primaryTypographyProps={{ style: { fontSize: '1.1rem' } }}
                    />
                  </Box>
                </ListItem>

                {/* Search Link */}
                <ListItem button onClick={() => handleNavigation('/search')}>
                  <Box display="flex" alignItems="center">
                    <i className="fas fa-search" style={{ marginRight: '10px' }}></i>
                    <ListItemText
                        primary={t('Search')}
                        primaryTypographyProps={{
                          style: { fontSize: '1.1rem' },
                        }}
                    />
                  </Box>
                </ListItem>

                {/* Products Submenu */}
                <ProductsSubHeaderMobile />

                {/* Articles */}
                <ListItem button onClick={() => handleNavigation('/articles')}>
                  <ListItemText
                      primary={t('Articles')}
                      primaryTypographyProps={{ style: { fontSize: '1.1rem' } }}
                  />
                </ListItem>

                {/* About Us */}
                <ListItem button onClick={() => handleNavigation('/about-us')}>
                  <ListItemText
                      primary={t('How it works')}
                      primaryTypographyProps={{ style: { fontSize: '1.1rem' } }}
                  />
                </ListItem>

                {/* Privacy Policy */}
                <ListItem button onClick={() => handleNavigation('/privacy-policy')}>
                  <ListItemText
                      primary={t('Privacy Policy')}
                      primaryTypographyProps={{ style: { fontSize: '1.1rem' } }}
                  />
                </ListItem>

                {/* Shipping Policy */}
                <ListItem button onClick={() => handleNavigation('/shipping-policy')}>
                  <ListItemText
                      primary={t('shipping_policy.title')}
                      primaryTypographyProps={{ style: { fontSize: '1.1rem' } }}
                  />
                </ListItem>

                {/* Return Policy */}
                <ListItem button onClick={() => handleNavigation('/return-policy')}>
                  <ListItemText
                      primary={t('return_policy.title')}
                      primaryTypographyProps={{ style: { fontSize: '1.1rem' } }}
                  />
                </ListItem>

                {/* Sales Agreement */}
                <ListItem button onClick={() => handleNavigation('/sales-agreement')}>
                  <ListItemText
                      primary={t('sales_agreement.title')}
                      primaryTypographyProps={{ style: { fontSize: '1.1rem' } }}
                  />
                </ListItem>

                {/* Contact Us */}
                <ListItem button onClick={() => handleNavigation('/contact-us')}>
                  <ListItemText
                      primary={t('Contact Us')}
                      primaryTypographyProps={{ style: { fontSize: '1.1rem' } }}
                  />
                </ListItem>

                {/* Language Switch - Mobile */}
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
                        },
                      }}
                  >
                    <MenuItem onClick={() => changeLanguage('en')}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src="https://flagcdn.com/24x18/gb.png" alt="English" style={{ width: '24px', height: '24px' }} />
                        <Typography sx={{ fontFamily: "'Playfair Display', serif", color: '#5D4037' }}>
                          {t('English')}
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem onClick={() => changeLanguage('tr')}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src="https://flagcdn.com/24x18/tr.png" alt="Türkçe" style={{ width: '24px', height: '24px' }} />
                        <Typography sx={{ fontFamily: "'Playfair Display', serif", color: '#5D4037' }}>
                          {t('Türkçe')}
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