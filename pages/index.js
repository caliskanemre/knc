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

export async function getServerSideProps(context) {
    try {
        const { locale, defaultLocale, resolvedUrl, req, res } = context;
        const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

        // Mevcut ürün çekme mantığınız aynı kalıyor
        const fwdFor = req?.headers?.['x-forwarded-for'];
        const clientIp = Array.isArray(fwdFor) ? fwdFor[0] : (typeof fwdFor === 'string' ? fwdFor.split(',')[0].trim() : (req?.socket?.remoteAddress || ''));

        const apiRes = await axios.get(`${baseURL}/products/all`, {
            params: { page: 0, size: 20, locale },
            headers: { 'Accept-Language': locale, 'X-Forwarded-For': clientIp, 'X-Real-IP': clientIp },
            timeout: 5000
        });
        const { content = [] } = apiRes.data || {};

        // 🚀 YENİ: Backend'den gelen is_turkey_user bilgisini cookie'ye yazalım
        if (content && content.length > 0 && content[0].is_turkey_user !== undefined) {
            const isTurkeyUser = content[0].is_turkey_user;
            res.setHeader('Set-Cookie', `is_turkey_user=${isTurkeyUser ? '1' : '0'}; Path=/; Max-Age=15552000; SameSite=Lax`);
        }

        // 🚀 YENİ: Sunucu tarafında HeroSection için gerekli verileri hazırlıyoruz.
        const userAgent = req.headers['user-agent'] || '';
        const { isMobile } = getSelectorsByUserAgent(userAgent);

        // Sunucuda dil çevirilerini alıyoruz
        const t = i18n.getFixedT(locale || 'tr');
        const heroTitle = t('heroTitle', 'Hayalinizdeki Kına Gecesi');
        const heroSubtitle = t('heroSubtitle', 'Size özel kına organizasyonları ve ürünleri.');

        // Resim URL'leri
        const mobileImageUrl = "https://d2830psw11bu27.cloudfront.net/small_sade.webp";
        const desktopImageUrl = "https://d2830psw11bu27.cloudfront.net/sade.webp";

        const heroData = {
            isMobile,
            heroTitle,
            heroSubtitle,
            mobileImageUrl,
            desktopImageUrl
        };

        // Mevcut SEO mantığınız aynı kalıyor
        const headers = req?.headers || {};
        const proto = headers['x-forwarded-proto'] || 'http';
        const host = headers['host'] || 'localhost:3000';
        const origin = `${proto}://${host}`;
        const pathTR = `/`;
        const pathEN = `/en`;
        const canonical = `${origin}${locale === 'tr' ? pathTR : pathEN}`;

        const seo = {
            title: 'Kınasepeti - Kına ve Düğün Ürünleri',
            description: 'Kınasepeti ile kına gecesi ve düğün ürünlerini keşfedin. Kişiselleştirilmiş setler, hediyelikler ve daha fazlası.',
            canonical,
            alternates: { tr: `${origin}${pathTR}`, en: `${origin}${pathEN}`, xDefault: `${origin}${pathTR}` }
        };

        return {
            props: {
                products: content,
                seo,
                heroData, // Hazırlanan veriyi prop olarak gönderiyoruz
                pageLocale: locale || 'tr',
                defaultLocale: defaultLocale || 'tr',
                asPath: resolvedUrl || '/'
            }
        };
    } catch (e) {
        // Hata durumunda da heroData'yı oluşturup göndermek, sayfanın çökmesini engeller
        const { req, locale, defaultLocale, resolvedUrl } = context;
        const userAgent = req.headers['user-agent'] || '';
        const { isMobile } = getSelectorsByUserAgent(userAgent);
        const t = i18n.getFixedT(locale || 'tr');
        const heroTitle = t('heroTitle', 'Hayalinizdeki Kına Gecesi');
        const heroSubtitle = t('heroSubtitle', 'Size özel kına organizasyonları ve ürünleri.');
        const mobileImageUrl = "https://d2830psw11bu27.cloudfront.net/small_sade.webp";
        const desktopImageUrl = "https://d2830psw11bu27.cloudfront.net/sade.webp";
        const heroData = { isMobile, heroTitle, heroSubtitle, mobileImageUrl, desktopImageUrl };

        console.info('SSR fetch skipped or failed:', e?.message || e);
        return {
            props: {
                products: [],
                seo: null,
                heroData,
                pageLocale: locale || 'tr',
                defaultLocale: defaultLocale || 'tr',
                asPath: resolvedUrl || '/'
            }
        };
    }
}
