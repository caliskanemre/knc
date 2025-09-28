/** @type {import('next-sitemap').IConfig} */

const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const SITE_URL = process.env.SITE_URL || 'https://www.kinasepeti.com';

module.exports = {
    siteUrl: SITE_URL,
    generateRobotsTxt: true,
    exclude: ['/api/*'],

    // Genel alternateRefs ayarını kaldırıyoruz.
    // Bunun yerine transform fonksiyonu ile kontrol edeceğiz.

    // ✅ Her URL için özel dönüşüm uygula
    transform: async (config, path) => {
        let alternateRefs = []; // Varsayılan olarak dil alternatifi yok

        // Sadece /tr veya /en ile başlayan path'ler için hreflang ekle
        if (path.startsWith('/tr') || path.startsWith('/en')) {
            // Mevcut dil ön ekini kaldırıp ana yolu bul (örn: /products/detail/123)
            const pathWithoutLocale = path.replace(/^\/(tr|en)/, '');

            alternateRefs = [
                {
                    href: `${SITE_URL}/tr${pathWithoutLocale}`,
                    hreflang: 'tr',
                },
                {
                    href: `${SITE_URL}/en${pathWithoutLocale}`,
                    hreflang: 'en',
                },
                {
                    href: `${SITE_URL}/tr${pathWithoutLocale}`,
                    hreflang: 'x-default',
                },
            ];
        }

        return {
            loc: path, // '/tr/urun-adi' veya '/articles/3' gibi
            changefreq: 'weekly',
            priority: 0.7,
            lastmod: new Date().toISOString(),
            alternateRefs: alternateRefs, // Sadece uygunsa eklenecek, değilse boş dizi olacak
        };
    },

    additionalPaths: async (config) => {
        const backendApiUrl = `${BACKEND_API_BASE_URL}/api/sitemap/urls`;
        console.log(`Fetching dynamic URLs from: ${backendApiUrl}`);

        try {
            const response = await fetch(backendApiUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }
            const dynamicUrls = await response.json();

            // Sadece path kısmını al
            return dynamicUrls.map(item => new URL(item.loc).pathname);

        } catch (error) {
            console.error("Failed to fetch dynamic URLs from backend:", error);
            return [];
        }
    },
};
