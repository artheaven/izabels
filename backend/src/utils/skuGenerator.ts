import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Генерирует уникальный SKU для товара
 */
export const generateSKU = async (prefix: 'FL' | 'PK' | 'BQ'): Promise<string> => {
  let model: 'flower' | 'packaging' | 'bouquet';
  
  switch (prefix) {
    case 'FL':
      model = 'flower';
      break;
    case 'PK':
      model = 'packaging';
      break;
    case 'BQ':
      model = 'bouquet';
      break;
  }

  // Находим последний SKU с таким префиксом
  let lastNumber = 0;
  
  try {
    const lastItem = await (prisma[model] as any).findFirst({
      where: {
        sku: {
          startsWith: prefix,
        },
      },
      orderBy: {
        sku: 'desc',
      },
      select: {
        sku: true,
      },
    });

    if (lastItem && lastItem.sku) {
      const match = lastItem.sku.match(/\d+$/);
      if (match) {
        lastNumber = parseInt(match[0], 10);
      }
    }
  } catch (error) {
    console.error('Ошибка при генерации SKU:', error);
  }

  // Генерируем новый номер
  const newNumber = lastNumber + 1;
  const sku = `${prefix}-${String(newNumber).padStart(4, '0')}`;

  return sku;
};

/**
 * Генерирует уникальный номер заказа
 */
export const generateOrderNumber = async (): Promise<string> => {
  const lastOrder = await prisma.order.findFirst({
    orderBy: {
      id: 'desc',
    },
    select: {
      orderNumber: true,
    },
  });

  let lastNumber = 1000;
  if (lastOrder && lastOrder.orderNumber) {
    const match = lastOrder.orderNumber.match(/\d+$/);
    if (match) {
      lastNumber = parseInt(match[0], 10);
    }
  }

  return String(lastNumber + 1);
};

