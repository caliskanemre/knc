import React from 'react';
import ReactDOM from 'react-dom/client';
import { hydrateRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from "axios";
import i18n from './i18n';
import { I18nextProvider } from 'react-i18next';
import { InitialDataProvider } from './shared/InitialDataContext';

axios.interceptors.request.use(config => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
});

// URL'den dil algıla ve i18n'i başlat
const detectLanguageFromUrl = () => {
  const path = window.location.pathname;
  const langMatch = path.match(/^\/(en|tr)/);
  return langMatch ? langMatch[1] : null;
};

const detectBrowserLang = () => {
  const navLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
  return navLang.startsWith('en') ? 'en' : 'tr';
};

const ensureLocalePrefix = () => {
  const hasLocale = detectLanguageFromUrl();
  if (!hasLocale) {
    const pref = detectBrowserLang();
    const { pathname, search, hash } = window.location;
    const target = `/${pref}${pathname.startsWith('/') ? pathname : '/' + pathname}${search || ''}${hash || ''}`;
    window.location.replace(target);
    return false; // redirected
  }
  return true;
};

const initializeApp = async () => {
  // Dil öneki yoksa, render etmeden önce yönlendir
  if (!ensureLocalePrefix()) return;

  const currentLang = detectLanguageFromUrl() || 'tr';

  // i18n dilini URL'e göre senkron ayarla
  if (i18n.language !== currentLang) {
    await i18n.changeLanguage(currentLang);
  }

  // SSR initial store varsa yükle
  if (window.__I18N_INITIAL_STORE__) {
    try {
      const { resources } = window.__I18N_INITIAL_STORE__;
      if (resources && resources[currentLang]) {
        i18n.addResourceBundle(currentLang, 'translation', resources[currentLang].translation, true, true);
      }
    } catch (e) {
      console.warn('Failed to load SSR i18n store:', e);
    }
  }

  const container = document.getElementById('root');
  const initialData = window.__INITIAL_DATA__ || {};

  const app = (
    <React.StrictMode>
      <I18nextProvider i18n={i18n}>
        <InitialDataProvider value={initialData}>
          <App />
        </InitialDataProvider>
      </I18nextProvider>
    </React.StrictMode>
  );

  if (container && container.hasChildNodes()) {
    hydrateRoot(container, app);
  } else {
    const root = ReactDOM.createRoot(container);
    root.render(app);
  }

  reportWebVitals();
};

// App'i başlat
initializeApp();
