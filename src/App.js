import React, {useEffect, useState} from 'react';
import Main from "./Main";
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import ProductList from "./activity/ProductList";
import ProductDetails from "./activity/ProductDetails";
import SearchPage from "./search/SearchPage";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFnsV3";
import {CookieConsent} from "react-cookie-consent";
import Login from "./login/Login";
import Register from "./login/Register";
import {jwtDecode} from 'jwt-decode';
import Favorites from "./user/Favorites";
import {AuthProvider} from "./auth/AuthProvider";
import AboutUs from "./links/AboutUs";
import PrivacyPolicy from "./links/PrivacyPolicy";
import ContactUs from "./links/ContactUs";
import ResetPassword from "./login/ResetPassword";
import Cart from "./cart/Cart";
import Payment from "./cart/Payment";
import PaymentFailure from "./cart/PaymentFailure";
import PaymentSuccess from "./cart/PaymentSuccess";
import ArticlesPage from "./activity/ArticlesPage";
import ArticleDetailPage from "./activity/ArticleDetailPage";
import MyOrders from "./user/MyOrders";

function App() {
    const [, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);


    useEffect(() => {
        const script = document.createElement('script');
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decoded.exp < currentTime) {
                    // Token expired, remove it and redirect to login
                    localStorage.removeItem('token');
                } else {
                    setIsAuthenticated(true);
                    // Optionally decode user information from token and set user state
                }
            } catch (error) {
                console.error('Token decoding failed', error);
            }
        }

        return () => {
            // Clean up the script when the component unmounts
            document.head.removeChild(script);
        };
    }, []);
    const handleLoginSuccess = (data) => {
        localStorage.setItem('token', data.accessToken); // Assuming the response contains an accessToken
        setIsAuthenticated(true);
        setUser(data.user); // Assuming the response contains user information
        // Redirect to home page or dashboard as needed
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        // Redirect to login page or home page as needed
    };

    const handleAccept = () => {
        // Example: Update Google Analytics consent
        window.dataLayer = window.dataLayer || [];

        // Define a function to utilize window.dataLayer for pushing messages
        function gtag() {
            window.dataLayer.push(arguments);
        }

        // Update consent configuration for Google Analytics using gtag
        gtag('consent', 'update', {
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
            analytics_storage: 'granted',
            functionality_storage: 'granted',
            personalization_storage: 'granted',
            security_storage: 'granted',
        });

    };


    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Router>
                <AuthProvider>
                    <div className="App">
                        <Routes>
                            <Route path="/" element={<Main/>}/>
                            <Route path="/products" element={<ProductList/>}/>
                            <Route path="/products/:type" element={<ProductList/>}/>
                            <Route path="/products/detail/:id/:title" element={<ProductDetails/>}/>
                            <Route path="/products/detail/:id" element={<ProductDetails/>}/>
                            <Route path="/search" element={<SearchPage/>}/>
                            <Route path="/about-us" element={<AboutUs />} />
                            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                            <Route path="/contact-us" element={<ContactUs />} />
                            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess}/>}/>
                            <Route path="/users/favorites" element={<Favorites/>}/>
                            <Route path="/my-orders" element={<MyOrders />} />
                            <Route path="/register" element={<Register/>}/>
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/payment" element={<Payment />} />
                            <Route path="/payment-success" element={<PaymentSuccess />} />
                            <Route path="/payment-failure" element={<PaymentFailure />} />
                            <Route path="/articles" element={<ArticlesPage />} />
                            <Route path="/articles/:id" element={<ArticleDetailPage />} />

                        </Routes>

                        <CookieConsent
                            onAccept={handleAccept}
                            location="bottom"
                            buttonText="Accept"
                            declineButtonText="Decline"
                            cookieName="activentyUserConsent"
                            style={{background: "#2B373B"}}
                            buttonStyle={{color: "#4e503b", fontSize: "13px"}}
                            declineButtonStyle={{fontSize: "13px"}}
                            expires={150}
                        >
                            This website uses cookies to enhance the user experience.{" "}
                        </CookieConsent>
                    </div>
                </AuthProvider>
            </Router>
        </LocalizationProvider>
    );
}

export default App;
