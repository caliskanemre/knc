/** @type {import('next-sitemap').IConfig} */

const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';
const SITE_URL = process.env.SITE_URL || 'https://www.kinasepeti.com';

module.exports = {
    siteUrl: SITE_URL,
    generateRobotsTxt: true,
    exclude: ['/api/*'],

    // Bu fonksiyon ARTIK SADECE STATİK SAYFALAR İÇİN ÇALIŞACAK.
    // Dinamik sayfaların tüm mantığı additionalPaths'e taşındı.
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
            alternateRefs: alternateRefs,
        };
    },

    // ✅ DEĞİŞİKLİK BURADA:
    // Artık sadece path değil, her bir dinamik URL için tam bir sitemap objesi oluşturuyoruz.
    additionalPaths: async (config) => {
        const backendApiUrl = `${BACKEND_API_BASE_URL}/api/sitemap/urls`;

        try {
            const response = await fetch(backendApiUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }
            const dynamicUrls = await response.json();

            // Gelen her bir dinamik URL için tam sitemap objesi oluştur
            const fields = dynamicUrls.map(item => {
                const path = new URL(item.loc).pathname;
                let alternateRefs = [];

                // hreflang mantığını doğrudan buraya taşıdık
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
                    priority: path.includes('/products/') ? 0.8 : 0.7, // Ürünlere daha yüksek öncelik
                    lastmod: new Date().toISOString(),
                    alternateRefs: alternateRefs,
                };
            });

            return fields;

        } catch (error) {
            console.error("Error in additionalPaths:", error);
            return [];
        }
    },
};
