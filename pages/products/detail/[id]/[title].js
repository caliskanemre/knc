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
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ShareIcon from '@mui/icons-material/Share';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
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

export default function ProductDetailPage({ product, seo, pageLocale = 'tr', initialIsTR = null }) {
  const { t } = useTranslation();
  const { isLoggedIn, favorites = {}, toggleFavorite, token } = useAuth();
  const [selectedUrl, setSelectedUrl] = useState(product?.photos?.[0]?.photo || '');
  const [quantity, setQuantity] = useState(1);
  const [orderNote] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [similar, setSimilar] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Amazon tarzı fotoğraf modal için state'ler
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [displayIsTR, setDisplayIsTR] = useState(() => {
    if (typeof initialIsTR === 'boolean') return initialIsTR;
    if (typeof product?.is_turkey_user === 'boolean') return !!product.is_turkey_user;
    return null;
  });

  // Client: localStorage/cookie üzerinden son kararı ver
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Önce backend'den gelen is_turkey_user bilgisini kontrol et
    if (typeof product?.is_turkey_user === 'boolean') {
      const isTR = !!product.is_turkey_user;
      setDisplayIsTR(isTR);
      // Backend kararını localStorage'a da kaydet
      try {
        localStorage.setItem('is_turkey_user', JSON.stringify(isTR));
        document.cookie = `is_turkey_user=${isTR ? '1' : '0'}; path=/; max-age=15552000`;
      } catch(_) {}
      return;
    }

    // Backend bilgisi yoksa localStorage/cookie kontrol et
    try {
      const raw = localStorage.getItem('is_turkey_user');
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'boolean') {
          setDisplayIsTR(parsed);
          return;
        }
      }

      // localStorage yoksa cookie kontrol et
      const m = document.cookie.match(/(?:^|; )is_turkey_user=([^;]+)/);
      if (m) {
        setDisplayIsTR(m[1] === '1');
        return;
      }
    } catch(_) {}

    // Son çare dil tahmini
    if (displayIsTR === null && typeof navigator !== 'undefined') {
      const guess = navigator.language?.toLowerCase().startsWith('tr');
      setDisplayIsTR(!!guess);
    }
  }, [product?.is_turkey_user]);

  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
  const placeholderImg = '/ksLogo.jpeg';

  const images = useMemo(() => (product?.photos || []).map(p => p.photo).filter(Boolean), [product]);

  // Ana fotoğraf için optimize edilmiş URL'ler
  const optimizedImages = useMemo(() => {
    if (!images.length) return [];
    return images.map(url => {
      if (!url) return url;
      // Medium prefix kullan (hızlı yüklenme + yeterli kalite)
      return url.replace(/([^/]+)$/, `medium_$1`) || url;
    });
  }, [images]);

  useEffect(() => {
    if (!selectedUrl && optimizedImages[0]) setSelectedUrl(optimizedImages[0]);
  }, [optimizedImages, selectedUrl]);

  const isVideoUrl = (url) => {
    if (!url) return false;
    const clean = url.toLowerCase().split('#')[0].split('?')[0];
    return /(\.(mp4|webm|ogg|mov|m4v)$)/.test(clean);
  };

  // Price and currency display (displayIsTR öncelikli)
  const isTRDisplay = typeof displayIsTR === 'boolean' ? displayIsTR : !!product?.is_turkey_user;
  const baseUIPrice = isTRDisplay ? (product?.tl_price ?? product?.price) : (product?.eur_price ?? product?.price);
  const displayOriginal = Number(baseUIPrice) || 0;
  const discountPercent = 20;
  const displayDiscounted = displayOriginal * (1 - discountPercent / 100);
  const currencySymbol = isTRDisplay ? '₺' : '€';

  // Similar products (client-side)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!product?.category) return;
      try {
        setLoadingSimilar(true);
        const res = await axios.get(`${baseURL}/products/${encodeURIComponent(product.category)}`, {
          params: { page: 0, size: 6, locale: pageLocale === 'en' ? 'en' : 'tr' },
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
      const unitPrice = isTRDisplay
        ? (Number(product?.tl_price ?? product?.price) || 0)
        : (Number(product?.eur_price ?? product?.price) || 0);

      const cartItem = {
        productId: product.id,
        quantity,
        price: unitPrice * quantity,
        title: product.name || product.title,
        image: product.imageUrl || product.photos?.[0]?.photo,
        orderNote,
        currency: isTRDisplay ? 'TRY' : 'EUR',
        is_turkey_user: isTRDisplay
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
          const currencyCode = isTRDisplay ? 'TRY' : 'EUR';
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

  // Amazon tarzı fotoğraf modal fonksiyonları
  const handleImageClick = () => {
    const currentIndex = optimizedImages.findIndex(img => img === selectedUrl);
    setCurrentImageIndex(currentIndex >= 0 ? currentIndex : 0);
    setImageModalOpen(true);
  };

  const handleModalClose = () => {
    setImageModalOpen(false);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : optimizedImages.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev < optimizedImages.length - 1 ? prev + 1 : 0));
  };

  // Klavye navigasyonu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!imageModalOpen) return;
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'Escape') handleModalClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageModalOpen, optimizedImages.length]);

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
            <Card sx={{ position: 'relative', aspectRatio: '1 / 1', mb: 2, cursor: 'pointer' }} onClick={handleImageClick}>
              {isVideoUrl(selectedUrl) ? (
                <video controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} poster={images.find((u) => !isVideoUrl(u)) || undefined}>
                  <source src={selectedUrl} />
                </video>
              ) : (
                <Image
                  src={selectedUrl || (optimizedImages[0] || placeholderImg)}
                  alt={product.title || 'Product'}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 400px"
                  style={{ objectFit: 'cover' }}
                  priority
                  quality={85}
                  placeholder="empty"
                  loading="eager"
                />
              )}
              {/* Zoom indicator */}
              <Box sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}>
                🔍 {t('Click to zoom', 'Yakınlaştırmak için tıklayın')}
              </Box>
            </Card>
            {/* Thumbnails */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {optimizedImages.map((url, index) => (
                <Box key={url} sx={{ width: 72, height: 72, position: 'relative', border: selectedUrl === url ? '2px solid #8B0000' : '1px solid #eee', borderRadius: 1, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setSelectedUrl(url)}>
                  {isVideoUrl(url) ? (
                    <video style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted>
                      <source src={url} />
                    </video>
                  ) : (
                    <Image
                      src={url || placeholderImg}
                      alt={product.title || 'thumb'}
                      fill
                      sizes="72px"
                      style={{ objectFit: 'cover' }}
                      quality={75}
                      loading={index < 4 ? "eager" : "lazy"}
                    />
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
                const img = p.photos?.[0]?.photo || placeholderImg;
                const sanitizeTitle = (str) => (str || 'product').replace(/[\\/]+/g, '-').replace(/\s+/g, ' ').trim();
                const href = `/products/detail/${p.id}/${encodeURIComponent(sanitizeTitle(p.title || 'product'))}`;
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

      {/* Amazon tarzı fotoğraf modalı */}
      <Dialog open={imageModalOpen} onClose={handleModalClose} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ position: 'relative', width: '100%', pb: '100%', overflow: 'hidden' }}>
            {optimizedImages.length > 0 && (
              <Image
                src={optimizedImages[currentImageIndex]}
                alt={product.title || 'Product'}
                fill
                sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 400px"
                style={{ objectFit: 'contain', position: 'absolute', top: 0, left: 0 }}
                priority
                quality={85}
                placeholder="empty"
                loading="eager"
              />
            )}
          </Box>
          <IconButton onClick={handleModalClose} sx={{ position: 'absolute', top: 16, right: 16, color: 'white' }}>
            <CloseIcon />
          </IconButton>
          {optimizedImages.length > 1 && (
            <>
              <IconButton onClick={handlePrevImage} sx={{ position: 'absolute', top: '50%', left: 8, color: 'white', transform: 'translateY(-50%)' }}>
                <ChevronLeftIcon />
              </IconButton>
              <IconButton onClick={handleNextImage} sx={{ position: 'absolute', top: '50%', right: 8, color: 'white', transform: 'translateY(-50%)' }}>
                <ChevronRightIcon />
              </IconButton>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export async function getServerSideProps({ params, locale, defaultLocale, resolvedUrl, req }) {
  try {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const { id, title } = params;
    const lang = (locale === 'en' ? 'en' : 'tr');
    // Daha uyumlu Accept-Language başlığı
    const acceptLang = lang === 'en' ? 'en-US,en;q=0.9' : 'tr-TR,tr;q=0.9,en;q=0.5';

    // Kullanıcının TR olup olmadığını SSR'da tahmin et (URL/locale/cookie/Accept-Language)
    const inHeaders = req?.headers || {};
    const cookie = inHeaders.cookie || '';
    const rawAcceptLang = inHeaders['accept-language'] || '';
    const urlPath = resolvedUrl || '';
    const urlIsTR = !!(urlPath && /(^|\/)tr(\/|$)/i.test(urlPath));
    const cookieIsTR = /(?:^|;)\s*is_turkey_user=1\b/.test(cookie || '');
    const langIsTR = ((locale || '').toLowerCase().startsWith('tr')) || (/\btr\b/i.test(rawAcceptLang || ''));
    const initialIsTR = !!(urlIsTR || cookieIsTR || langIsTR);

    // Backend'e iletilecek ortak header'lar (IP forward ederek backend'in GeoIP tespiti yapabilmesi için)
    const fwdFor = inHeaders['x-forwarded-for'] || inHeaders['x-real-ip'] || '';
    const socketIp = req?.socket?.remoteAddress || '';
    const clientIp = (typeof fwdFor === 'string' && fwdFor) ? fwdFor.split(',')[0].trim() : (socketIp || '');
    const headers = {
      'Accept-Language': acceptLang,
      'Accept': 'application/json',
      ...(clientIp ? { 'X-Forwarded-For': clientIp, 'X-Real-IP': clientIp } : {})
    };

    let product = null;

    const extractProduct = (data, wantedId) => {
      if (!data) return null;
      if (data.id) return data;
      // Ortak sarmalayıcılar
      if (data.product && typeof data.product === 'object') return extractProduct(data.product, wantedId);
      if (data.result && typeof data.result === 'object') return extractProduct(data.result, wantedId);
      if (data.data && typeof data.data === 'object') return extractProduct(data.data, wantedId);
      // Dizi/icerik
      if (Array.isArray(data)) {
        if (wantedId != null) {
          const found = data.find((d) => d && String(d.id) === String(wantedId));
          return found || data[0] || null;
        }
        return data[0] || null;
      }
      if (data.content && Array.isArray(data.content)) {
        if (wantedId != null) {
          const found = data.content.find((d) => d && String(d.id) === String(wantedId));
          return found || data.content[0] || null;
        }
        return data.content[0] || null;
      }
      return null;
    };

    const tryFetch = async (label, url, opts = {}) => {
      try {
        const res = await axios.get(url, {
          headers: opts.headers ?? headers,
          params: { ...(opts.params || {}), locale: lang },
          timeout: opts.timeout || 7000
        });
        const data = res.data;
        const extracted = extractProduct(data, id);
        if (extracted && extracted.id) {
          console.info(`[SSR product] OK ${label} ${url}`);
          return extracted;
        }
        console.warn(`[SSR product] Unexpected shape/no match from ${label}:`, typeof data, Array.isArray(data) ? 'array' : Object.keys(data || {}));
        return null;
      } catch (e) {
        const status = e?.response?.status;
        const msg = e?.response?.data || e.message;
        console.error(`[SSR product] FAIL ${label} ${url} ->`, status, msg);
        return null;
      }
    };

    // Deneme sırası (currency parametresi gönderilmiyor, backend IP'ye göre tespit etsin)
    product = await tryFetch('id-headers-only', `${baseURL}/products/${id}`, { headers });

    if (!product) {
      const encTitle = encodeURIComponent(title || '');
      product = await tryFetch('detail-with-title', `${baseURL}/products/detail/${id}/${encTitle}`, { headers });
    }

    if (!product) {
      product = await tryFetch('detail-id-only', `${baseURL}/products/detail/${id}`, { headers });
    }

    if (!product) {
      const decodedTitle = decodeURIComponent(title || '');
      product = await tryFetch('search-fts', `${baseURL}/products/searchByFts`, { params: { query: decodedTitle, page: 0, size: 50 }, headers });
    }

    if (!product || !product.id) {
      return { props: { product: null, seo: null, structuredData: null, pageLocale: locale || 'tr', defaultLocale: defaultLocale || 'tr', asPath: resolvedUrl || '/', initialIsTR } };
    }

    const sanitizeTitle = (str) => (str || 'product').replace(/[\\/]+/g, '-').replace(/\s+/g, ' ').trim();
    const actualTitle = product.title || product.name || '';
    const sanitizedActual = sanitizeTitle(actualTitle);
    const decodedParamTitle = sanitizeTitle(decodeURIComponent(title || ''));
    if (sanitizedActual && decodedParamTitle && sanitizedActual !== decodedParamTitle) {
      const destination = `/products/detail/${id}/${encodeURIComponent(sanitizedActual)}`;
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

    const reqHeaders = req?.headers || {};
    const proto = reqHeaders['x-forwarded-proto'] || 'http';
    const host = reqHeaders['host'] || 'localhost:3000';
    const origin = `${proto}://${host}`;

    const rawDesc = pickLocalizedDescription(product, locale);
    const plainDesc = rawDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const metaDescription = (plainDesc && plainDesc.length > 160)
      ? plainDesc.slice(0, 157).replace(/[,:;.!?]*$/, '') + '…'
      : (plainDesc || `${product?.title || 'Ürün'} uygun fiyatlı kına gecesi ürünleri.`);

    const currentLang = locale === 'en' ? 'en' : 'tr';
    const safeTitle = encodeURIComponent(sanitizedActual || 'product');
    const pathTR = `/products/detail/${id}/${safeTitle}`;
    const pathEN = `/en/products/detail/${id}/${safeTitle}`;
    const canonical = `${origin}${currentLang === 'tr' ? pathTR : pathEN}`;

    const images = (product?.photos || []).map(p => p.photo).filter(Boolean);
    const ogImage = images[0] || `${origin}/ksLogo.jpeg`;

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

    const schemaCurrency = (typeof product.is_turkey_user === 'boolean' ? product.is_turkey_user : initialIsTR) ? 'TRY' : 'EUR';
    const schemaUnitPrice = schemaCurrency === 'TRY'
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

    // Ürüne SSR kararı da not düş (UI için ipucu)
    const productWithFlag = { ...product, is_turkey_user: typeof product.is_turkey_user === 'boolean' ? product.is_turkey_user : initialIsTR };

    return { props: { product: { ...productWithFlag, structuredData }, seo, pageLocale: locale || 'tr', defaultLocale: defaultLocale || 'tr', asPath: resolvedUrl || '/', initialIsTR } };
  } catch (e) {
    console.error('SSR product fetch failed (outer):', e?.response?.data || e.message);
    return { props: { product: null, seo: null, structuredData: null, pageLocale: 'tr', defaultLocale: 'tr', asPath: '/' } };
  }
}
