import React from 'react';
import Head from 'next/head';
import axios from 'axios';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import ProductGrid from '../../src/ProductGrid';
import NextHeader from '../../src/components/NextHeader';

export default function ProductsPage({ products, seo }) {
  const favorites = { favoriteProducts: [] };
  const isLoggedIn = false;
  const handleFavoriteClick = () => {};

  const { title, description, canonical, alternates } = seo || {};

  return (
    <>
      <Head>
        <title>{title || 'Kınasepeti - Ürünler'}</title>
        <meta name="description" content={description || 'Kınasepeti ürünlerine göz atın. Kına gecesi ve düğün için setler, hediyelikler ve aksesuarlar.'} />
        {canonical && <link rel="canonical" href={canonical} />}
        {alternates?.tr && <link rel="alternate" hrefLang="tr" href={alternates.tr} />}
        {alternates?.en && <link rel="alternate" hrefLang="en" href={alternates.en} />}
        {alternates?.xDefault && <link rel="alternate" hrefLang="x-default" href={alternates.xDefault} />}
      </Head>
      <CssBaseline />
      <NextHeader />
      <main>
        <Container sx={{ py: 6 }} maxWidth="xl">
          <ProductGrid
            products={products || []}
            favorites={favorites}
            isLoggedIn={isLoggedIn}
            handleFavoriteClick={handleFavoriteClick}
          />
        </Container>
      </main>
    </>
  );
}

export async function getServerSideProps(context) {
  try {
    const locale = context.locale === 'en' ? 'en' : 'tr';
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    const res = await axios.get(`${baseURL}/products/all`, {
      params: { page: 0, size: 20 },
      headers: { 'Accept-Language': locale }
    });
    const { content = [] } = res.data || {};

    const headers = context.req?.headers || {};
    const proto = headers['x-forwarded-proto'] || 'http';
    const host = headers['host'] || 'localhost:3000';
    const origin = `${proto}://${host}`;

    const pathTR = `/products`;
    const pathEN = `/en/products`;

    const canonical = `${origin}${locale === 'tr' ? pathTR : pathEN}`;

    const seo = {
      title: 'Kınasepeti - Ürünler',
      description: 'Kınasepeti ürünlerine göz atın. Kına gecesi ve düğün için setler, hediyelikler ve aksesuarlar.',
      canonical,
      alternates: {
        tr: `${origin}${pathTR}`,
        en: `${origin}${pathEN}`,
        xDefault: `${origin}${pathTR}`
      }
    };

    return { props: { products: content, seo } };
  } catch (e) {
    console.error('SSR fetch failed:', e?.response?.data || e.message);
    return { props: { products: [], seo: null } };
  }
}
