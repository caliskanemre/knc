import React from 'react';
import Head from 'next/head';
import axios from 'axios';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Image from 'next/image';

export default function ProductDetailPage({ product, seo }) {
  if (!product) {
    return (
      <Container maxWidth="md">
        <CssBaseline />
        <Typography variant="h5" sx={{ mt: 4 }}>Product not found</Typography>
      </Container>
    );
  }

  const title = product.title || product.name || 'Product';
  const image = product.photos?.[0]?.photo || 'https://via.placeholder.com/600x600?text=No+Image';

  const { metaTitle, metaDescription, canonical, alternates, ogImage } = seo || {};

  return (
    <>
      <Head>
        <title>{metaTitle || title}</title>
        {metaDescription && <meta name="description" content={metaDescription} />}
        {canonical && <link rel="canonical" href={canonical} />}
        {alternates?.tr && <link rel="alternate" hrefLang="tr" href={alternates.tr} />}
        {alternates?.en && <link rel="alternate" hrefLang="en" href={alternates.en} />}
        {alternates?.xDefault && <link rel="alternate" hrefLang="x-default" href={alternates.xDefault} />}
        {/* Open Graph / Twitter */}
        <meta property="og:title" content={metaTitle || title} />
        {metaDescription && <meta property="og:description" content={metaDescription} />}
        <meta property="og:type" content="product" />
        {ogImage && <meta property="og:image" content={ogImage} />}
        {canonical && <meta property="og:url" content={canonical} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle || title} />
        {metaDescription && <meta name="twitter:description" content={metaDescription} />}
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        {/* JSON-LD */}
        {product.structuredData?.product && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(product.structuredData.product) }} />
        )}
        {product.structuredData?.breadcrumbs && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(product.structuredData.breadcrumbs) }} />
        )}
      </Head>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>{title}</Typography>
          <Card sx={{ maxWidth: 600, position: 'relative', aspectRatio: '1 / 1' }}>
            <Image src={image} alt={title} fill sizes="(max-width: 800px) 100vw, 800px" priority style={{ objectFit: 'cover' }} />
          </Card>
        </Box>
      </Container>
    </>
  );
}

export async function getServerSideProps({ params, locale, defaultLocale, resolvedUrl, req }) {
  try {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const { id, title } = params;
    const res = await axios.get(`${baseURL}/products/detail/${id}/${encodeURIComponent(title || '')}`, {
      headers: { 'Accept-Language': locale === 'en' ? 'en' : 'tr' }
    });
    const product = res.data || null;

    const headers = req?.headers || {};
    const proto = headers['x-forwarded-proto'] || 'http';
    const host = headers['host'] || 'localhost:3000';
    const origin = `${proto}://${host}`;

    // Helpers
    const rawDesc = product?.description || '';
    const plainDesc = rawDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const metaDescription = (plainDesc && plainDesc.length > 160)
      ? plainDesc.slice(0, 157).replace(/[,:;.!?]*$/, '') + '…'
      : (plainDesc || `${product?.title || 'Ürün'} uygun fiyatlı kına gecesi ürünleri.`);

    const currentLang = locale === 'en' ? 'en' : 'tr';
    const titleSlug = encodeURIComponent((title || '').toString().toLowerCase());
    const pathTR = `/products/detail/${id}/${titleSlug}`;
    const pathEN = `/en/products/detail/${id}/${titleSlug}`;
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

    // JSON-LD Product
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
        priceCurrency: product?.is_turkey_user ? 'TRY' : 'EUR',
        price: (product?.eur_price ?? product?.tl_price ?? product?.price ?? 0).toFixed?.(2) || String(product?.price || 0),
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        url: canonical
      }
    };

    // JSON-LD Breadcrumbs
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
    console.error('SSR product fetch failed:', e?.response?.data || e.message);
    return { props: { product: null, seo: null, structuredData: null, pageLocale: 'tr', defaultLocale: 'tr', asPath: '/' } };
  }
}
