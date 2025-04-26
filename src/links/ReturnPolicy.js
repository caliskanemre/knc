import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import Header from "../header/Header";

const ReturnPolicy = () => {
    const { t } = useTranslation();

    return (
        <div>
            <Helmet>
                <title>{t('return_policy.title')} | Your Site Name</title>
                <meta name="description" content={t('return_policy.content').substring(0, 160)} />
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
                        {t('return_policy.title')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('return_policy.content')}
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

export default ReturnPolicy;