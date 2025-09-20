import React, {useEffect} from 'react';
import {BrowserRouter as Router, useLocation, useNavigate} from 'react-router-dom';
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFnsV3";
import CookieConsent from "react-cookie-consent";
import { jwtDecode } from 'jwt-decode';
import {AuthProvider} from "./auth/AuthProvider";
import Chatbot from "./chatbot/Chatbot";
import {useTranslation} from "react-i18next";
import {Helmet} from "react-helmet";
import { initGA, trackPageView, grantAllConsent } from './analytics/ga';
import AppRoutes from './AppRoutes';

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
        if (i18n && typeof i18n.changeLanguage === 'function' && i18n.language !== currentLang) {
            i18n.changeLanguage(currentLang);
        }
    }, [location.pathname, location.search, location.hash, i18n, navigate]);

    return null;
};

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const gaId = process.env.REACT_APP_GA_MEASUREMENT_ID;
    const adsId = process.env.REACT_APP_GADS_ID;
    initGA(gaId, adsId);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          if (typeof window !== 'undefined') localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Token decoding failed', error);
      }
    }
  }, []);

  const handleAccept = () => {
    grantAllConsent();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Router>
        <AuthProvider>
          <div className="App">
            <Helmet>
              <html lang={i18n.language || 'tr'} />
            </Helmet>
            <LanguageRedirect />
            <RouteTracker />
            {/* Routes */}
            <AppRoutes />
            <Chatbot />
            <CookieConsent onAccept={handleAccept}>
              This website uses cookies to enhance the user experience.
            </CookieConsent>
          </div>
        </AuthProvider>
      </Router>
    </LocalizationProvider>
  );
}

export default App;
