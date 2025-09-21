/* eslint-disable */
require('ignore-styles');

// Image dosyalarını ignore et
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico'];
[...imageExtensions, ...imageExtensions.map(e => e.toUpperCase())].forEach(ext => {
  require.extensions[ext] = function (module, filename) {
    module.exports = '';
  };
});

require('@babel/register')({
  presets: [
    ['@babel/preset-env', { targets: { node: '16' } }],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ],
  extensions: ['.js', '.jsx'],
  ignore: [/node_modules/, /\.(jpg|jpeg|png|gif|svg|webp|ico)$/i]
});

const path = require('path');
const fs = require('fs');
const express = require('express');
const React = require('react');
const { renderToString } = require('react-dom/server');
const { Helmet } = require('react-helmet');
const axios = require('axios');

const ServerApp = require('./src/ServerApp').default;

const app = express();
const buildDir = path.resolve(__dirname, 'build');
const indexPath = path.join(buildDir, 'index.html');

// Çeviri dosyalarını yükle
let translations = {};
try {
  const trPath = path.join(__dirname, 'public', 'locales', 'tr', 'translation.json');
  const enPath = path.join(__dirname, 'public', 'locales', 'en', 'translation.json');

  if (fs.existsSync(trPath)) {
    translations.tr = JSON.parse(fs.readFileSync(trPath, 'utf8'));
  }
  if (fs.existsSync(enPath)) {
    translations.en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  }
} catch (e) {
  console.warn('Translation loading failed:', e.message);
}

// Serve static assets
app.use('/static', express.static(path.join(buildDir, 'static'), {
  maxAge: '1y',
  etag: true,
  fallthrough: true,
  setHeaders: (res) => {
    // Hash'li dosyalar: güvenle uzun süre cache'lenebilir
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));

app.use('/locales', express.static(path.join(__dirname, 'public', 'locales'), {
  maxAge: '1h', // Çeviri dosyaları sık değişirse kısa tut
  etag: true,
  fallthrough: true
}));

// Build kök dosyaları: index.html hariç orta süreli cache
app.use(express.static(buildDir, {
  etag: true,
  fallthrough: true,
  setHeaders: (res, filePath) => {
    const basename = path.basename(filePath);
    if (basename === 'index.html') {
      // HTML her zaman en güncel olsun
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return;
    }

    // asset-manifest gibi manifest dosyalarını kısa cache'le
    if (/asset-manifest\.json$/i.test(basename)) {
      res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=300');
      return;
    }

    // Diğer kök statikler (favicon, logo, manifest, robots, css)
    if (/\.(?:ico|png|jpg|jpeg|svg|webp|gif|css|js|xml|json)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400'); // 7 gün
    }
  }
}));

// Helper: fetch initial data for routes
async function getInitialData(url) {
  try {
    const match = url.match(/^\/(en|tr)\/products\/detail\/([^\/]+)(?:\/[^\?]*)?/i);
    if (match) {
      const id = match[2];
      const title = '';
      const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
      const lang = match[1];
      const res = await axios.get(`${baseURL}/products/detail/${id}/${title}`, {
        headers: { 'Accept-Language': lang === 'en' ? 'en' : 'tr' }
      });
      return { product: res.data };
    }
  } catch (e) {
    console.error('Initial data fetch failed:', e?.response?.data || e.message);
  }
  return {};
}

app.get('*', async (req, res) => {
  if (!fs.existsSync(indexPath)) {
    res.status(500).send('Build not found. Run "npm run build" first.');
    return;
  }

  // SSR HTML için cache kapat
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  // URL'den dil belirle
  const segments = (req.url || '/').split('/').filter(Boolean);
  const urlLang = (segments[0] === 'en' || segments[0] === 'tr') ? segments[0] : 'tr';

  const template = fs.readFileSync(indexPath, 'utf8');
  const initialData = await getInitialData(req.url);

  // i18n store'u hazırla
  const i18nStore = {
    lng: urlLang,
    resources: {
      [urlLang]: {
        translation: translations[urlLang] || {}
      }
    }
  };

  const appElement = React.createElement(ServerApp, {
    location: req.url,
    initialData,
    i18nStore
  });

  let appHtml;
  try {
    appHtml = renderToString(appElement);
  } catch (renderError) {
    console.error('SSR render failed:', renderError);
    appHtml = '<div>Loading...</div>';
  }

  const helmet = Helmet.renderStatic();

  // HTML'e enjekte et
  let html = template
    .replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>\n` +
      `<script>window.__INITIAL_DATA__ = ${JSON.stringify(initialData).replace(/</g, '\\u003c')};</script>\n` +
      `<script>window.__I18N_INITIAL_STORE__ = ${JSON.stringify(i18nStore).replace(/</g, '\\u003c')};</script>`
    )
    .replace('</head>', `${helmet.title.toString()}${helmet.meta.toString()}${helmet.link.toString()}${helmet.script.toString()}</head>`);

  res.status(200).send(html);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`SSR server is running on http://localhost:${port}`);
});
