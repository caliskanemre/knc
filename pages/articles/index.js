import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Box, Container, Grid, Typography, Card, CardMedia, CardContent, Chip, Button } from '@mui/material';

export default function ArticlesPage({ articles = [], seo, pageLocale = 'tr', defaultLocale = 'tr', asPath = '/articles' }) {
  const { t } = useTranslation();
  const { title, description, canonical, alternates } = seo || {};

  // Tüm konu etiketlerini çıkar
  const topics = Array.from(new Set(articles.map((a) => a.topic).filter(Boolean)));

  const [topicFilter, setTopicFilter] = React.useState('All');
  const filtered = topicFilter === 'All' ? articles : articles.filter((a) => a.topic === topicFilter);

  return (
    <>
      <Head>
        <title>{title || 'Kınasepeti | Makaleler'}</title>
        <meta name="description" content={description || 'Kına gecesi ve düğün için ipuçları, gelenekler ve fikirler'} />
        {canonical && <link rel="canonical" href={canonical} />}
        {alternates?.tr && <link rel="alternate" hrefLang="tr" href={alternates.tr} />}
        {alternates?.en && <link rel="alternate" hrefLang="en" href={alternates.en} />}
        {alternates?.xDefault && <link rel="alternate" hrefLang="x-default" href={alternates.xDefault} />}
      </Head>

      <Container sx={{ mt: 6, mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h3" sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#8B0000' }}>
            {t('Henna Night Ideas', 'Kına Gecesi Fikirleri')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 2 }}>
            {t('Discover tips, traditions, and creative ideas for your next henna celebration', 'Bir sonraki kına kutlamanız için ipuçları, gelenekler ve yaratıcı fikirler keşfedin')}
          </Typography>
        </Box>

        {/* Konu filtresi */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Chip
            label="All"
            onClick={() => setTopicFilter('All')}
            variant={topicFilter === 'All' ? 'filled' : 'outlined'}
            sx={{ mr: 1, cursor: 'pointer', '&.MuiChip-filled': { backgroundColor: '#8B0000', color: '#fff' } }}
          />
          {topics.map((topic) => (
            <Chip
              key={topic}
              label={topic}
              onClick={() => setTopicFilter(topic)}
              variant={topicFilter === topic ? 'filled' : 'outlined'}
              sx={{ mr: 1, cursor: 'pointer', '&.MuiChip-filled': { backgroundColor: '#8B0000', color: '#fff' } }}
            />
          ))}
        </Box>

        <Grid container spacing={4}>
          {filtered.map((article) => (
            <Grid key={article.id} item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3, borderRadius: 2 }}>
                {article.image && (
                  <CardMedia component="img" image={article.image} alt={article.title} sx={{ height: 180, objectFit: 'cover' }} />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {(article.topic || '')}{article.date ? ` · ${article.date}` : ''}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 600 }}>
                    {article.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    {article.excerpt}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Link href={`/articles/${article.id}`} passHref legacyBehavior>
                    <Button variant="outlined" size="small" component="a" sx={{ borderColor: '#8B0000', color: '#8B0000' }}>
                      {t('Read More', 'Devamını Oku')}
                    </Button>
                  </Link>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}

export async function getServerSideProps(context) {
  try {
    const { locale, defaultLocale, resolvedUrl, req } = context;
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    const res = await axios.get(`${baseURL}/articles`, {
      headers: { 'Accept-Language': locale },
      timeout: 5000
    });
    const items = Array.isArray(res.data) ? res.data : (res.data?.content || []);

    const headers = req?.headers || {};
    const proto = headers['x-forwarded-proto'] || 'http';
    const host = headers['host'] || 'localhost:3000';
    const origin = `${proto}://${host}`;

    const pathTR = `/articles`;
    const pathEN = `/en/articles`;
    const canonical = `${origin}${locale === 'tr' ? pathTR : pathEN}`;

    const seo = {
      title: 'Kınasepeti | Makaleler',
      description: 'Kına gecesi ve düğün için ipuçları, gelenekler ve fikirler',
      canonical,
      alternates: {
        tr: `${origin}${pathTR}`,
        en: `${origin}${pathEN}`,
        xDefault: `${origin}${pathTR}`
      }
    };

    return { props: { articles: items, seo, pageLocale: locale || 'tr', defaultLocale: defaultLocale || 'tr', asPath: resolvedUrl || '/articles' } };
  } catch (e) {
    // Hata durumunda boş liste ve temel SEO ile devam et
    const { locale, defaultLocale, resolvedUrl, req } = context;
    const headers = req?.headers || {};
    const proto = headers['x-forwarded-proto'] || 'http';
    const host = headers['host'] || 'localhost:3000';
    const origin = `${proto}://${host}`;
    const pathTR = `/articles`;
    const pathEN = `/en/articles`;
    const canonical = `${origin}${locale === 'tr' ? pathTR : pathEN}`;
    const seo = {
      title: 'Kınasepeti | Makaleler',
      description: 'Kına gecesi ve düğün için ipuçları, gelenekler ve fikirler',
      canonical,
      alternates: {
        tr: `${origin}${pathTR}`,
        en: `${origin}${pathEN}`,
        xDefault: `${origin}${pathTR}`
      }
    };
    return { props: { articles: [], seo, pageLocale: locale || 'tr', defaultLocale: defaultLocale || 'tr', asPath: resolvedUrl || '/articles' } };
  }
}

