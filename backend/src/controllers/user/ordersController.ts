import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth';

const prisma = new PrismaClient();

/**
 * Получить заказы текущего пользователя
 * GET /api/user/orders
 */
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Необходима авторизация' });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // Обогащаем данные о товарах
    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      const enrichedItems = await Promise.all(order.items.map(async (item) => {
        let bouquet = null;
        if (item.itemType === 'bouquet' && item.itemId) {
          bouquet = await prisma.bouquet.findUnique({
            where: { id: item.itemId },
            select: {
              sku: true,
              images: true,
              translations: {
                where: { lang: 'bg' },
                select: { name: true },
              },
            },
          });
        }
        return {
          ...item,
          bouquet,
        };
      }));
      return {
        ...order,
        items: enrichedItems,
      };
    }));

    res.json({ orders: enrichedOrders });
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    res.status(500).json({ error: 'Ошибка при получении заказов' });
  }
};

/**
 * Получить заказ по ID (только свой)
 * GET /api/user/orders/:id
 */
export const getMyOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Необходима авторизация' });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
        userId,
      },
      include: {
        items: true,
      },
    });
    
    if (order) {
      // Обогащаем данные о товарах
      const enrichedItems = await Promise.all(order.items.map(async (item) => {
        let bouquet = null;
        if (item.itemType === 'bouquet' && item.itemId) {
          bouquet = await prisma.bouquet.findUnique({
            where: { id: item.itemId },
            select: {
              sku: true,
              images: true,
              translations: {
                where: { lang: 'bg' },
                select: { name: true, description: true },
              },
            },
          });
        }
        return {
          ...item,
          bouquet,
        };
      }));
      
      (order as any).items = enrichedItems;
    }

    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Ошибка при получении заказа:', error);
    res.status(500).json({ error: 'Ошибка при получении заказа' });
  }
};

