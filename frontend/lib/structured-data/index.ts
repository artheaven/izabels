/**
 * Библиотека для работы со Structured Data (JSON-LD)
 * Экспорт всех утилит для генерации Schema.org разметки
 */

export * from './types';
export * from './organization';
export * from './product';
export * from './breadcrumbs';

/**
 * Компонент для встраивания JSON-LD в страницу
 * Использование:
 * 
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={generateJsonLd(schema)}
 * />
 */
export { generateJsonLd } from './organization';

