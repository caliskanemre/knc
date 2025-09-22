import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
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
  Tooltip
} from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import Login from '../login/Login';
import { useAuth } from '../auth/AuthProvider';

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

export default function NextHeader({ locale = 'tr', defaultLocale = 'tr', asPath = '/' }) {
  const prefix = locale && defaultLocale && locale !== defaultLocale ? `/${locale}` : '';
  const router = useRouter();
  const { isLoggedIn, username, setIsLoggedIn, setUsername, setToken } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [openLoginDialog, setOpenLoginDialog] = useState(false);

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

  return (
    <>
      <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #eee' }}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <Link href={`${prefix}/`} style={{ textDecoration: 'none', color: '#8B0000' }}>
            <Typography variant="h1" component="h1" sx={{ fontFamily: 'Dancing Script, cursive', fontSize: { xs: '1.8rem', sm: '2.2rem' }, fontWeight: 700 }}>
              Kınasepeti
            </Typography>
          </Link>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Link href={`${prefix}/products`} style={{ textDecoration: 'none' }}>
              <Button variant="text">Ürünler</Button>
            </Link>

            {/* Language Switch */}
            <Link href={asPath} locale="tr">
              <Button variant="outlined" size="small" disabled={locale === 'tr'}>TR</Button>
            </Link>
            <Link href={asPath} locale="en">
              <Button variant="outlined" size="small" disabled={locale === 'en'}>EN</Button>
            </Link>

            {/* Cart */}
            <Tooltip title="Sepetim">
              <IconButton onClick={() => go('/cart')}>
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingBagOutlinedIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User menu */}
            <Tooltip title={isLoggedIn ? (username || '') : 'Giriş Yap'}>
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
                  <MenuItem onClick={() => { go('/users/favorites'); setAnchorElUser(null); }}>Favorilerim</MenuItem>
                  <MenuItem onClick={() => { go('/my-orders'); setAnchorElUser(null); }}>Siparişlerim</MenuItem>
                  <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
                </>
              ) : (
                <MenuItem onClick={() => { setOpenLoginDialog(true); }}>Giriş Yap</MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Login Dialog */}
      <Login
        open={openLoginDialog}
        handleClose={() => setOpenLoginDialog(false)}
        onLoginSuccess={() => {
          setOpenLoginDialog(false);
          setAnchorElUser(null);
        }}
        handleOpenRegisterDialog={() => { /* Optional: could route to /register */ }}
      />
    </>
  );
}
