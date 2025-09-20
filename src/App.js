import React, {useEffect, useState} from 'react';
import Main from "./Main";
import {BrowserRouter as Router, Route, Routes, useLocation, useNavigate} from 'react-router-dom';
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
import Chatbot from "./chatbot/Chatbot";
import {useTranslation} from "react-i18next";
import {Helmet} from "react-helmet";
import ShippingPolicy from "./links/ShippingPolicy";
import ReturnPolicy from "./links/ReturnPolicy";
import SalesAgreement from "./links/SalesAggrement";
import { initGA, trackPageView, grantAllConsent } from './analytics/ga';

// Route change tracker for GA page_view
const RouteTracker = () => {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location.pathname, location.search]);
  return null;
};

const LanguageRedirect = () => {
    const { i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    // Tarayıcı/HTML diline göre tercih edilen dil kodunu belirle
    const getPreferredLang = () => {
        const htmlLang = (typeof document !== 'undefined' && document.documentElement.getAttribute('lang')) || '';
        const navLang = (typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage)) || '';
        const src = (htmlLang || navLang || '').toLowerCase();
        return src.startsWith('tr') ? 'tr' : 'en';
    };

    useEffect(() => {
        const validLangs = ['en', 'tr'];
        const path = location.pathname || '/';
        const segments = path.split('/').filter(Boolean);
        const currentLang = segments[0];

        // www olmayan domaine gelindiyse www'ye yönlendir (tam sayfa yönlendirme)
        if (typeof window !== 'undefined' && window.location.hostname === 'kinasepeti.com') {
            const target = 'https://www.kinasepeti.com' + window.location.pathname + (window.location.search || '') + (window.location.hash || '');
            window.location.replace(target);
            return;
        }

        // Yol dil öneki içermiyorsa, tercih edilen dile göre yönlendir
        const hasLangPrefix = validLangs.includes(currentLang);
        if (!hasLangPrefix) {
            const pref = getPreferredLang();
            let newPath = `/${pref}${path.startsWith('/') ? path : '/' + path}`;
            if (newPath === '/tr' || newPath === '/en') newPath += '/';
            const full = newPath + (location.search || '') + (location.hash || '');
            navigate(full, { replace: true });
            return;
        }

        // URL'deki dil öneki geçerliyse i18n dilini ayarla
        if (i18n.language !== currentLang) {
            i18n.changeLanguage(currentLang);
        }
    }, [location.pathname, location.search, location.hash, i18n, navigate]);

    return null;
};

function App() {
  const { i18n } = useTranslation();
  const [, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

    useEffect(() => {
        const gaId = process.env.REACT_APP_GA_MEASUREMENT_ID;
        const adsId = process.env.REACT_APP_GADS_ID;
        initGA(gaId, adsId);
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decoded.exp < currentTime) {
                    localStorage.removeItem('token');
                } else {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Token decoding failed', error);
            }
        }
    }, []);

    const handleLoginSuccess = (data) => {
        localStorage.setItem('token', data.accessToken);
        setIsAuthenticated(true);
        setUser(data.user);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
    };

    const handleAccept = () => {
        // On cookie consent accept grant GA storage
        grantAllConsent();
    };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Router>
        <AuthProvider>
          <div className="App">
            {/* Set <html lang> dynamically based on i18n language */}
            <Helmet>
              <html lang={i18n.language || 'tr'} />
            </Helmet>
            <LanguageRedirect />
            <RouteTracker />
            <Routes>
              {/* Main Routes */}
              <Route path="/:lang/" element={<Main />} />
              <Route path="/:lang/products" element={<ProductList />} />
              <Route path="/:lang/products/:type" element={<ProductList />} />
              <Route path="/:lang/products/detail/:id/:title" element={<ProductDetails />} />
              <Route path="/:lang/products/detail/:id" element={<ProductDetails />} />
              <Route path="/:lang/search" element={<SearchPage />} />

              {/* Legal Pages */}
              <Route path="/:lang/about-us" element={<AboutUs />} />
              <Route path="/:lang/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/:lang/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/:lang/return-policy" element={<ReturnPolicy />} />
              <Route path="/:lang/sales-agreement" element={<SalesAgreement />} />
              <Route path="/:lang/contact-us" element={<ContactUs />} />

              {/* User Routes */}
              <Route path="/:lang/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/:lang/users/favorites" element={<Favorites />} />
              <Route path="/:lang/my-orders" element={<MyOrders />} />
              <Route path="/:lang/register" element={<Register />} />
              <Route path="/:lang/reset-password" element={<ResetPassword />} />

              {/* Cart and Payment Routes */}
              <Route path="/:lang/cart" element={<Cart />} />
              <Route path="/:lang/payment" element={<Payment />} />
              <Route path="/:lang/payment-success" element={<PaymentSuccess />} />
              <Route path="/:lang/payment-failure" element={<PaymentFailure />} />

              {/* Articles */}
              <Route path="/:lang/articles" element={<ArticlesPage />} />
              <Route path="/:lang/articles/:id" element={<ArticleDetailPage />} />
            </Routes>
            <Chatbot />
          </div>
        </AuthProvider>
      </Router>
    </LocalizationProvider>
  );
}

export default App;
