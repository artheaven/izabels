/**
 * Утилиты для вызова on-demand revalidation
 * Используется в админке после создания/обновления контента
 */

const FRONTEND_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'izabels-revalidate-2024';

/**
 * Ревалидировать товар в Next.js кеше
 */
export async function revalidateProduct(sku: string) {
  try {
    const response = await fetch(`${FRONTEND_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: REVALIDATE_SECRET,
        type: 'product',
        sku,
      }),
    });

    if (!response.ok) {
      console.error('Failed to revalidate product:', await response.text());
      return false;
    }

    console.log(`✅ Revalidated product: ${sku}`);
    return true;
  } catch (error) {
    console.error('Error revalidating product:', error);
    return false;
  }
}

/**
 * Ревалидировать категорию
 */
export async function revalidateCategory() {
  try {
    const response = await fetch(`${FRONTEND_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: REVALIDATE_SECRET,
        type: 'category',
      }),
    });

    if (!response.ok) {
      console.error('Failed to revalidate category:', await response.text());
      return false;
    }

    console.log('✅ Revalidated categories');
    return true;
  } catch (error) {
    console.error('Error revalidating category:', error);
    return false;
  }
}

/**
 * Полная ревалидация сайта
 */
export async function revalidateAll() {
  try {
    const response = await fetch(`${FRONTEND_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: REVALIDATE_SECRET,
        type: 'all',
      }),
    });

    if (!response.ok) {
      console.error('Failed to revalidate all:', await response.text());
      return false;
    }

    console.log('✅ Revalidated entire site');
    return true;
  } catch (error) {
    console.error('Error revalidating all:', error);
    return false;
  }
}

