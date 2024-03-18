import React from 'react';
import { Typography, Box, Container } from '@mui/material';
import Header from "../header/Header";

const AboutUs = () => {
    return (
        <div>
            <Header/>
            <Container > {/* Centers the content and sets a max-width */}
                <Box sx={{
                    padding: '20px',
                    fontFamily: '"Roboto Slab", serif', // Custom font
                    '& h1, & h2': {
                        fontFamily: '"Roboto Slab", serif', // Ensures headers use the custom font
                    },
                }}>
                    <Typography variant="h2" component="h1" gutterBottom>
                        How it works
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Welcome to Activenty, your ultimate guide to discovering the best events and activities tailored just for you. Whether you're a thrill-seeker, a tech enthusiast, a music lover, or looking for family-friendly fun, Activenty brings the world of events to your fingertips, uniquely personalized to suit your interests and lifestyle.
                    </Typography>

                    <Typography variant="h6" component="h2">
                        Discover Your Personalized World of Events with Activenty
                    </Typography>
                    <Typography variant="body1" paragraph>
                        At Activenty, we harness the power of advanced AI to revolutionize how you discover and engage with events and activities.
                        Our platform is designed not just to connect you with events but to tailor these connections to your unique preferences and interests, ensuring a personalized experience every time.
                    </Typography>

                    <Typography variant="h6" component="h2">
                        AI-Driven Personalization
                    </Typography>
                    <Typography variant="body1" paragraph>
                        From the moment you start using Activenty, our AI begins to understand your interests and preferences based on your interactions and selections.
                        Whether you're marking events as favorites, searching for specific types of activities, or simply browsing, our intelligent system is at work, learning what makes your ideal event experience.
                    </Typography>

                    <Typography variant="h6" component="h2">
                        Curated Events Just for You
                    </Typography>
                    <Typography variant="body1" paragraph>
                        As Activenty gets to know you better, the events and activities you'll see will become increasingly aligned with your personal tastes.
                        This means that the more you use Activenty, the more relevant and exciting your event recommendations will become. Whether you're a music enthusiast eager for the next concert or an adventure seeker looking for your next thrill, Activenty ensures that the most relevant events are always at your fingertips.
                    </Typography>

                    <Typography variant="h6" component="h2">
                        For Singles
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Solo adventurers rejoice! Activenty curates events that cater specifically to singles, offering a mix of social gatherings, workshops, and adventure activities designed to foster connections and personal growth. Discover your next favorite hobby or meet like-minded individuals in a welcoming environment.
                    </Typography>

                    <Typography variant="h6" component="h2">
                        For Couples
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Create unforgettable memories with your partner through Activenty's handpicked experiences. From romantic dinners under the stars to thrilling couple’s escapades, our platform ensures you find the perfect activities to deepen your bond and add excitement to your relationship.
                    </Typography>

                    <Typography variant="h6" component="h2">
                        For Families
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Family time is precious, and Activenty makes it more meaningful with activities that are enjoyable for all ages. Explore family-friendly festivals, educational workshops, and outdoor adventures that promise fun and learning in equal measure. Make every family outing memorable with Activenty.
                    </Typography>

                    <Typography variant="h6" component="h2">
                        For Friends
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Gather your crew and dive into a world of shared experiences with Activenty. Whether it's hitting the latest music festivals, participating in group challenges, or embarking on outdoor adventures, our platform brings you events that are better experienced together. Strengthen your friendships with shared adventures that you'll talk about for years to come.
                    </Typography>

                    <Typography variant="h6" component="h2">
                        Events Categorized for Your Interest
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Activenty's AI-powered platform doesn't just personalize; it categorizes events to align with your passions. Whether you're an outdoor enthusiast, a tech geek, a music aficionado, an art lover, or seeking children-friendly activities, our intelligent categorization ensures you find events that resonate with your interests.
                    </Typography>


                    <Typography variant="h6" component="h2">
                        Join Us on a Journey of Discovery
                    </Typography>
                    <Typography variant="body1" paragraph>
                        With Activenty, every day is an opportunity for a new adventure. Our mission is to connect you with experiences that bring joy, foster connections, and create lasting memories through the power of shared events. Join our community and let Activenty's AI guide you to your next unforgettable experience.
                    </Typography>
                </Box>
            </Container>
        </div>
    );
};

export default AboutUs;
