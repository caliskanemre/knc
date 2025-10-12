import Document, { Html, Head, Main, NextScript } from 'next/document';
import createEmotionServer from '@emotion/server/create-instance';
import createEmotionCache from '../src/mui/createEmotionCache';

export default class MyDocument extends Document {
  render() {
    const lang = (this.props && this.props.__NEXT_DATA__ && this.props.__NEXT_DATA__.locale) || 'tr';
    return (
      <Html lang={lang}>
        <Head>
          {/* Site Name for SEO */}
          <meta property="og:site_name" content="Kınasepeti" />
          <meta name="application-name" content="Kınasepeti" />

          {/* Favicon and Logo - Optimized */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#000000" />

          {/* Open Graph / Social Media */}
          <meta property="og:image" content="/android-chrome-512x512.png" />
          <meta property="og:type" content="website" />

          {/* LCP OPTİMİZASYONU: Kritik görsellerin preload edilmesi */}
          <link rel="preload" as="image" href="https://d2830psw11bu27.cloudfront.net/sade.webp" fetchPriority="high" />
          <link rel="preload" as="image" href="https://d2830psw11bu27.cloudfront.net/sade-mobile.webp" fetchPriority="high" media="(max-width: 599px)" />

          {/* CDN preconnect for faster image loading */}
          <link rel="preconnect" href="https://d2830psw11bu27.cloudfront.net" />

          {/* Preconnects for faster font fetching */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          {/* Consolidated Google Fonts stylesheet */}
          <link
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lora:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Dancing+Script:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
          {/* Emotion SSR styles will be injected below by getInitialProps */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

MyDocument.getInitialProps = async (ctx) => {
  const originalRenderPage = ctx.renderPage;

  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) => <App emotionCache={cache} {...props} />,
    });

  const initialProps = await Document.getInitialProps(ctx);
  // Extract the styles as <style> tags
  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      key={style.key}
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    styles: [
      ...initialProps.styles,
      ...emotionStyleTags,
    ],
  };
};
