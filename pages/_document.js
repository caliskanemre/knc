import Document, { Html, Head, Main, NextScript } from 'next/document';
import createEmotionServer from '@emotion/server/create-instance';
import createEmotionCache from '../src/mui/createEmotionCache';

export default class MyDocument extends Document {
  render() {
    const lang = (this.props && this.props.__NEXT_DATA__ && this.props.__NEXT_DATA__.locale) || 'tr';
    return (
      <Html lang={lang}>
        <Head>
          {/* Preconnects for faster font fetching */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

          {/* Critical font (used in hero title): load non-blocking with preload-as-style */}
          <link
            rel="preload"
            as="style"
            href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap"
            onLoad="this.onload=null;this.rel='stylesheet'"
          />
          <noscript>
            <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap"
            />
          </noscript>

          {/* Defer the rest of font families non-blocking */}
          <link
            rel="preload"
            as="style"
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lora:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
            onLoad="this.onload=null;this.rel='stylesheet'"
          />
          <noscript>
            <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Lora:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
            />
          </noscript>

          {/* Hint the browser early about the image CDN used for the LCP hero image */}
          <link rel="dns-prefetch" href="//d2830psw11bu27.cloudfront.net" />
          <link rel="preconnect" href="https://d2830psw11bu27.cloudfront.net" crossOrigin="anonymous" />

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
