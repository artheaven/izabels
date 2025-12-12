import type { BreadcrumbList, ListItem } from './types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://izabels.bg';

/**
 * Генерация BreadcrumbList schema из массива элементов
 */
export function generateBreadcrumbSchema(
  items: Array<{ label: string; href?: string }>
): BreadcrumbList {
  const listItems: ListItem[] = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.label,
    ...(item.href && { item: `${SITE_URL}${item.href}` }),
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: listItems,
  };
}

/**
 * Генерация breadcrumbs для главной
 */
export function generateHomeBreadcrumbs(): BreadcrumbList {
  return generateBreadcrumbSchema([
    { label: 'Начало', href: '/' },
  ]);
}

/**
 * Генерация breadcrumbs для каталога
 */
export function generateCatalogBreadcrumbs(categoryName?: string): BreadcrumbList {
  const items = [
    { label: 'Начало', href: '/' },
    { label: 'Каталог', href: '/katalog' },
  ];

  if (categoryName) {
    items.push({ label: categoryName });
  }

  return generateBreadcrumbSchema(items);
}

/**
 * Генерация breadcrumbs для страницы товара
 */
export function generateProductBreadcrumbs(
  productName: string,
  categoryName: string,
  sku: string
): BreadcrumbList {
  return generateBreadcrumbSchema([
    { label: 'Начало', href: '/' },
    { label: 'Каталог', href: '/katalog' },
    { label: categoryName, href: '/katalog' },
    { label: productName, href: `/produkti/${sku}` },
  ]);
}

