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
  return langMatch ? langMatch[1] : 'tr';
};

const initializeApp = async () => {
  const currentLang = detectLanguageFromUrl();

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
