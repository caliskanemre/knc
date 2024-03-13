import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import Header from "../header/Header";

const PrivacyPolicy = () => {
    return (
        <div>
            <Header/>
            <Container>
                <Box sx={{
                    padding: '20px',
                    fontFamily: '"Roboto Slab", serif', // Custom font
                    '& h1, & h2, & h3': {
                        fontFamily: '"Roboto Slab", serif', // Ensures headers use the custom font
                    },
                }}>
                    <Typography variant="h2" component="h1" gutterBottom>
                        Privacy Policy
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Your privacy is important to us. This privacy policy explains the types of information we collect, how it's used, and the measures we take to safeguard your data.
                    </Typography>

                    <Typography variant="h6" component="h2">
                        Information Collection
                    </Typography>
                    <Typography variant="body1" paragraph>
                        We collect information to provide better services to all our users
                    </Typography>

                    <Typography variant="h6" component="h2">
                        Use of Information
                    </Typography>
                    <Typography variant="body1" paragraph>
                        The information we collect is used to improve our services, customize the user experience, and communicate updates
                    </Typography>

                    <Typography variant="h6" component="h2">
                        Cookies and Tracking Technologies
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Our website uses cookies and similar tracking technologies to enhance user experience and analyze website traffic. In accordance with European data protection laws, we seek your consent before placing any cookies on your device. You have the option to accept or decline cookies and can modify your preferences at any time through our cookie settings. For more detailed information about the cookies we use, please review our Cookie Policy.
                    </Typography>

                    <Typography variant="h6" component="h2">
                        Data Sharing and Transfers
                    </Typography>
                    <Typography variant="body1" paragraph>
                        We respect your privacy and only share your personal information with third parties when necessary for the provision of our services, compliance with legal obligations, or with your explicit consent. We ensure that all data transfers, especially those crossing European borders, adhere to legal standards and are protected by appropriate safeguards.
                    </Typography>

                    {/* Include more sections as necessary for your privacy policy details */}

                    <Typography variant="h6" component="h2">
                        Your Choices
                    </Typography>
                    <Typography variant="body1" paragraph>
                        You have choices regarding the information we collect and how it's used
                    </Typography>

                    <Typography variant="h6" component="h2">
                        Changes to This Policy
                    </Typography>
                    <Typography variant="body1" paragraph>
                        We may update our privacy policy from time to time. We will notify you of any changes by posting the new policy on this page
                    </Typography>

                    <Typography variant="h6" component="h2">
                        Contact Us
                    </Typography>
                    <Typography variant="body1" paragraph>
                        If you have any questions about this privacy policy, please contact us
                    </Typography>
                </Box>
            </Container>
        </div>
    );
};

export default PrivacyPolicy;
