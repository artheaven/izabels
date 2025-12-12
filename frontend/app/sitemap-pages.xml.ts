import { MetadataRoute } from 'next';

/**
 * Sitemap для страниц (статических + динамических категорий)
 * Включает главную, каталог, контакты, категории и другие важные страницы
 */
export default async function sitemapPages(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://izabels.bg';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
      alternates: {
        languages: {
          bg: baseUrl,
          en: `${baseUrl}/en`,
          ru: `${baseUrl}/ru`,
        },
      },
    },
    {
      url: `${baseUrl}/katalog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
      alternates: {
        languages: {
          bg: `${baseUrl}/katalog`,
          en: `${baseUrl}/en/katalog`,
          ru: `${baseUrl}/ru/katalog`,
        },
      },
    },
    {
      url: `${baseUrl}/kontakti`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: {
        languages: {
          bg: `${baseUrl}/kontakti`,
          en: `${baseUrl}/en/kontakti`,
          ru: `${baseUrl}/ru/kontakti`,
        },
      },
    },
  ];

  try {
    // Получаем динамические категории из API
    const response = await fetch(`${apiUrl}/api/categories?lang=bg`, {
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const data = await response.json();
      const categories = data.categories || [];

      // Добавляем категории в sitemap
      categories.forEach((category: any) => {
        if (category.slug && category.isActive !== false) {
          staticPages.push({
            url: `${baseUrl}/katalog?category=${category.slug}`,
            lastModified: new Date(category.updatedAt || category.createdAt || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
            alternates: {
              languages: {
                bg: `${baseUrl}/katalog?category=${category.slug}`,
                en: `${baseUrl}/en/katalog?category=${category.slug}`,
                ru: `${baseUrl}/ru/katalog?category=${category.slug}`,
              },
            },
          });

          // Добавляем подкатегории
          if (category.children && category.children.length > 0) {
            category.children.forEach((subcat: any) => {
              if (subcat.slug && subcat.isActive !== false) {
                staticPages.push({
                  url: `${baseUrl}/katalog?category=${subcat.slug}`,
                  lastModified: new Date(subcat.updatedAt || subcat.createdAt || new Date()),
                  changeFrequency: 'weekly' as const,
                  priority: 0.7,
                  alternates: {
                    languages: {
                      bg: `${baseUrl}/katalog?category=${subcat.slug}`,
                      en: `${baseUrl}/en/katalog?category=${subcat.slug}`,
                      ru: `${baseUrl}/ru/katalog?category=${subcat.slug}`,
                    },
                  },
                });
              }
            });
          }
        }
      });
    }
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
  }

  return staticPages;
}

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Обновлять каждый час

