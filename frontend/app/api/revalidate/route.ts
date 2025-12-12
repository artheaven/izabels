import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API для принудительной ревалидации кеша
 * Вызывается из админки после создания/обновления товаров
 * 
 * Использование:
 * POST /api/revalidate
 * Body: { secret: "...", path: "/katalog", type: "product" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, path, type, sku } = body;

    // Проверяем секретный ключ
    const revalidateSecret = process.env.REVALIDATE_SECRET || 'izabels-revalidate-2024';
    
    if (secret !== revalidateSecret) {
      return NextResponse.json(
        { message: 'Invalid secret' },
        { status: 401 }
      );
    }

    // Ревалидируем в зависимости от типа
    switch (type) {
      case 'product':
        // Ревалидируем конкретный товар
        if (sku) {
          revalidatePath(`/produkti/${sku}`);
        }
        // Ревалидируем каталог
        revalidatePath('/katalog');
        // Ревалидируем главную (featured products)
        revalidatePath('/');
        break;

      case 'category':
        // Ревалидируем каталог и все товары
        revalidatePath('/katalog');
        revalidatePath('/');
        break;

      case 'all':
        // Полная ревалидация всего сайта
        revalidatePath('/', 'layout');
        break;

      default:
        if (path) {
          revalidatePath(path);
        }
    }

    return NextResponse.json({ 
      revalidated: true, 
      type,
      path,
      sku,
      now: Date.now() 
    });

  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint для простого тестирования
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Revalidation API',
    usage: 'POST /api/revalidate with { secret, path, type }',
    types: ['product', 'category', 'all'],
  });
}

