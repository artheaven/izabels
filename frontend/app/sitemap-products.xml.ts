import { MetadataRoute } from 'next';

/**
 * Динамический sitemap для товаров
 * Получает список активных букетов из API
 */
export default async function sitemapProducts(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://izabels.bg';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  try {
    // Получаем список всех активных букетов
    const response = await fetch(`${apiUrl}/api/products?lang=bg`, {
      next: { revalidate: 3600 }, // Кешируем на 1 час
    });

    if (!response.ok) {
      console.error('Failed to fetch products for sitemap');
      return [];
    }

    const data = await response.json();
    const products = data.products || [];

    return products.map((product: any) => ({
      url: `${baseUrl}/produkti/${product.sku}`,
      lastModified: new Date(product.updatedAt || product.createdAt),
      changeFrequency: 'weekly' as const,
      priority: product.isFeatured ? 0.9 : 0.7,
      alternates: {
        languages: {
          bg: `${baseUrl}/produkti/${product.sku}`,
          en: `${baseUrl}/en/produkti/${product.sku}`,
          ru: `${baseUrl}/ru/produkti/${product.sku}`,
        },
      },
    }));
  } catch (error) {
    console.error('Error generating products sitemap:', error);
    return [];
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Обновлять каждый час

