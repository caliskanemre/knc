import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

/*
 * Reusable SEO component
 * Props:
 *  - title
 *  - description
 *  - image
 *  - type (og:type)
 *  - locale (og:locale)
 *  - robots (default: index,follow)
 *  - structuredData (object | object[])
 */
const SITE_NAME = 'Kina Sepeti';
const DEFAULT_DESCRIPTION = 'Kına gecesi ürünleri, aksesuarlar ve ilham verici fikirler. Kına Sepeti ile özel gününüzü özelleştirin.';
const DEFAULT_IMAGE = 'https://www.kinasepeti.com/ksLogo.jpeg';

const SEO = ({
  title = SITE_NAME,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = 'website',
  locale = 'tr_TR',
  robots = 'index,follow',
  structuredData
}) => {
  const location = useLocation();
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.kinasepeti.com';
  const canonical = `${origin}${location.pathname}`;

  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  const jsonLdArray = structuredData
    ? Array.isArray(structuredData) ? structuredData : [structuredData]
    : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content={locale} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLdArray.map((obj, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(obj)}</script>
      ))}
    </Helmet>
  );
};

export default SEO;
