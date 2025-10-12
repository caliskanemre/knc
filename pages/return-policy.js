import React from 'react';
import Head from 'next/head';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';

export default function ReturnPolicyPage() {
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>{t('return_policy.title')} | Kınasepeti</title>
        <meta name="description" content={(t('return_policy.content') || '').slice(0, 160)} />

        {/* Open Graph meta tags */}
        <meta property="og:site_name" content="Kınasepeti" />
        <meta property="og:title" content={`${t('return_policy.title')} | Kınasepeti`} />
        <meta property="og:description" content={(t('return_policy.content') || '').slice(0, 160)} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="noindex,follow" />
      </Head>
      <main>
        <Container sx={{ py: 6 }}>
          <Box sx={{
            padding: '20px',
            fontFamily: '"Roboto Slab", serif',
            '& h1, & h2, & h3': { fontFamily: '"Roboto Slab", serif' }
          }}>
            <Typography variant="h2" component="h1" gutterBottom>
              {t('return_policy.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('return_policy.content')}
            </Typography>
            <Typography variant="h6" component="h2">{t('contact_us.title')}</Typography>
            <Typography variant="body1" paragraph>{t('contact_us.description')}</Typography>
          </Box>
        </Container>
      </main>
    </>
  );
}
