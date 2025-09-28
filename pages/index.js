import React from 'react';
import Head from 'next/head';
import axios from 'axios';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import ProductGrid from '../src/ProductGrid';
import HeroSection from '../src/shared/HeroSection';

// 🚀 GEREKLİ İMPORTLAR
import { getSelectorsByUserAgent } from 'react-device-detect';
// Projenizdeki i18next konfigürasyon dosyasının yolunu doğru belirttiğinizden emin olun
import i18n from '../src/i18n';

// 🚀 DEĞİŞİKLİK: HomePage bileşeni artık sunucudan gelen `heroData` prop'unu alıyor.
export default function HomePage({ products, seo, heroData, pageLocale = 'tr', defaultLocale = 'tr', asPath = '/' }) {
    const favorites = { favoriteProducts: [] };
    const isLoggedIn = false;
    const handleFavoriteClick = () => {};

    const { title, description, canonical, alternates } = seo || {};

    return (
        <>
            <Head>
                <title>{title || 'Kınasepeti - Kına ve Düğün Ürünleri'}</title>
                <meta name="description" content={description || 'Kınasepeti ile kına gecesi ve düğün ürünlerini keşfedin. Kişiselleştirilmiş setler, hediyelikler ve daha fazlası.'} />
                {canonical && <link rel="canonical" href={canonical} />}
                {alternates?.tr && <link rel="alternate" hrefLang="tr" href={alternates.tr} />}
                {alternates?.en && <link rel="alternate" hrefLang="en" href={alternates.en} />}
                {alternates?.xDefault && <link rel="alternate" hrefLang="x-default" href={alternates.xDefault} />}

                {/* 🚀 PERFORMANS: HeroSection görsellerini en öncelikli olarak yüklemesi için tarayıcıya ipucu veriyoruz. */}
                {heroData && (
                    <>
                        <link rel="preload" as="image" href={heroData.mobileImageUrl} media="(max-width: 599px)" fetchPriority="high" />
                        <link rel="preload" as="image" href={heroData.desktopImageUrl} media="(min-width: 600px)" fetchPriority="high" />
                    </>
                )}
            </Head>
            <CssBaseline />

            {/* 🚀 DEĞİŞİKLİK: HeroSection'a sunucuda hazırlanan verileri prop olarak aktarıyoruz. */}
            <HeroSection {...heroData} />

            <main>
                <Container sx={{ py: 6 }} maxWidth="xl">
                    <ProductGrid
                        products={products || []}
                        favorites={favorites}
                        isLoggedIn={isLoggedIn}
                        handleFavoriteClick={handleFavoriteClick}
                        pageLocale={pageLocale}
                        defaultLocale={defaultLocale}
                    />
                </Container>
            </main>
        </>
    );
}

// getServerSideProps fonksiyonunu silin ve yerine bunu ekleyin
export async function getStaticProps(context) {
    try {
        const { locale, defaultLocale } = context;
        const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

        // 1. Ürünleri çek
        const res = await axios.get(`${baseURL}/products/all`, {
            params: { page: 0, size: 20, locale },
            headers: { 'Accept-Language': locale },
            timeout: 5000
        });
        const { content = [] } = res.data || {};

        // 2. Dil çevirilerini al (i18n ve diğer kısımlar aynı kalabilir)
        const t = i18n.getFixedT(locale || 'tr');
        const heroTitle = t('heroTitle', 'Hayalinizdeki Kına Gecesi');
        const heroSubtitle = t('heroSubtitle', 'Size özel kına organizasyonları ve ürünleri.');

        const heroData = {
            isMobile: false, // getStaticProps'ta 'req' nesnesi olmadığı için bu dinamik olamaz
            heroTitle,
            heroSubtitle,
            mobileImageUrl: "https://d2830psw11bu27.cloudfront.net/small_sade.webp",
            desktopImageUrl: "https://d2830psw11bu27.cloudfront.net/sade.webp"
        };

        // 3. SEO verilerini oluştur (host bilgisi dinamik olmayacak)
        const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kinasepeti.com'; // .env dosyasından site URL'nizi alın
        const pathTR = `/`;
        const pathEN = `/en`;
        const canonical = `${origin}${locale === 'tr' ? pathTR : pathEN}`;

        const seo = {
            title: 'Kınasepeti - Kına ve Düğün Ürünleri',
            description: 'Kınasepeti ile kına gecesi ve düğün ürünlerini keşfedin.',
            canonical,
            alternates: { tr: `${origin}${pathTR}`, en: `${origin}${pathEN}`, xDefault: `${origin}${pathTR}` }
        };

        return {
            props: {
                products: content,
                seo,
                heroData,
                pageLocale: locale || 'tr',
                defaultLocale: defaultLocale || 'tr',
            },
            // Sayfanın her 60 saniyede bir arkaplanda güncellenmesini sağlar.
            // Bu süre içinde gelen tüm isteklere cache'lenmiş sayfa sunulur.
            revalidate: 60
        };

    } catch (e) {
        console.error('getStaticProps failed:', e?.message || e);
        return {
            props: { products: [], seo: null, heroData: {} },
            revalidate: 10 // Hata durumunda 10 saniye sonra tekrar denesin
        };
    }
}
