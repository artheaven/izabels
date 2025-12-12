/**
 * SEO для фасетной навигации (фильтры в каталоге)
 * Предотвращает индексацию бесполезных комбинаций фильтров
 */

// Белый список "ценных" фильтров, которые можно индексировать
const VALUABLE_FILTERS = [
  'category', // Категории всегда ценны
  'sort',     // Сортировка может быть полезна
];

/**
 * Определяет, нужно ли индексировать страницу с фильтрами
 */
export function shouldIndexFacetedPage(searchParams: URLSearchParams): boolean {
  const params = Array.from(searchParams.keys());
  
  // Если нет параметров - индексируем
  if (params.length === 0) {
    return true;
  }
  
  // Если только один параметр и он в белом списке - индексируем
  if (params.length === 1 && VALUABLE_FILTERS.includes(params[0])) {
    return true;
  }
  
  // Если несколько параметров - не индексируем
  // (это избыточные комбинации фильтров)
  return false;
}

/**
 * Генерирует robots meta для страницы каталога
 */
export function getFacetedRobotsMeta(searchParams: URLSearchParams) {
  const shouldIndex = shouldIndexFacetedPage(searchParams);
  
  return {
    index: shouldIndex,
    follow: true, // Всегда follow для обхода ссылок
    googleBot: {
      index: shouldIndex,
      follow: true,
    },
  };
}

/**
 * Генерирует canonical URL для страницы каталога
 * Убирает избыточные параметры и указывает на основную версию
 */
export function getFacetedCanonicalUrl(baseUrl: string, searchParams: URLSearchParams): string {
  const params = Array.from(searchParams.entries());
  
  // Если нет параметров - canonical на базовую страницу
  if (params.length === 0) {
    return baseUrl;
  }
  
  // Фильтруем только ценные параметры
  const valuableParams = params.filter(([key]) => VALUABLE_FILTERS.includes(key));
  
  // Если остались только ценные параметры - canonical с ними
  if (valuableParams.length === 1) {
    const [key, value] = valuableParams[0];
    return `${baseUrl}?${key}=${value}`;
  }
  
  // Иначе canonical на базовую страницу (без фильтров)
  return baseUrl;
}

/**
 * Определяет, нужно ли использовать rel="prev" и rel="next" для пагинации
 */
export function getPaginationLinks(
  baseUrl: string,
  currentPage: number,
  totalPages: number
): { prev?: string; next?: string } {
  const links: { prev?: string; next?: string } = {};
  
  if (currentPage > 1) {
    links.prev = `${baseUrl}?page=${currentPage - 1}`;
  }
  
  if (currentPage < totalPages) {
    links.next = `${baseUrl}?page=${currentPage + 1}`;
  }
  
  return links;
}
