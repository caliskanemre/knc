import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import Header from "../header/Header";
import {Helmet} from "react-helmet";
import {useTranslation} from "react-i18next";

const SalesAgreement = () => {
  const { t } = useTranslation();

  return (
    <div>
      <Helmet>
        <title>{t('sales_agreement.title')} | Your Site Name</title>
        <meta name="description" content={t('sales_agreement.content').substring(0, 160)} />
      </Helmet>
      <Header />
      <Container>
        <Box sx={{
          padding: '20px',
          fontFamily: '"Roboto Slab", serif',
          '& h1, & h2, & h3': {
            fontFamily: '"Roboto Slab", serif',
          },
        }}>
          <Typography variant="h2" component="h1" gutterBottom>
            {t('sales_agreement.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('sales_agreement.content')}
          </Typography>
          <Typography variant="h6" component="h2">
            {t('contact_us.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('contact_us.description')}
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default SalesAgreement;