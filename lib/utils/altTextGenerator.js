/**
 * Alt Text Generator Utility
 * Backend'den alt text gelmediğinde otomatik oluşturur
 */

/**
 * Ürün bilgisinden SEO-friendly alt text oluştur
 */
export const generateProductAltText = (product, photoIndex = 0, locale = 'tr') => {
  if (!product) return locale === 'tr' ? 'Ürün Görseli' : 'Product Image';

  const isTR = locale.toLowerCase().startsWith('tr');
  const productName = isTR
    ? (product.name || product.title || product.productName)
    : (product.name_en || product.nameEn || product.name || product.title);

  if (!productName) {
    return isTR ? 'Ürün Görseli' : 'Product Image';
  }

  const category = product.category || '';

  // Ana görsel (index 0) için daha açıklayıcı
  if (photoIndex === 0) {
    if (category) {
      return isTR
        ? `${productName} - ${category}`
        : `${productName} - ${category}`;
    }
    return productName;
  }

  // Diğer görseller için
  return isTR
    ? `${productName} - Detay Görseli ${photoIndex + 1}`
    : `${productName} - Detail Image ${photoIndex + 1}`;
};

/**
 * Kategori bazlı akıllı alt text oluştur
 */
export const generateSmartAltText = (product, photoIndex = 0, locale = 'tr') => {
  if (!product) return locale === 'tr' ? 'Ürün Görseli' : 'Product Image';

  const isTR = locale.toLowerCase().startsWith('tr');
  const productName = isTR
    ? (product.name || product.title || product.productName)
    : (product.name_en || product.nameEn || product.name || product.title);

  if (!productName) {
    return isTR ? 'Ürün Görseli' : 'Product Image';
  }

  const category = (product.category || '').toLowerCase();

  // Kategori bazlı açıklamalar
  const categoryDescriptions = {
    'kına setleri': { tr: 'Kına Seti', en: 'Henna Set' },
    'henna sets': { tr: 'Kına Seti', en: 'Henna Set' },
    'bohça': { tr: 'Bohça', en: 'Traditional Bundle' },
    'bundle': { tr: 'Bohça', en: 'Bundle' },
    'aksesuar': { tr: 'Aksesuar', en: 'Accessory' },
    'accessories': { tr: 'Aksesuar', en: 'Accessory' },
    'hediyelik': { tr: 'Hediyelik Eşya', en: 'Gift Item' },
    'gifts': { tr: 'Hediyelik Eşya', en: 'Gift Item' },
    'süs': { tr: 'Süsleme', en: 'Decoration' },
    'decoration': { tr: 'Süsleme', en: 'Decoration' },
    'gelin': { tr: 'Gelin Ürünü', en: 'Bride Product' },
    'bride': { tr: 'Gelin Ürünü', en: 'Bride Product' },
    'damat': { tr: 'Damat Ürünü', en: 'Groom Product' },
    'groom': { tr: 'Damat Ürünü', en: 'Groom Product' },
  };

  const categoryDesc = categoryDescriptions[category];
  const categoryText = categoryDesc
    ? (isTR ? categoryDesc.tr : categoryDesc.en)
    : (product.category || '');

  // Ana görsel
  if (photoIndex === 0) {
    return categoryText
      ? `${productName} - ${categoryText}`
      : productName;
  }

  // Detay görselleri için daha açıklayıcı
  const detailTexts = {
    1: { tr: 'Ön Görünüm', en: 'Front View' },
    2: { tr: 'Yan Görünüm', en: 'Side View' },
    3: { tr: 'Detay Görünümü', en: 'Detail View' },
    4: { tr: 'Arka Görünüm', en: 'Back View' },
  };

  const detailText = detailTexts[photoIndex]
    ? (isTR ? detailTexts[photoIndex].tr : detailTexts[photoIndex].en)
    : (isTR ? `Görsel ${photoIndex + 1}` : `Image ${photoIndex + 1}`);

  return `${productName} - ${detailText}`;
};

/**
 * Backend response'dan alt text al veya oluştur
 */
export const getAltText = (photo, product, photoIndex = 0, locale = 'tr') => {
  // Backend'den gelen alt text varsa kullan
  if (photo) {
    const isTR = locale.toLowerCase().startsWith('tr');
    const backendAltText = isTR
      ? (photo.altText || photo.alt_text)
      : (photo.altTextEn || photo.alt_text_en || photo.altText || photo.alt_text);

    if (backendAltText && backendAltText.trim()) {
      return backendAltText;
    }
  }

  // Yoksa otomatik oluştur
  return generateSmartAltText(product, photoIndex, locale);
};

/**
 * Video için alt text oluştur
 */
export const generateVideoAltText = (product, locale = 'tr') => {
  if (!product) return locale === 'tr' ? 'Ürün Videosu' : 'Product Video';

  const isTR = locale.toLowerCase().startsWith('tr');
  const productName = isTR
    ? (product.name || product.title)
    : (product.name_en || product.nameEn || product.name || product.title);

  return isTR
    ? `${productName} - Tanıtım Videosu`
    : `${productName} - Product Video`;
};

/**
 * SEO için optimize edilmiş alt text (max 125 karakter)
 */
export const optimizeAltTextForSEO = (altText) => {
  if (!altText) return '';

  // Max 125 karakter (Google tavsiyesi)
  if (altText.length <= 125) return altText;

  // Fazlasını kes ve ... ekle
  return altText.substring(0, 122) + '...';
};

/**
 * Bulk alt text oluştur (tüm ürün listesi için)
 */
export const generateBulkAltTexts = (products, locale = 'tr') => {
  if (!Array.isArray(products)) return [];

  return products.map(product => ({
    productId: product.id,
    photos: (product.photos || []).map((photo, index) => ({
      photoId: photo.id,
      photoUrl: photo.photo,
      altText: getAltText(photo, product, index, locale),
    })),
  }));
};

