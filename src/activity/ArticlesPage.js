import React, { useCallback, useEffect, useState } from 'react';
import { Box, Container, Grid, Typography, Card, CardMedia, CardContent, Chip, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from "../header/Header";
import {t} from "i18next";
import SEO from '../shared/SEO';


export default function ArticlesPage() {
    const [articles, setArticles] = useState([]);
    const [topicFilter, setTopicFilter] = useState('All');
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
    const fetchArticles = useCallback(async () => {
        try {
            const response = await axios.get(`${baseURL}/articles`); // Fetch articles from backend
            setArticles(response.data);
        } catch (error) {
            console.error("Error fetching articles:", error);
        }
    }, [baseURL]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    // Extract unique topics
    const topics = Array.from(new Set(articles.map((a) => a.topic)));

    // Filter articles based on selected topic
    const filteredArticles = topicFilter === 'All' ? articles : articles.filter((article) => article.topic === topicFilter);

    return (
        <div>
            <SEO
                title={t('Henna Night Ideas') + ' | Articles'}
                description={t('Discover tips, traditions, and creative ideas for your next henna celebration')}
                type="article"
            />
            <Header />
            <Container sx={{ mt: 4 }}>
                {/* Page Title */}
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                    <Typography 
                        variant="h3" 
                        sx={{ 
                            fontFamily: 'var(--font-heading)', 
                            fontWeight: 'var(--fw-bold)', 
                            color: '#8B0000',
                            letterSpacing: 'var(--ls-tight)',
                            mb: 2
                        }}
                    >
                        {t("Henna Night Ideas")}
                    </Typography>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            color: 'text.secondary', 
                            mt: 2,
                            fontFamily: 'var(--font-primary)',
                            fontSize: '1.1rem',
                            lineHeight: 1.6,
                            letterSpacing: 'var(--ls-normal)',
                            maxWidth: '600px',
                            mx: 'auto'
                        }}
                    >
                        {t("Discover tips, traditions, and creative ideas for your next henna celebration")}
                    </Typography>
                </Box>

                {/* Topic Filter */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Chip
                        label="All"
                        onClick={() => setTopicFilter('All')}
                        variant={topicFilter === 'All' ? 'filled' : 'outlined'}
                        sx={{ 
                            mr: 1, 
                            cursor: 'pointer',
                            fontFamily: 'var(--font-ui)',
                            fontWeight: 'var(--fw-medium)',
                            letterSpacing: 'var(--ls-wide)',
                            '&.MuiChip-filled': {
                                backgroundColor: '#8B0000',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#660000',
                                }
                            }
                        }}
                    />
                    {topics.map((topic) => (
                        <Chip
                            key={topic}
                            label={topic}
                            onClick={() => setTopicFilter(topic)}
                            variant={topicFilter === topic ? 'filled' : 'outlined'}
                            sx={{ 
                                mr: 1, 
                                cursor: 'pointer',
                                fontFamily: 'var(--font-ui)',
                                fontWeight: 'var(--fw-medium)',
                                letterSpacing: 'var(--ls-wide)',
                                '&.MuiChip-filled': {
                                    backgroundColor: '#8B0000',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#660000',
                                    }
                                }
                            }}
                        />
                    ))}
                </Box>

                {/* Articles Grid */}
                <Grid container spacing={4}>
                    {filteredArticles.map((article) => (
                        <Grid key={article.id} item xs={12} sm={6} md={4}>
                            <Card sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                boxShadow: 3,
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6
                                }
                            }}>
                                <CardMedia
                                    component="img"
                                    image={article.image}
                                    alt={article.title}
                                    sx={{ height: 180, objectFit: 'cover' }}
                                />
                                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            color: 'text.secondary',
                                            fontFamily: 'var(--font-ui)',
                                            fontSize: '0.8rem',
                                            letterSpacing: 'var(--ls-wide)',
                                            textTransform: 'uppercase',
                                            fontWeight: 'var(--fw-medium)'
                                        }}
                                    >
                                        {article.topic} &middot; {article.date}
                                    </Typography>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            fontWeight: 'var(--fw-semibold)', 
                                            mt: 1,
                                            fontFamily: 'var(--font-heading)',
                                            letterSpacing: 'var(--ls-tight)',
                                            lineHeight: 1.3,
                                            color: '#2c2c2c'
                                        }}
                                    >
                                        {article.title}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            mt: 1, 
                                            color: 'text.secondary',
                                            fontFamily: 'var(--font-primary)',
                                            lineHeight: 1.6,
                                            letterSpacing: 'var(--ls-normal)'
                                        }}
                                    >
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
                                            fontFamily: 'var(--font-ui)',
                                            fontWeight: 'var(--fw-semibold)',
                                            letterSpacing: 'var(--ls-wide)',
                                            textTransform: 'uppercase',
                                            borderRadius: 2,
                                            transition: 'all 0.3s ease',
                                            ':hover': {
                                                borderColor: '#8B0000',
                                                backgroundColor: '#8B0000',
                                                color: 'white',
                                                transform: 'translateY(-1px)',
                                            },
                                        }}
                                    >
                                        {t("Read More")}
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
