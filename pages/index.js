import React from 'react';
import Head from 'next/head';
import axios from 'axios';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import dynamic from 'next/dynamic';
import HeroSection from '../src/shared/HeroSection';
// ProductGrid SSR'siz ve dinamik yüklenir (below-the-fold içerik)
const ProductGrid = dynamic(() => import('../src/ProductGrid'), {
  ssr: false,
  loading: () => <div style={{ height: 200 }} />,
});

export default function HomePage({ products, seo, pageLocale = 'tr', defaultLocale = 'tr' }) {
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
      </Head>
      <CssBaseline />
      <HeroSection />
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

export async function getStaticProps(context) {
  try {
    const { locale = 'tr', defaultLocale = 'tr' } = context || {};
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const res = await axios.get(`${baseURL}/products/all`, {
      params: { page: 0, size: 20 },
      headers: { 'Accept-Language': locale },
      timeout: 5000,
    });
    const { content = [] } = res.data || {};

    const pathTR = `/`;
    const pathEN = `/en`;

    const canonical = `${siteUrl}${locale === 'tr' ? pathTR : pathEN}`;

    const seo = {
      title: 'Kınasepeti - Kına ve Düğün Ürünleri',
      description: 'Kınasepeti ile kına gecesi ve düğün ürünlerini keşfedin. Kişiselleştirilmiş setler, hediyelikler ve daha fazlası.',
      canonical,
      alternates: {
        tr: `${siteUrl}${pathTR}`,
        en: `${siteUrl}${pathEN}`,
        xDefault: `${siteUrl}${pathTR}`,
      },
    };

    return {
      props: { products: content, seo, pageLocale: locale, defaultLocale },
      revalidate: 120, // 2 dakikada bir güncelle
    };
  } catch (e) {
    console.info('SSG fetch failed:', e?.message || e);

    const { locale = 'tr', defaultLocale = 'tr' } = context || {};
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const pathTR = `/`;
    const pathEN = `/en`;
    const canonical = `${siteUrl}${locale === 'en' ? pathEN : pathTR}`;
    const seo = {
      title: 'Kınasepeti - Kına ve Düğün Ürünleri',
      description: 'Kınasepeti ile kına gecesi ve düğün ürünlerini keşfedin. Kişiselleştirilmiş setler, hediyelikler ve daha fazlası.',
      canonical,
      alternates: {
        tr: `${siteUrl}${pathTR}`,
        en: `${siteUrl}${pathEN}`,
        xDefault: `${siteUrl}${pathTR}`,
      },
    };

    return { props: { products: [], seo, pageLocale: locale, defaultLocale }, revalidate: 300 };
  }
}
