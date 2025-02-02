
import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Typography, Card, CardMedia, CardContent, Chip, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from "../header/Header";


const articlesData = [
    {
        id: 1,
        title: "The Ultimate Guide to Henna Night Parties",
        excerpt: "Planning a magical Henna Night? Explore traditions, outfit ideas, and more.",
        image: "https://images.unsplash.com/photo-1574762514559-33b55b68af04?w=800", // Example image
        date: "Jan 10, 2025",
        topic: "Henna Traditions"
    },
    {
        id: 2,
        title: "5 Global Henna Customs You Must See",
        excerpt: "From Morocco to India, discover how different cultures celebrate Henna ceremonies.",
        image: "https://images.unsplash.com/photo-1601805681622-72b0fe62b03b?w=800",
        date: "Jan 12, 2025",
        topic: "Cultural Spotlights"
    },
    {
        id: 3,
        title: "Henna-Inspired Wedding Favors",
        excerpt: "Unique gift ideas to wow your guests, complete with henna-themed packaging.",
        image: "https://images.unsplash.com/photo-1574867549278-16d99a3f2c9c?w=800",
        date: "Jan 15, 2025",
        topic: "Wedding Tips"
    },
    {
        id: 4,
        title: "Modern Henna Trends for 2025",
        excerpt: "What’s new in Henna styles this year? Minimalist motifs, glitter add-ons, and more!",
        image: "https://images.unsplash.com/photo-1535218509729-5f7ee064f36b?w=800",
        date: "Jan 18, 2025",
        topic: "Fashion & Trends"
    },
    // Add as many articles as you like...
];

export default function ArticlesPage() {
    const [articles, setArticles] = useState([]);
    const [topicFilter, setTopicFilter] = useState('All');
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const response = await axios.get(`${baseURL}/articles`); // Fetch articles from backend
            setArticles(response.data);
        } catch (error) {
            console.error("Error fetching articles:", error);
        }
    };

    // Extract unique topics
    const topics = Array.from(new Set(articles.map((a) => a.topic)));

    // Filter articles based on selected topic
    const filteredArticles = topicFilter === 'All' ? articles : articles.filter((article) => article.topic === topicFilter);

    return (
        <div>
            <Header />
            <Container sx={{ mt: 4 }}>
                {/* Page Title */}
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                    <Typography variant="h3" sx={{ fontFamily: "'Arial'", fontWeight: 700, color: '#8B0000' }}>
                        Kına gecesi tarihi ve trendleri
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mt: 2 }}>
                        Discover tips, traditions, and creative ideas for your next Henna celebration.
                    </Typography>
                </Box>

                {/* Topic Filter */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Chip
                        label="All"
                        onClick={() => setTopicFilter('All')}
                        variant={topicFilter === 'All' ? 'filled' : 'outlined'}
                        sx={{ mr: 1, cursor: 'pointer' }}
                    />
                    {topics.map((topic) => (
                        <Chip
                            key={topic}
                            label={topic}
                            onClick={() => setTopicFilter(topic)}
                            variant={topicFilter === topic ? 'filled' : 'outlined'}
                            sx={{ mr: 1, cursor: 'pointer' }}
                        />
                    ))}
                </Box>

                {/* Articles Grid */}
                <Grid container spacing={4}>
                    {filteredArticles.map((article) => (
                        <Grid key={article.id} item xs={12} sm={6} md={4}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
                                <CardMedia
                                    component="img"
                                    image={article.image}
                                    alt={article.title}
                                    sx={{ height: 180, objectFit: 'cover' }}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {article.topic} &middot; {article.date}
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
                                        {article.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                        {article.excerpt}
                                    </Typography>
                                </CardContent>
                                <Box sx={{ p: 2, pt: 0 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        component={Link}
                                        to={`/articles/${article.id}`}
                                        sx={{
                                            borderColor: '#8B0000',
                                            color: '#8B0000',
                                            ':hover': {
                                                borderColor: '#8B0000',
                                                backgroundColor: '#f9ecec',
                                            },
                                        }}
                                    >
                                        Read More
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </div>
    );
}
