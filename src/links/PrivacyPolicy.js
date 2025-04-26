import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import Header from "../header/Header";
import {Helmet} from "react-helmet";
import {useTranslation} from "react-i18next";

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  return (
    <div>
      <Helmet>
        <title>{t('privacy_policy.title')} | Your Site Name</title>
        <meta name="description" content={t('privacy_policy.content').substring(0, 160)} />
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
            {t('privacy_policy.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy_policy.content')}
          </Typography>

          <Typography variant="h6" component="h2">
            {t('privacy_policy.information_collection.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy_policy.information_collection.content')}
          </Typography>

          <Typography variant="h6" component="h2">
            {t('privacy_policy.use_of_information.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy_policy.use_of_information.content')}
          </Typography>

          <Typography variant="h6" component="h2">
            {t('privacy_policy.cookies_and_tracking.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy_policy.cookies_and_tracking.content')}
          </Typography>

          <Typography variant="h6" component="h2">
            {t('privacy_policy.data_sharing.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy_policy.data_sharing.content')}
          </Typography>

          <Typography variant="h6" component="h2">
            {t('privacy_policy.your_choices.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy_policy.your_choices.content')}
          </Typography>

          <Typography variant="h6" component="h2">
            {t('privacy_policy.changes_to_policy.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('privacy_policy.changes_to_policy.content')}
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

export default PrivacyPolicy;