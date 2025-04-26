import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import Header from "../header/Header";
// ShippingPolicy.jsx (example)
import { useTranslation } from 'react-i18next';
import {Helmet} from "react-helmet";

const ShippingPolicy = () => {
    const { t } = useTranslation();

    return (

        <div>
            <Helmet>
                <title>{t('shipping_policy.title')} | Your Site Name</title>
                <meta name="description" content={t('shipping_policy.meta_description')} />
            </Helmet>
            <Header />
            <Container>
                <Box sx={{ padding: '20px', fontFamily: '"Roboto Slab", serif', '& h1, & h2, & h3': { fontFamily: '"Roboto Slab", serif' } }}>
                    <Typography variant="h2" component="h1" gutterBottom>
                        {t('shipping_policy.title')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('shipping_policy.content')}
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
export default ShippingPolicy;