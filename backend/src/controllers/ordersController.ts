import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ordersController = {
  async getAll(req: Request, res: Response) {
    try {
      const { status, startDate, endDate } = req.query;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = new Date(startDate as string);
        }
        if (endDate) {
          where.createdAt.lte = new Date(endDate as string);
        }
      }

      const orders = await prisma.order.findMany({
        where,
        include: {
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json(orders);
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ error: 'Ошибка при получении заказов' });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const order = await prisma.order.findUnique({
        where: { id: parseInt(id) },
        include: {
          items: true,
        },
      });

      if (!order) {
        return res.status(404).json({ error: 'Заказ не найден' });
      }

      res.json(order);
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ error: 'Ошибка при получении заказа' });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Статус обязателен' });
      }

      const allowedStatuses = ['new', 'processing', 'ready', 'delivered', 'cancelled'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Недопустимый статус' });
      }

      const order = await prisma.order.update({
        where: { id: parseInt(id) },
        data: { status },
      });

      res.json(order);
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ error: 'Ошибка при обновлении статуса заказа' });
    }
  },
};

