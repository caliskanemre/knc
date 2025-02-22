import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import Axios from "axios";
import Header from "../header/Header";
import './css/ActivityDetails.css';
import {
    Button,
    IconButton,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Snackbar,
    Alert, CircularProgress, AccordionDetails,
} from "@mui/material";
import { Helmet } from "react-helmet";
import axios from "axios";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { jwtDecode } from "jwt-decode";
import {
    FacebookIcon,
    FacebookShareButton,
    TelegramIcon,
    TelegramShareButton,
    WhatsappIcon,
    WhatsappShareButton
} from "react-share";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useAuth } from "../auth/AuthProvider";
import { useTranslation } from "react-i18next";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const ProductDetails = () => {
    const { id, title, type } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [username, setUsername] = useState('');
    const [selectedImage, setSelectedImage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // For image modal
    const [similarProducts, setSimilarProducts] = useState([]); // NEW state
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Default: success

    const { favorites, toggleFavorite } = useAuth();
    const { t } = useTranslation();
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    // Helper to get image URL with prefix (e.g., small_, medium_, large_)
    const getPrefixedImage = (url, prefix) => {
        if (!url) return url;
        return url.replace(/([^/]+)$/, `${prefix}_$1`);
    };

    // Fetch product details
    useEffect(() => {
        Axios.get(`${baseURL}/products/detail/${id}/${title}`)
            .then((response) => {
                setProduct(response.data);
            })
            .catch((error) => {
                console.error('Error fetching product:', error);
                showSnackbar("Ürün yüklenemedi! ❌", "error");
            });
    }, [id, title, baseURL]);

    // Once product is loaded, set the default selectedImage
    useEffect(() => {
        if (product && product.photos && product.photos.length > 0) {
            setSelectedImage(product.photos[0].photo);
        }
    }, [product]);

    // Check if user is logged in
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            const decodedToken = jwtDecode(storedToken);
            setUsername(decodedToken.sub);
            setIsLoggedIn(true);
        }
    }, []);

    // --- NEW: Fetch similar products whenever `product` changes ---
    useEffect(() => {
        if (product && product.category) {
            fetchSimilarProducts(product.category);
        }
    }, [product]);

    // Example: fetch "similar" items by the same `type` or `category`.
    const fetchSimilarProducts = async (typeValue) => {
        if (!typeValue) return;
        try {
            // For example, get up to 5 items of the same type (or category).
            const response = await Axios.get(`${baseURL}/products/${typeValue}?page=0&size=5`);
            const fetched = response.data.content || [];

            // Exclude the current product from the "similar" list
            const filtered = fetched.filter((p) => p.id !== product.id);

            setSimilarProducts(filtered);
        } catch (error) {
            console.error('Error fetching similar products:', error);
        }
    };

    const handleFavoriteClick = () => {
        if (!isLoggedIn) {
            showSnackbar("Favorilere eklemek için giriş yapmalısınız! 🔐", "warning");
            return;
        }
        toggleFavorite(product.id, isAlreadyFavorited, "product");
        showSnackbar(isAlreadyFavorited ? "Favorilerden kaldırıldı! ❌" : "Favorilere eklendi! ❤️", "success");
    };

    const handleSnackbarClose = () => setSnackbarOpen(false);

    if (product === null) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <CircularProgress />
            </div>
        );
    }

    const addToCart = async (quantity) => {
        if (!isLoggedIn) {
            showSnackbar("Sepete eklemek için giriş yapmalısınız! 🔐", "warning");
            return;
        }

        try {
            const cartItem = {
                productId: product.id,
                quantity,
                price: product.price,
            };

            const response = await axios.post(`${baseURL}/cart/${username}`, cartItem, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 200) {
                showSnackbar(`${quantity} adet "${product.title}" sepete eklendi! 🛒`, "success");
            } else {
                showSnackbar("Ürün sepete eklenemedi! ❌", "error");
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            showSnackbar("Sepete eklerken hata oluştu! ⚠️", "error");
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };
    const shareUrl = window.location.href;
    const shareMessage = `${product.title} - Check out this product!`;

    const isAlreadyFavorited = favorites.favoriteProducts?.some(
        (fav) => fav.id === product.id
    );

    // Modal open/close
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Split the description into lines for the accordion
    const descriptionLines = product.description
        ? product.description.split("\n").filter((line) => line.trim() !== "")
        : [];

    // ----------------------
    // Discount Logic Example
    // ----------------------
    // Define a discount rate of 20% (this can be dynamic)
    const discountPercent = 20;
    const originalPrice = Math.floor(product.price);
    const discountedPrice = Math.floor(product.price * (1 - discountPercent / 100));

    return (
        <div className="activity-details-container">
            <Helmet>
                <title>{product.title} - Product Details | Kina Sepeti</title>
                <meta
                    name="description"
                    content={`Discover more about ${product.title}. 
            Contact: ${product.product_email || 'N/A'} | ${product.product_phone || 'N/A'}`}
                />
                <link
                    rel="canonical"
                    href={`${window.location.origin}${window.location.pathname}`}
                />
                {/* Open Graph / Facebook */}
                <meta property="og:title" content={product.title} />
                <meta
                    property="og:description"
                    content={product.description || 'Learn more about this product.'}
                />
                <meta
                    property="og:image"
                    content={
                        product.photos.length > 0
                            ? getPrefixedImage(product.photos[0].photo, 'small')
                            : undefined
                    }
                />
                <meta
                    property="og:url"
                    content={`${window.location.origin}${window.location.pathname}`}
                />
                <meta property="og:type" content="website" />
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={product.title} />
                <meta
                    name="twitter:description"
                    content={product.description || 'Learn more about this product.'}
                />
                <meta
                    name="twitter:image"
                    content={
                        product.photos.length > 0
                            ? getPrefixedImage(product.photos[0].photo, 'small')
                            : undefined
                    }
                />
                {/* Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "http://schema.org",
                        "@type": "TouristAttraction",
                        "name": product.title,
                        "description": product.description,
                        "image": product.photos.map(photo => photo.photo),
                        "location": {
                            "@type": "Place",
                            "name": product.location,
                        },
                        "offers": {
                            "@type": "Offer",
                            "price": product.price,
                        },
                        "telephone": product.product_phone,
                        "email": product.product_email,
                        "url": product.product_website,
                        "publisher": {
                            "@type": "Organization",
                            "name": "Kina Sepeti",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://kinasepeti.com/logo.png"
                            }
                        }
                    })}
                </script>
            </Helmet>

            {/* Header */}
            <Header />
            <h2>
                {type ? `${type} - ${t(product.category)}` : t("All Products")}
            </h2>


            <div className="activity-details-wrapper">
                {/* Left Section: single main image with srcSet */}
                <div className="left-section">
                    {selectedImage && (
                        <img
                            src={getPrefixedImage(selectedImage, 'small')}
                            srcSet={`
                                ${getPrefixedImage(selectedImage, 'small')} 400w,
                                ${getPrefixedImage(selectedImage, 'medium')} 800w,
                                ${getPrefixedImage(selectedImage, 'large')} 1200w
                            `}
                            sizes="(max-width: 600px) 400px, (max-width: 960px) 800px, 1200px"
                            alt="Selected"
                            className="main-image"
                            onClick={openModal}
                        />
                    )}
                </div>

                {/* Right Section: Product Info + Description Accordion */}
                <div className="right-section">
                    <h1 className="product-title">{product.title}</h1>

                    {/* Thumbnail Row with srcSet */}
                    {product.photos.length > 0 && (
                        <div className="thumbnail-container">
                            {product.photos.map((photo, index) => (
                                <img
                                    key={index}
                                    src={getPrefixedImage(photo.photo, 'small')}
                                    srcSet={`
                                        ${getPrefixedImage(photo.photo, 'small')} 100w,
                                        ${getPrefixedImage(photo.photo, 'medium')} 200w,
                                        ${getPrefixedImage(photo.photo, 'large')} 300w
                                    `}
                                    sizes="100px"
                                    alt={`Thumbnail ${index}`}
                                    className="thumbnail"
                                    onClick={() => setSelectedImage(photo.photo)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Price with Discount */}
                    {product.price && (
                        <div
                            className="product-price"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '1.25rem',
                                margin: '10px 0'
                            }}
                        >
                            <span
                                style={{
                                    textDecoration: 'line-through',
                                    color: 'gray',
                                    marginRight: '8px'
                                }}
                            >
                                {originalPrice} €
                            </span>
                            <span
                                style={{
                                    color: '#1976d2',
                                    fontWeight: 'bold',
                                    marginRight: '8px'
                                }}
                            >
                                {discountedPrice} €
                            </span>
                            <span
                                style={{
                                    backgroundColor: 'red',
                                    color: 'white',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem'
                                }}
                            >
                                {discountPercent}% OFF
                            </span>
                        </div>
                    )}

                    {/* Quantity Controls */}
                    <div className="quantity-control">
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() =>
                                setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
                            }
                            className="quantity-btn"
                        >
                            -
                        </Button>
                        <span className="quantity-display">{quantity}</span>
                        <Button
                            variant="outlined"
                            color="success"
                            onClick={() => setQuantity((prev) => prev + 1)}
                            className="quantity-btn"
                        >
                            +
                        </Button>
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                        onClick={() => addToCart(quantity)}
                        variant="contained"
                        color="success"
                        startIcon={<ShoppingCartIcon />}
                        className="add-cart-btn"
                    >
                        {t('Add to Cart')}
                    </Button>

                    {/* Type (if exists) */}
                    {product.type && (
                        <p className="product-type">
                            <strong>Type:</strong> {product.type}
                        </p>
                    )}

                    {/* Share Buttons */}
                    <div
                        className="share-buttons"
                        style={{ marginTop: '10px', marginLeft: '25px' }}
                    >
                        <WhatsappShareButton
                            url={shareUrl}
                            title={shareMessage}
                            separator=":: "
                            className="share-btn"
                        >
                            <WhatsappIcon size={32} round />
                        </WhatsappShareButton>
                        <TelegramShareButton
                            url={shareUrl}
                            title={shareMessage}
                            className="share-btn"
                        >
                            <TelegramIcon size={32} round />
                        </TelegramShareButton>
                        <FacebookShareButton
                            url={shareUrl}
                            quote={shareMessage}
                            className="share-btn"
                        >
                            <FacebookIcon size={32} round />
                        </FacebookShareButton>
                    </div>

                    {/* Favorite Button */}
                    <IconButton
                        aria-label="add to favorites"
                        onClick={handleFavoriteClick}
                        style={{ marginTop: '20px' }}
                    >
                        {isAlreadyFavorited ? (
                            <FavoriteIcon color="error" />
                        ) : (
                            <FavoriteBorderIcon />
                        )}
                    </IconButton>

                    {/* Description (Accordion) */}
                    {descriptionLines.length > 0 && (
                        <div
                            className="description-accordion"
                            style={{
                                marginTop: '20px',
                                width: '100%',
                                maxWidth: '400px'
                            }}
                        >
                            <div>
                                <div
                                    aria-controls="description-content"
                                    id="description-header"
                                >
                                    <Typography variant="h6">
                                        Ürün Açıklaması
                                    </Typography>
                                </div>
                                <AccordionDetails>
                                    {descriptionLines.map((line, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginBottom: '8px'
                                            }}
                                        >
                                            <CheckCircleOutlineIcon
                                                color="primary"
                                                style={{ marginRight: '8px' }}
                                            />
                                            <Typography variant="body1">
                                                {line}
                                            </Typography>
                                        </div>
                                    ))}
                                </AccordionDetails>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* IMAGE MODAL (lightbox) with srcSet */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content">
                        <img
                            src={getPrefixedImage(selectedImage, 'large')}
                            srcSet={`
                                ${getPrefixedImage(selectedImage, 'small')} 400w,
                                ${getPrefixedImage(selectedImage, 'medium')} 800w,
                                ${getPrefixedImage(selectedImage, 'large')} 1200w
                            `}
                            sizes="(max-width: 600px) 400px, (max-width: 960px) 800px, 1200px"
                            alt="Full Size"
                            className="modal-image"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {/* SIMILAR PRODUCTS SECTION with srcSet */}
            {similarProducts.length > 0 && (
                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <h2>{t("Similar Products")}</h2>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            gap: '20px',
                            padding: '10px 20px'
                        }}
                    >
                        {similarProducts.map((sp) => {
                            const spOriginal = sp.photos?.[0]?.photo || "https://via.placeholder.com/300x200?text=No+Image";
                            return (
                                <Card
                                    key={sp.id}
                                    style={{
                                        marginRight: '30px',
                                        minWidth: '200px',
                                        maxWidth: '300px',
                                        textAlign: 'center',
                                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        alt={sp.title}
                                        height="140"
                                        image={getPrefixedImage(spOriginal, 'small')}
                                        srcSet={`
                                            ${getPrefixedImage(spOriginal, 'small')} 400w,
                                            ${getPrefixedImage(spOriginal, 'medium')} 800w,
                                            ${getPrefixedImage(spOriginal, 'large')} 1200w
                                        `}
                                        sizes="(max-width: 600px) 400px, (max-width: 960px) 800px, 1200px"
                                    />
                                    <CardContent>
                                        <Typography variant="subtitle1" component="div">
                                            {sp.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {sp.price} €
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            sx={{ mt: 1 }}
                                            onClick={() => window.open(`/products/detail/${sp.id}/${sp.title}`, "_blank")}
                                        >
                                            {t("View")}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                        <Snackbar
                            open={snackbarOpen}
                            autoHideDuration={4000}
                            onClose={handleSnackbarClose}
                            anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Moved to top-center
                        >
                            <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                                {snackbarMessage}
                            </Alert>
                        </Snackbar>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
