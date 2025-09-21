/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://www.kinasepeti.com',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/api/*'],
  transform: async (config, path) => {
    // Varsayılan transform: i18n ile hreflang alternatifleri eklenir
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
      alternateRefs: [
        { href: `${config.siteUrl}/tr`, hreflang: 'tr' },
        { href: `${config.siteUrl}/en`, hreflang: 'en' },
        { href: `${config.siteUrl}/tr`, hreflang: 'x-default' },
      ],
    };
  },
};

