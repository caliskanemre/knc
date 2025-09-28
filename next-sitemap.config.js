/** @type {import('next-sitemap').IConfig} */

const BACKEND_API_BASE_URL = 'https://kinasepeti-f99dbcee65cd.herokuapp.com';
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
