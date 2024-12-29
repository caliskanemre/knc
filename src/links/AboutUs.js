import React from 'react';
import { Typography, Box, Container } from '@mui/material';
import Header from "../header/Header";

const AboutUs = () => {
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
                        About KınaSepeti
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Welcome to KınaSepeti, your ultimate destination for personalized wedding and henna night products. Whether you're looking for customized gifts, decorative items, or unique keepsakes for the bride and groom, KınaSepeti ensures every product is crafted to make your special moments unforgettable.
                    </Typography>

                    <Typography variant="h6" component="h2">
                        What We Offer
                    </Typography>
                    <Typography variant="body1" paragraph>
                        At KınaSepeti, we specialize in personalized products tailored for weddings and henna nights. From customized candles and handkerchiefs to beautifully designed trays and gift boxes, our items are crafted to add elegance and individuality to your celebrations.
                    </Typography>

                    <Typography variant="h6" component="h2">
                        Personalized Products for Every Occasion
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Add a personal touch to your wedding or henna night with our customizable options. You can include names, dates, or special messages to create unique and memorable gifts and decorations that reflect your love story.
                    </Typography>

                    <Typography variant="h6" component="h2">
                        For Brides
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Celebrate your journey to the big day with our exclusive collection designed for brides. From personalized sashes to elegant accessories, we have everything you need to make your day truly yours.
                    </Typography>

                    <Typography variant="h6" component="h2">
                        For Grooms
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Grooms can find a range of custom products to complement their big day. Our personalized items ensure that every detail is as special and unique as your love story.
                    </Typography>

                    <Typography variant="h6" component="h2">
                        For Guests
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Show appreciation to your guests with our beautiful and thoughtful party favors. From custom-engraved keepsakes to delightful gift boxes, our products make your guests feel truly special.
                    </Typography>

                    <Typography variant="h6" component="h2">
                        Traditional Meets Modern
                    </Typography>
                    <Typography variant="body1" paragraph>
                        KınaSepeti blends traditional henna night customs with modern design to create products that honor your heritage while embracing contemporary elegance. Our collections are inspired by timeless traditions, ensuring that your celebration is both meaningful and stylish.
                    </Typography>

                    <Typography variant="h6" component="h2">
                        Join Us in Making Memories
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Let KınaSepeti be a part of your journey to create unforgettable memories. Explore our wide range of personalized products and discover how we can help make your wedding or henna night truly extraordinary.
                    </Typography>

                    <Typography variant="h6" component="h2">
                        Get Started Today
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Visit KınaSepeti.com to start personalizing your products and planning your perfect celebration. With KınaSepeti, every detail is tailored to you, ensuring a magical and memorable experience for you and your loved ones.
                    </Typography>
                </Box>
            </Container>
        </div>
    );
};

export default AboutUs;
