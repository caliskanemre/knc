import React, { useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { I18nextProvider } from 'react-i18next';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Box from '@mui/material/Box';
import { useRouter } from 'next/router';
import i18n from '../src/i18n';
import createEmotionCache from '../src/mui/createEmotionCache';
import theme from '../src/mui/theme';
import '../src/index.css';
import '../src/chatbot/Chatbot.css';
import NextHeader from '../src/components/NextHeader';
import Footer from '../src/Footer';
import Chatbot from '../src/chatbot/Chatbot';
import {AuthProvider} from "../src/auth/AuthProvider";

// Client-side cache shared for the whole session
const clientSideEmotionCache = createEmotionCache();

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-ERZ1D4VS7L';
const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID || 'AW-16834301094';

export default function MyApp({ Component, pageProps, emotionCache = clientSideEmotionCache }) {
  const router = useRouter();
  const { locale = 'tr', defaultLocale = 'tr', asPath = '/' } = router || {};

  // Sync i18next language with Next.js locale
  useEffect(() => {
    if (locale && i18n?.language !== locale) {
      i18n.changeLanguage(locale).catch(() => {});
    }
  }, [locale]);

  return (
    <CacheProvider value={emotionCache}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <Head>
              <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            {/* Google Analytics */}
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);} 
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
              gtag('config', '${GADS_ID}');
            `}
            </Script>

            <CssBaseline />

            {/* Sayfa düzeni: footer sabit değil, en altta */}
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              {/* Global Header */}
              <NextHeader locale={locale} defaultLocale={defaultLocale} asPath={asPath} />

              {/* Sayfa içeriği */}
              <Box component="main" sx={{ flexGrow: 1 }}>
                <Component {...pageProps} />
              </Box>

              {/* Global Footer (sabit değil) */}
              <Footer />

              {/* Global Chatbot - sabit sağ alt */}
              <Chatbot />
            </Box>
          </AuthProvider>
        </ThemeProvider>
      </I18nextProvider>
    </CacheProvider>
  );
}
