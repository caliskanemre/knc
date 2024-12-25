import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import Axios from "axios";
import Header from "../header/Header";
import BackgroundGallery from "../shared/BackgroundGallery";
import './css/ActivityDetails.css';
import {Button} from "@mui/material";
import BackgroundGalleryDetails from "../shared/BackgroundGalleryDetails";
import {Helmet} from "react-helmet";
import { jwtDecode } from "jwt-decode";


import {
    FacebookIcon,
    FacebookShareButton,
    TelegramIcon,
    TelegramShareButton,
    WhatsappIcon,
    WhatsappShareButton
} from "react-share";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import axios from "axios";
import {useAuth} from "../auth/AuthProvider";

const ActivityDetails = () => {
    const {id} = useParams();
    const {title} = useParams();
    const [product, setProduct] = useState(null);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [cart, setCart] = useState([]); // State to manage cart
    const [quantity, setQuantity] = useState(1);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [username, setUsername] = useState('');

    const isMobile = window.innerWidth <= 768;

    const toggleMap = () => {
        setIsMapOpen(!isMapOpen);
        console.log("Map Open State:", !isMapOpen); // This should log true/false alternately on each click
    };


    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    useEffect(() => {
        // Make an HTTP GET request to fetch events from the backend
        Axios.get(`${baseURL}/products/detail/${id}`)
            .then((response) => {
                setProduct(response.data);
            })
            .catch((error) => {
                console.error('Error fetching events:', error);
            });
    }, [id]); // Include eventId as a dependency in useEffect

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            const decodedToken = jwtDecode(storedToken);
            setUsername(decodedToken.sub); // Extract `sub` or equivalent from the token
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

    const renderLink = (content) => {
        // Regex for detecting an email address
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Regex for detecting a URL (basic version for demonstration, can be expanded)
        const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

        if (emailRegex.test(content)) {
            // If content is an email address
            return <a href={`mailto:${content}`} style={{textDecoration: 'none'}}>{content}</a>;
        } else if (urlRegex.test(content)) {
            // If content is a URL
            return <a href={content} target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}}>Visit
                Website</a>;
        } else {
            // If content is neither, just display the content
            return <span>{content}</span>;
        }
    };

    const shareUrl = window.location.href;
    const shareMessage = `${product.title} - Check out this product!`;

    return (
        <div className="event-details" style={{textAlign: 'center', position: 'relative'}}>
            <Helmet>
                <title>{product.title} - Product Details | Kina Sepeti</title>
                <meta name="description"
                      content={`Discover more about ${product.title} at ${product}. Contact: ${product.product_email || 'N/A'} | ${product.product_phone || 'N/A'}`}/>
                <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`}/>
                {/* Open Graph / Facebook */}
                <meta property="og:title" content={product.title}/>
                <meta property="og:description"
                      content={product.description || 'Learn more about this product.'}/>
                <meta property="og:image"
                      content={(product.photos.length > 0) ? product.photos[0].photo : undefined}/>
                <meta property="og:url" content={`${window.location.origin}${window.location.pathname}`}/>
                <meta property="og:type" content="website"/>
                <meta property="og:site_name" content="Activenty"/>
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:title" content={product.title}/>
                <meta name="twitter:description"
                      content={product.description || 'Learn more about this product.'}/>
                <meta name="twitter:image"
                      content={(product.photos.length > 0) ? product.photos[0].photo : undefined}/>
                {/* Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "http://schema.org",
                        "@type": "TouristAttraction", // Adjust based on the product type
                        "name": product.title,
                        "description": product.description,
                        "image": product.photos.map(photo => photo.photo),
                        "location": {
                            "@type": "Place",
                            "name": product.location,
                            // Additional location details if available
                        },
                        "offers": {
                            "@type": "Offer",
                            "price": product.price,
                            // Additional offer details if available
                        },
                        "telephone": product.product_phone,
                        "email": product.product_email,
                        "url": product.product_website,
                        "publisher": {
                            "@type": "Organization",
                            "name": "Activenty",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://activenty.com/logo.png"
                            }
                        }
                        // Additional product details if available
                    })}
                </script>
            </Helmet>

            <Header/>

            {product.photos.length > 0 && (
                <div style={{position: 'relative'}}>
                    {/* Background overlay */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%', // Cover 100% on mobile
                            height: '100%',
                            zIndex: 1, // Make sure it's above the images
                        }}

                    >

                    </div>
                    {isMobile ? (
                        <BackgroundGallery images={product.photos.map((photo) => photo.photo)}/>
                    ) : (
                        <BackgroundGalleryDetails images={product.photos.map((photo) => photo.photo)}/>
                    )}
                </div>
            )}
            <div className="product-container">
                <div className="product" style={{maxWidth: '800px', margin: '0 auto', padding: '20px'}}>
                    {/* Product Title */}
                    <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '20px'}}>{product.title}</h1>
                    {product.description && (
                        <p style={{fontSize: '1rem', lineHeight: '1.6', color: '#666', marginBottom: '30px'}}>
                            {product.description}
                        </p>
                    )}

                    <div
                        style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px'}}>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => setQuantity(prev => (prev > 1 ? prev - 1 : 1))}
                            style={{
                                margin: '0 10px',
                                padding: '10px',
                                minWidth: '40px',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                borderRadius: '50%',
                            }}
                        >
                            -
                        </Button>
                        <span style={{fontSize: '1.5rem', fontWeight: 'bold', margin: '0 20px'}}>{quantity}</span>
                        <Button
                            variant="outlined"
                            color="success"
                            onClick={() => setQuantity(prev => prev + 1)}
                            style={{
                                margin: '0 10px',
                                padding: '10px',
                                minWidth: '40px',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                borderRadius: '50%',
                            }}
                        >
                            +
                        </Button>
                    </div>
                    {/* Price Section */}
                    {product.price && (
                        <div
                            style={{
                                fontSize: '1.8rem',
                                fontWeight: 'bold',
                                color: '#4caf50',
                                margin: '10px 0 30px',
                            }}
                        >
                            {product.price} TL
                        </div>
                    )}

                    {/* Product Description */}

                    <Button
                        onClick={() => addToCart(quantity)}
                        variant="contained"
                        color="success"
                        startIcon={<ShoppingCartIcon />}
                        style={{
                            marginBottom: '20px',
                            padding: '12px 25px',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            borderRadius: '30px',
                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        Add {quantity} to Cart
                    </Button>


                    {product.type && (
                        <p style={{fontSize: '1rem', color: '#333', marginBottom: '20px'}}>
                            <strong>Type:</strong> {product.type}
                        </p>
                    )}


                    <div className="share-buttons">
                        {/* WhatsApp Share Button */}
                        <WhatsappShareButton url={shareUrl} title={shareMessage} separator=":: "
                                             style={{marginRight: '10px'}}>
                            <WhatsappIcon size={32} round/>
                        </WhatsappShareButton>
                        <TelegramShareButton url={shareUrl} title={shareMessage} style={{marginRight: '10px'}}>
                            <TelegramIcon size={32} round/>
                        </TelegramShareButton>
                        <FacebookShareButton url={shareUrl} title={shareMessage} style={{marginRight: '10px'}}>
                            <FacebookIcon size={32} round/>
                        </FacebookShareButton>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ActivityDetails;