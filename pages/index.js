import React from 'react';
import Head from 'next/head';
import axios from 'axios';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import ProductGrid from '../src/ProductGrid';
import HeroSection from '../src/shared/HeroSection';

export default function HomePage({ products, seo, pageLocale = 'tr', defaultLocale = 'tr', asPath = '/' }) {
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

export async function getServerSideProps(context) {
  try {
    const { locale, defaultLocale, resolvedUrl, req } = context;
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const res = await axios.get(`${baseURL}/products/all`, {
      params: { page: 0, size: 20 },
      headers: { 'Accept-Language': locale }
    });
    const { content = [] } = res.data || {};

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
      alternates: {
        tr: `${origin}${pathTR}`,
        en: `${origin}${pathEN}`,
        xDefault: `${origin}${pathTR}`
      }
    };

    return { props: { products: content, seo, pageLocale: locale || 'tr', defaultLocale: defaultLocale || 'tr', asPath: resolvedUrl || '/' } };
  } catch (e) {
    console.error('SSR fetch failed:', e?.response?.data || e.message);
    return { props: { products: [], seo: null, pageLocale: context.locale || 'tr', defaultLocale: context.defaultLocale || 'tr', asPath: context.resolvedUrl || '/' } };
  }
}
