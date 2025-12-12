/**
 * Хуки для использования в админке
 * Автоматически вызывают revalidation после изменений
 */

import { api } from './api';

/**
 * Вызывает revalidation после создания/обновления товара
 */
export async function triggerProductRevalidation(sku: string) {
  if (typeof window === 'undefined') return;

  try {
    // Вызываем backend webhook, который обновит frontend кеш
    await api.post('/api/webhooks/revalidate', {
      type: 'product',
      sku,
    });

    console.log('✅ Product cache revalidated:', sku);
  } catch (error) {
    console.error('Failed to trigger revalidation:', error);
    // Не критично - кеш обновится через час
  }
}

/**
 * Вызывает revalidation после создания/обновления категории
 */
export async function triggerCategoryRevalidation() {
  if (typeof window === 'undefined') return;

  try {
    await api.post('/api/webhooks/revalidate', {
      type: 'category',
    });

    console.log('✅ Category cache revalidated');
  } catch (error) {
    console.error('Failed to trigger revalidation:', error);
  }
}

/**
 * Полная ревалидация (используйте осторожно)
 */
export async function triggerFullRevalidation() {
  if (typeof window === 'undefined') return;

  try {
    await api.post('/api/webhooks/revalidate', {
      type: 'all',
    });

    console.log('✅ Full site revalidated');
  } catch (error) {
    console.error('Failed to trigger revalidation:', error);
  }
}

