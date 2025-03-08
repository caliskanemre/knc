import React, {useEffect} from "react";
import {useAuth} from "../auth/AuthProvider";
import Header from "../header/Header";
import {Box, Card, CardMedia, Container, Grid, IconButton, Typography,} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";



// Helper function to generate a prefixed image URL (e.g., "small_", "medium_", "large_")
const getPrefixedImage = (url, prefix) => {
    if (!url) return url;
    return url.replace(/([^/]+)$/, `${prefix}_$1`);
};

const Favorites = () => {
    const { favorites, toggleFavorite } = useAuth(); // ✅ Ensure `useAuth()` provides correct props

    useEffect(() => {
        // Additional logic if needed when favorites change
    }, [favorites]);

    // Dynamically adjust font size based on title length
    const getDynamicFontSize = (title) => {
        if (!title) return "1.5rem";
        return title.length < 10 ? "1.8rem" : title.length < 20 ? "1.5rem" : "1.2rem";
    };

    return (
        <div>
            <Header />
            <Container sx={{ py: 9 }} maxWidth="xl">
                <Grid container spacing={4}>
                    {Array.isArray(favorites.favoriteProducts) &&
                        favorites.favoriteProducts.length > 0 ? (
                        favorites.favoriteProducts.map((item) => {
                            // ✅ Fix: Use `.some()` instead of `.map().includes()` for better performance
                            const isAlreadyFavorited = favorites.favoriteProducts.some(product => product.id === item.id);

                            // ✅ Pricing and discount logic
                            const discountPercent = 20;
                            const originalPrice = Math.floor(item.price);
                            const discountedPrice = Math.floor(item.price * (1 - discountPercent / 100));

                            // ✅ Get image URLs
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
                                        <a
                                            href={`/products/detail/${item.id}/${item.title}`}
                                            style={{ textDecoration: "none", color: "inherit" }}
                                        >
                                            <CardMedia
                                                component="img"
                                                image={smallImageUrl}
                                                srcSet={`${smallImageUrl} 400w, ${mediumImageUrl} 800w, ${largeImageUrl} 1200w`}
                                                sizes="(max-width: 600px) 400px, (max-width: 960px) 800px, 1200px"
                                                alt={item.title}
                                                sx={{
                                                    width: "100%",
                                                    height: { xs: 140, md: 200 },
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </a>
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
                                                {item.title}
                                            </Typography>
                                            {/* Display date and location */}
                                            <Box sx={{ mt: 0.5 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {item.date}
                                                </Typography>
                                                <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.activity_location}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            {/* Pricing & Discount Section */}
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
                                            aria-label="add to favorites"
                                            onClick={() => toggleFavorite(item.id, isAlreadyFavorited, "activity")}
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
                            Favori ürününüz bulunmamaktadır.
                        </Typography>
                    )}
                </Grid>
            </Container>

            {/* ✅ Load More Button - Only shows if more events/activities exist */}
           {/* {(hasMoreEvents || hasMoreActivity) && (eventPage > 0 || activityPage > 0) && (
                <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: "none", fontSize: "16px", px: 3, py: 1 }}
                    >
                        Daha Fazla Yükle
                    </Button>
                </Box>
            )}*/}
        </div>
    );
};

export default Favorites;
