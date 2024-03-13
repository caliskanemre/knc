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
                        About Us
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Welcome to Activenty, your ultimate guide to discovering the best events and activities tailored just for you. Whether you're a thrill-seeker, a tech enthusiast, a music lover, or looking for family-friendly fun, Activenty brings the world of events to your fingertips, uniquely personalized to suit your interests and lifestyle.
                    </Typography>

                    <Typography variant="h6" component="h2">
                        Discover Nearest Events & Activities
                    </Typography>
                    <Typography variant="body1" paragraph>
                        With Activenty, the best events are just a click away. Our platform is designed to find the nearest events to you, ensuring you never miss out on exciting happenings around you. From local gatherings to grand festivals, our extensive database is your ticket to the hottest events in town.
                        Our platform covers a vast range of activities, ensuring there's something for everyone. Whether you're into sports, arts, culinary experiences, or outdoor adventures, Activenty is your gateway to unforgettable experiences.
                    </Typography>

                    <Typography variant="h6" component="h2">
                        AI Powered
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Activenty takes personalization to the next level with our advanced AI technology. Our intelligent system groups activities and events tailored to your preferences, ensuring a personalized experience like no other.
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
                        At Activenty, we believe in creating connections through shared experiences. Our mission is to bring people together through the joy of events and activities, tailored just for you. Join us on this journey of discovery and make every day an adventure.
                    </Typography>
                </Box>
            </Container>
        </div>
    );
};

export default AboutUs;
