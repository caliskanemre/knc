import axios from 'axios';
import ProductDetailPage from './[title]';

// Yardımcı fonksiyonlar (orijinal dosyadan sadeleştirilmiş)
const stripHtmlTags = (str) => (str || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const sanitizeTitle = (str) => (str || 'product').replace(/[\\/]+/g, '-').replace(/\s+/g, ' ').trim();

export { ProductDetailPage as default };

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params, locale }) {
  const { id } = params;
  const lang = locale === 'en' ? 'en' : 'tr';
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.example.com';

  const headers = {
    'Accept-Language': lang === 'en' ? 'en-US,en;q=0.9' : 'tr-TR,tr;q=0.9,en;q=0.5',
    'Accept': 'application/json'
  };

  const tryFetch = async (label, url) => {
    try {
      const res = await axios.get(url, { headers, params: { locale: lang }, timeout: 7000 });
      return res.data;
    } catch (e) {
      console.error('[ID-only detail] FAIL', label, url, e?.response?.status);
      return null;
    }
  };

  // Önce /products/{id}
  let product = await tryFetch('id', `${baseURL}/products/${id}`);
  // Gerekirse /products/detail/{id}
  if (!product || !product.id) {
    product = await tryFetch('detail-id-only', `${baseURL}/products/detail/${id}`);
  }
  if (!product || !product.id) {
    return { notFound: true };
  }

  // Benzer ürünler
  let similarProducts = [];
  if (product.category) {
    try {
      const simRes = await axios.get(`${baseURL}/products/${encodeURIComponent(product.category)}` , { params: { page:0, size:6, locale: lang }, headers });
      const list = simRes.data?.content || [];
      similarProducts = list.filter(p => p.id !== product.id).slice(0,6);
    } catch (e) {
      console.error('[ID-only detail] similar error', e.message);
    }
  }

  const actualTitle = product.title || product.name || '';
  const sanitizedActual = sanitizeTitle(actualTitle);

  // Canonical her zaman başlıkla olsun (SEO tutarlılığı) ama burada redirect ETMİYORUZ.
  const pathTR = `/products/detail/${id}/${encodeURIComponent(sanitizedActual)}`;
  const pathEN = `/en/products/detail/${id}/${encodeURIComponent(sanitizedActual)}`;
  const canonical = `${origin}${lang === 'tr' ? pathTR : pathEN}`;

  // Açıklama çıkarımı basit versiyon
  const getLocalizedDescription = (p, l) => {
    if (!p) return '';
    const key = l === 'en' ? 'en' : 'tr';
    let trans = p.translations && (p.translations[key] || p.translations[key.toUpperCase()]);
    if (trans) {
      for (const cand of ['description','desc','longDescription','shortDescription']) {
        if (trans[cand] && typeof trans[cand] === 'string' && trans[cand].trim()) return trans[cand].trim();
      }
    }
    if (key === 'en') {
      for (const cand of ['descriptionEn','descriptionEN','en_description','descEn','descEN','enDesc','longDescriptionEn','shortDescriptionEn']) {
        if (p[cand] && typeof p[cand] === 'string' && p[cand].trim()) return p[cand].trim();
      }
    } else {
      for (const cand of ['descriptionTr','descriptionTR','tr_description','descTr','descTR','trDesc','longDescriptionTr','shortDescriptionTr']) {
        if (p[cand] && typeof p[cand] === 'string' && p[cand].trim()) return p[cand].trim();
      }
    }
    for (const cand of ['description','shortDescription']) {
      if (p[cand] && typeof p[cand] === 'string' && p[cand].trim()) return p[cand].trim();
    }
    return '';
  };

  const rawDesc = getLocalizedDescription(product, lang);
  const plainDesc = stripHtmlTags(rawDesc);
  const metaDescription = plainDesc ? (plainDesc.length > 160 ? plainDesc.slice(0,157) + '…' : plainDesc) : `${actualTitle}`;

  const seo = {
    metaTitle: actualTitle || 'Ürün',
    metaDescription,
    canonical,
    alternates: {
      tr: `${origin}${pathTR}`,
      en: `${origin}${pathEN}`,
      xDefault: `${origin}${pathTR}`
    },
    ogImage: (product.photos || []).map(p=>p.photo).filter(Boolean)[0]
  };

  const schemaCurrency = lang === 'tr' ? 'TRY' : 'EUR';
  const schemaUnitPrice = schemaCurrency === 'TRY'
    ? (Number(product?.tl_price ?? product?.price) || 0)
    : (Number(product?.eur_price ?? product?.price) || 0);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: actualTitle,
    image: (product.photos || []).map(p => p.photo).filter(Boolean),
    description: plainDesc || undefined,
    sku: product.id ? String(product.id) : undefined,
    brand: { '@type': 'Brand', name: 'Kina Sepeti' },
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: canonical,
      priceCurrency: schemaCurrency,
      price: schemaUnitPrice.toFixed(2)
    }
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Kına Sepeti', item: `${origin}/${lang === 'tr' ? '' : 'en'}` },
      { '@type': 'ListItem', position: 2, name: product?.category || 'Ürünler', item: `${origin}/${lang === 'tr' ? '' : 'en/'}products` },
      { '@type': 'ListItem', position: 3, name: actualTitle || 'Ürün', item: canonical }
    ]
  };

  return {
    props: {
      product: { ...product, structuredData: { product: productSchema, breadcrumbs } },
      seo,
      similarProducts,
    },
    revalidate: 3600
  };
}

