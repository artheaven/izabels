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
        items: {
          include: {
            bouquet: {
              select: {
                sku: true,
                images: true,
                translations: {
                  where: { language: 'bg' },
                  select: { name: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
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
        items: {
          include: {
            bouquet: {
              select: {
                sku: true,
                images: true,
                translations: {
                  where: { language: 'bg' },
                  select: { name: true, description: true },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Ошибка при получении заказа:', error);
    res.status(500).json({ error: 'Ошибка при получении заказа' });
  }
};

