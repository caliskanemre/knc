import React from 'react';
import Head from 'next/head';
import axios from 'axios';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import ProductGrid from '../../src/ProductGrid';

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
      {/* Header _app.js içinde global olarak render edilmekte */}
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
    const { category } = context.query || {};

    const endpoint = category ? `${baseURL}/products/${encodeURIComponent(category)}` : `${baseURL}/products/all`;

    const res = await axios.get(endpoint, {
      params: { page: 0, size: 20 },
      headers: { 'Accept-Language': locale },
      timeout: 5000
    });
    const { content = [] } = res.data || {};

    const headers = context.req?.headers || {};
    const proto = headers['x-forwarded-proto'] || 'http';
    const host = headers['host'] || 'localhost:3000';
    const origin = `${proto}://${host}`;

    const pathTR = `/products${category ? `?category=${encodeURIComponent(category)}` : ''}`;
    const pathEN = `/en/products${category ? `?category=${encodeURIComponent(category)}` : ''}`;

    const canonical = `${origin}${locale === 'tr' ? pathTR : pathEN}`;

    const title = category ? `Kınasepeti - Ürünler (${category})` : 'Kınasepeti - Ürünler';
    const description = category
      ? `Kınasepeti ${category} kategorisindeki ürünlere göz atın.`
      : 'Kınasepeti ürünlerine göz atın. Kına gecesi ve düğün için setler, hediyelikler ve aksesuarlar.';

    const seo = {
      title,
      description,
      canonical,
      alternates: {
        tr: `${origin}${pathTR}`,
        en: `${origin}${pathEN}`,
        xDefault: `${origin}${pathTR}`
      }
    };

    return { props: { products: content, seo } };
  } catch (e) {
    const locale = context.locale === 'en' ? 'en' : 'tr';
    const { category } = context.query || {};
    const headers = context.req?.headers || {};
    const proto = headers['x-forwarded-proto'] || 'http';
    const host = headers['host'] || 'localhost:3000';
    const origin = `${proto}://${host}`;
    const pathTR = `/products${category ? `?category=${encodeURIComponent(category)}` : ''}`;
    const pathEN = `/en/products${category ? `?category=${encodeURIComponent(category)}` : ''}`;
    const canonical = `${origin}${locale === 'tr' ? pathTR : pathEN}`;
    const title = category ? `Kınasepeti - Ürünler (${category})` : 'Kınasepeti - Ürünler';
    const description = category
      ? `Kınasepeti ${category} kategorisindeki ürünlere göz atın.`
      : 'Kınasepeti ürünlerine göz atın. Kına gecesi ve düğün için setler, hediyelikler ve aksesuarlar.';
    const seo = {
      title,
      description,
      canonical,
      alternates: {
        tr: `${origin}${pathTR}`,
        en: `${origin}${pathEN}`,
        xDefault: `${origin}${pathTR}`
      }
    };
    return { props: { products: [], seo } };
  }
}
