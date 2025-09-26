import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation } from "react-router-dom"; // useLocation eklendi
import Axios from "axios";
import Header from "../header/Header";
import './css/ActivityDetails.css';
import {
    Button,
    IconButton,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Snackbar,
    Alert,
    CircularProgress,
    AccordionDetails,
    Box,
    Grid,
    useTheme,
    useMediaQuery
} from "@mui/material";
import { debounce } from '@mui/material/utils';
import SEO from '../shared/SEO';
import axios from "axios";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { jwtDecode } from "jwt-decode";
import {
    FacebookIcon,
    FacebookShareButton,
    TelegramIcon,
    TelegramShareButton,
    WhatsappIcon,
    WhatsappShareButton
} from "react-share";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useAuth } from "../auth/AuthProvider";
import { useTranslation } from "react-i18next";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Footer from "../Footer";
import { trackEvent } from "../analytics/ga";
import { useInitialData } from "../shared/InitialDataContext";

// Helper to slugify product titles for canonical consistency
const slugify = (str) => str ? str.toString().toLowerCase()
  .normalize('NFD').replace(/\p{Diacritic}/gu, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .substring(0, 80) : '';


// Locale-aware description selector (SPA)
const pickLocalizedDescription = (p, lang) => {
    if (!p) return '';
    const l = (lang || 'tr').toLowerCase().startsWith('en') ? 'en' : 'tr';

    // translations alanı varsa öncelik ver
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

function generateUUID() {
    try {
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
            );
        }
    } catch (_) { /* ignore */ }
    // Fallback: timestamp + random
    const ts = Date.now().toString(16);
    const rnd = Math.floor(Math.random() * 1e16).toString(16);
    return `${ts}-${rnd}-${ts.slice(-4)}-${rnd.slice(-4)}-${ts}${rnd}`.slice(0, 36);
}

const getPrefixedImage = (url, prefix) => {
    if (!url) return url;
    return url.replace(/([^/]+)$/, `${prefix}_$1`);
};

// Detect if a media URL is a video file (basic extension check)
const isVideoUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const u = url.toLowerCase();
    const clean = u.split('#')[0].split('?')[0];
    return /\.(mp4|webm|ogg|mov|m4v)$/.test(clean);
};

// Kalıcı TR bayrağını oku (localStorage/cookie)
const readIsTRFromStorage = () => {
    try {
        if (typeof window === 'undefined') return null;
        const ls = window.localStorage?.getItem('is_turkey_user');
        if (ls !== null && ls !== undefined) {
            if (ls === '1' || ls === 'true') return true;
            if (ls === '0' || ls === 'false') return false;
            try { return JSON.parse(ls); } catch (_) { /* ignore */ }
        }
        const m = document.cookie.match(/(?:^|; )is_turkey_user=([^;]+)/);
        if (m) {
            const v = decodeURIComponent(m[1]);
            if (v === '1' || v === 'true') return true;
            if (v === '0' || v === 'false') return false;
        }
    } catch (_) { /* ignore */ }
    return null;
};

const writeIsTRToStorage = (isTR) => {
    try {
        if (typeof window === 'undefined') return;
        window.localStorage?.setItem('is_turkey_user', JSON.stringify(!!isTR));
        document.cookie = `is_turkey_user=${isTR ? '1' : '0'}; path=/; max-age=15552000`;
    } catch (_) { /* ignore */ }
};

const guessTRFromNavigator = () => {
    try {
        if (typeof navigator === 'undefined') return null;
        return !!navigator.language?.toLowerCase().startsWith('tr');
    } catch (_) { return null; }
};

const ProductDetails = () => {
    const { id, title } = useParams();
    const location = useLocation();
    // Route state üzerinden (varsa) product'ı hemen kullanarak ilk network gecikmesini azalt
    const routeStateProduct = location?.state?.product;
    const initialData = useInitialData();
    const initialProduct = routeStateProduct || initialData?.product;
    const [product, setProduct] = useState(initialProduct || null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState('');
    // Hero görsel optimizasyonu için ek state'ler
    const [heroDisplaySrc, setHeroDisplaySrc] = useState(null); // Şu an img tag'inde gösterilen kaynak
    const [heroHighResLoaded, setHeroHighResLoaded] = useState(false); // Medium/large yüklendi mi
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [orderNote, setOrderNote] = useState("");
    const [similarProducts, setSimilarProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Persisted guest token: generate if absent, then store in localStorage and state
    const [guestToken, setGuestToken] = useState(() => (typeof window !== 'undefined' ? (localStorage.getItem('guestToken') || generateUUID()) : ''));

    // guestToken'ı mount anında localStorage'a garanti yaz
    useEffect(() => {
        if (typeof window !== 'undefined' && guestToken && localStorage.getItem('guestToken') !== guestToken) {
            localStorage.setItem('guestToken', guestToken);
        }
    }, [guestToken]);

    const { token, isLoggedIn, favorites, toggleFavorite } = useAuth();
    const { t, i18n } = useTranslation();
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Fiyat formatlama (dönüşüm yok, yalnızca sembol)
    const formatPrice = (amount, isTR) => {
        const symbol = isTR ? '₺' : '€';
        const num = Number(amount) || 0;
        return `${num.toFixed(2)} ${symbol}`;
    };

    // Ürün yüklendiğinde varsa is_turkey_user bilgisini kalıcılaştır; yoksa navigator’dan tahminle (backend düzeltebilir)
    useEffect(() => {
        if (!product) return;
        const hasFlag = product.is_turkey_user !== undefined && product.is_turkey_user !== null;
        if (hasFlag) {
            writeIsTRToStorage(!!product.is_turkey_user);
        } else {
            const persisted = readIsTRFromStorage();
            if (persisted === null) {
                const guess = guessTRFromNavigator();
                if (guess !== null) writeIsTRToStorage(guess);
            }
        }
    }, [product]);

    // Ürün fetch (yalnızca elimizde yoksa)
    useEffect(() => {
        if (product && product.id) return; // already have
        Axios.get(`${baseURL}/products/detail/${id}/${title}` , {
            headers: {
                'Accept-Language': i18n.language === 'en' ? 'en' : 'tr'
            }
        })
            .then((response) => {
                setProduct(response.data);
            })
            .catch((error) => {
                console.error('Error fetching product:', error);
                showSnackbar(t("Failed to load product") + " ❌", "error");
            });
    }, [id, title, baseURL, i18n.language, product, t]);

    // Set default selected image
    useEffect(() => {
        if (product && product.photos && product.photos.length > 0) {
            setSelectedImage(prev => prev || product.photos[0].photo);
        }
    }, [product]);

    // selectedImage değişince aggressive preload başlat
    useEffect(() => {
        if (!selectedImage || isVideoUrl(selectedImage)) {
            setHeroDisplaySrc(selectedImage);
            setHeroHighResLoaded(true);
            return;
        }

        const small = getPrefixedImage(selectedImage, 'small');
        const medium = getPrefixedImage(selectedImage, 'medium');
        const large = getPrefixedImage(selectedImage, 'large');

        // Her durumda hemen small göster
        setHeroDisplaySrc(small);
        setHeroHighResLoaded(true); // blur'ı hemen kaldır

        const startTs = performance.now();

        // Arka planda medium preload (görünmez)
        const mediumImg = new Image();
        mediumImg.src = medium;
        mediumImg.onload = () => {
            // Medium yüklendikten sonra swap
            setHeroDisplaySrc(medium);
            const dur = Math.round(performance.now() - startTs);
            try { console.log('[HeroImage Fast] upgraded small->medium in', dur, 'ms'); } catch(_){}

            // Large arka planda preload
            if (large && large !== medium) {
                const largeImg = new Image();
                largeImg.src = large;
            }
        };
        mediumImg.onerror = () => {
            console.log('[HeroImage Fast] medium failed, staying with small');
        };

    }, [selectedImage]);

    // Sayfa yüklenirken tüm görselleri agresif preload
    useEffect(() => {
        if (!product?.photos?.length) return;

        const preloadAll = () => {
            product.photos.forEach((photo, index) => {
                if (!isVideoUrl(photo.photo)) {
                    // İlk 3 görseli small+medium preload
                    if (index < 3) {
                        const smallImg = new Image();
                        smallImg.src = getPrefixedImage(photo.photo, 'small');
                        const mediumImg = new Image();
                        mediumImg.src = getPrefixedImage(photo.photo, 'medium');
                    } else {
                        // Diğerleri sadece small preload
                        const smallImg = new Image();
                        smallImg.src = getPrefixedImage(photo.photo, 'small');
                    }
                }
            });
        };

        // 100ms gecikmeyle preload başlat (sayfa render'ını engellememek için)
        const preloadTimer = setTimeout(preloadAll, 100);
        return () => clearTimeout(preloadTimer);
    }, [product?.photos]);

    // GA view_item event: Ürün detayları yüklendiğinde tetiklenir
    useEffect(() => {
        if (product && product.id) {
            trackEvent('view_item', {
                items: [
                    {
                        item_id: product.id,
                        item_name: product.title,
                        item_category: product.category,
                        price: product.price,
                        currency: currency,
                        // Ekstra alanlar eklenebilir
                    }
                ]
            });
        }
    }, [product, currency]);

    // Fetch similar products
    const fetchSimilarProducts = useCallback(async (typeValue) => {
        if (!typeValue) return;
        try {
            const response = await Axios.get(`${baseURL}/products/${typeValue}?page=0&size=5`, {
                headers: {
                    'Accept-Language': i18n.language === 'en' ? 'en' : 'tr'
                }
            });
            const fetched = response.data.content || [];
            setSimilarProducts(prev => fetched.filter(p => p.id !== product?.id));
        } catch (error) {
            console.error('Error fetching similar products:', error);
        }
    }, [baseURL, i18n.language, product?.id]);

    // Similar products effect (bağımlılık güncellendi)
    useEffect(() => {
        if (product?.category) {
            fetchSimilarProducts(product.category);
        }
    }, [product?.category, fetchSimilarProducts]);

    const handleFavoriteClick = async () => {
        if (!product || !product.id) {
            showSnackbar(t("Cannot add to favorites: Product not loaded"), "error");
            return;
        }

        if (isLoggedIn && token) {
            // Logged-in user: Use toggleFavorite
            const isAlreadyFavorited = favorites.favoriteProducts?.some((fav) => fav.id === product.id);
            toggleFavorite(product.id, isAlreadyFavorited, "product");
            showSnackbar(isAlreadyFavorited ? t("Removed from favorites") + " ❌" : t("Added to favorites") + " ❤️", "success");
        } else {
            // Guest user: Update localStorage and sync with backend
            let localFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const isAlreadyFavorited = localFavorites.some(fav => fav.id === product.id);

            if (isAlreadyFavorited) {
                // Remove from favorites
                localFavorites = localFavorites.filter(fav => fav.id !== product.id);
                try {
                    await axios.delete(`${baseURL}/users/guest/favorites/${product.id}`, {
                        headers: { 'X-Guest-Token': guestToken },
                    });
                    localStorage.setItem('favorites', JSON.stringify(localFavorites));
                    showSnackbar(t("Removed from favorites") + " ❌", "success");
                } catch (error) {
                    console.error("Error removing guest favorite:", error.response?.data || error.message);
                    showSnackbar(t("Error removing from favorites"), "error");
                }
            } else {
                // Add to favorites
                const favoriteItem = {
                    id: product.id,
                    title: product.title || product.name || "Unknown",
                    price: product.price || 0,
                    photos: product.photos || [],
                    date: product.date || "",
                    activity_location: product.activityLocation || product.location || "",
                };
                localFavorites.push(favoriteItem);
                try {
                    await axios.post(`${baseURL}/users/guest/favorites/${product.id}`, {}, {
                        headers: { 'X-Guest-Token': guestToken },
                    });
                    localStorage.setItem('favorites', JSON.stringify(localFavorites));
                    showSnackbar(t("Added to favorites") + " ❤️", "success");
                } catch (error) {
                    console.error("Error adding guest favorite:", error.response?.data || error.message);
                    showSnackbar(t("Error adding to favorites"), "error");
                }
            }
        }
    };

    const handleSnackbarClose = () => setSnackbarOpen(false);

    if (product === null) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <CircularProgress />
            </div>
        );
    }

    // Discount Logic (moved earlier so SEO can use values)
    const discountPercent = 20;

    // Para birimi tespiti önceliği:
    // 1) Kalıcı bayrak (localStorage/cookie: is_turkey_user)
    // 2) product.is_turkey_user
    // 3) product.currency (TRY/TL/EUR)
    // 4) i18n.language (tr => TRY, diğer => EUR)
    const persistedIsTR = readIsTRFromStorage();
    const normCurr = (product?.currency || '').toUpperCase();
    const langIsTR = (i18n.language || 'tr').toLowerCase().startsWith('tr');

    const isTR = (persistedIsTR !== null) ? persistedIsTR
        : (product?.is_turkey_user !== undefined && product?.is_turkey_user !== null) ? !!product.is_turkey_user
        : (normCurr === 'TRY' || normCurr === 'TL') ? true
        : (normCurr === 'EUR') ? false
        : langIsTR;

    const uiBaseOriginal = isTR ? (product?.tl_price ?? product?.price) : (product?.eur_price ?? product?.price);
    const displayOriginalPrice = Number(uiBaseOriginal) || 0;
    const displayDiscountedPrice = displayOriginalPrice * (1 - discountPercent / 100);
    const currency = isTR ? 'TRY' : 'EUR';

    // SEO meta helpers
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.kinasepeti.com';
    const currentLang = (i18n.language || 'tr');
    const generatedSlug = slugify(product.title || title || '');
    const canonical = `${origin}/${currentLang}/products/detail/${product.id}/${generatedSlug || product.id}`;

    const rawDesc = pickLocalizedDescription(product, i18n.language) || '';
    const plainDesc = rawDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const metaDescription = (plainDesc && plainDesc.length > 160)
        ? plainDesc.slice(0, 157).replace(/[,:;.!?]*$/,'') + '…'
        : (plainDesc || `${product.title} ${t('Uygun fiyatlı kına gecesi ürünü. Hızlı kargo ve güvenli alışveriş.')}`);

    const seoTitle = `${product.title}${product.category ? ' | ' + product.category : ''} | Kına Sepeti`;

    // Images (prefer large variants for social share)
    const images = (product.photos || []).map(p => p.photo).filter(Boolean);
    // Prefer non-video as primary image for SEO/share
    const primaryImage = images.find(u => !isVideoUrl(u)) || images[0] || 'https://www.kinasepeti.com/ksLogo.jpeg';

    // Structured Data: Product
    const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        image: images,
        description: plainDesc || undefined,
        sku: product.id?.toString(),
        brand: { '@type': 'Brand', name: 'Kina Sepeti' },
        offers: {
            '@type': 'Offer',
            priceCurrency: currency,
            price: displayDiscountedPrice.toFixed(2),
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
            url: canonical
        }
    };

    // Structured Data: Breadcrumbs
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Kına Sepeti',
                item: `${origin}/${currentLang}/`
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: product.category || t('Ürünler'),
                item: `${origin}/${currentLang}/products${product.category ? '/' + encodeURIComponent(product.category) : ''}`
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: product.title,
                item: canonical
            }
        ]
    };

    // Guest sepetini (gerekirse) backend tarafında initialize et
    const ensureGuestCartInitialized = async (tokenToUse) => {
        try {
            await axios.get(`${baseURL}/cart/guest`, {
                headers: {
                    'X-Guest-Token': tokenToUse,
                    'Accept-Language': i18n.language?.startsWith('en') ? 'en' : 'tr'
                },
                timeout: 8000
            });
        } catch (e) {
            // 401 haricinde init hatalarını zorlamayalım, POST sırasında fallback çalışır
            if (e?.response?.status === 401) throw e;
        }
    };

    const addToCart = debounce(async () => {
        if (!product || quantity <= 0) {
            showSnackbar(t('Invalid quantity'), 'warning');
            return;
        }

        const unitPrice = Number(displayOriginalPrice) || 0; // backend’den gelen tl_price/eur_price
        const cartItem = {
             productId: product.id,
             quantity,
             price: unitPrice * quantity,
             title: product.name || product.title,
             image: product.imageUrl || (product.photos && product.photos[0]?.photo),
             orderNote,
             currency: isTR ? 'TRY' : 'EUR', // Currency bilgisini ekle
             is_turkey_user: isTR // IP bazlı bilgiyi de ekle
         };

        try {
            const token = localStorage.getItem('token');
            let currentGuestToken = guestToken;
            if (!currentGuestToken) {
                currentGuestToken = (typeof window !== 'undefined' ? (localStorage.getItem('guestToken') || generateUUID()) : '');
                if (currentGuestToken) {
                    localStorage.setItem('guestToken', currentGuestToken);
                    setGuestToken(currentGuestToken);
                }
            }
            // Önce guest cart'ı initialize etmeyi dene (backend bazı ortamlarda add sırasında 401 dönebiliyor)
            await ensureGuestCartInitialized(currentGuestToken);

            const requestId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') ? crypto.randomUUID() : generateUUID();

            if (token) {
                const email = jwtDecode(token).sub;
                await axios.post(`${baseURL}/cart/${encodeURIComponent(email)}`, cartItem, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'X-Request-ID': requestId
                    },
                });
            } else {
                // Local sepeti güncelle
                let localCart = JSON.parse(localStorage.getItem('cart')) || [];
                const existingItem = localCart.find(item => item.productId === cartItem.productId);
                if (existingItem) {
                    existingItem.quantity += cartItem.quantity;
                    existingItem.price = unitPrice * existingItem.quantity;
                    existingItem.orderNote = orderNote || existingItem.orderNote;
                } else {
                    localCart.push(cartItem);
                }
                localStorage.setItem('cart', JSON.stringify(localCart));

                const headers = {
                    'X-Guest-Token': currentGuestToken,
                    'X-Request-ID': requestId,
                    'Accept-Language': i18n.language?.startsWith('en') ? 'en' : 'tr'
                };

                try {
                    await axios.post(`${baseURL}/cart/guest`, localCart, { headers, timeout: 8000 });
                } catch (err) {
                    if (err?.response?.status === 401) {
                        // Token invalid olabilir: yeni token üret, init et ve tekrar dene
                        const newToken = generateUUID();
                        localStorage.setItem('guestToken', newToken);
                        setGuestToken(newToken);
                        await ensureGuestCartInitialized(newToken);
                        await axios.post(`${baseURL}/cart/guest`, localCart, {
                            headers: { ...headers, 'X-Guest-Token': newToken },
                            timeout: 8000
                        });
                    } else if ([400, 404, 405, 415, 422].includes(err?.response?.status)) {
                        // Sözleşme uyuşmazlığında tek item fallback
                        try {
                            await axios.post(`${baseURL}/cart/guest`, cartItem, { headers, timeout: 8000 });
                        } catch (err2) {
                            if (err2?.response?.status === 401) {
                                const newToken2 = generateUUID();
                                localStorage.setItem('guestToken', newToken2);
                                setGuestToken(newToken2);
                                await ensureGuestCartInitialized(newToken2);
                                await axios.post(`${baseURL}/cart/guest`, cartItem, {
                                    headers: { ...headers, 'X-Guest-Token': newToken2 },
                                    timeout: 8000
                                });
                            } else {
                                throw err2;
                            }
                        }
                    } else {
                        throw err;
                    }
                }
            }

            // Google Ads conversion + GA4 add_to_cart
            if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
                const currencyCode = isTR ? 'TRY' : 'EUR';
                const unitPriceUI = Number(displayOriginalPrice) || 0; // indirim uygulanmaz
                const totalValueUI = unitPriceUI * quantity;

                try {
                    // Google Ads Conversion (doğru event adı ve send_to)
                    window.gtag('event', 'conversion', {
                        send_to: 'AW-16834301094/UmqFCIDEyq0aEKaZnNs-',
                        value: totalValueUI,
                        currency: currencyCode,
                        event_callback: () => { /* no-op */ }
                    });
                } catch (_) { /* ignore */ }

                try {
                    // GA4 add_to_cart (analitik amaçlı)
                    window.gtag('event', 'add_to_cart', {
                        currency: currencyCode,
                        value: totalValueUI,
                        items: [{
                            item_id: String(product.id),
                            item_name: cartItem.title || 'Product',
                            quantity: quantity,
                            price: unitPriceUI
                        }]
                    });
                } catch (_) { /* ignore */ }

                console.log("Conversion & GA4 add_to_cart gönderildi:", {
                    id: product.id,
                    value: totalValueUI,
                    currency: currencyCode
                });
            }

            // Sepet güncellendiğini bildir
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('cartUpdated'));
            }

            showSnackbar(t('Item added to cart'), 'success');
        } catch (error) {
            console.error('Error adding to cart:', error?.response?.status, error?.response?.data || error?.message);
            if (error.response?.status === 500 && error.response?.data?.includes('Invalid price')) {
                showSnackbar(t('Price validation failed. Please refresh the page and try again.'), 'error');
            } else if (error.response?.status === 401) {
                showSnackbar(t('Authorization error while adding to cart. Please try again.'), 'error');
            } else {
                showSnackbar(t('Error adding to cart'), 'error');
            }
        }
    }, 500);

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    // Emoji'leri encoding'den bağımsız oluştur
    const EMOJI = {
        bag: String.fromCodePoint(0x1F6CD, 0xFE0F),
        box: String.fromCodePoint(0x1F4E6),
        money: String.fromCodePoint(0x1F4B0),
        calendar: String.fromCodePoint(0x1F4C5),
    };

    const handleWhatsAppOrder = () => {
        if (!product || quantity <= 0) {
            showSnackbar(t('Invalid product or quantity'), 'warning');
            return;
        }

        // WhatsApp mesajı oluştur
        // isTR bilgisini yukarıdaki tespit ile kullan
        const uiBaseOriginal = isTR ? (product.tl_price ?? product.price) : (product.eur_price ?? product.price);
        const displayOriginalPrice = Number(uiBaseOriginal) || 0;
        const displayDiscountedPrice = displayOriginalPrice * (1 - discountPercent / 100);
        const totalDiscountedPrice = displayDiscountedPrice * quantity;

        const orderSummary = `• ${product.title} - ${quantity} adet - ${formatPrice(totalDiscountedPrice, isTR)}${orderNote ? ` (Not: ${orderNote})` : ''}`;

        // Emojileri String.fromCodePoint ile kullan
        const message = `${EMOJI.bag} Yeni Siparis:\n\n` +
            `${EMOJI.box} Urun:\n${orderSummary}\n\n` +
            `${EMOJI.money} Toplam: ${formatPrice(totalDiscountedPrice, isTR)}\n\n` +
            `${EMOJI.calendar} Siparis Tarihi: ${new Date().toLocaleString('tr-TR')}`;
        const phoneNumber = '905348290866'; // Buraya WhatsApp numaranızı yazın
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank');

        showSnackbar(t('Redirecting to WhatsApp...'), 'info');
    };

    const shareUrl = typeof window !== 'undefined' ? window.location.href : canonical;
    const shareMessage = `${product.title} - Check out this product!`;

    const isAlreadyFavorited = isLoggedIn
        ? favorites.favoriteProducts?.some((fav) => fav.id === product.id)
        : (JSON.parse(localStorage.getItem('favorites')) || []).some(fav => fav.id === product.id);

    // Modal open/close
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Split the description into lines for the accordion
    const localizedDescription = pickLocalizedDescription(product, i18n.language);
    const descriptionLines = localizedDescription
        ? localizedDescription.split("\n").filter((line) => line.trim() !== "")
        : [];

    // Poster helpers for videos
    const getPosterFromPhotos = (photos, size = 'small') => {
        const list = Array.isArray(photos) ? photos : [];
        const firstImage = list.map(p => p?.photo).find(u => u && !isVideoUrl(u));
        if (firstImage) return getPrefixedImage(firstImage, size);
        return '/ksLogo.jpeg';
    };

    const getPosterFor = (url, size = 'medium') => {
        if (!isVideoUrl(url)) return undefined;
        return getPosterFromPhotos(product?.photos || [], size);
    };

    // Görsel domainine preconnect + medium görseline preload ekle
    useEffect(() => {
        if (!selectedImage || isVideoUrl(selectedImage)) return;
        try {
            const url = new URL(selectedImage, window.location.href);
            const origin = url.origin;
            const medium = getPrefixedImage(selectedImage, 'medium');

            // Preconnect / dns-prefetch
            const pcId = 'preconnect-img-origin';
            if (!document.getElementById(pcId)) {
                const dns = document.createElement('link');
                dns.id = pcId;
                dns.rel = 'dns-prefetch';
                dns.href = origin;
                document.head.appendChild(dns);
                const pc = document.createElement('link');
                pc.rel = 'preconnect';
                pc.href = origin;
                pc.crossOrigin = 'anonymous';
                document.head.appendChild(pc);
            }
            // Preload medium (eğer zaten head içinde yoksa)
            const preloadId = 'preload-hero-medium';
            if (medium && !document.getElementById(preloadId)) {
                const link = document.createElement('link');
                link.id = preloadId;
                link.rel = 'preload';
                link.as = 'image';
                link.href = medium;
                document.head.appendChild(link);
            }
        } catch (_) { /* ignore */ }
    }, [selectedImage]);

    // Basit performans ölçümü: hero görseli yüklenince tarayıcı timing bilgilerini logla
    const measureImagePerf = (url) => {
        try {
            requestAnimationFrame(() => {
                const entries = performance.getEntriesByName(url) || [];
                if (entries.length) {
                    const e = entries[0];
                    console.log('[HeroImagePerf]', {
                        name: e.name,
                        startTime: Math.round(e.startTime),
                        duration: Math.round(e.duration),
                        transferSize: e.transferSize,
                        encodedBodySize: e.encodedBodySize,
                        decodedBodySize: e.decodedBodySize,
                        redirect: e.redirectEnd - e.redirectStart,
                        dns: e.domainLookupEnd - e.domainLookupStart,
                        connect: e.connectEnd - e.connectStart,
                        ttfb: e.responseStart - e.requestStart,
                        response: e.responseEnd - e.responseStart,
                        fetchUntilResponseEnd: e.responseEnd - e.startTime
                    });
                }
            });
        } catch (_) { /* ignore */ }
    };

    return (
        <div className="activity-details-container">
            {/* Küçük arka plan placeholder için small varyant */}
            {(() => {})()}
            <SEO
                title={seoTitle}
                description={metaDescription}
                image={primaryImage}
                type="product"
                structuredData={[productSchema, breadcrumbSchema]}
            />
            <Header />
            { /* small placeholder değişkeni */ }
            { /* render öncesi hesap */ }
            {/* eslint-disable-next-line */}
            {(() => { /* no-op self-invoking to keep structure */ })()}
            {/* Devam */}
            <Box sx={{
                px: { xs: 1, sm: 2, md: 3 },
                py: { xs: 1, sm: 2 },
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <Typography
                    variant="h4"
                    component="h2"
                    sx={{
                        mb: { xs: 2, sm: 3 },
                        fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                        textAlign: { xs: 'center', md: 'left' },
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 'var(--fw-semibold)',
                        letterSpacing: 'var(--ls-tight)',
                        color: '#2c2c2c'
                    }}
                >

                </Typography>

                <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                    {/* Left Section - Image/Video */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            {selectedImage && (
                                isVideoUrl(selectedImage) ? (
                                    <Box
                                        component="video"
                                        src={selectedImage}
                                        poster={getPosterFor(selectedImage, 'large')}
                                        preload="metadata"
                                        controls
                                        onClick={openModal}
                                        sx={{
                                            width: '100%',
                                            maxWidth: { xs: '100%', sm: '400px', md: '500px' },
                                            height: 'auto',
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            mb: 2,
                                            boxShadow: 2,
                                            '&:hover': {
                                                boxShadow: 4,
                                                transform: 'scale(1.02)',
                                                transition: 'all 0.3s ease'
                                            }
                                        }}
                                    />
                                ) : (
                                    // Wrapper: arka plan small, üstte medium img
                                    <Box
                                        sx={{
                                            width: '100%',
                                            maxWidth: { xs: '100%', sm: '400px', md: '500px' },
                                            borderRadius: 2,
                                            cursor: 'pointer',
                                            mb: 2,
                                            boxShadow: 2,
                                            position: 'relative',
                                            backgroundImage: `url(${getPrefixedImage(selectedImage, 'small')})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            overflow: 'hidden',
                                            '&:hover': {
                                                boxShadow: 4,
                                                transform: 'scale(1.02)',
                                                transition: 'all 0.3s ease'
                                            }
                                        }}
                                        onClick={openModal}
                                    >
                                        <img
                                            src={heroDisplaySrc || getPrefixedImage(selectedImage, 'medium')}
                                            {...(!isMobile && { srcSet: `${getPrefixedImage(selectedImage, 'medium')} 800w, ${getPrefixedImage(selectedImage, 'large')} 1200w` })}
                                            sizes={isMobile ? '100vw' : '(max-width: 960px) 800px, 1200px'}
                                            alt={product.title || 'Ürün görseli'}
                                            loading="eager"
                                            decoding="async"
                                            fetchpriority="high"
                                            style={{
                                                display: 'block',
                                                width: '100%',
                                                height: 'auto',
                                                filter: (!heroHighResLoaded) ? 'blur(10px) saturate(115%)' : 'none',
                                                transition: 'filter 0.5s ease'
                                            }}
                                            onLoad={(e) => {
                                                setHeroHighResLoaded(true);
                                                measureImagePerf(e.currentTarget.currentSrc || e.currentTarget.src);
                                            }}
                                            onError={(e) => {
                                                const fallback = getPrefixedImage(selectedImage, 'small');
                                                if (fallback && e.currentTarget.src !== fallback) {
                                                    e.currentTarget.src = fallback;
                                                }
                                                setHeroHighResLoaded(true);
                                            }}
                                        />
                                    </Box>
                                )
                            )}

                            {/* Küçük preload göstergesi */}
                            {!heroHighResLoaded && !isVideoUrl(selectedImage) && (
                                <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 1 }}>
                                    {t('Loading high quality image')}...
                                </Box>
                            )}

                            {/* Thumbnail Container */}
                            {product?.photos && product.photos.length > 0 && (
                                <Box sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 1,
                                    justifyContent: 'center',
                                    maxWidth: '100%'
                                }}>
                                    {product.photos.map((photo, index) => {
                                        const url = photo.photo;
                                        const video = isVideoUrl(url);
                                        return (
                                            <Box
                                                key={index}
                                                onClick={() => setSelectedImage(url)}
                                                sx={{
                                                    width: { xs: 60, sm: 80, md: 100 },
                                                    height: { xs: 60, sm: 80, md: 100 },
                                                    borderRadius: 1,
                                                    cursor: 'pointer',
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: selectedImage === url ? '3px solid #1976d2' : '1px solid #ccc',
                                                    '&:hover': {
                                                        border: '2px solid #1976d2',
                                                        transform: 'scale(1.05)',
                                                        transition: 'all 0.2s ease'
                                                    }
                                                }}
                                                aria-label={video ? 'Video küçük önizleme' : 'Görsel küçük önizleme'}
                                                title={video ? 'Video' : 'Görsel'}
                                            >
                                                {video ? (
                                                    <video
                                                        src={url}
                                                        poster={getPosterFor(url, 'small')}
                                                        preload="metadata"
                                                        muted
                                                        loop
                                                        playsInline
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <Box
                                                        component="img"
                                                        src={getPrefixedImage(url, 'small')}
                                                        alt={`${product.title || 'Ürün'} küçük görsel ${index + 1}`}
                                                        loading="lazy"
                                                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}
                        </Box>
                    </Grid>

                    {/* Right Section - Product Info */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ p: { xs: 1, sm: 2 } }}>
                            <Typography
                                variant="h4"
                                component="h1"
                                className="product-title"
                                sx={{
                                    mb: 2,
                                    fontSize: { xs: '1.4rem', sm: '1.6rem', md: '1.8rem' },
                                    fontFamily: 'var(--font-heading)',
                                    fontWeight: 'var(--fw-semibold)',
                                    letterSpacing: 'var(--ls-tight)',
                                    lineHeight: 1.3,
                                    color: '#2c2c2c'
                                }}
                            >
                                {product.title}
                            </Typography>

                            {/* Price Section */}
                            {product.price && (

                                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                    <Typography className="price" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontSize: { xs: '1.1rem', sm: '1.25rem' }, fontFamily: 'var(--font-ui)', fontWeight: 'var(--fw-medium)' }}>
                                        {formatPrice(displayOriginalPrice, isTR)}
                                    </Typography>
                                    <Typography className="price" sx={{ color: 'primary.main', fontWeight: 'var(--fw-semibold)', fontSize: { xs: '1.3rem', sm: '1.5rem' }, fontFamily: 'var(--font-ui)' }}>
                                        {formatPrice(displayDiscountedPrice, isTR)}
                                    </Typography>
                                    <Box sx={{ backgroundColor: 'error.main', color: 'white', px: 1, py: 0.5, borderRadius: 1, fontSize: '0.8rem', fontWeight: 'var(--fw-bold)', fontFamily: 'var(--font-ui)', letterSpacing: 'var(--ls-wide)' }}>
                                        {discountPercent}% OFF
                                    </Box>
                                </Box>
                            )}

                            {/* Quantity Control */}
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                mb: 3
                            }}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
                                    sx={{
                                        minWidth: { xs: 40, sm: 44 },
                                        height: { xs: 40, sm: 44 },
                                        fontSize: { xs: '1.1rem', sm: '1.2rem' },
                                        fontFamily: 'var(--font-ui)',
                                        fontWeight: 'var(--fw-bold)'
                                    }}
                                >
                                    -
                                </Button>
                                <Typography sx={{
                                    fontSize: { xs: '1.1rem', sm: '1.2rem' },
                                    fontWeight: 'var(--fw-semibold)',
                                    minWidth: 30,
                                    textAlign: 'center',
                                    fontFamily: 'var(--font-ui)'
                                }}>
                                    {quantity}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="success"
                                    onClick={() => setQuantity((prev) => prev + 1)}
                                    sx={{
                                        minWidth: { xs: 40, sm: 44 },
                                        height: { xs: 40, sm: 44 },
                                        fontSize: { xs: '1.1rem', sm: '1.2rem' },
                                        fontFamily: 'var(--font-ui)',
                                        fontWeight: 'var(--fw-bold)'
                                    }}
                                >
                                    +
                                </Button>
                            </Box>

                            {/* Order Note Section */}
                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    component="label"
                                    htmlFor="order-note"
                                    sx={{
                                        fontWeight: 'var(--fw-semibold)',
                                        display: 'block',
                                        mb: 1,
                                        fontFamily: 'var(--font-ui)',
                                        fontSize: '0.95rem',
                                        letterSpacing: 'var(--ls-normal)'
                                    }}
                                >
                                    {t("Order Note (Optional)")}
                                </Typography>
                                <Box
                                    component="textarea"
                                    id="order-note"
                                    value={orderNote}
                                    onChange={(e) => setOrderNote(e.target.value)}
                                    placeholder={t("Add any special instructions for your order...")}
                                    sx={{
                                        width: '100%',
                                        minHeight: { xs: 60, sm: 80 },
                                        border: '1px solid #ccc',
                                        borderRadius: 1,
                                        p: 1,
                                        fontSize: { xs: '0.9rem', sm: '1rem' },
                                        fontFamily: 'var(--font-primary)',
                                        letterSpacing: 'var(--ls-normal)',
                                        lineHeight: 1.5,
                                        resize: 'vertical',
                                        '&:focus': {
                                            outline: 'none',
                                            borderColor: 'primary.main'
                                        }
                                    }}
                                />
                            </Box>

                            {/* Add to Cart Button */}
                            <Button
                                onClick={() => addToCart(quantity)}
                                variant="contained"
                                color="success"
                                startIcon={<ShoppingCartIcon />}
                                fullWidth
                                sx={{
                                    mb: 2,
                                    py: { xs: 1.5, sm: 2 },
                                    fontSize: { xs: '1rem', sm: '1.1rem' },
                                    fontWeight: 'var(--fw-semibold)',
                                    fontFamily: 'var(--font-ui)',
                                    letterSpacing: 'var(--ls-wide)',
                                    textTransform: 'uppercase',
                                    borderRadius: 2,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                                    }
                                }}
                            >
                                {t('Add to Cart')}
                            </Button>

                            {/* WhatsApp Order Button */}
                            <Button
                                onClick={handleWhatsAppOrder}
                                variant="outlined"
                                color="success"
                                fullWidth
                                sx={{
                                    mb: 2,
                                    py: { xs: 1.5, sm: 2 },
                                    fontSize: { xs: '1rem', sm: '1.1rem' },
                                    fontWeight: 'var(--fw-semibold)',
                                    fontFamily: 'var(--font-ui)',
                                    letterSpacing: 'var(--ls-wide)',
                                    textTransform: 'uppercase',
                                    borderRadius: 2,
                                    borderColor: '#25D366',
                                    color: '#25D366',
                                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.15)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: '#25D366',
                                        color: 'white',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 20px rgba(37, 211, 102, 0.3)'
                                    }
                                }}
                                startIcon={<span style={{ fontSize: '1.2rem' }}>📱</span>}
                            >
                                {t('Order via WhatsApp')}
                            </Button>

                            {/* Product Type */}
                            {product.type && (
                                <Typography sx={{
                                    mb: 2,
                                    color: 'text.secondary',
                                    fontFamily: 'var(--font-primary)',
                                    fontSize: '0.9rem',
                                    letterSpacing: 'var(--ls-normal)'
                                }}>
                                    <strong style={{ fontWeight: 'var(--fw-semibold)' }}>Type:</strong> {product.type}
                                </Typography>
                            )}

                            {/* Share Buttons */}
                            <Box sx={{
                                display: 'flex',
                                gap: { xs: 1, sm: 2 },
                                justifyContent: { xs: 'center', md: 'flex-start' },
                                mb: 2
                            }}>
                                <WhatsappShareButton
                                    url={shareUrl}
                                    title={shareMessage}
                                    separator=":: "
                                    className="share-btn"
                                >
                                    <WhatsappIcon size={isMobile ? 28 : 32} round />
                                </WhatsappShareButton>
                                <TelegramShareButton
                                    url={shareUrl}
                                    title={shareMessage}
                                    className="share-btn"
                                >
                                    <TelegramIcon size={isMobile ? 28 : 32} round />
                                </TelegramShareButton>
                                <FacebookShareButton
                                    url={shareUrl}
                                    quote={shareMessage}
                                    className="share-btn"
                                >
                                    <FacebookIcon size={isMobile ? 28 : 32} round />
                                </FacebookShareButton>
                            </Box>

                            {/* Favorite Button */}
                            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                                <IconButton
                                    aria-label="add to favorites"
                                    onClick={handleFavoriteClick}
                                    sx={{
                                        color: isAlreadyFavorited ? 'error.main' : 'action.disabled',
                                        fontSize: { xs: '2rem', sm: '2.5rem' }
                                    }}
                                >
                                    {isAlreadyFavorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                </IconButton>
                            </Box>

                            {/* Description Accordion */}
                            {descriptionLines.length > 0 && (
                                <Box sx={{ mt: 3, width: '100%' }}>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{
                                            fontFamily: 'var(--font-heading)',
                                            fontWeight: 'var(--fw-semibold)',
                                            letterSpacing: 'var(--ls-tight)',
                                            color: '#2c2c2c'
                                        }}
                                    >
                                        {t('Product Description')}
                                    </Typography>
                                    <AccordionDetails sx={{ px: 0 }}>
                                        {descriptionLines.map((line, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    mb: 1
                                                }}
                                            >
                                                <CheckCircleOutlineIcon
                                                    sx={{
                                                        color: 'success.main',
                                                        mr: 1,
                                                        fontSize: '1.2rem'
                                                    }}
                                                />
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontFamily: 'var(--font-primary)',
                                                        lineHeight: 1.6,
                                                        letterSpacing: 'var(--ls-normal)'
                                                    }}
                                                >
                                                    {line}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </AccordionDetails>
                                </Box>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content">
                        {isVideoUrl(selectedImage) ? (
                            <video
                                src={selectedImage}
                                poster={getPosterFor(selectedImage, 'large')}
                                preload="metadata"
                                controls
                                className="modal-image"
                                onClick={(e) => e.stopPropagation()}
                                style={{ maxWidth: '100%', maxHeight: '80vh' }}
                            />
                        ) : (
                            <img
                                src={getPrefixedImage(selectedImage, 'large')}
                                srcSet={`
                                ${getPrefixedImage(selectedImage, 'small')} 400w,
                                ${getPrefixedImage(selectedImage, 'medium')} 800w,
                                ${getPrefixedImage(selectedImage, 'large')} 1200w
                            `}
                                sizes="(max-width: 600px) 400px, (max-width: 960px) 800px, 1200px"
                                alt="Full Size"
                                className="modal-image"
                                onClick={(e) => e.stopPropagation()}
                            />
                        )}
                    </div>
                </div>
            )}

            {similarProducts.length > 0 && (
                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <h2>{t("Similar Products")}</h2>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            flexWrap: 'wrap',
                            gap: '20px',
                            padding: '10px 20px'
                        }}
                    >
                        {similarProducts.map((sp) => {
                            const spCurr = (sp?.currency || '').toUpperCase();
                            const spIsTR = spCurr === 'TRY' || spCurr === 'TL' ? true
                                : spCurr === 'EUR' ? false
                                : isTR;
                            const spBaseOriginal = spIsTR ? (sp.tl_price ?? sp.price) : (sp.eur_price ?? sp.price);
                            const spOriginalNum = Number(spBaseOriginal) || 0;
                            const spOriginal = sp.photos?.[0]?.photo || "https://via.placeholder.com/300x200?text=No+Image";
                            const spIsVideo = isVideoUrl(spOriginal);
                            const spPoster = getPosterFromPhotos(sp.photos, 'small');
                            return (
                                <Card key={sp.id} style={{ marginRight: '30px', minWidth: '200px', maxWidth: '300px', textAlign: 'center', boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}>
                                    {spIsVideo ? (
                                        <CardMedia
                                            component="video"
                                            src={spOriginal}
                                            poster={spPoster}
                                            preload="metadata"
                                            height="140"
                                            muted
                                            loop
                                            playsInline
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <CardMedia
                                            component="img"
                                            alt={sp.title}
                                            height="140"
                                            image={getPrefixedImage(spOriginal, 'small')}
                                            loading="lazy"
                                            fetchPriority="low"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    )}
                                    <CardContent>
                                        <Typography variant="subtitle1" component="div">
                                            {sp.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatPrice(spOriginalNum, spIsTR)}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            sx={{ mt: 1 }}
                                            onClick={() => window.open(`/${i18n.language}/products/detail/${sp.id}/${sp.title}`, "_blank")}
                                        >
                                            {t("View")}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            <Footer />
        </div>
    );
};

export default ProductDetails;
