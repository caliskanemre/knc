/** @type {import('next-sitemap').IConfig} */

// ✅ Backend API adresini ortam değişkeninden oku, yoksa localhost kullan.
const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

module.exports = {
    siteUrl: process.env.SITE_URL || 'https://www.kinasepeti.com',
    generateRobotsTxt: true,
    exclude: ['/api/*'],
    alternateRefs: [
        {
            href: 'https://www.kinasepeti.com/en',
            hreflang: 'en',
        },
        {
            href: 'https://www.kinasepeti.com/tr',
            hreflang: 'tr',
        },
        {
            href: 'https://www.kinasepeti.com/tr',
            hreflang: 'x-default',
        },
    ],
    additionalPaths: async (config) => {
        // ✅ Sabit kodlanmış URL yerine dinamik değişkeni kullan.
        const backendApiUrl = `${BACKEND_API_BASE_URL}/api/sitemap/urls`;
        console.log(`Fetching dynamic URLs from: ${backendApiUrl}`);

        try {
            const response = await fetch(backendApiUrl);

            // Fetch'in başarılı olup olmadığını kontrol et
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }

            const dynamicUrls = await response.json();

            const paths = dynamicUrls.map(item => {
                const path = new URL(item.loc).pathname;
                return {
                    loc: path,
                    changefreq: 'weekly',
                    priority: 0.8,
                };
            });

            console.log(`Found ${paths.length} dynamic URLs to add.`);
            return paths;

        } catch (error) {
            console.error("Failed to fetch dynamic URLs from backend:", error);
            return [];
        }
    },
};
