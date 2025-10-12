import React from 'react';
import Head from 'next/head';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';

export default function AboutUsPage() {
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>{t('aboutUsTitle') || 'Kınasepeti - Hakkımızda'}</title>
        <meta name="description" content={t('aboutUsIntro') || 'Kınasepeti hakkında: Kına gecesi ürünleri ve organizasyon çözümleri.'} />

        {/* Open Graph meta tags */}
        <meta property="og:site_name" content="Kınasepeti" />
        <meta property="og:title" content={t('aboutUsTitle') || 'Kınasepeti - Hakkımızda'} />
        <meta property="og:description" content={t('aboutUsIntro') || 'Kınasepeti hakkında: Kına gecesi ürünleri ve organizasyon çözümleri.'} />
        <meta property="og:type" content="website" />
      </Head>
      <main>
        <Container sx={{ py: 6 }}>
          <Box sx={{
            fontFamily: '"Roboto Slab", serif',
            '& h1, & h2': { fontFamily: '"Roboto Slab", serif' }
          }}>
            <Typography variant="h2" component="h1" gutterBottom>
              {t('aboutUsTitle')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('aboutUsIntro')}
            </Typography>

            <Typography variant="h6" component="h2">{t('whatWeOfferTitle')}</Typography>
            <Typography variant="body1" paragraph>{t('whatWeOfferContent')}</Typography>

            <Typography variant="h6" component="h2">{t('personalizedProductsTitle')}</Typography>
            <Typography variant="body1" paragraph>{t('personalizedProductsContent')}</Typography>

            <Typography variant="h6" component="h2">{t('forBridesTitle')}</Typography>
            <Typography variant="body1" paragraph>{t('forBridesContent')}</Typography>

            <Typography variant="h6" component="h2">{t('forGroomsTitle')}</Typography>
            <Typography variant="body1" paragraph>{t('forGroomsContent')}</Typography>

            <Typography variant="h6" component="h2">{t('forGuestsTitle')}</Typography>
            <Typography variant="body1" paragraph>{t('forGuestsContent')}</Typography>

            <Typography variant="h6" component="h2">{t('traditionalMeetsModernTitle')}</Typography>
            <Typography variant="body1" paragraph>{t('traditionalMeetsModernContent')}</Typography>

            <Typography variant="h6" component="h2">{t('joinUsTitle')}</Typography>
            <Typography variant="body1" paragraph>{t('joinUsContent')}</Typography>

            <Typography variant="h6" component="h2">{t('getStartedTitle')}</Typography>
            <Typography variant="body1" paragraph>{t('getStartedContent')}</Typography>
          </Box>
        </Container>
      </main>
    </>
  );
}
