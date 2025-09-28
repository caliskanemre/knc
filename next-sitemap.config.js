/** @type {import('next-sitemap').IConfig} */

module.exports = {
    siteUrl: process.env.SITE_URL || 'https://www.kinasepeti.com',
    generateRobotsTxt: true,
    exclude: ['/api/*'],

    // Bu ayar, bulunan tüm sayfalar için (hem statik hem dinamik)
    // otomatik olarak hreflang etiketleri ekler.
    // Transform fonksiyonuna artık ihtiyacınız yok.
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

    // ✅ BURASI EN ÖNEMLİ KISIM
    // Dinamik URL'leri Java backend'den çeken fonksiyon
    additionalPaths: async (config) => {
        // Backend API'nizin tam adresi
        // Build sırasında Next.js bu adrese ulaşabilmelidir.
        const backendApiUrl = 'http://localhost:8080/api/sitemap/urls';
        console.log(`Fetching dynamic URLs from: ${backendApiUrl}`);

        try {
            const response = await fetch(backendApiUrl);
            const dynamicUrls = await response.json(); // [{loc: '...'}, {loc: '...'}]

            // API'den gelen veriyi next-sitemap formatına map'liyoruz
            const paths = dynamicUrls.map(item => {
                // Gelen tam URL'den siteUrl kısmını çıkararak sadece path'i alıyoruz
                const path = new URL(item.loc).pathname;

                return {
                    loc: path, // Sadece '/tr/products/detail/...' gibi kısmı
                    changefreq: 'weekly',
                    priority: 0.8,
                    // lastmod: item.lastModified || new Date().toISOString(), // API'den geliyorsa kullan
                };
            });

            console.log(`Found ${paths.length} dynamic URLs to add.`);
            return paths;

        } catch (error) {
            console.error("Failed to fetch dynamic URLs from backend:", error);
            return []; // Hata durumunda boş dizi dön
        }
    },
};
