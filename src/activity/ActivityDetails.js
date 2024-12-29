import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import Axios from "axios";
import Header from "../header/Header";
import './css/ActivityDetails.css';
import {Button, IconButton} from "@mui/material";
import { Helmet } from "react-helmet";
import axios from "axios";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { jwtDecode } from "jwt-decode";  // ensure you have a correct import
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
import {useAuth} from "../auth/AuthProvider";

const ActivityDetails = () => {
  const { id } = useParams();
  const { title } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // For image modal
    const {type} = useParams();
    const { favorites, toggleFavorite } = useAuth()

    const isMobile = window.innerWidth <= 768;
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

  // Fetch product details
  useEffect(() => {
    Axios.get(`${baseURL}/products/detail/${id}`)
      .then((response) => {
        setProduct(response.data);
      })
      .catch((error) => {
        console.error('Error fetching product:', error);
      });
  }, [id, baseURL]);

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

    if (product === null) {
        return <div>Loading...</div>;
    }

    const addToCart = async (quantity) => {
        if (!isLoggedIn) {
            alert("You need to be logged in to add items to the cart.");
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
                alert(`${quantity} ${product.title} added to the cart!`);
            } else {
                alert("Failed to add item to cart.");
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert("There was an error adding the product to your cart.");
        }
    };

    const shareUrl = window.location.href;
    const shareMessage = `${product.title} - Check out this product!`;

    const isAlreadyFavorited = favorites.favoriteActivities?.some(fav => fav.id === product.productId);

    // Modal open/close
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

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
                <meta property="og:title" content={product.title}/>
                <meta
                    property="og:description"
                    content={product.description || 'Learn more about this product.'}
                />
                <meta
                    property="og:image"
                    content={(product.photos.length > 0) ? product.photos[0].photo : undefined}
                />
                <meta
                    property="og:url"
                    content={`${window.location.origin}${window.location.pathname}`}
                />
                <meta property="og:type" content="website"/>
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:title" content={product.title}/>
                <meta
                    name="twitter:description"
                    content={product.description || 'Learn more about this product.'}
                />
                <meta
                    name="twitter:image"
                    content={(product.photos.length > 0) ? product.photos[0].photo : undefined}
                />
                {/* Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "http://schema.org",
                        "@type": "TouristAttraction", // or "Product", "Event" – adapt as needed
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
                                "url": "https://activenty.com/logo.png"
                            }
                        }
                    })}
                </script>
            </Helmet>

            {/* Header */}
            <Header/>
            <h2>{type ? `${type}` : 'All Products'} - KINA SEPETI</h2>
            <div className="activity-details-wrapper">
                {/* Left Section: single main image */}
                <div className="left-section">
                    {selectedImage && (
                        <img
                            src={selectedImage}
                            alt="Selected"
                            className="main-image"
                            onClick={openModal}
                        />
                    )}
                </div>

                {/* Right Section: Product Info */}
                <div className="right-section">
                    <h1 className="product-title">{product.title}</h1>



                    {/* Thumbnail Row (New) */}
                    {product.photos.length > 0 && (
                        <div className="thumbnail-container">
                            {product.photos.map((photo, index) => (
                                <img
                                    key={index}
                                    src={photo.photo}
                                    alt={`Thumbnail ${index}`}
                                    className="thumbnail"
                                    onClick={() => setSelectedImage(photo.photo)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Price */}
                    {product.price && (
                        <div className="product-price">
                            {product.price} TL
                        </div>
                    )}

                    {/* Quantity Controls */}
                    <div className="quantity-control">
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => setQuantity(prev => (prev > 1 ? prev - 1 : 1))}
                            className="quantity-btn"
                        >
                            -
                        </Button>
                        <span className="quantity-display">{quantity}</span>
                        <Button
                            variant="outlined"
                            color="success"
                            onClick={() => setQuantity(prev => prev + 1)}
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
                        startIcon={<ShoppingCartIcon/>}
                        className="add-cart-btn"
                    >
                        Add {quantity} to Cart
                    </Button>

                    {/* Type (if exists) */}
                    {product.type && (
                        <p className="product-type">
                            <strong>Type:</strong> {product.type}
                        </p>
                    )}

                    <div className="share-buttons"  style={{ marginTop: '10px', marginLeft: '25px' }}>
                        <WhatsappShareButton
                            url={shareUrl}
                            title={shareMessage}
                            separator=":: "
                            className="share-btn"
                        >
                            <WhatsappIcon size={32} round/>
                        </WhatsappShareButton>
                        <TelegramShareButton
                            url={shareUrl}
                            title={shareMessage}
                            className="share-btn"
                        >
                            <TelegramIcon size={32} round/>
                        </TelegramShareButton>
                        <FacebookShareButton
                            url={shareUrl}
                            quote={shareMessage}
                            className="share-btn"
                        >
                            <FacebookIcon size={32} round/>
                        </FacebookShareButton>
                    </div>
                    {/* Favorite Button */}
                    <IconButton
                        aria-label="add to favorites"
                        onClick={() => toggleFavorite(product.productId, isAlreadyFavorited, "product")}
                        style={{ marginTop: '20px' }}
                    >
                        {isAlreadyFavorited ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                    </IconButton>
                </div>
            </div>
            <div style={{ marginTop: '10px' }}>
                {product.description && (
                    <p className="product-description">
                        {product.description}
                    </p>
                )}
            </div>
            {/* IMAGE MODAL (lightbox) when clicked */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content">
                        <img
                            src={selectedImage}
                            alt="Full Size"
                            className="modal-image"
                            onClick={(e) => e.stopPropagation()}
                            /* stopPropagation so clicking the image won't close modal immediately */
                        />
                    </div>
                </div>
            )}



        </div>
    );
};

export default ActivityDetails;
