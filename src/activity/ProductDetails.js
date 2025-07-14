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
    Alert,
    CircularProgress,
    AccordionDetails,
    debounce
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
import Footer from "../Footer";

const ProductDetails = () => {
    const { id, title, type } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [orderNote, setOrderNote] = useState("");
    const [guestToken, setGuestToken] = useState(localStorage.getItem('guestToken') || generateUUID());

    const { token, isLoggedIn, favorites, toggleFavorite } = useAuth();
    const [email, setEmail] = useState('');

    const { t } = useTranslation();
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    // Generate UUID for guest token
    const generateUUID = () => {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    };

    // Helper to get image URL with prefix
    const getPrefixedImage = (url, prefix) => {
        if (!url) return url;
        return url.replace(/([^/]+)$/, `${prefix}_$1`);
    };

    useEffect(() => {
        // Store guest token
        localStorage.setItem('guestToken', guestToken);

        if (isLoggedIn && email && token) {
            const localCart = JSON.parse(localStorage.getItem('cart')) || [];
            localCart.forEach(async (item) => {
                try {
                    await axios.post(`${baseURL}/cart/${encodeURIComponent(email)}`, item, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                } catch (error) {
                    console.error("Error syncing cart item:", error);
                }
            });
            localStorage.removeItem('cart');

            const localFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
            localFavorites.forEach(async (favorite) => {
                if (favorite && favorite.id) {
                    try {
                        await toggleFavorite(favorite.id, false, "product");
                    } catch (error) {
                        console.error("Error syncing favorite:", error);
                    }
                }
            });
            localStorage.removeItem('favorites');
        }
    }, [isLoggedIn, email, token, guestToken]);

    // Extract email from JWT token
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            const decoded = jwtDecode(storedToken);
            setEmail(decoded.sub);
        }
    }, []);

    useEffect(() => {
        Axios.get(`${baseURL}/products/detail/${id}/${title}`)
            .then((response) => {
                setProduct(response.data);
            })
            .catch((error) => {
                console.error('Error fetching product:', error);
                showSnackbar(t("Failed to load product") + " ❌", "error");
            });
    }, [id, title, baseURL]);

    // Set default selected image
    useEffect(() => {
        if (product && product.photos && product.photos.length > 0) {
            setSelectedImage(product.photos[0].photo);
        }
    }, [product]);

    // Fetch similar products
    useEffect(() => {
        if (product && product.category) {
            fetchSimilarProducts(product.category);
        }
    }, [product]);

    const fetchSimilarProducts = async (typeValue) => {
        if (!typeValue) return;
        try {
            const response = await Axios.get(`${baseURL}/products/${typeValue}?page=0&size=5`);
            const fetched = response.data.content || [];
            const filtered = fetched.filter((p) => p.id !== product.id);
            setSimilarProducts(filtered);
        } catch (error) {
            console.error('Error fetching similar products:', error);
        }
    };

    const handleFavoriteClick = async () => {
        if (!product || !product.id) {
            showSnackbar(t("Cannot add to favorites: Product not loaded"), "error");
            return;
        }

        if (isLoggedIn && token) {
            // Logged-in user: Use toggleFavorite
            const isAlreadyFavorited = favorites.favoriteProducts?.some((fav) => fav.id === product.id);
            toggleFavorite(product.id, isAlreadyFavorited, "product");
            showSnackbar(isAlreadyFavorited ? t("Removed from favorites") + " ❌" : t("Added to favorites") + " ❤️", "success");
        } else {
            // Guest user: Update localStorage and sync with backend
            let localFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const isAlreadyFavorited = localFavorites.some(fav => fav.id === product.id);

            if (isAlreadyFavorited) {
                // Remove from favorites
                localFavorites = localFavorites.filter(fav => fav.id !== product.id);
                try {
                    await axios.delete(`${baseURL}/users/guest/favorites/${product.id}`, {
                        headers: { 'X-Guest-Token': guestToken },
                    });
                    localStorage.setItem('favorites', JSON.stringify(localFavorites));
                    showSnackbar(t("Removed from favorites") + " ❌", "success");
                } catch (error) {
                    console.error("Error removing guest favorite:", error.response?.data || error.message);
                    showSnackbar(t("Error removing from favorites"), "error");
                }
            } else {
                // Add to favorites
                const favoriteItem = {
                    id: product.id,
                    title: product.title || product.name || "Unknown",
                    price: product.price || 0,
                    photos: product.photos || [],
                    date: product.date || "",
                    activity_location: product.activityLocation || product.location || "",
                };
                localFavorites.push(favoriteItem);
                try {
                    await axios.post(`${baseURL}/users/guest/favorites/${product.id}`, {}, {
                        headers: { 'X-Guest-Token': guestToken },
                    });
                    localStorage.setItem('favorites', JSON.stringify(localFavorites));
                    showSnackbar(t("Added to favorites") + " ❤️", "success");
                } catch (error) {
                    console.error("Error adding guest favorite:", error.response?.data || error.message);
                    showSnackbar(t("Error adding to favorites"), "error");
                }
            }
        }
    };

    const handleSnackbarClose = () => setSnackbarOpen(false);

    if (product === null) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <CircularProgress />
            </div>
        );
    }

    const addToCart = debounce(async () => {
        if (!product || quantity <= 0) {
            showSnackbar(t('Invalid quantity'), 'warning');
            return;
        }

        const cartItem = {
            productId: product.id,
            quantity,
            price: discountedPrice * quantity, // İndirimli fiyatı kullanmak daha doğru olacaktır
            title: product.name || product.title,
            image: product.imageUrl || (product.photos && product.photos[0]?.photo),
            orderNote,
        };

        try {
            const token = localStorage.getItem('token');
            const guestToken = localStorage.getItem('guestToken');
            const requestId = crypto.randomUUID();

            if (token) {
                const email = jwtDecode(token).sub;
                await axios.post(`${baseURL}/cart/${encodeURIComponent(email)}`, cartItem, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'X-Request-ID': requestId
                    },
                });
            } else {
                let localCart = JSON.parse(localStorage.getItem('cart')) || [];
                const existingItem = localCart.find(item => item.productId === cartItem.productId);
                if (existingItem) {
                    existingItem.quantity += cartItem.quantity;
                    existingItem.price = discountedPrice * existingItem.quantity; // Fiyatı da güncelle
                    existingItem.orderNote = orderNote || existingItem.orderNote;
                } else {
                    localCart.push(cartItem);
                }
                localStorage.setItem('cart', JSON.stringify(localCart));

                await axios.post(`${baseURL}/cart/guest`, localCart, {
                    headers: {
                        'X-Guest-Token': guestToken,
                        'X-Request-ID': requestId
                    },
                });
            }

            // --- DÜZELTİLMİŞ GOOGLE ADS KODU ---
            if (window.gtag) {
                window.gtag('event', 'add_to_cart', {
                    'send_to': 'AW-16834301094/UmqFCIDEyq0aEKaZnNs-',
                    'value': parseFloat(cartItem.price), // Sepete eklenen toplam tutar (indirimli)
                    'currency': 'EUR', // Para birimi (sabit olarak EUR ayarlı)
                    'items': [{
                        'id': product.id,                  // DOĞRU: product.id kullanıldı
                        'name': cartItem.title,            // DOĞRU: cartItem.title kullanıldı
                        'quantity': quantity               // DOĞRU: quantity değişkeni kullanıldı
                    }]
                });
                console.log("Google Ads 'add_to_cart' dönüşümü gönderildi:", {
                    id: product.id,
                    price: cartItem.price,
                    currency: 'EUR'
                });
            }
            // --- KOD BİTİŞİ ---

            showSnackbar(t('Item added to cart'), 'success');
        } catch (error) {
            console.error('Error adding to cart:', error);
            showSnackbar(t('Error adding to cart'), 'error');
        }
    }, 500);

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };
    const shareUrl = window.location.href;
    const shareMessage = `${product.title} - Check out this product!`;

    const isAlreadyFavorited = isLoggedIn
        ? favorites.favoriteProducts?.some((fav) => fav.id === product.id)
        : (JSON.parse(localStorage.getItem('favorites')) || []).some(fav => fav.id === product.id);

    // Modal open/close
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Split the description into lines for the accordion
    const descriptionLines = product.description
        ? product.description.split("\n").filter((line) => line.trim() !== "")
        : [];

    // Discount Logic
    const discountPercent = 20;
    const originalPrice = Math.floor(product.price);
    const discountedPrice = Math.floor(product.price * (1 - discountPercent / 100));

    return (
        <div className="activity-details-container">
            <Helmet>
                <title>{product.title} - Product Details | Kina Sepeti</title>
                <meta
                    name="description"
                    content={`Discover more about ${product.title}. Contact: ${product.product_email || 'N/A'} | ${product.product_phone || 'N/A'}`}
                />
                <link
                    rel="canonical"
                    href={`${window.location.origin}${window.location.pathname}`}
                />
                <meta property="og:title" content={product.title} />
                <meta
                    property="og:description"
                    content={product.description || 'Learn more about this product.'}
                />
                <meta
                    property="og:image"
                    content={
                        product.photos && product.photos.length > 0
                            ? getPrefixedImage(product.photos[0].photo, 'small')
                            : undefined
                    }
                />
                <meta
                    property="og:url"
                    content={`${window.location.origin}${window.location.pathname}`}
                />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={product.title} />
                <meta
                    name="twitter:description"
                    content={product.description || 'Learn more about this product.'}
                />
                <meta
                    name="twitter:image"
                    content={
                        product.photos && product.photos.length > 0
                            ? getPrefixedImage(product.photos[0].photo, 'small')
                            : undefined
                    }
                />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "http://schema.org",
                        "@type": "TouristAttraction",
                        "name": product.title,
                        "description": product.description,
                        "image": product.photos ? product.photos.map(photo => photo.photo) : [],
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

            <Header />
            <h2>
                {type ? `${type} - ${t(product.category)}` : t("All Products")}
            </h2>

            <div className="activity-details-wrapper">
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

                <div className="right-section">
                    <h1 className="product-title">{product.title}</h1>

                    {product.photos && product.photos.length > 0 && (
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

                    <div className="order-note-section" style={{ marginTop: "15px" }}>
                        <label htmlFor="order-note" style={{ fontWeight: "bold", display: "block", marginBottom: "5px" }}>
                            {t("Order Note (Optional)")}
                        </label>
                        <textarea
                            id="order-note"
                            value={orderNote}
                            onChange={(e) => setOrderNote(e.target.value)}
                            placeholder={t("Add any special instructions for your order...")}
                            style={{
                                width: "100%",
                                minHeight: "10px",
                                border: "1px solid #ccc",
                                borderRadius: "5px",
                                padding: "8px",
                                fontSize: "14px",
                                marginBottom: "10px"
                            }}
                        />
                    </div>

                    <Button
                        onClick={() => addToCart(quantity)}
                        variant="contained"
                        color="success"
                        startIcon={<ShoppingCartIcon />}
                        className="add-cart-btn"
                    >
                        {t('Add to Cart')}
                    </Button>

                    {product.type && (
                        <p className="product-type">
                            <strong>Type:</strong> {product.type}
                        </p>
                    )}

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
                    </div>
                </div>
            )}

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            <Footer />
        </div>
    );
};

export default ProductDetails;