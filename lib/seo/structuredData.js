// SEO için Structured Data (JSON-LD) şemaları

const SITE_URL = 'https://www.kinasepeti.com';
const SITE_NAME = 'Kınasepeti';
const LOGO_URL = `${SITE_URL}/ksLogo.jpeg`;

/**
 * Organization Schema - Şirket bilgileri
 */
export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: LOGO_URL,
  description: 'Kına gecesi ve düğün ürünleri konusunda uzman online mağaza. Kişiselleştirilmiş setler, hediyelikler ve aksesuarlar.',
  foundingDate: '2020',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'TR',
    addressLocality: 'İstanbul'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    availableLanguage: ['Turkish', 'English']
  },
  sameAs: [
    'https://www.instagram.com/kinasepeti',
    'https://www.tiktok.com/@kinasepeti',
    'https://www.etsy.com/shop/KinaSepeti'
  ]
});

/**
 * WebSite Schema - Site arama özelliği
 */
export const getWebsiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/search?query={search_term_string}`
    },
    'query-input': 'required name=search_term_string'
  }
});

/**
 * Breadcrumb Schema Generator
 */
export const getBreadcrumbSchema = (items) => {
  const itemListElement = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url ? `${SITE_URL}${item.url}` : undefined
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement
  };
};

/**
 * Product Schema Generator with Reviews
 */
export const getProductSchema = (product, reviews = []) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images || [],
    sku: product.id?.toString(),
    brand: {
      '@type': 'Brand',
      name: SITE_NAME
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/detail/${product.id}/${encodeURIComponent(product.title)}`,
      priceCurrency: 'TRY',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME
      }
    }
  };

  // Yorumlar varsa aggregateRating ekle
  if (reviews && reviews.length > 0) {
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;

    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avgRating.toFixed(1),
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1
    };

    schema.review = reviews.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.username
      },
      datePublished: review.date,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1
      },
      reviewBody: review.comment
    }));
  }

  return schema;
};

/**
 * FAQ Schema Generator
 */
export const getFAQSchema = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
});

/**
 * Article Schema Generator
 */
export const getArticleSchema = (article) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.title,
  description: article.description,
  image: article.image,
  datePublished: article.publishedDate,
  dateModified: article.modifiedDate || article.publishedDate,
  author: {
    '@type': 'Organization',
    name: SITE_NAME
  },
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    logo: {
      '@type': 'ImageObject',
      url: LOGO_URL
    }
  }
});

/**
 * Local Business Schema (eğer fiziksel mağaza açılırsa)
 */
export const getLocalBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: SITE_NAME,
  image: LOGO_URL,
  '@id': SITE_URL,
  url: SITE_URL,
  telephone: '+90-XXX-XXX-XXXX', // Telefon numarası eklenebilir
  priceRange: '₺₺',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'TR',
    addressLocality: 'İstanbul'
  }
});

