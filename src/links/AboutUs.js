import React from 'react';
import { Typography, Box, Container } from '@mui/material';
import Header from "../header/Header";
import { useTranslation } from 'react-i18next';

const AboutUs = () => {
    const { t } = useTranslation();

    return (
        <div>
            <Header/>
            <Container>
                <Box sx={{
                    padding: '20px',
                    fontFamily: '"Roboto Slab", serif',
                    '& h1, & h2': {
                        fontFamily: '"Roboto Slab", serif',
                    },
                }}>
                    <Typography variant="h2" component="h1" gutterBottom>
                        {t('aboutUsTitle')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('aboutUsIntro')}
                    </Typography>

                    <Typography variant="h6" component="h2">
                        {t('whatWeOfferTitle')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('whatWeOfferContent')}
                    </Typography>

                    <Typography variant="h6" component="h2">
                        {t('personalizedProductsTitle')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('personalizedProductsContent')}
                    </Typography>

                    <Typography variant="h6" component="h2">
                        {t('forBridesTitle')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('forBridesContent')}
                    </Typography>

                    <Typography variant="h6" component="h2">
                        {t('forGroomsTitle')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('forGroomsContent')}
                    </Typography>

                    <Typography variant="h6" component="h2">
                        {t('forGuestsTitle')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('forGuestsContent')}
                    </Typography>

                    <Typography variant="h6" component="h2">
                        {t('traditionalMeetsModernTitle')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('traditionalMeetsModernContent')}
                    </Typography>

                    <Typography variant="h6" component="h2">
                        {t('joinUsTitle')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('joinUsContent')}
                    </Typography>

                    <Typography variant="h6" component="h2">
                        {t('getStartedTitle')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('getStartedContent')}
                    </Typography>
                </Box>
            </Container>
        </div>
    );
};

export default AboutUs;
