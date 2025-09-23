import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const isServer = typeof window === 'undefined';

// Temel çeviriler - her durumda mevcut olacak
const baseResources = {
  en: {
    translation: {
      heroTitle: 'Your Dream Henna Night',
      heroSubtitle: 'Everything you need for your special day is just a click away.',
      'About Us': 'About Us',
      'Contact Us': 'Contact',
      'Privacy Policy': 'Privacy Policy',
      'Policies': 'Policies',
      'Articles': 'Blog',
      'Products': 'Products',
      'Login': 'Login',
      'Register': 'Register',
      'Search': 'Search'
    }
  },
  tr: {
    translation: {
      heroTitle: 'Hayalinizdeki Kına Gecesi',
      heroSubtitle: 'En özel gününüz için ihtiyacınız olan her şey bir tık uzağınızda.',
      'About Us': 'Hakkımızda',
      'Contact Us': 'İletişim',
      'Privacy Policy': 'Gizlilik Politikası',
      'Policies': 'Politikalar',
      'Articles': 'Blog',
      'Products': 'Ürünler',
      'Login': 'Giriş Yap',
      'Register': 'Kayıt Ol',
      'Search': 'Ara'
    }
  }
};

// Başlangıç dilini tespit et
const detectInitialLang = () => {
  if (isServer) return 'tr';
  try {
    // 1) <html lang="..."> önceliklidir (SSR tarafından ayarlanır)
    const htmlLang = document?.documentElement?.lang;
    if (htmlLang === 'tr' || htmlLang === 'en') return htmlLang;

    // 2) URL segmenti /tr veya /en ise
    const seg = window.location.pathname.split('/')[1];
    if (seg === 'tr' || seg === 'en') return seg;

    // 3) NEXT_LOCALE çerezi varsa
    const m = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/);
    if (m) {
      const v = decodeURIComponent(m[1]);
      if (v === 'tr' || v === 'en') return v;
    }
  } catch {}
  return 'tr';
};

const initialLang = detectInitialLang();

// Tek seferlik init
i18n.use(initReactI18next).init({
  lng: initialLang,
  fallbackLng: 'en',
  supportedLngs: ['en', 'tr'],
  load: 'languageOnly',
  debug: false,
  resources: baseResources,
  interpolation: { escapeValue: false },
  react: { useSuspense: false }
});

// Client tarafında ek çeviriler yükle
if (!isServer) {
  // Async olarak tam çeviri dosyalarını yükle
  const loadFullTranslations = async () => {
    try {
      const [trResponse, enResponse] = await Promise.all([
        fetch('/locales/tr/translation.json'),
        fetch('/locales/en/translation.json')
      ]);

      if (trResponse.ok && enResponse.ok) {
        const [trData, enData] = await Promise.all([
          trResponse.json(),
          enResponse.json()
        ]);

        i18n.addResourceBundle('tr', 'translation', trData, true, true);
        i18n.addResourceBundle('en', 'translation', enData, true, true);
      }
    } catch (error) {
      console.warn('Failed to load full translations:', error);
    }
  };

  loadFullTranslations();
}

export default i18n;
