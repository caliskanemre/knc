// src/ProductGrid.js

import React from 'react';
import { Grid, Card, CardMedia, Box, IconButton, Typography } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useTranslation } from "react-i18next";
import i18n from './i18n';

// Main.js'den kopyalanan yardımcı fonksiyonlar
const getPrefixedImage = (url, prefix) => {
    if (!url) return url;
    return url.replace(/([^/]+)$/, `${prefix}_$1`);
};

const formatPrice = (amount, isTR) => {
    const symbol = isTR ? '₺' : '€';
    const num = Number(amount) || 0;
    return `${num.toFixed(2)} ${symbol}`;
};

export default function ProductGrid({ products, favorites, isLoggedIn, handleFavoriteClick }) {
    const { t } = useTranslation();

    return (
        <Grid container spacing={4}>
            {products.map((item) => {
                const isTR = !!item.is_turkey_user;
                const baseOriginal = isTR ? (item.tl_price ?? item.price) : (item.eur_price ?? item.price);
                const originalPriceNum = Number(baseOriginal) || 0;
                const discountPercent = 20;
                const discountedPriceNum = originalPriceNum * (1 - discountPercent / 100);

                const originalPhoto = item.photos[0]?.photo || 'https://via.placeholder.com/300x200?text=No+Image';
                const smallImageUrl = getPrefixedImage(originalPhoto, 'small');

                const isAlreadyFavorited = isLoggedIn
                    ? favorites.favoriteProducts?.some(product => product.id === item.id)
                    : (JSON.parse(localStorage.getItem('favorites')) || []).some(fav => fav.id === item.id);

                const productTitle = item.productName || item.title || item.name || 'Unknown';
                const productShortDesc = item.shortDescription;

                return (
                    <Grid item key={item.id} xs={6} sm={6} md={4} lg={3}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: 'none' }}>
                            <a href={`/${i18n.language}/products/detail/${item.id}/${encodeURIComponent(productTitle || 'product')}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <CardMedia
                                    component="img"
                                    loading="lazy" // <-- EKRAN DIŞINDAKİ RESİMLER İÇİN ÖNEMLİ BİR EKLEME
                                    width="400"
                                    height="400"
                                    image={smallImageUrl}
                                    alt={productTitle || 'Product'}
                                    sx={{ width: '100%', height: 'auto', aspectRatio: '1 / 1', objectFit: 'cover', backgroundColor: '#f0f0f0' }}
                                />
                            </a>
                            <Box sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '150px' }}>
                                <Typography sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.1rem' }, minHeight: '2.8rem', WebkitLineClamp: 2, /* ...diğer stiller... */ }}>
                                    {productTitle}
                                </Typography>
                                {productShortDesc && (
                                    <Typography sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: { xs: '0.85rem', sm: '0.95rem' }, WebkitLineClamp: 2, /* ...diğer stiller... */ }}>
                                        {productShortDesc}
                                    </Typography>
                                )}
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                    <Typography sx={{ fontWeight: 'bold' }}>{formatPrice(discountedPriceNum, isTR)}</Typography>
                                    <Typography sx={{ textDecoration: 'line-through', color: 'gray', ml: 1 }}>{formatPrice(originalPriceNum, isTR)}</Typography>
                                </Box>
                            </Box>
                            <IconButton onClick={() => handleFavoriteClick(item.id)} sx={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
                                {isAlreadyFavorited ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                            </IconButton>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
}
