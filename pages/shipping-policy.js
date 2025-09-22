import React from 'react';
import Head from 'next/head';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';

export default function ShippingPolicyPage() {
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>{t('shipping_policy.title')} | Kınasepeti</title>
        <meta name="description" content={t('shipping_policy.meta_description') || ''} />
      </Head>
      <main>
        <Container sx={{ py: 6 }}>
          <Box sx={{ padding: '20px', fontFamily: '"Roboto Slab", serif', '& h1, & h2, & h3': { fontFamily: '"Roboto Slab", serif' } }}>
            <Typography variant="h2" component="h1" gutterBottom>
              {t('shipping_policy.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('shipping_policy.content')}
            </Typography>
            <Typography variant="h6" component="h2">{t('contact_us.title')}</Typography>
            <Typography variant="body1" paragraph>{t('contact_us.description')}</Typography>
          </Box>
        </Container>
      </main>
    </>
  );
}

