import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, Card, CardMedia, CardContent, Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import Header from '../header/Header';

export default function ArticleDetailPage() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    // fetchArticle fonksiyonunu useCallback ile sarmalayarak bağımlılık sorununu çöz
    const fetchArticle = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const response = await axios.get(`${baseURL}/articles/${id}`);
            setArticle(response.data);
        } catch (err) {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [id, baseURL]);

    useEffect(() => {
        fetchArticle();
    }, [fetchArticle]);

    if (loading) {
        return (
            <Container sx={{ textAlign: 'center', mt: 5 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error || !article) {
        return (
            <Container sx={{ textAlign: 'center', mt: 5 }}>
                <Typography variant="h4" color="error">Article Not Found</Typography>
                <Button component={Link} to="/articles" variant="contained" sx={{ mt: 2 }}>
                    Back to Articles
                </Button>
            </Container>
        );
    }

    return (
        <div>
            <Header />
            <Container sx={{ mt: 4 }}>
                <Card sx={{ boxShadow: 3 }}>
                    <CardMedia
                        component="img"
                        image={article.image}
                        alt={article.title}
                        sx={{ height: 350, objectFit: 'cover' }}
                    />
                    <CardContent>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#8B0000', mb: 2 }}>
                            {article.title}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                            {article.topic} &middot; {article.date}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                                <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                                    <div dangerouslySetInnerHTML={{ __html: article.content }} />
                                </Typography>
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* Back to Articles Button */}
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Button component={Link} to="/articles" variant="outlined" sx={{ borderColor: '#8B0000', color: '#8B0000' }}>
                        Back to Articles
                    </Button>
                </Box>
            </Container>
        </div>
    );
}
