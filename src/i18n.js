import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector'; // Import the language detector

i18n
    .use(HttpBackend) // Load translations via http
    .use(LanguageDetector) // Detect language
    .use(initReactI18next) // Pass the i18n instance to react-i18next
    .init({
        fallbackLng: 'tr', // Fallback language is English
        debug: true,
        interpolation: {
            escapeValue: false, // Not needed for React as it escapes by default
        },
        detection: {
            order: ['navigator'], // Use the 'navigator' detector
            caches: [] // Do not cache the language setting to respect user's preference in each session
        }
    });

export default i18n;
