// Google Analytics / Google Ads helper
// Uses global site tag (gtag.js) dynamically.

let lastTrackedPath = null;
let lastTrackedTime = 0;

export function initGA(measurementId, adsConversionId) {
  if (!measurementId && !adsConversionId) return;
  if (window.__GA_INITIALIZED__) return; // avoid duplicates

  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);} // eslint-disable-line
  window.gtag = gtag;

  gtag('js', new Date());

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied'
  });

  const script = document.createElement('script');
  script.async = true;
  const ids = [measurementId, adsConversionId].filter(Boolean);
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ids[0])}`;
  document.head.appendChild(script);

  if (measurementId) gtag('config', measurementId, { send_page_view: false });
  if (adsConversionId) gtag('config', adsConversionId);

  window.__GA_INITIALIZED__ = true;
}

export function grantAllConsent() {
  if (!window.gtag) return;
  window.gtag('consent', 'update', {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted'
  });
}

export function trackPageView(path, title) {
  if (!window.gtag) return;
  const now = Date.now();
  if (lastTrackedPath === path && (now - lastTrackedTime) < 400) return;
  lastTrackedPath = path;
  lastTrackedTime = now;
  const measurementId = process.env.REACT_APP_GA_MEASUREMENT_ID;
  if (measurementId) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href
    });
  }
}

export function trackEvent(name, params = {}) {
  if (!window.gtag) return;
  window.gtag('event', name, params);
}

