import { MetadataRoute } from 'next';

/**
 * Sitemap для изображений
 * Помогает Google индексировать изображения товаров
 * 
 * Note: Next.js MetadataRoute.Sitemap не поддерживает image sitemap напрямую,
 * поэтому мы возвращаем URL изображений как обычные записи
 * Для полноценного image sitemap нужен кастомный XML endpoint
 */
export default async function sitemapImages(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://izabels.bg';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  try {
    // Получаем список всех активных букетов с изображениями
    const response = await fetch(`${apiUrl}/api/products?lang=bg`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error('Failed to fetch products for image sitemap');
      return [];
    }

    const data = await response.json();
    const products = data.products || [];

    const imageEntries: MetadataRoute.Sitemap = [];

    products.forEach((product: any) => {
      const translation = product.translations?.[0];
      const productUrl = `${baseUrl}/produkti/${product.sku}`;

      // Добавляем каждое изображение как отдельную запись
      if (product.images && product.images.length > 0) {
        product.images.forEach((image: string, index: number) => {
          // Пропускаем placeholder изображения
          if (!image || image.includes('placeholder')) return;

          imageEntries.push({
            url: productUrl,
            lastModified: new Date(product.updatedAt || product.createdAt),
            changeFrequency: 'weekly' as const,
            priority: index === 0 ? 0.8 : 0.6, // Первое изображение важнее
            // В будущем можно добавить images в alternates
            // когда Next.js добавит поддержку image sitemap
          });
        });
      }
    });

    return imageEntries;
  } catch (error) {
    console.error('Error generating images sitemap:', error);
    return [];
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Обновлять каждый час

