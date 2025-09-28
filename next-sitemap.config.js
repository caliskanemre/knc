/** @type {import('next-sitemap').IConfig} */

const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const SITE_URL = process.env.SITE_URL || 'https://www.kinasepeti.com';

module.exports = {
    siteUrl: SITE_URL,
    generateRobotsTxt: true,
    exclude: ['/api/*'],

    transform: async (config, path) => {
        let alternateRefs = [];

        if (path.startsWith('/tr') || path.startsWith('/en')) {
            const pathWithoutLocale = path.replace(/^\/(tr|en)/, '');

            alternateRefs = [
                { href: `${SITE_URL}/tr${pathWithoutLocale}`, hreflang: 'tr' },
                { href: `${SITE_URL}/en${pathWithoutLocale}`, hreflang: 'en' },
                { href: `${SITE_URL}/tr${pathWithoutLocale}`, hreflang: 'x-default' },
            ];
        }

        return {
            loc: path,
            changefreq: 'weekly',
            priority: 0.7,
            lastmod: new Date().toISOString(),
            alternateRefs,
        };
    },

    additionalPaths: async (config) => {
        const backendApiUrl = `${BACKEND_API_BASE_URL}/api/sitemap/urls`;
        console.log(`[DEBUG] Fetching dynamic URLs from: ${backendApiUrl}`);

        try {
            const response = await fetch(backendApiUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }
            const dynamicUrls = await response.json();

            // ✅ 1. HATA AYIKLAMA LOGU: API'den gelen ham veriyi görelim
            console.log('[DEBUG] Fetched Data:', JSON.stringify(dynamicUrls, null, 2));

            const paths = dynamicUrls.map(item => {
                // Her bir item'ın loc özelliğinin geçerli bir URL olduğundan emin olalım
                if (!item || !item.loc) {
                    console.warn('[DEBUG] Warning: Found an item without a .loc property:', item);
                    return null; // Geçersiz item'ları atla
                }
                return new URL(item.loc).pathname;
            }).filter(Boolean); // Null değerleri listeden temizle

            // ✅ 2. HATA AYIKLAMA LOGU: İşlenmiş path'leri görelim
            console.log('[DEBUG] Processed Paths:', paths);

            return paths;

        } catch (error) {
            console.error("[DEBUG] Error in additionalPaths:", error);
            return [];
        }
    },
};
