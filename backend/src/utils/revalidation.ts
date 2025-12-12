/**
 * Утилита для вызова Next.js revalidation из backend
 */

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'izabels-revalidate-2024';

/**
 * Вызывает revalidation Next.js кеша
 */
export async function triggerRevalidation(type: 'product' | 'category' | 'all', data?: { sku?: string; path?: string }) {
  try {
    const response = await fetch(`${FRONTEND_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: REVALIDATE_SECRET,
        type,
        ...data,
      }),
    });

    if (!response.ok) {
      console.error('Revalidation failed:', await response.text());
      return false;
    }

    console.log(`✅ Revalidated: ${type}`, data);
    return true;
  } catch (error) {
    console.error('Error calling revalidation:', error);
    return false;
  }
}

