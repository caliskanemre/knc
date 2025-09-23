import React from 'react';
import Head from 'next/head';
import axios from 'axios';
import { Box, Container, Typography, Chip, Divider } from '@mui/material';

export default function ArticleDetail({ article, seo }) {
  if (!article) {
    return (
      <Container sx={{ mt: 8, mb: 8 }}>
        <Typography variant="h5" sx={{ textAlign: 'center' }}>Makale bulunamadı</Typography>
      </Container>
    );
  }

  const { title, image, topic, date, content } = article;
  const { metaTitle, metaDescription, canonical, alternates } = seo || {};

  return (
    <>
      <Head>
        <title>{metaTitle || title || 'Makale'}</title>
        {metaDescription && <meta name="description" content={metaDescription} />}
        {canonical && <link rel="canonical" href={canonical} />}
        {alternates?.tr && <link rel="alternate" hrefLang="tr" href={alternates.tr} />}
        {alternates?.en && <link rel="alternate" hrefLang="en" href={alternates.en} />}
        {alternates?.xDefault && <link rel="alternate" hrefLang="x-default" href={alternates.xDefault} />}
        <meta property="og:title" content={metaTitle || title || 'Makale'} />
        {metaDescription && <meta property="og:description" content={metaDescription} />}
        {image && <meta property="og:image" content={image} />}
        {canonical && <meta property="og:url" content={canonical} />}
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <Container sx={{ mt: 6, mb: 8, maxWidth: 'md' }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: '#8B0000', mb: 2 }}>{title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {topic && <Chip label={topic} size="small" />}
          {date && <Typography variant="caption" color="text.secondary">{date}</Typography>}
        </Box>
        {image && (
          <Box component="img" src={image} alt={title} sx={{ width: '100%', height: 'auto', borderRadius: 2, mb: 3 }} />
        )}
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ color: 'text.primary' }}
             dangerouslySetInnerHTML={{ __html: content || '' }} />
      </Container>
    </>
  );
}

export async function getServerSideProps(context) {
  try {
    const { params, locale, defaultLocale, resolvedUrl, req } = context;
    const { id } = params;
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    const res = await axios.get(`${baseURL}/articles/${encodeURIComponent(id)}`, {
      headers: { 'Accept-Language': locale },
      timeout: 5000
    });
    const article = res.data || null;

    const headers = req?.headers || {};
    const proto = headers['x-forwarded-proto'] || 'http';
    const host = headers['host'] || 'localhost:3000';
    const origin = `${proto}://${host}`;

    const pathTR = `/articles/${id}`;
    const pathEN = `/en/articles/${id}`;

    // Meta description'ı düz metne çevirip kısalt
    const raw = (article?.excerpt || article?.content || '').toString();
    const plain = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const metaDescription = plain.length > 160 ? plain.slice(0, 157).replace(/[,:;.!?]*$/, '') + '…' : plain;

    const seo = {
      metaTitle: `${article?.title || 'Makale'} | Kınasepeti`,
      metaDescription: metaDescription || 'Kına gecesi ve düğün için ipuçları, gelenekler ve fikirler',
      canonical: `${origin}${locale === 'tr' ? pathTR : pathEN}`,
      alternates: {
        tr: `${origin}${pathTR}`,
        en: `${origin}${pathEN}`,
        xDefault: `${origin}${pathTR}`,
      }
    };

    return { props: { article, seo, pageLocale: locale || 'tr', defaultLocale: defaultLocale || 'tr', asPath: resolvedUrl || `/articles/${id}` } };
  } catch (e) {
    return { props: { article: null, seo: null, pageLocale: context.locale || 'tr', defaultLocale: context.defaultLocale || 'tr', asPath: context.resolvedUrl || `/articles/${context.params?.id || ''}` } };
  }
}
