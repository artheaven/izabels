import { MetadataRoute } from 'next';

/**
 * Индексный sitemap
 * Ссылается на все остальные sitemaps
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://izabels.bg';

  return [
    {
      url: `${baseUrl}/sitemap-pages.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-products.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap-images.xml`,
      lastModified: new Date(),
    },
  ];
}

