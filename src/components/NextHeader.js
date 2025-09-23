import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  ListItemButton,
  ListItemIcon
} from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import Login from '../login/Login';
import { useAuth } from '../auth/AuthProvider';
import SearchImage from '../images/urunAra.png';
import hennaSetIcon from '../images/hennaset.jpg';
import handkerchiefIcon from '../images/mendil.jpg';
import tamborineIcon from '../images/tamborine.jpg';
import veilIcon from '../images/veil.jpg';
import giftIcon from '../images/gift.jpg';
import ornamentIcon from '../images/ornament.jpg';
import souvenirIcon from '../images/souvenir.jpg';

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

export default function NextHeader({ locale = 'tr', defaultLocale = 'tr', asPath = '/' }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { isLoggedIn, username, setIsLoggedIn, setUsername, setToken } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [anchorElProducts, setAnchorElProducts] = useState(null);
  const [anchorElPolicies, setAnchorElPolicies] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fetch cart count on client
  useEffect(() => {
    let cancelled = false;
    const fetchCartCount = async () => {
      if (typeof window === 'undefined') return;
      try {
        let count = 0;
        if (isLoggedIn && username) {
          const token = localStorage.getItem('token') || '';
          const res = await axios.get(`${baseURL}/cart/${encodeURIComponent(username)}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const items = Array.isArray(res.data) ? res.data : [];
          count = items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
        } else {
          const guestToken = localStorage.getItem('guestToken');
          if (guestToken) {
            const res = await axios.get(`${baseURL}/cart/guest`, { headers: { 'X-Guest-Token': guestToken } });
            const items = Array.isArray(res.data) ? res.data : [];
            count = items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
          }
        }
        if (!cancelled) setCartCount(count);
      } catch (e) {
        if (!cancelled) setCartCount(0);
      }
    };
    fetchCartCount();
    return () => { cancelled = true; };
  }, [isLoggedIn, username]);

  const go = (path) => {
    router.push(path, undefined, { locale });
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    setIsLoggedIn(false);
    setUsername('');
    setToken('');
    setCartCount(0);
    setAnchorElUser(null);
    go('/');
  };

  // Kategoriler i18n etiketleriyle
  const categories = [
    { key: 'hennaset', label: t('HennaSet', 'Kına Seti'), icon: hennaSetIcon },
    { key: 'handkerchief', label: t('Handkerchief', 'Mendil'), icon: handkerchiefIcon },
    { key: 'tamborine', label: t('Tambourine', 'Tef'), icon: tamborineIcon },
    { key: 'veil', label: t('Veil', 'Duvak'), icon: veilIcon },
    { key: 'gift', label: t('Gift', 'Hediye'), icon: giftIcon },
    { key: 'ornament', label: t('Ornament', 'Süs'), icon: ornamentIcon },
    { key: 'souvenir', label: t('Souvenir', 'Hediyelik'), icon: souvenirIcon },
  ];

  // Masaüstü menü butonları için ortak stil
  const navBtnSx = {
    color: '#8B0000',
    textTransform: 'none',
    fontFamily: "'Lora', serif",
    fontWeight: 500,
    fontSize: { xs: '0.95rem', md: '1.08rem', lg: '1.16rem' },
    letterSpacing: '0.2px',
    '&:hover': { color: '#660000', bgcolor: 'transparent' }
  };

  const MobileList = (
    <Box sx={{ width: { xs: '68vw', sm: 340 } }} role="presentation" onClick={() => setMobileOpen(false)}>
      <List>
        <ListItem>
          <Typography variant="h6" sx={{ fontFamily: 'Dancing Script, cursive', color: '#8B0000', fontWeight: 700 }}>
            Kınasepeti
          </Typography>
        </ListItem>
        <Divider />
        {/* Language (mobile) */}
        <Link href={asPath} locale="tr" passHref legacyBehavior>
          <ListItemButton component="a">
            <ListItemText primary={locale === 'tr' ? 'Türkçe ✓' : 'Türkçe'} />
          </ListItemButton>
        </Link>
        <Link href={asPath} locale="en" passHref legacyBehavior>
          <ListItemButton component="a">
            <ListItemText primary={locale === 'en' ? 'English ✓' : 'English'} />
          </ListItemButton>
        </Link>
        <Divider />
        <Link href="/products" locale={locale} passHref legacyBehavior>
          <ListItemButton component="a">
            <ListItemText primary={t('Products', 'Ürünler')} />
          </ListItemButton>
        </Link>
        {categories.map((c) => (
          <Link key={c.key} href={{ pathname: '/products', query: { category: c.key } }} locale={locale} passHref legacyBehavior>
            <ListItemButton component="a">
              <Box component="img" src={c.icon?.src || c.icon} alt={c.label} sx={{ width: 20, height: 20, objectFit: 'cover', borderRadius: '3px', mr: 1 }} />
              <ListItemText primary={c.label} sx={{ pl: 0 }} />
            </ListItemButton>
          </Link>
        ))}
        <Divider />
        <Link href="/articles" locale={locale} passHref legacyBehavior>
          <ListItemButton component="a">
            <ListItemText primary={t('Articles', 'Makaleler')} />
          </ListItemButton>
        </Link>
        <Link href="/about-us" locale={locale} passHref legacyBehavior>
          <ListItemButton component="a">
            <ListItemText primary={t('About Us', 'Hakkımızda')} />
          </ListItemButton>
        </Link>
        <Link href="/privacy-policy" locale={locale} passHref legacyBehavior>
          <ListItemButton component="a">
            <ListItemText primary={t('privacy_policy.title', 'Gizlilik Politikası')} />
          </ListItemButton>
        </Link>
        <Link href="/shipping-policy" locale={locale} passHref legacyBehavior>
          <ListItemButton component="a">
            <ListItemText primary={t('shipping_policy.title', 'Kargo Politikası')} />
          </ListItemButton>
        </Link>
        <Link href="/return-policy" locale={locale} passHref legacyBehavior>
          <ListItemButton component="a">
            <ListItemText primary={t('return_policy.title', 'İade Politikası')} />
          </ListItemButton>
        </Link>
        <Link href="/sales-agreement" locale={locale} passHref legacyBehavior>
          <ListItemButton component="a">
            <ListItemText primary={t('sales_agreement.title', 'Satış Sözleşmesi')} />
          </ListItemButton>
        </Link>
        <Link href="/contact-us" locale={locale} passHref legacyBehavior>
          <ListItemButton component="a">
            <ListItemText primary={t('Contact Us', 'İletişim')} />
          </ListItemButton>
        </Link>
        <Divider />
        <Link href="/search" locale={locale} passHref legacyBehavior>
          <ListItemButton component="a">
            <ListItemText primary={t('Search', 'Arama')} />
          </ListItemButton>
        </Link>
        <Link href="/users/favorites" locale={locale} passHref legacyBehavior>
          <ListItemButton component="a">
            <ListItemText primary={t('Favorites', 'Favorilerim')} />
          </ListItemButton>
        </Link>
        {isLoggedIn && (
          <Link href="/my-orders" locale={locale} passHref legacyBehavior>
            <ListItemButton component="a">
              <ListItemText primary={t('My Orders', 'Siparişlerim')} />
            </ListItemButton>
          </Link>
        )}
      </List>
    </Box>
  );

  return (
    <>
      {/* Fixed header */}
      <AppBar position="fixed" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #eee', backdropFilter: 'saturate(180%) blur(8px)', bgcolor: 'rgba(255,255,255,0.9)' }}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          {/* Mobile menu button */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}>
            <IconButton onClick={() => setMobileOpen(true)} aria-label="menu" sx={{ color: '#5D4037' }}>
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Brand */}
          <Link href="/" locale={locale} style={{ textDecoration: 'none' }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                color: '#8B0000',
                fontFamily: 'Dancing Script, cursive',
                fontSize: { xs: '1.8rem', sm: '2.2rem', lg: '2.4rem' },
                fontWeight: 700,
                letterSpacing: '0.3px',
                lineHeight: 1.2
              }}
            >
              Kınasepeti
            </Typography>
          </Link>

          {/* Desktop nav */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2, ml: 2, flexWrap: 'wrap', justifyContent: 'space-evenly', flexGrow: 1, minWidth: 0 }}>
            {/* Instagram */}
         {/*   <IconButton
              aria-label="Instagram"
              href="https://www.instagram.com/knc_kina_organizasyon"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'black', '&:hover': { color: '#8B0000' } }}
            >
               svg ...
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" style={{ marginRight: '2px' }}>
                <defs>
                  <linearGradient id="instaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#feda75' }} />
                    <stop offset="20%" style={{ stopColor: '#fa7e1e' }} />
                    <stop offset="40%" style={{ stopColor: '#d62976' }} />
                    <stop offset="60%" style={{ stopColor: '#962fbf' }} />
                    <stop offset="100%" style={{ stopColor: '#4f5bd5' }} />
                  </linearGradient>
                </defs>
                <path fill="url(#instaGradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.326 3.608 1.301.975.975 1.24 2.242 1.301 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.326 2.633-1.301 3.608-.975.975-2.242 1.24-3.608 1.301-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.326-3.608-1.301-.975-.975-1.24-2.242-1.301-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.326-2.633 1.301-3.608.975-.975 2.242-1.24 3.608-1.301 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.67.014-4.947.072-1.277.058-2.153.28-2.92.599-.79.33-1.454.794-2.118 1.458-.664.664-1.128 1.328-1.458 2.118-.319.767-.541 1.643-.599 2.92-.058 1.277-.072 1.688-.072 4.947s.014 3.67.072 4.947c.058 1.277.28 2.153.599 2.92.33.79.794 1.454 1.458 2.118.664.664 1.328 1.128 2.118 1.458.767.319 1.643.541 2.92.599 1.277.058 1.688.072 4.947.072s3.67-.014 4.947-.072c1.277-.058 2.153-.28 2.92-.599.79-.33 1.454-.794 2.118-1.458.664-.664 1.128-1.328 1.458-2.118.319-.767.541-1.643.599-2.92.058-1.277.072-1.688.072-4.947s-.014-3.67-.072-4.947c-.058-1.277-.28-2.153-.599-2.92-.33-.79-.794-1.454-1.458-2.118-.664-.664-1.328-1.128-2.118-1.458-.767-.319-1.643-.541-2.92-.599-1.277-.058-1.688-.072-4.947-.072z" />
                <path fill="url(#instaGradient)" d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4z" />
                <circle fill="url(#instaGradient)" cx="18.406" cy="5.594" r="1.44" />
              </svg>
            </IconButton>*/}

            {/* Search */}
            <Link href="/search" locale={locale} style={{ textDecoration: 'none' }}>
              <Box
                component="img"
                src={SearchImage.src || SearchImage}
                alt="Ara"
                sx={{ cursor: 'pointer', display: 'block', height: { xs: 32, md: 42, lg: 52 }, width: 'auto' }}
              />
            </Link>

            {/* Products with submenu */}
            <Button
              variant="text"
              onMouseEnter={(e) => setAnchorElProducts(e.currentTarget)}
              onClick={(e) => setAnchorElProducts(e.currentTarget)}
              sx={navBtnSx}
            >
              {t('Products', 'Ürünler')}
            </Button>
            <Menu
              anchorEl={anchorElProducts}
              open={Boolean(anchorElProducts)}
              onClose={() => setAnchorElProducts(null)}
              onMouseLeave={() => setAnchorElProducts(null)}
              PaperProps={{
                sx: {
                  border: '1px solid #8B0000',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  bgcolor: 'white',
                  '& .MuiMenuItem-root': { fontFamily: "'Lora', serif !important" }
                }
              }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
              {categories.map((c) => (
                <MenuItem key={c.key} onClick={() => { setAnchorElProducts(null); go(`/products?category=${c.key}`); }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Box component="img" src={c.icon?.src || c.icon} alt={c.label} sx={{ width: 22, height: 22, objectFit: 'cover', borderRadius: '3px' }} />
                  </ListItemIcon>
                  {c.label}
                </MenuItem>
              ))}
            </Menu>

            {/* More links */}
            <Link href="/articles" locale={locale} style={{ textDecoration: 'none' }}>
              <Button variant="text" sx={navBtnSx}>{t('Articles', 'Makaleler')}</Button>
            </Link>
            <Link href="/about-us" locale={locale} style={{ textDecoration: 'none' }}>
              <Button variant="text" sx={navBtnSx}>{t('About Us', 'Hakkımızda')}</Button>
            </Link>

            {/* Policies */}
            <Button variant="text" sx={navBtnSx} onMouseEnter={(e) => setAnchorElPolicies(e.currentTarget)} onClick={(e) => setAnchorElPolicies(e.currentTarget)}>
              {t('Policies', 'Politikalar')}
            </Button>
            <Menu
              anchorEl={anchorElPolicies}
              open={Boolean(anchorElPolicies)}
              onClose={() => setAnchorElPolicies(null)}
              onMouseLeave={() => setAnchorElPolicies(null)}
              PaperProps={{
                sx: {
                  border: '1px solid #8B0000',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  bgcolor: 'white',
                  '& .MuiMenuItem-root': { fontFamily: "'Lora', serif !important" }
                }
              }}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
              <MenuItem onClick={() => { setAnchorElPolicies(null); go('/privacy-policy'); }}>{t('privacy_policy.title', 'Gizlilik Politikası')}</MenuItem>
              <MenuItem onClick={() => { setAnchorElPolicies(null); go('/shipping-policy'); }}>{t('shipping_policy.title', 'Kargo Politikası')}</MenuItem>
              <MenuItem onClick={() => { setAnchorElPolicies(null); go('/return-policy'); }}>{t('return_policy.title', 'İade Politikası')}</MenuItem>
              <MenuItem onClick={() => { setAnchorElPolicies(null); go('/sales-agreement'); }}>{t('sales_agreement.title', 'Satış Sözleşmesi')}</MenuItem>
            </Menu>

            <Link href="/contact-us" locale={locale} style={{ textDecoration: 'none' }}>
              <Button variant="text" sx={navBtnSx}>{t('Contact Us', 'İletişim')}</Button>
            </Link>

            {/* Language (desktop) */}
            <Link href={asPath} locale="tr" style={{ textDecoration: 'none' }}>
              <Button variant="outlined" size="small" disabled={locale === 'tr'} sx={{ borderColor: '#8B0000', color: '#8B0000', '&:hover': { borderColor: '#660000', color: '#660000' } }}>TR</Button>
            </Link>
            <Link href={asPath} locale="en" style={{ textDecoration: 'none' }}>
              <Button variant="outlined" size="small" disabled={locale === 'en'} sx={{ borderColor: '#8B0000', color: '#8B0000', '&:hover': { borderColor: '#660000', color: '#660000' } }}>EN</Button>
            </Link>
          </Box>

          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1 }} />

          {/* Cart */}
          <Tooltip title={t('My Cart', 'Sepetim')}>
            <IconButton onClick={() => go('/cart')}>
              <Badge badgeContent={cartCount} color="error">
                <ShoppingBagOutlinedIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User menu */}
          <Tooltip title={isLoggedIn ? (username || '') : t('Login', 'Giriş Yap')}>
            <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)}>
              <Avatar sx={{ bgcolor: 'white', color: 'black', border: '1px solid #8B0000', width: 36, height: 36 }}>
                {(username || '').charAt(0).toUpperCase() || '?'}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={() => setAnchorElUser(null)}
            PaperProps={{
              sx: {
                border: '1px solid #8B0000',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                bgcolor: 'white',
                '& .MuiMenuItem-root': { fontFamily: "'Lora', serif !important" }
              }
            }}
          >
            {isLoggedIn ? (
              <>
                <MenuItem onClick={() => { go('/users/favorites'); setAnchorElUser(null); }}>{t('Favorites', 'Favorilerim')}</MenuItem>
                <MenuItem onClick={() => { go('/my-orders'); setAnchorElUser(null); }}>{t('My Orders', 'Siparişlerim')}</MenuItem>
                <MenuItem onClick={handleLogout}>{t('Logout', 'Çıkış Yap')}</MenuItem>
              </>
            ) : (
              <MenuItem onClick={() => { setOpenLoginDialog(true); }}>{t('Login', 'Giriş Yap')}</MenuItem>
            )}
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Spacer to offset fixed header height */}
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />

      {/* Mobile drawer */}
      <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        {MobileList}
      </Drawer>

      {/* Login Dialog */}
      <Login
        open={openLoginDialog}
        handleClose={() => setOpenLoginDialog(false)}
        onLoginSuccess={() => {
          setOpenLoginDialog(false);
          setAnchorElUser(null);
        }}
        handleOpenRegisterDialog={() => { /* route to /register if needed */ }}
      />
    </>
  );
}
