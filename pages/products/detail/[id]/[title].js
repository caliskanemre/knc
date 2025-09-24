import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import Image from 'next/image';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ShareIcon from '@mui/icons-material/Share';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../../../src/auth/AuthProvider';
import { useTranslation } from 'react-i18next';

// Lightweight shimmer placeholder for fast first paint while images load
const toBase64 = (str) => (typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str));
const shimmer = (w, h) => `data:image/svg+xml;base64,${toBase64(
  `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
     <defs>
       <linearGradient id="g">
         <stop stop-color="#f6f7f8" offset="20%"/>
         <stop stop-color="#edeef1" offset="50%"/>
         <stop stop-color="#f6f7f8" offset="70%"/>
       </linearGradient>
     </defs>
     <rect width="${w}" height="${h}" fill="#f6f7f8"/>
     <rect id="r" width="${w}" height="${h}" fill="url(#g)"/>
     <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite"  />
   </svg>`)} }`;

function generateUUID() {
  try {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
      );
    }
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (_) { /* ignore */ }
  const ts = Date.now().toString(16);
  const rnd = Math.floor(Math.random() * 1e16).toString(16);
  return `${ts}-${rnd}-${ts.slice(-4)}-${rnd.slice(-4)}-${ts}${rnd}`.slice(0, 36);
}

export default function ProductDetailPage({ product, seo, pageLocale = 'tr' }) {
  const { t } = useTranslation();
  const { isLoggedIn, favorites = {}, toggleFavorite, token } = useAuth();
  const [selectedUrl, setSelectedUrl] = useState(product?.photos?.[0]?.photo || '');
  const [quantity, setQuantity] = useState(1);
  const [orderNote] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [similar, setSimilar] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

  const images = useMemo(() => (product?.photos || []).map(p => p.photo).filter(Boolean), [product]);
  useEffect(() => { if (!selectedUrl && images[0]) setSelectedUrl(images[0]); }, [images, selectedUrl]);

  const isVideoUrl = (url) => {
    if (!url) return false;
    const clean = url.toLowerCase().split('#')[0].split('?')[0];
    return /\.(mp4|webm|ogg|mov|m4v)$/.test(clean);
  };

  // Price and currency display
  const isTR = !!product?.is_turkey_user;
  const baseUIPrice = isTR ? (product?.tl_price ?? product?.price) : (product?.eur_price ?? product?.price);
  const displayOriginal = Number(baseUIPrice) || 0;
  const discountPercent = 20;
  const displayDiscounted = displayOriginal * (1 - discountPercent / 100);
  const currencySymbol = isTR ? '₺' : '€';

  // Similar products (client-side)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!product?.category) return;
      try {
        setLoadingSimilar(true);
        const res = await axios.get(`${baseURL}/products/${encodeURIComponent(product.category)}`, {
          params: { page: 0, size: 6 },
          headers: { 'Accept-Language': pageLocale === 'en' ? 'en' : 'tr' }
        });
        const list = (res.data?.content || []).filter(p => p.id !== product.id);
        if (!cancelled) setSimilar(list);
      } catch {
        if (!cancelled) setSimilar([]);
      } finally {
        if (!cancelled) setLoadingSimilar(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [product?.category, product?.id, baseURL, pageLocale]);

  const show = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const handleAddToCart = async () => {
    if (!product?.id || quantity <= 0) return show(t('Invalid quantity'), 'warning');
    try {
      const unitPrice = isTR
        ? (Number(product?.tl_price ?? product?.price) || 0)
        : (Number(product?.eur_price ?? product?.price) || 0);

      const cartItem = {
        productId: product.id,
        quantity,
        price: unitPrice * quantity,
        title: product.name || product.title,
        image: product.imageUrl || product.photos?.[0]?.photo,
        orderNote,
        currency: isTR ? 'TRY' : 'EUR',
        is_turkey_user: isTR
      };

      if (typeof window !== 'undefined') {
        const tokenStr = localStorage.getItem('token');
        let guestToken = localStorage.getItem('guestToken');
        if (!guestToken) {
          guestToken = generateUUID();
          localStorage.setItem('guestToken', guestToken);
        }

        const requestId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') ? crypto.randomUUID() : generateUUID();
        const lang = pageLocale === 'en' ? 'en' : 'tr';

        if (tokenStr) {
          const email = jwtDecode(tokenStr).sub;
          await axios.post(`${baseURL}/cart/${encodeURIComponent(email)}`, cartItem, {
            headers: { Authorization: `Bearer ${tokenStr}`, 'X-Request-ID': requestId, 'Accept-Language': lang }
          });
        } else {
          // local cart sync (array-first, then fallback single item)
          let localCart;
          try { localCart = JSON.parse(localStorage.getItem('cart') || '[]'); } catch { localCart = []; }
          const existing = localCart.find(i => i.productId === cartItem.productId);
          if (existing) {
            existing.quantity += cartItem.quantity;
            existing.price = unitPrice * existing.quantity;
            existing.orderNote = orderNote || existing.orderNote;
          } else {
            localCart.push(cartItem);
          }
          localStorage.setItem('cart', JSON.stringify(localCart));

          const headers = { 'X-Guest-Token': guestToken, 'X-Request-ID': requestId, 'Accept-Language': lang };
          try {
            await axios.post(`${baseURL}/cart/guest`, localCart, { headers, timeout: 8000 });
          } catch (err) {
            if (err?.response?.status === 401) {
              // refresh token once and retry
              const newToken = generateUUID();
              localStorage.setItem('guestToken', newToken);
              guestToken = newToken;
              await axios.post(`${baseURL}/cart/guest`, localCart, { headers: { ...headers, 'X-Guest-Token': newToken }, timeout: 8000 });
            } else if ([400, 404, 405, 415, 422].includes(err?.response?.status)) {
              // fallback to single item
              try {
                await axios.post(`${baseURL}/cart/guest`, cartItem, { headers, timeout: 8000 });
              } catch (err2) {
                if (err2?.response?.status === 401) {
                  const newToken2 = generateUUID();
                  localStorage.setItem('guestToken', newToken2);
                  await axios.post(`${baseURL}/cart/guest`, cartItem, { headers: { ...headers, 'X-Guest-Token': newToken2 }, timeout: 8000 });
                } else {
                  throw err2;
                }
              }
            } else {
              throw err;
            }
          }
        }

        if (typeof window.gtag === 'function') {
          const totalValueUI = displayOriginal * quantity; // UI fiyatı
          const currencyCode = isTR ? 'TRY' : 'EUR';
          try {
            window.gtag('event', 'conversion', { send_to: 'AW-16834301094/UmqFCIDEyq0aEKaZnNs-', value: totalValueUI, currency: currencyCode });
          } catch {}
          try {
            window.gtag('event', 'add_to_cart', { currency: currencyCode, value: totalValueUI, items: [{ item_id: String(product.id), item_name: cartItem.title || 'Product', quantity, price: displayOriginal }] });
          } catch {}
          window.dispatchEvent(new Event('cartUpdated'));
        }
      }

      show(t('Item added to cart'), 'success');
    } catch (e) {
      console.error('Add to cart error', e?.response?.status, e?.response?.data || e.message);
      if (e?.response?.status === 401) {
        show(t('Authorization error while adding to cart. Please try again.'), 'error');
      } else {
        show(t('Error adding to cart'), 'error');
      }
    }
  };

  const isFav = useMemo(() => {
    if (!product?.id) return false;
    if (isLoggedIn) return favorites?.favoriteProducts?.some(f => f.id === product.id);
    if (typeof window === 'undefined') return false;
    try { return (JSON.parse(localStorage.getItem('favorites') || '[]') || []).some(f => f.id === product.id); } catch { return false; }
  }, [favorites, isLoggedIn, product?.id]);

  const handleFavorite = async () => {
    if (!product?.id) return;
    try {
      if (isLoggedIn && token) {
        await toggleFavorite(product.id, isFav, 'product');
        show(isFav ? t('Removed from favorites') + ' ❌' : t('Added to favorites') + ' ❤️', 'success');
      } else if (typeof window !== 'undefined') {
        let localFavorites;
         try { localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]'); } catch { localFavorites = []; }
        const exists = localFavorites.some(f => f.id === product.id);
        if (exists) {
          localFavorites = localFavorites.filter(f => f.id !== product.id);
          const guestToken = localStorage.getItem('guestToken');
          if (guestToken) await axios.delete(`${baseURL}/users/guest/favorites/${product.id}`, { headers: { 'X-Guest-Token': guestToken } });
          localStorage.setItem('favorites', JSON.stringify(localFavorites));
          show(t('Removed from favorites') + ' ❌', 'success');
        } else {
          const guestToken = localStorage.getItem('guestToken') || (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()));
          if (!localStorage.getItem('guestToken')) localStorage.setItem('guestToken', guestToken);
          await axios.post(`${baseURL}/users/guest/favorites/${product.id}`, {}, { headers: { 'X-Guest-Token': guestToken } });
          const favItem = { id: product.id, title: product.title || product.name || 'Unknown', price: product.price || 0, photos: product.photos || [] };
          localFavorites.push(favItem);
          localStorage.setItem('favorites', JSON.stringify(localFavorites));
          show(t('Added to favorites') + ' ❤️', 'success');
        }
      }
    } catch (e) {
      console.error('Favorite error', e?.response?.data || e.message);
      show(t('Error syncing favorites'), 'error');
    }
  };

  const handleWhatsAppOrder = () => {
    if (!product?.id || quantity <= 0) return show(t('Invalid product or quantity'), 'warning');
    const totalDiscounted = displayDiscounted * quantity;
    const summary = `• ${product.title} - ${quantity} adet - ${totalDiscounted.toFixed(2)} ${currencySymbol}${orderNote ? ` (Not: ${orderNote})` : ''}`;
    const msg = `🛍️ Yeni Siparis:\n\n📦 Urun:\n${summary}\n\n💰 Toplam: ${totalDiscounted.toFixed(2)} ${currencySymbol}\n\n📅 Siparis Tarihi: ${new Date().toLocaleString('tr-TR')}`;
    const phoneNumber = '905348290866';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`;
    if (typeof window !== 'undefined') window.open(url, '_blank');
    show(t('Redirecting to WhatsApp...'), 'info');
  };

  // Locale-aware description selector
  const getLocalizedDescription = (p, lang) => {
    if (!p) return '';
    const l = (lang || 'tr').toLowerCase().startsWith('en') ? 'en' : 'tr';

    // translations yapısı varsa deneyin
    const trans = p.translations && (p.translations[l] || p.translations[l.toUpperCase()] || p.translations[l === 'en' ? 'En' : 'Tr']);
    if (trans) {
      const desc = trans.description || trans.desc || trans.longDescription || trans.shortDescription;
      if (typeof desc === 'string' && desc.trim()) return desc.trim();
    }

    // Alan varyantları (en)
    if (l === 'en') {
      const candidatesEN = [
        p.descriptionEn,
        p.descriptionEN,
        p.en_description,
        p.descEn,
        p.descEN,
        p.enDesc,
        p.longDescriptionEn,
        p.shortDescriptionEn
      ];
      for (const c of candidatesEN) { if (typeof c === 'string' && c.trim()) return c.trim(); }
    } else {
      // Alan varyantları (tr)
      const candidatesTR = [
        p.descriptionTr,
        p.descriptionTR,
        p.tr_description,
        p.descTr,
        p.descTR,
        p.trDesc,
        p.longDescriptionTr,
        p.shortDescriptionTr
      ];
      for (const c of candidatesTR) { if (typeof c === 'string' && c.trim()) return c.trim(); }
    }

    // Genel fallback
    return (typeof p.description === 'string' && p.description.trim())
      ? p.description.trim()
      : (typeof p.shortDescription === 'string' ? p.shortDescription.trim() : '');
  };

  const localizedDescription = useMemo(() => getLocalizedDescription(product, pageLocale), [product, pageLocale]);

  if (!product) {
    return (
      <Container maxWidth="md">
        <CssBaseline />
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5">{t('Product not found', 'Ürün bulunamadı')}</Typography>
        </Box>
      </Container>
    );
  }

  const { metaTitle, metaDescription, canonical, alternates, ogImage } = seo || {};
  const shareUrl = typeof window !== 'undefined' ? window.location.href : canonical;

  return (
    <>
      <Head>
        <title>{metaTitle || (product.title || 'Ürün')}</title>
        {metaDescription && <meta name="description" content={metaDescription} />}
        {canonical && <link rel="canonical" href={canonical} />}
        {alternates?.tr && <link rel="alternate" hrefLang="tr" href={alternates.tr} />}
        {alternates?.en && <link rel="alternate" hrefLang="en" href={alternates.en} />}
        {alternates?.xDefault && <link rel="alternate" hrefLang="x-default" href={alternates.xDefault} />}
        <meta property="og:title" content={metaTitle || (product.title || 'Ürün')} />
        {metaDescription && <meta property="og:description" content={metaDescription} />}
        <meta property="og:type" content="product" />
        {(ogImage || images[0]) && <meta property="og:image" content={ogImage || images[0]} />}
        {canonical && <meta property="og:url" content={canonical} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle || (product.title || 'Ürün')} />
        {metaDescription && <meta name="twitter:description" content={metaDescription} />}
        {(ogImage || images[0]) && <meta name="twitter:image" content={ogImage || images[0]} />}
        {product.structuredData?.product && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(product.structuredData.product) }} />
        )}
        {product.structuredData?.breadcrumbs && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(product.structuredData.breadcrumbs) }} />
        )}
        {/* Preconnect to image CDN to reduce DNS/TLS latency */}
        <link rel="preconnect" href="https://d2830psw11bu27.cloudfront.net" crossOrigin="" />
      </Head>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {/* Main media */}
            <Card sx={{ position: 'relative', aspectRatio: '1 / 1', mb: 2 }}>
              {isVideoUrl(selectedUrl) ? (
                <video controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} poster={images.find((u) => !isVideoUrl(u)) || undefined}>
                  <source src={selectedUrl} />
                </video>
              ) : (
                <Image
                  src={selectedUrl || (images[0] || 'https://via.placeholder.com/800x800?text=No+Image')}
                  alt={product.title || 'Product'}
                  fill
                  sizes="(max-width: 900px) 100vw, 900px"
                  style={{ objectFit: 'cover' }}
                  priority
                  quality={60}
                  placeholder="blur"
                  blurDataURL={shimmer(16, 16)}
                />
              )}
            </Card>
            {/* Thumbnails */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {images.map((url) => (
                <Box key={url} sx={{ width: 72, height: 72, position: 'relative', border: url === selectedUrl ? '2px solid #8B0000' : '1px solid #eee', borderRadius: 1, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setSelectedUrl(url)}>
                  {isVideoUrl(url) ? (
                    <video style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted>
                      <source src={url} />
                    </video>
                  ) : (
                    <Image src={url} alt={product.title || 'thumb'} fill sizes="72px" style={{ objectFit: 'cover' }} quality={60} />
                  )}
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h4" sx={{ mb: 1 }}>{product.title || product.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{product.category}</Typography>

            {/* Price */}
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 2 }}>
              <Typography sx={{ textDecoration: 'line-through', color: 'gray' }}>{displayOriginal.toFixed(2)} {currencySymbol}</Typography>
              <Typography variant="h5" color="primary">{displayDiscounted.toFixed(2)} {currencySymbol}</Typography>
              <Typography variant="body2" color="error">%{discountPercent} indirim</Typography>
            </Box>

            {/* Quantity */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Button variant="outlined" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
              <Typography sx={{ minWidth: 32, textAlign: 'center' }}>{quantity}</Typography>
              <Button variant="outlined" onClick={() => setQuantity(q => q + 1)}>+</Button>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" startIcon={<ShoppingCartIcon />} onClick={handleAddToCart}>{t('Add to Cart', 'Sepete Ekle')}</Button>
              <Button variant="outlined" startIcon={<WhatsAppIcon />} color="success" onClick={handleWhatsAppOrder}>WhatsApp</Button>
              <IconButton onClick={handleFavorite} color={isFav ? 'error' : 'default'} aria-label="favorite">
                {isFav ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              {/* basic share anchors */}
              <IconButton component="a" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl || '')}`} target="_blank" rel="noopener noreferrer" aria-label="share"><ShareIcon /></IconButton>
            </Box>

            {/* Description */}
            {localizedDescription && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>{t('Description', 'Açıklama')}</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{localizedDescription}</Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Similar products */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>{t('Similar Products', 'Benzer Ürünler')}</Typography>
          {loadingSimilar ? (
            <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <Grid container spacing={2}>
              {similar.map((p) => {
                const img = p.photos?.[0]?.photo || 'https://via.placeholder.com/300x300?text=No+Image';
                const href = `/products/detail/${p.id}/${encodeURIComponent(p.title || 'product')}`;
                return (
                  <Grid item key={p.id} xs={6} sm={4} md={3}>
                    <Card sx={{ p: 1 }}>
                      <Box component="a" href={href} sx={{ position: 'relative', display: 'block', aspectRatio: '1 / 1' }}>
                        <Image src={img} alt={p.title || 'product'} fill sizes="(max-width: 400px) 100vw, 400px" style={{ objectFit: 'cover' }} />
                      </Box>
                      <Typography variant="body2" noWrap sx={{ mt: 1 }}>{p.title}</Typography>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Container>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}

export async function getServerSideProps({ params, locale, defaultLocale, resolvedUrl, req }) {
  try {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const { id, title } = params;
    const langHeader = { 'Accept-Language': locale === 'en' ? 'en' : 'tr' };
    const encodedTitle = encodeURIComponent(title || '');

    let product = null;
    let primaryError = null;

    // 1) Try title-based endpoint
    try {
      const res = await axios.get(`${baseURL}/products/detail/${id}/${encodedTitle}`, {
        headers: langHeader,
        timeout: 5000,
      });
      product = res.data || null;
    } catch (e) {
      primaryError = e;
    }

    // 2) Fallback: try id-only endpoint if first failed or product is null
    if (!product) {
      try {
        const resId = await axios.get(`${baseURL}/products/${id}`, { headers: langHeader, timeout: 5000 });
        product = resId.data || null;
      } catch (_) {
        // ignore
      }
    }

    // If still not found, render not found state (no crash)
    if (!product) {
      console.error('SSR product fetch failed:', primaryError?.response?.data || primaryError?.message);
      return { props: { product: null, seo: null, structuredData: null, pageLocale: locale || 'tr', defaultLocale: defaultLocale || 'tr', asPath: resolvedUrl || '/' } };
    }

    // If title in URL does not match actual product title, redirect to canonical URL with correct title
    const actualTitle = product.title || product.name || '';
    const decodedParamTitle = decodeURIComponent(title || '');
    if (actualTitle && decodedParamTitle && actualTitle !== decodedParamTitle) {
      const destination = `/products/detail/${id}/${encodeURIComponent(actualTitle)}`;
      return { redirect: { destination, permanent: true } };
    }

    // Helper: locale-aware description (SSR)
    const pickLocalizedDescription = (p, loc) => {
      if (!p) return '';
      const l = (loc || 'tr').toLowerCase().startsWith('en') ? 'en' : 'tr';
      const trans = p.translations && (p.translations[l] || p.translations[l.toUpperCase()] || p.translations[l === 'en' ? 'En' : 'Tr']);
      if (trans) {
        const d = trans.description || trans.desc || trans.longDescription || trans.shortDescription;
        if (typeof d === 'string' && d.trim()) return d.trim();
      }
      if (l === 'en') {
        const enList = [p.descriptionEn, p.descriptionEN, p.en_description, p.descEn, p.descEN, p.enDesc, p.longDescriptionEn, p.shortDescriptionEn];
        for (const c of enList) { if (typeof c === 'string' && c.trim()) return c.trim(); }
      } else {
        const trList = [p.descriptionTr, p.descriptionTR, p.tr_description, p.descTr, p.descTR, p.trDesc, p.longDescriptionTr, p.shortDescriptionTr];
        for (const c of trList) { if (typeof c === 'string' && c.trim()) return c.trim(); }
      }
      return (typeof p.description === 'string' && p.description.trim()) ? p.description.trim() : (typeof p.shortDescription === 'string' ? p.shortDescription.trim() : '');
    };

    const headers = req?.headers || {};
    const proto = headers['x-forwarded-proto'] || 'http';
    const host = headers['host'] || 'localhost:3000';
    const origin = `${proto}://${host}`;

    // Use localized description for meta
    const rawDesc = pickLocalizedDescription(product, locale);
    const plainDesc = rawDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const metaDescription = (plainDesc && plainDesc.length > 160)
      ? plainDesc.slice(0, 157).replace(/[,:;.!?]*$/, '') + '…'
      : (plainDesc || `${product?.title || 'Ürün'} uygun fiyatlı kına gecesi ürünleri.`);

    const currentLang = locale === 'en' ? 'en' : 'tr';
    const safeTitle = encodeURIComponent(actualTitle || title || 'product');
    const pathTR = `/products/detail/${id}/${safeTitle}`;
    const pathEN = `/en/products/detail/${id}/${safeTitle}`;
    const canonical = `${origin}${currentLang === 'tr' ? pathTR : pathEN}`;

    const images = (product?.photos || []).map(p => p.photo).filter(Boolean);
    const ogImage = images[0] || 'https://www.kinasepeti.com/ksLogo.jpeg';

    const seo = {
      metaTitle: `${product?.title || 'Ürün'} | Kına Sepeti`,
      metaDescription,
      canonical,
      ogImage,
      alternates: {
        tr: `${origin}${pathTR}`,
        en: `${origin}${pathEN}`,
        xDefault: `${origin}${pathTR}`
      }
    };

    const schemaCurrency = product?.is_turkey_user ? 'TRY' : 'EUR';
    const schemaUnitPrice = product?.is_turkey_user
      ? (Number(product?.tl_price ?? product?.price) || 0)
      : (Number(product?.eur_price ?? product?.price) || 0);

    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product?.title,
      image: images,
      description: plainDesc || undefined,
      sku: product?.id ? String(product.id) : undefined,
      brand: { '@type': 'Brand', name: 'Kina Sepeti' },
      offers: {
        '@type': 'Offer',
        priceCurrency: schemaCurrency,
        price: schemaUnitPrice.toFixed(2),
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        url: canonical
      }
    };

    const breadcrumbs = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Kına Sepeti', item: `${origin}/${currentLang === 'tr' ? '' : 'en'}` },
        { '@type': 'ListItem', position: 2, name: product?.category || 'Ürünler', item: `${origin}/${currentLang === 'tr' ? '' : 'en/'}products` },
        { '@type': 'ListItem', position: 3, name: product?.title || 'Ürün', item: canonical }
      ]
    };

    const structuredData = { product: productSchema, breadcrumbs };

    return { props: { product: { ...product, structuredData }, seo, pageLocale: locale || 'tr', defaultLocale: defaultLocale || 'tr', asPath: resolvedUrl || '/' } };
  } catch (e) {
    console.error('SSR product fetch failed (outer):', e?.response?.data || e.message);
    return { props: { product: null, seo: null, structuredData: null, pageLocale: 'tr', defaultLocale: 'tr', asPath: '/' } };
  }
}
