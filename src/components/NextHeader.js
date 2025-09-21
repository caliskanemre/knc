import React from 'react';
import Link from 'next/link';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';

export default function NextHeader({ locale = 'tr', defaultLocale = 'tr', asPath = '/' }) {
  const prefix = locale && defaultLocale && locale !== defaultLocale ? `/${locale}` : '';

  return (
    <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #eee' }}>
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        <Link href={`${prefix}/`} style={{ textDecoration: 'none', color: '#8B0000' }}>
          <Typography variant="h1" component="h1" sx={{ fontFamily: 'Dancing Script, cursive', fontSize: { xs: '1.8rem', sm: '2.2rem' }, fontWeight: 700 }}>
            Kınasepeti
          </Typography>
        </Link>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Link href={`${prefix}/products`} style={{ textDecoration: 'none' }}>
            <Button variant="text">Ürünler</Button>
          </Link>
          <Link href={asPath} locale="tr">
            <Button variant="outlined" size="small" disabled={locale === 'tr'}>
              TR
            </Button>
          </Link>
          <Link href={asPath} locale="en">
            <Button variant="outlined" size="small" disabled={locale === 'en'}>
              EN
            </Button>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
