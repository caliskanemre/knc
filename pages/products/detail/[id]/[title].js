// Temel React ve Next.js import'ları
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router'; // useParams yerine useRouter kullanıyoruz
import Head from 'next/head'; // Head yönetimi için
import Image from 'next/image'; // Optimize resimler için

// Kütüphane ve Component import'ları
import Axios from "axios";
import Header from "../header/Header";
import Footer from "../Footer";
import SEO from '../shared/SEO';
import { useAuth } from "../auth/AuthProvider";
import { useTranslation } from "react-i18next";
import { trackEvent } from "../analytics/ga";

// MUI Component'leri
import {
    Box,
    Grid,
    Button,
    IconButton,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Snackbar,
    Alert,
    useTheme,
    useMediaQuery,
    AccordionDetails,
} from "@mui/material";

// Simgeler ve Paylaşım
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { FacebookIcon, FacebookShareButton, TelegramIcon, TelegramShareButton, WhatsappIcon, WhatsappShareButton } from "react-share";

// Diğer import'lar
import { jwtDecode } from "jwt-decode";
import { debounce } from '@mui/material/utils';
import { useInitialData } from "../shared/InitialDataContext"; // Bu hala kullanılıyorsa kalabilir

// CSS
import './css/ActivityDetails.css';


// --- HELPER FONKSİYONLAR (Değişiklik yok) ---
const slugify = (str) => str ? str.toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80) : '';
const pickLocalizedDescription = (p, lang) => { /* ... mevcut kod ... */ };
const generateUUID = () => { /* ... mevcut kod ... */ };
const getPrefixedImage = (url, prefix) => url ? url.replace(/([^/]+)$/, `${prefix}_$1`) : url;
const isVideoUrl = (url) => { /* ... mevcut kod ... */ };
const readIsTRFromStorage = () => { /* ... mevcut kod ... */ };
const writeIsTRToStorage = (isTR) => { /* ... mevcut kod ... */ };
const guessTRFromNavigator = () => { /* ... mevcut kod ... */ };


// ==================================================================
//          OPTIMIZE EDİLMİŞ PRODUCTDETAILS COMPONENT'İ
// ==================================================================
const ProductDetails = ({ initialProduct, initialSimilarProducts }) => {

    // --- STATE VE HOOK'LAR ---
    const [product, setProduct] = useState(initialProduct);
    const [similarProducts, setSimilarProducts] = useState(initialSimilarProducts);

    // Component'in kendi iç state'leri
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(product?.photos?.[0]?.photo || '');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [orderNote, setOrderNote] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [guestToken, setGuestToken] = useState(() => (typeof window !== 'undefined' ? (localStorage.getItem('guestToken') || generateUUID()) : ''));

    // Diğer hook'lar
    const router = useRouter();
    const { token, isLoggedIn, favorites, toggleFavorite } = useAuth();
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    // --- EFFECT'LER ---

    // [KALDIRILDI] Ana ürün verisini çeken useEffect kaldırıldı. Veri artık sunucudan geliyor.
    // [KALDIRILDI] Benzer ürünleri çeken useEffect kaldırıldı. Veri artık sunucudan geliyor.
    // [KALDIRILDI] Karmaşık hero resim yükleme useEffect'i kaldırıldı. next/image bunu daha iyi yönetiyor.

    // Ürün değiştiğinde, seçili resmi güncelle
    useEffect(() => {
        if (product?.photos?.length > 0) {
            setSelectedImage(product.photos[0].photo);
        }
    }, [product]);

    // GA event'i için
    useEffect(() => {
        if (product && product.id) {
            trackEvent('view_item', { /* ... */ });
        }
    }, [product]);

    // Diğer client-side effect'ler (değişiklik yok)
    useEffect(() => { /* ... guestToken yönetimi ... */ }, [guestToken]);
    useEffect(() => { /* ... is_turkey_user storage yönetimi ... */ }, [product]);
    useEffect(() => { /* ... thumbnail'leri preload etme (isteğe bağlı) ... */ }, [product?.photos]);


    // --- RENDER ÖNCESİ HESAPLAMALAR ---

    // Eğer veri sunucudan gelememişse veya bir hata oluşmuşsa
    if (!product) {
        return (
            <>
                <Header />
                <Box sx={{ textAlign: 'center', my: 10 }}>
                    <Typography variant="h5">{t("Product not found")}</Typography>
                    <Typography>{t("The product you are looking for may have been removed or the link is incorrect.")}</Typography>
                </Box>
                <Footer />
            </>
        );
    }

    // Para birimi ve fiyat hesaplamaları
    const persistedIsTR = readIsTRFromStorage();
    const langIsTR = (i18n.language || 'tr').toLowerCase().startsWith('tr');
    const isTR = (persistedIsTR !== null) ? persistedIsTR : (product?.is_turkey_user ?? langIsTR);
    const displayOriginalPrice = Number(isTR ? (product?.tl_price ?? product?.price) : (product?.eur_price ?? product?.price)) || 0;
    const discountPercent = 20;
    const displayDiscountedPrice = displayOriginalPrice * (1 - discountPercent / 100);
    const currency = isTR ? 'TRY' : 'EUR';
    const formatPrice = (amount, isTR) => `${(Number(amount) || 0).toFixed(2)} ${isTR ? '₺' : '€'}`;

    // SEO ve Schema.org verileri
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.kinasepeti.com';
    const canonical = `${origin}/${i18n.language}/products/detail/${product.id}/${slugify(product.title)}`;
    const plainDesc = (pickLocalizedDescription(product, i18n.language) || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const metaDescription = plainDesc.slice(0, 157) + (plainDesc.length > 157 ? '…' : '');
    const seoTitle = `${product.title} | ${product.category || 'Ürünler'} | Kına Sepeti`;
    const primarySeoImage = product.photos?.map(p => p.photo).find(u => !isVideoUrl(u)) || product.photos?.[0]?.photo || '/ksLogo.jpeg';
    const productSchema = { /* ... */ };
    const breadcrumbSchema = { /* ... */ };

    // Ana resmin preload edilecek versiyonu
    const heroPreloadUrl = getPrefixedImage(selectedImage, 'medium');


    // --- HANDLER FONKSİYONLAR (Değişiklik yok) ---
    const addToCart = debounce(async () => { /* ... mevcut kod ... */ }, 500);
    const handleFavoriteClick = async () => { /* ... mevcut kod ... */ };
    const handleWhatsAppOrder = () => { /* ... mevcut kod ... */ };
    const showSnackbar = (message, severity) => { /* ... */ };
    const handleSnackbarClose = () => setSnackbarOpen(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const isAlreadyFavorited = isLoggedIn ? favorites.favoriteProducts?.some((fav) => fav.id === product.id) : (typeof window !== 'undefined' && (JSON.parse(localStorage.getItem('favorites')) || []).some(fav => fav.id === product.id));

    // ==================================================================
    //                        RENDER (JSX)
    // ==================================================================
    return (
        // --- 1. TEK BİR ANA SARMALAYICI ELEMENT ---
        <div className="activity-details-container">
            <Head>
                {/* ... */}
            </Head>
            <SEO/>

            <Header />

            <Box sx={{ maxWidth: '1200px', margin: '0 auto', px: { xs: 1, sm: 2, md: 3 }, py: { xs: 1, sm: 2 } }}>
                <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                    {/* Grid içeriği (resimler ve ürün bilgileri) */}
                    {/* ... */}
                </Grid>
            </Box>

            {/* --- 2. MODAL VE DİĞER ELEMENTLER ANA DIV'İN İÇİNDE --- */}

            {/* Modal'ı render et */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content">
                        {/* Modal içeriği buraya gelecek (img veya video) */}
                        <p>Modal içeriği...</p>
                    </div>
                </div>
            )}

            {/* Benzer ürünleri render et */}
            {similarProducts.length > 0 && (
                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <h2>{t("Similar Products")}</h2>
                    {/* Benzer ürünler listesi buraya gelecek */}
                    <p>Benzer ürünler...</p>
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

            {/* --- 3. ANA SARMALAYICI ELEMENTİN KAPANIŞI --- */}
        </div>
    );
};

export default ProductDetails;


// ==================================================================
//          [YENİ] SUNUCU TARAFLI VERİ ÇEKME FONKSİYONU
// ==================================================================
export async function getServerSideProps(context) {
    const { id, title } = context.params;
    const lang = context.locale || 'tr';
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';

    try {
        // 1. Ana ürün verisini çek
        const productResponse = await Axios.get(`${baseURL}/products/detail/${id}/${title}`, {
            headers: { 'Accept-Language': lang }
        });

        const product = productResponse.data;

        // Ürün bulunamadıysa 404 sayfasına yönlendir
        if (!product) {
            return { notFound: true };
        }

        // 2. Benzer ürünleri çek (client-side'da ikinci bir istek yapmamak için)
        let similarProducts = [];
        if (product.category) {
            try {
                const similarResponse = await Axios.get(`${baseURL}/products/${product.category}?page=0&size=5`, {
                    headers: { 'Accept-Language': lang }
                });
                const fetchedSimilar = similarResponse.data.content || [];
                similarProducts = fetchedSimilar.filter(p => p.id !== product.id);
            } catch (similarError) {
                console.error('Error fetching similar products on server:', similarError.message);
                // Bu hata ana sayfanın yüklenmesini engellememeli, o yüzden boş diziyle devam et
            }
        }

        // 3. Verileri component'e prop olarak gönder
        return {
            props: {
                initialProduct: product,
                initialSimilarProducts: similarProducts,
            },
        };
    } catch (error) {
        console.error(`Error fetching product in getServerSideProps for ID ${id}:`, error.message);
        // Ana ürün çekilemezse, component'e null veri göndererek hata durumunu yönetmesini sağla
        return {
            props: {
                initialProduct: null,
                initialSimilarProducts: [],
            },
        };
    }
}
