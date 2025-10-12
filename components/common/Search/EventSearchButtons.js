import React from 'react';
import { Button, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const EventSearchButtons = ({ handleNewSearch, updateFilteredEvents, setSearchQuery }) => {
    const { t, i18n } = useTranslation();
    const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

    // Get current locale from i18next
    const getCurrentLocale = () => {
        const currentLang = i18n.language || 'tr';
        return currentLang.split('-')[0]; // 'tr-TR' -> 'tr'
    };

    // Filter products by category
    const handleCategoryFilter = async (category) => {
        const locale = getCurrentLocale();

        try {
            const response = await axios.get(`${baseURL}/products/${category}`, {
                params: {
                    page: 0,
                    size: 20,
                    locale: locale // Backend otomatik olarak currency tespit edecek
                }
            });

            const products = response.data.content;
            setSearchQuery(category);
            updateFilteredEvents(products);
        } catch (error) {
            console.error('Error filtering by category:', error);
        }
    };

    const categories = [
        { key: 'Veil', value: 'veil' },
        { key: 'HalayHandkerchief', value: 'handkerchief' },
        { key: 'Flowers', value: 'flowers' },
        { key: 'Tambourine', value: 'tambourine' },
        { key: 'Basket', value: 'basket' },
        { key: 'Cloth', value: 'cloth' }
    ];

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {categories.map((category) => (
                <Button
                    key={category.value}
                    variant="outlined"
                    size="small"
                    onClick={() => handleCategoryFilter(category.value)}
                    sx={{
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'white'
                        }
                    }}
                >
                    {t(category.key)}
                </Button>
            ))}
            <Button
                variant="outlined"
                size="small"
                onClick={() => {
                    setSearchQuery('');
                    handleNewSearch('');
                }}
                sx={{
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    color: 'error.main',
                    borderColor: 'error.main',
                    '&:hover': {
                        backgroundColor: 'error.light',
                        color: 'white'
                    }
                }}
            >
                {t('Clear')}
            </Button>
        </Box>
    );
};

export default EventSearchButtons;
