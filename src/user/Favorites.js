import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import Header from "../header/Header";
import SEO from "../shared/SEO";
import {
    Box,
    Card,
    CardMedia,
    Container,
    Grid,
    IconButton,
    Typography,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import axios from "axios";
import { t } from "i18next";
import { Link } from 'react-router-dom';
import i18n from 'i18next';

// Helper function to generate a prefixed image URL
const getPrefixedImage = (url, prefix) => {
    if (!url) return url;
    return url.replace(/([^/]+)$/, `${prefix}_$1`);
};

// Generate UUID for guest token
const generateUUID = () => {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
};

const Favorites = () => {
    const { user, favorites, toggleFavorite } = useAuth();
    const [guestFavorites, setGuestFavorites] = useState([]);
    const [guestToken, setGuestToken] = useState(localStorage.getItem('guestToken') || generateUUID());
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    useEffect(() => {
        localStorage.setItem('guestToken', guestToken);
        if (user) {
            // Logged-in user: Use favorites from useAuth
        } else {
            // Guest user: Load from localStorage and sync with backend
            let localFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
            // Filter out invalid items (missing id, non-numeric id, or empty objects)
            localFavorites = localFavorites.filter(item => item && item.id && typeof item.id === 'number');
            console.log("Loaded localFavorites:", localFavorites);
            localStorage.setItem('favorites', JSON.stringify(localFavorites));
            setGuestFavorites(localFavorites);
            syncGuestFavorites(localFavorites);
        }
    }, [user, guestToken]);

    const syncGuestFavorites = async (localFavorites) => {
        try {
            console.log("Syncing guest favorites:", localFavorites);
            // Fetch current favorites from backend
            const response = await axios.get(`${baseURL}/users/guest/favorites`, {
                headers: { 'X-Guest-Token': guestToken },
            });
            const serverFavorites = Array.isArray(response.data) ? response.data.filter(item => item && item.id && typeof item.id === 'number') : [];
            console.log("Server favorites:", serverFavorites);
            // Merge local and server favorites
            const mergedFavorites = mergeFavorites(localFavorites, serverFavorites);
            console.log("Merged favorites:", mergedFavorites);
            localStorage.setItem('favorites', JSON.stringify(mergedFavorites));
            setGuestFavorites(mergedFavorites);
        } catch (error) {
            console.error("Error syncing guest favorites:", error.response?.data || error.message);
        }
    };

    const mergeFavorites = (localFavorites, serverFavorites) => {
        const itemMap = new Map();
        [...localFavorites, ...serverFavorites].forEach(item => {
            // Only include items with valid numeric id
            if (item && item.id && typeof item.id === 'number') {
                itemMap.set(item.id, { ...item });
            }
        });
        return Array.from(itemMap.values());
    };

    const handleToggleFavorite = async (productId, isFavorited, itemType) => {
        if (!productId || typeof productId !== 'number') {
            console.error("Invalid productId:", productId);
            return;
        }

        if (user) {
            // Logged-in user: Use toggleFavorite from useAuth
            toggleFavorite(productId, isFavorited, itemType);
        } else {
            // Guest user: Update localStorage and sync with backend
            let updatedFavorites = [...guestFavorites];
            if (isFavorited) {
                // Remove from favorites
                updatedFavorites = updatedFavorites.filter(item => item.id !== productId);
                try {
                    await axios.delete(`${baseURL}/users/guest/favorites/${productId}`, {
                        headers: { 'X-Guest-Token': guestToken },
                    });
                } catch (error) {
                    console.error("Error removing guest favorite:", error.response?.data || error.message);
                    return;
                }
            } else {
                // Add to favorites
                try {
                    const productResponse = await axios.get(`${baseURL}/products/${productId}`);
                    const product = productResponse.data;
                    if (!product || !product.id) {
                        console.error("Invalid product data:", product);
                        return;
                    }
                    updatedFavorites.push({
                        id: product.id,
                        title: product.title || product.name || "Unknown",
                        price: product.price || 0,
                        photos: product.photos || [],
                        date: product.date || "",
                        activity_location: product.activityLocation || product.location || "",
                    });
                    await axios.post(`${baseURL}/users/guest/favorites/${productId}`, {}, {
                        headers: { 'X-Guest-Token': guestToken },
                    });
                } catch (error) {
                    console.error("Error adding guest favorite:", error.response?.data || error.message);
                    return;
                }
            }
            console.log("Updated favorites:", updatedFavorites);
            localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
            setGuestFavorites(updatedFavorites);
        }
    };

    const getDynamicFontSize = (title) => {
        if (!title) return "1.5rem";
        return title.length < 10 ? "1.8rem" : title.length < 20 ? "1.5rem" : "1.2rem";
    };

    const displayFavorites = user ? favorites.favoriteProducts : guestFavorites;

    return (
        <div>
            <SEO
                title={t('Favorites') + ' | Kina Sepeti'}
                description={t('Your saved favorite henna night products and accessories.')}
                robots="noindex,nofollow"
                type="website"
            />
            <Header />
            <Container sx={{ py: 9 }} maxWidth="xl">
                <Grid container spacing={4}>
                    {Array.isArray(displayFavorites) && displayFavorites.length > 0 ? (
                        displayFavorites.map((item) => {
                            // Skip invalid items (missing id or empty object)
                            if (!item || !item.id || typeof item.id !== 'number') {
                                console.warn("Skipping invalid favorite item:", item);
                                return null;
                            }
                            const isAlreadyFavorited = displayFavorites.some(product => product.id === item.id);
                            const discountPercent = 20;
                            const originalPrice = Math.floor(item.price || 0);
                            const discountedPrice = Math.floor((item.price || 0) * (1 - discountPercent / 100));
                            const originalImage = item.photos?.[0]?.photo || "";
                            const smallImageUrl = getPrefixedImage(originalImage, "small");
                            const mediumImageUrl = getPrefixedImage(originalImage, "medium");
                            const largeImageUrl = getPrefixedImage(originalImage, "large");

                            return (
                                <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                                    <Card
                                        sx={{
                                            height: { xs: "auto", md: "350px" },
                                            display: "flex",
                                            flexDirection: "column",
                                            position: "relative",
                                        }}
                                    >
                                        <Link
                                            to={`/${(i18n?.language)||'tr'}/products/detail/${item.id}/${encodeURIComponent(item.title || 'product')}`}
                                            state={{ product: item }}
                                            style={{ textDecoration: "none", color: "inherit" }}
                                        >
                                            <CardMedia
                                                component="img"
                                                image={smallImageUrl || "https://via.placeholder.com/300x200?text=No+Image"}
                                                srcSet={`${smallImageUrl} 400w, ${mediumImageUrl} 800w, ${largeImageUrl} 1200w`}
                                                sizes="(max-width: 600px) 400px, (max-width: 960px) 800px, 1200px"
                                                alt={item.title || "Product"}
                                                sx={{
                                                    width: "100%",
                                                    height: { xs: 140, md: 200 },
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </Link>
                                        <Box sx={{ p: 2, flex: 1 }}>
                                            <Typography
                                                sx={{
                                                    textAlign: "left",
                                                    fontSize: getDynamicFontSize(item.title),
                                                    fontWeight: 500,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {item.title || "Unknown"}
                                            </Typography>
                                            <Box sx={{ mt: 0.5 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {item.date || ""}
                                                </Typography>
                                                <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.activity_location || ""}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                                                <Typography
                                                    sx={{
                                                        textDecoration: "line-through",
                                                        color: "gray",
                                                        mr: 1,
                                                        fontSize: "0.9rem",
                                                    }}
                                                >
                                                    {originalPrice} €
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        color: "#1976d2",
                                                        fontWeight: "bold",
                                                        fontSize: "0.9rem",
                                                    }}
                                                >
                                                    {discountedPrice} €
                                                </Typography>
                                                {discountPercent >= 20 && (
                                                    <Box
                                                        sx={{
                                                            backgroundColor: "red",
                                                            color: "white",
                                                            px: 1,
                                                            py: 0.5,
                                                            borderRadius: 1,
                                                            ml: 1,
                                                            fontSize: "0.75rem",
                                                            fontWeight: "bold",
                                                        }}
                                                    >
                                                        {discountPercent}%
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                        <IconButton
                                            aria-label="toggle favorite"
                                            onClick={() => handleToggleFavorite(item.id, isAlreadyFavorited, "activity")}
                                            sx={{
                                                position: "absolute",
                                                top: "8px",
                                                right: "8px",
                                                backgroundColor: "rgba(255, 255, 255, 0.7)",
                                                borderRadius: "50%",
                                                padding: "6px",
                                                zIndex: 3,
                                            }}
                                        >
                                            {isAlreadyFavorited ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                                        </IconButton>
                                    </Card>
                                </Grid>
                            );
                        })
                    ) : (
                        <Typography variant="h6" sx={{ textAlign: "center", width: "100%", mt: 5 }}>
                            {t('Favori ürününüz bulunmamaktadır')}
                        </Typography>
                    )}
                </Grid>
            </Container>
        </div>
    );
};

export default Favorites;
