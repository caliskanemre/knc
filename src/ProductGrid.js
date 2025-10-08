// src/ProductGrid.js

import React, { useEffect } from 'react';
import { Grid, Card, Box, IconButton, Typography } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import Link from 'next/link';
import Image from 'next/image';
import { getAverageRating, getReviewCount } from './data/productReviews';

// Yardımcı fonksiyonlar
const getPrefixedImage = (url, prefix) => {
    if (!url) return url;
    return url.replace(/([^/]+)$/, `${prefix}_$1`);
};

const sanitizeTitle = (str) => (str || 'product')
    .replace(/[\\/]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

const formatPrice = (amount, isTR) => {
    const symbol = isTR ? '₺' : '€';
    const num = Number(amount) || 0;
    return `${num.toFixed(2)} ${symbol}`;
};

export default function ProductGrid({ products, favorites, isLoggedIn, handleFavoriteClick, pageLocale = 'tr', defaultLocale = 'tr' }) {
    const isClient = typeof window !== 'undefined';

    // Açılışta ürünlerden is_turkey_user bilgisi varsa kalıcılaştır (cookie + localStorage)
    useEffect(() => {
        if (!isClient) return;
        if (!Array.isArray(products) || products.length === 0) return;
        const probe = products.find(p => p && p.is_turkey_user !== undefined && p.is_turkey_user !== null);
        if (probe) {
            const isTR = !!probe.is_turkey_user;
            try { localStorage.setItem('is_turkey_user', JSON.stringify(isTR)); } catch(_) {}
            try { document.cookie = `is_turkey_user=${isTR ? '1' : '0'}; path=/; max-age=15552000`; } catch(_) {}
        } else {
            // ürün bilgisinde yoksa, dil üzerinden tahmin edip yazalım (yanlışsa backend düzeltir)
            const guessTR = typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('tr');
            try { localStorage.setItem('is_turkey_user', JSON.stringify(guessTR)); } catch(_) {}
            try { document.cookie = `is_turkey_user=${guessTR ? '1' : '0'}; path=/; max-age=15552000`; } catch(_) {}
        }
    }, [isClient, products]);

    return (
        <Grid container spacing={4}>
            {products.map((item, idx) => {
                // is_turkey_user gelmezse locale'e göre fallback yap
                const isTR = (item.is_turkey_user !== undefined && item.is_turkey_user !== null)
                    ? !!item.is_turkey_user
                    : (typeof pageLocale === 'string' && pageLocale.toLowerCase().startsWith('tr'));
                const baseOriginal = isTR ? (item.tl_price ?? item.price) : (item.eur_price ?? item.price);
                const originalPriceNum = Number(baseOriginal) || 0;
                const discountPercent = 20;
                const discountedPriceNum = originalPriceNum * (1 - discountPercent / 100);

                const originalPhoto = item.photos?.[0]?.photo || '/ksLogo.jpeg';
                const smallImageUrl = getPrefixedImage(originalPhoto, 'small') || originalPhoto;

                let isAlreadyFavorited = false;
                if (isLoggedIn) {
                    isAlreadyFavorited = !!favorites?.favoriteProducts?.some(product => product.id === item.id);
                } else if (isClient) {
                    try {
                        const raw = window.localStorage ? window.localStorage.getItem('favorites') : null;
                        const arr = raw ? JSON.parse(raw) : [];
                        isAlreadyFavorited = arr.some(fav => fav.id === item.id);
                    } catch (_) { /* ignore */ }
                }

                const productTitle = sanitizeTitle(item.productName || item.title || item.name || 'Unknown');
                // Next Link mevcut locale'i otomatik uygular; manuel prefix eklemeyelim
                const href = `/products/detail/${item.id}/${encodeURIComponent(productTitle || 'product')}`;

                // Yıldız puanını ve inceleme sayısını al
                const averageRating = getAverageRating(item.id);
                const reviewCount = getReviewCount(item.id);

                return (
                    <Grid item key={item.id} xs={6} sm={6} md={4} lg={3}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: 'none' }}>
                            <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Box sx={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', backgroundColor: '#f0f0f0' }}>
                                    <Image
                                        src={smallImageUrl}
                                        alt={productTitle || 'Product'}
                                        fill
                                        sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw"
                                        priority={idx < 8}
                                        loading={idx < 8 ? "eager" : "lazy"}
                                        style={{ objectFit: 'cover' }}
                                        placeholder="blur"
                                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                                    />
                                </Box>
                            </Link>
                            <Box sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '150px' }}>
                                <Typography sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.1rem' }, minHeight: '2.8rem', WebkitLineClamp: 2 }}>
                                    {item.productName || item.title || item.name || 'Unknown'}
                                </Typography>
                                {item.shortDescription && (
                                    <Typography sx={{ fontFamily: 'Montserrat, sans-serif', fontSize: { xs: '0.85rem', sm: '0.95rem' }, WebkitLineClamp: 2 }}>
                                        {item.shortDescription}
                                    </Typography>
                                )}
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                    <Typography sx={{ fontWeight: 'bold' }}>{formatPrice(discountedPriceNum, isTR)}</Typography>
                                    <Typography sx={{ textDecoration: 'line-through', color: 'gray', ml: 1 }}>{formatPrice(originalPriceNum, isTR)}</Typography>
                                </Box>
                                {/* Yıldız puanlama ve inceleme sayısı */}
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    <StarIcon color={averageRating >= 1 ? "error" : "action"} />
                                    <StarIcon color={averageRating >= 2 ? "error" : "action"} />
                                    <StarIcon color={averageRating >= 3 ? "error" : "action"} />
                                    <StarIcon color={averageRating >= 4 ? "error" : "action"} />
                                    <StarIcon color={averageRating >= 5 ? "error" : "action"} />
                                    <Typography sx={{ fontSize: '0.875rem', ml: 0.5, color: 'text.secondary' }}>
                                        ({reviewCount})
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton onClick={() => handleFavoriteClick?.(item.id)} sx={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
                                {isAlreadyFavorited ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                            </IconButton>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );
}
