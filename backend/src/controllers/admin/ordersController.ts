import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth';

const prisma = new PrismaClient();

/**
 * Получить все заказы
 * GET /api/admin/orders
 */
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status, from, to, orderType, userId } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (orderType) {
      where.orderType = orderType;
    }

    if (userId) {
      where.userId = parseInt(userId as string);
    }

    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(from as string);
      }
      if (to) {
        where.createdAt.lte = new Date(to as string);
      }
    }

    const orders = await prisma.order.findMany({
      where,
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
 * Получить заказ по ID
 * GET /api/admin/orders/:id
 */
export const getOrderById = async (req: AuthRequest, res: Response) => {
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

    res.json({ order });
  } catch (error) {
    console.error('Ошибка при получении заказа:', error);
    res.status(500).json({ error: 'Ошибка при получении заказа' });
  }
};

/**
 * Создать заказ вручную (из админки)
 * POST /api/admin/orders
 */
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryType,
      deliveryAddress,
      deliveryDate,
      deliveryTime,
      orderType = 'PREORDER', // По умолчанию предзаказ
      source = 'STORE', // По умолчанию магазин для ручных заказов
      sellerName, // Имя продавца
      comment,
      paymentMethod = 'cash',
      items, // [{ sku, name, quantity, price }]
      deliveryPrice = 0,
    } = req.body;

    // Валидация - только товары обязательны
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Добавьте хотя бы один товар' });
    }

    // Генерируем номер заказа
    const orderNumber = await generateOrderNumber();

    // Рассчитываем общую сумму
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0) + parseFloat(deliveryPrice);

    // Создаем заказ
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: customerName || 'Гость',
        customerPhone: customerPhone || 'Не указан',
        customerEmail: customerEmail || null,
        deliveryType,
        deliveryAddress,
        deliveryDate: new Date(deliveryDate),
        deliveryTime,
        orderType,
        source,
        sellerName,
        comment,
        paymentMethod,
        totalAmount,
        deliveryPrice,
        status: 'new',
        items: {
          create: items.map((item: any) => ({
            itemType: item.type, // 'bouquet', 'flower', 'packaging'
            itemId: item.id,
            productNameSnapshot: item.name,
            quantity: item.quantity,
            priceSnapshot: item.price,
            options: item.options || {},
          })),
        },
      },
      include: {
        items: true,
      },
    });

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    res.status(500).json({ error: 'Ошибка при создании заказа' });
  }
};

/**
 * Обновить заказ
 * PUT /api/admin/orders/:id
 */
export const updateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryType,
      deliveryAddress,
      deliveryDate,
      deliveryTime,
      source,
      comment,
      status,
    } = req.body;

    const updateData: any = {};
    if (customerName !== undefined) updateData.customerName = customerName;
    if (customerPhone !== undefined) updateData.customerPhone = customerPhone;
    if (customerEmail !== undefined) updateData.customerEmail = customerEmail;
    if (deliveryType !== undefined) updateData.deliveryType = deliveryType;
    if (deliveryAddress !== undefined) updateData.deliveryAddress = deliveryAddress;
    if (deliveryDate !== undefined) updateData.deliveryDate = new Date(deliveryDate);
    if (deliveryTime !== undefined) updateData.deliveryTime = deliveryTime;
    if (source !== undefined) updateData.source = source;
    if (comment !== undefined) updateData.comment = comment;
    if (status !== undefined) updateData.status = status;

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        items: true,
      },
    });

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Ошибка при обновлении заказа:', error);
    res.status(500).json({ error: 'Ошибка при обновлении заказа' });
  }
};

/**
 * Обновить статус заказа
 * PATCH /api/admin/orders/:id/status
 */
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Требуется статус' });
    }

    const validStatuses = ['new', 'processing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Недопустимый статус' });
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        items: true,
      },
    });

    res.json({ order });
  } catch (error) {
    console.error('Ошибка при обновлении статуса заказа:', error);
    res.status(500).json({ error: 'Ошибка при обновлении статуса заказа' });
  }
};

/**
 * Генерация номера заказа
 */
async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  const prefix = `ORD-${year}${month}${day}`;
  
  const lastOrder = await prisma.order.findFirst({
    where: {
      orderNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      orderNumber: 'desc',
    },
  });
  
  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.split('-').pop() || '0');
    sequence = lastSequence + 1;
  }
  
  return `${prefix}-${String(sequence).padStart(4, '0')}`;
}

