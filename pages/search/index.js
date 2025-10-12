import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  CardMedia,
  Container,
  Grid,
  IconButton,
  Menu,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  MenuItem
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import EventSearchButtons from '../../components/common/Search/EventSearchButtons';
import { useAuth } from '../../lib/auth/AuthProvider';

// Helper function to generate a prefixed image URL (e.g., "small_", "medium_", "large_")
const getPrefixedImage = (url, prefix) => {
  if (!url) return url;
  return url.replace(/([^/]+)$/, `${prefix}_$1`);
};

export default function SearchPage({ initialQuery = '', initialResults = [], initialHasMore = false }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';

  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [allResult, setAllResult] = useState({ event: Array.isArray(initialResults) ? initialResults : [], activity: [] });
  const [eventPage, setEventPage] = useState(initialResults && initialResults.length > 0 ? 1 : 0);
  const [hasMoreEvents, setHasMoreEvents] = useState(!!initialHasMore);
  const [hasMoreActivity] = useState(false);
  const [activityPage, setActivityPage] = useState(0);
  const [openMenuEventId, setOpenMenuEventId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const { toggleFavorite, favorites, isLoggedIn } = useAuth();
  const safeFavorites = favorites || { favoriteEvents: [], favoriteActivities: [] };

  // Anchor refs map for favorite menu (avoid document usage in SSR)
  const favIconRefs = useRef({});
  const setFavIconRef = useCallback((id) => (el) => {
    if (el) {
      favIconRefs.current[id] = el;
    }
  }, []);

  const getCurrentLocale = useCallback(() => {
    const currentLang = i18n.language || 'tr';
    return currentLang.split('-')[0];
  }, [i18n.language]);

  const getDynamicFontSize = (title) => {
    if (!title) return '1.2rem';
    if (title.length < 10) return '1.8rem';
    if (title.length < 20) return '1.5rem';
    return '1.2rem';
  };

  const updateFilteredEvents = (filteredEvents) => {
    setAllResult((prev) => ({
      ...prev,
      event: [...filteredEvents],
    }));
    setEventPage(filteredEvents.length > 0 ? 1 : 0);
    setHasMoreEvents(filteredEvents.length >= 20);
  };

  const extractedEvent = useCallback(async ({ query = searchQuery, location = '', eventPageNumber = eventPage } = {}) => {
    const eventSize = 20;
    const locale = getCurrentLocale();
    try {
      const eventResponse = await axios.get(`${baseURL}/products/searchByFts`, {
        params: {
          query,
          location,
          page: eventPageNumber,
          size: eventSize,
          locale,
        },
      });
      const events = eventResponse.data?.content || [];
      setAllResult((prev) => ({ ...prev, event: [...prev.event, ...events] }));
      if (events.length === eventSize) {
        setEventPage((prev) => prev + 1);
        setHasMoreEvents(true);
      } else {
        setHasMoreEvents(false);
      }
    } catch (error) {
      console.error('Error loading more events:', error);
    }
  }, [baseURL, eventPage, getCurrentLocale, searchQuery]);

  const handleNewSearch = async (term) => {
    setEventPage(0);
    setActivityPage(0);
    setAllResult({ event: [], activity: [] });
    setSearchQuery(term);
    await extractedEvent({ query: term, eventPageNumber: 0 });

    // Update URL query (?q=term) without full reload
    const locale = router.locale || 'tr';
    const url = { pathname: router.pathname, query: term ? { q: term } : {} };
    router.replace(url, undefined, { shallow: true, locale });
  };

  const combinedResults = useMemo(() => [
    ...(Array.isArray(allResult.event)
      ? allResult.event.map((item) => ({ ...item, type: 'events' }))
      : []),
    ...(Array.isArray(allResult.activity)
      ? allResult.activity.map((item) => ({ ...item, type: 'activities' }))
      : []),
  ], [allResult]);

  const totalResults = combinedResults.length;

  const getLocalizedName = (item) => {
    const locale = getCurrentLocale();
    if (locale === 'en' && item?.nameEn) return item.nameEn;
    return item?.name || item?.title || '';
  };

  const sanitizeTitle = (str) => (str || 'product').replace(/[\\/]+/g, '-').replace(/\s+/g, ' ').trim();

  const formatPrice = (item) => {
    const isTR = !!item?.is_turkey_user;
    const base = isTR ? (item?.tl_price ?? item?.price) : (item?.eur_price ?? item?.price);
    if (base == null) return '';
    const num = Number(base) || 0;
    const symbol = isTR ? '₺' : '€';
    return `${Math.floor(num)} ${symbol}`;
  };

  const formatDiscountedPrice = (item) => {
    const isTR = !!item?.is_turkey_user;
    const base = isTR ? (item?.tl_price ?? item?.price) : (item?.eur_price ?? item?.price);
    if (base == null) return '';
    const num = Number(base) || 0;
    const discounted = Math.floor(num * 0.8);
    const symbol = isTR ? '₺' : '€';
    return `${discounted} ${symbol}`;
  };

  const handleClick = (eventId) => {
    if (isLoggedIn) {
      const isAlreadyFavoritedEvent = safeFavorites.favoriteEvents?.some((event) => event.id === eventId);
      if (!isAlreadyFavoritedEvent) {
        setOpenMenuEventId(eventId);
      } else {
        handleFavoriteClick(eventId, '');
      }
    } else {
      setOpenDialog(true);
    }
  };

  const handleFavoriteClick = (eventId, notificationType) => {
    const isFavorite = safeFavorites.favoriteEvents?.some((event) => event.id === eventId);
    toggleFavorite(eventId, isFavorite, 'event', notificationType);
    setOpenMenuEventId(null);
  };

  const handleFavoriteActivityClick = (activityId) => {
    const isFavorite = safeFavorites.favoriteActivities?.some((activity) => activity.id === activityId);
    toggleFavorite(activityId, isFavorite, 'activity');
  };

  // If there is an initial query from SSR, ensure client state matches URL
  useEffect(() => {
    if (router.isReady) {
      const q = typeof router.query?.q === 'string' ? router.query.q : '';
      if (q && q !== searchQuery && initialQuery !== q) {
        // If URL query differs, start a new search
        handleNewSearch(q);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  return (
    <>
      <Head>
        <title>{searchQuery ? `${searchQuery} - ${t('Search')} | Kına Sepeti` : `Search | Kına Sepeti`}</title>
        <meta name="description" content={t('Ürün arama sayfası')} />
        <meta name="robots" content="noindex, follow" />
      </Head>

      <main>
        <div className="parent-container">
          <div className="search-page">
            <div className="location-input">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleNewSearch(e.target.value);
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={() => handleNewSearch(searchQuery)}
                className="search-button"
              >
                {t('Search')}
              </Button>
            </div>

            <div className="filters">
              <EventSearchButtons
                handleNewSearch={handleNewSearch}
                updateFilteredEvents={updateFilteredEvents}
                setSearchQuery={setSearchQuery}
              />
            </div>

            <div className="recent-searches">
              <h2>{t('popularSearches')}</h2>
              <ul>
                <li><h6>{t('Veil')}</h6></li>
                <li><h6>{t('HalayHandkerchief')}</h6></li>
                <li><h6>{t('Flowers')}</h6></li>
                <li><h6>{t('Tambourine')}</h6></li>
                <li><h6>{t('Basket')}</h6></li>
                <li><h6>{t('Cloth')}</h6></li>
              </ul>
            </div>
          </div>

          {searchQuery && (
            <Typography variant="h6" style={{ textAlign: 'center', margin: '20px 0' }}>
              {totalResults === 0
                ? t('productNotFound')
                : t('resultsFound', { count: totalResults, query: searchQuery })}
            </Typography>
          )}
        </div>

        <Container sx={{ py: 9 }} maxWidth="xl">
          <Grid container spacing={4}>
            {combinedResults.map((item) => {
              const isAlreadyFavorited =
                item.type === 'events'
                  ? safeFavorites.favoriteEvents?.some((event) => event.id === item.id)
                  : safeFavorites.favoriteActivities?.some((activity) => activity.id === item.id);

              const handleFavClick =
                item.type === 'events'
                  ? () => handleClick(item.id)
                  : () => handleFavoriteActivityClick(item.id);

              const detailLink = `/products/detail/${item.id}/${encodeURIComponent(sanitizeTitle(getLocalizedName(item)))}`;

              const originalImage = (item.product_photos && item.product_photos[0]
                ? item.product_photos[0].photoUrl
                : (item.photos && item.photos[0] ? item.photos[0].photo : ''));

              const smallImageUrl = getPrefixedImage(originalImage, 'small');
              const mediumImageUrl = getPrefixedImage(originalImage, 'medium');
              const largeImageUrl = getPrefixedImage(originalImage, 'large');

              return (
                <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                  <Card sx={{ height: { xs: 'auto', md: '350px' }, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <Link href={detailLink} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <CardMedia
                        component="img"
                        image={smallImageUrl}
                        srcSet={`${smallImageUrl} 400w, ${mediumImageUrl} 800w, ${largeImageUrl} 1200w`}
                        sizes="(max-width: 600px) 400px, (max-width: 960px) 800px, 1200px"
                        alt={getLocalizedName(item)}
                        sx={{ width: '100%', height: { xs: 140, md: 200 }, objectFit: 'cover' }}
                      />
                    </Link>
                    <Box sx={{ p: 2, flex: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontSize: getDynamicFontSize(getLocalizedName(item)), fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {getLocalizedName(item)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.date}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {item.type === 'activities' ? item.activity_location : item.place}
                        </Typography>
                      </Box>
                      {(item.tl_price != null || item.eur_price != null || item.price != null) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Typography sx={{ textDecoration: 'line-through', color: 'gray', mr: 1, fontSize: '0.9rem' }}>
                            {formatPrice(item)}
                          </Typography>
                          <Typography sx={{ color: '#1976d2', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            {formatDiscountedPrice(item)}
                          </Typography>
                          <Box sx={{ backgroundColor: 'red', color: 'white', px: 1, py: 0.5, borderRadius: 1, ml: 1, fontSize: '0.75rem', fontWeight: 'bold' }}>
                            20%
                          </Box>
                        </Box>
                      )}
                    </Box>
                    <IconButton
                      ref={setFavIconRef(item.id)}
                      aria-label="add to favorites"
                      onClick={handleFavClick}
                      sx={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '50%', padding: '6px', zIndex: 3 }}
                    >
                      {isAlreadyFavorited ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                    </IconButton>
                    {item.type === 'events' && openMenuEventId === item.id && (
                      <Menu
                        id={`favorite-menu-${item.id}`}
                        anchorEl={favIconRefs.current[item.id] || null}
                        keepMounted
                        open={true}
                        onClose={() => setOpenMenuEventId(null)}
                      >
                        <MenuItem onClick={() => { handleFavoriteClick(item.id, 'NONE'); }}>
                          {t('addToFavorites') || 'Favorilere ekle'}
                        </MenuItem>
                      </Menu>
                    )}
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          {(hasMoreEvents || hasMoreActivity) && (eventPage > 0 || activityPage > 0) && (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <Button onClick={() => extractedEvent()} variant="contained" color="primary" style={{ textTransform: 'none', fontSize: '16px', padding: '10px 20px' }}>
                {t('Load More')}
              </Button>
            </div>
          )}
        </Container>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>{t('Just a moment')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('loginPlease')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary" autoFocus>
              {t('gotItThanks')}
            </Button>
          </DialogActions>
        </Dialog>
      </main>
    </>
  );
}

export async function getServerSideProps(context) {
  const { query, locale } = context;
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
  const q = typeof query.q === 'string' ? query.q : '';

  if (!q) {
    return {
      props: {
        initialQuery: '',
        initialResults: [],
        initialHasMore: false,
      },
    };
  }

  try {
    const size = 20;
    const res = await axios.get(`${baseURL}/products/searchByFts`, {
      params: {
        query: q,
        location: '',
        page: 0,
        size,
        locale: locale || 'tr',
      },
    });
    const items = res.data?.content || [];
    return {
      props: {
        initialQuery: q,
        initialResults: items,
        initialHasMore: items.length === size,
      },
    };
  } catch (e) {
    console.error('SSR search fetch failed:', e?.message || e);
    return {
      props: {
        initialQuery: q,
        initialResults: [],
        initialHasMore: false,
      },
    };
  }
}
