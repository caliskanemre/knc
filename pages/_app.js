import React from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { I18nextProvider } from 'react-i18next';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import i18n from '../src/i18n';
import createEmotionCache from '../src/mui/createEmotionCache';
import theme from '../src/mui/theme';
import '../src/index.css';

// Client-side cache shared for the whole session
const clientSideEmotionCache = createEmotionCache();

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-ERZ1D4VS7L';
const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID || 'AW-16834301094';

export default function MyApp({ Component, pageProps, emotionCache = clientSideEmotionCache }) {
  return (
    <CacheProvider value={emotionCache}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={theme}>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </Head>

          {/* Google Analytics */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
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
          <Component {...pageProps} />
        </ThemeProvider>
      </I18nextProvider>
    </CacheProvider>
  );
}
