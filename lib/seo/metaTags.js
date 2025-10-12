/**
 * SEO Meta Tag Helper Functions
 * Next.js için özelleştirilmiş meta tag yardımcıları
 */

/**
 * Temel meta tag seti oluştur
 */
export const generateBasicMeta = ({
  title,
  description,
  canonical,
  locale = 'tr',
  type = 'website'
}) => ({
  title,
  description,
  canonical,
  openGraph: {
    type,
    locale: locale === 'tr' ? 'tr_TR' : 'en_US',
    title,
    description,
    siteName: 'Kınasepeti',
    url: canonical
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description
  }
});

/**
 * Ürün meta tagları oluştur
 */
export const generateProductMeta = ({
  title,
  description,
  price,
  currency = 'TRY',
  availability = 'instock',
  images = [],
  canonical,
  locale = 'tr'
}) => ({
  title,
  description,
  canonical,
  openGraph: {
    type: 'product',
    locale: locale === 'tr' ? 'tr_TR' : 'en_US',
    title,
    description,
    siteName: 'Kınasepeti',
    url: canonical,
    images: images.map(img => ({
      url: img,
      alt: title
    })),
    product: {
      price: {
        amount: price,
        currency
      },
      availability
    }
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: images[0] ? [images[0]] : []
  }
});

/**
 * Makale meta tagları oluştur
 */
export const generateArticleMeta = ({
  title,
  description,
  publishedTime,
  modifiedTime,
  author,
  tags = [],
  images = [],
  canonical,
  locale = 'tr'
}) => ({
  title,
  description,
  canonical,
  openGraph: {
    type: 'article',
    locale: locale === 'tr' ? 'tr_TR' : 'en_US',
    title,
    description,
    siteName: 'Kınasepeti',
    url: canonical,
    images: images.map(img => ({
      url: img,
      alt: title
    })),
    article: {
      publishedTime,
      modifiedTime,
      authors: [author],
      tags
    }
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: images[0] ? [images[0]] : []
  }
});

/**
 * Robots meta tag oluştur
 */
export const generateRobotsMeta = ({
  index = true,
  follow = true,
  noarchive = false,
  noimageindex = false,
  maxSnippet = -1,
  maxImagePreview = 'large',
  maxVideoPreview = -1
}) => {
  const directives = [];

  directives.push(index ? 'index' : 'noindex');
  directives.push(follow ? 'follow' : 'nofollow');

  if (noarchive) directives.push('noarchive');
  if (noimageindex) directives.push('noimageindex');
  if (maxSnippet !== -1) directives.push(`max-snippet:${maxSnippet}`);
  if (maxImagePreview !== 'large') directives.push(`max-image-preview:${maxImagePreview}`);
  if (maxVideoPreview !== -1) directives.push(`max-video-preview:${maxVideoPreview}`);

  return directives.join(', ');
};

/**
 * Sosyal medya paylaşım URL'leri oluştur
 */
export const generateSocialShareUrls = (url, title, description) => ({
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`,
  pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(description)}`,
  linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
});

