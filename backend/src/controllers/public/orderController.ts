import { Request, Response } from 'express';
import { PrismaClient, CustomerStatus } from '@prisma/client';
import { generateOrderNumber } from '../../utils/skuGenerator';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

/**
 * Обновляет статус клиента на основе истории заказов
 */
const updateCustomerStatus = async (userId: number): Promise<CustomerStatus> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalOrders: true, totalSpent: true }
  });

  if (!user) return 'NEW';

  const totalSpent = parseFloat(user.totalSpent.toString());

  // Логика определения статуса:
  // NEW: 0-1 заказа или < 100 лв
  // REGULAR: 2-5 заказов или 100-500 лв (5% скидка)
  // LOYAL: 6-10 заказов или 500-1000 лв (10% скидка)
  // VIP: > 10 заказов или > 1000 лв (15% скидка)

  let newStatus: CustomerStatus = 'NEW';

  if (user.totalOrders > 10 || totalSpent > 1000) {
    newStatus = 'VIP';
  } else if (user.totalOrders >= 6 || totalSpent >= 500) {
    newStatus = 'LOYAL';
  } else if (user.totalOrders >= 2 || totalSpent >= 100) {
    newStatus = 'REGULAR';
  }

  await prisma.user.update({
    where: { id: userId },
    data: { customerStatus: newStatus }
  });

  return newStatus;
};

/**
 * Вычисляет скидку на основе статуса клиента
 */
const getStatusDiscount = (status: CustomerStatus): number => {
  const discounts = {
    NEW: 0,
    REGULAR: 0.05, // 5%
    LOYAL: 0.10,   // 10%
    VIP: 0.15,     // 15%
  };
  return discounts[status] || 0;
};

interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  price: number;
  options?: any;
}

/**
 * Создать новый заказ
 * POST /api/orders
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // Может быть undefined для гостей
    
    console.log('📝 Creating order with body:', JSON.stringify(req.body, null, 2));
    
    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      deliveryType = 'DELIVERY', // 'DELIVERY' или 'PICKUP'
      deliveryDate, // Дата доставки/самовывоза
      deliveryTime,
      recipientPhone, // Телефон получателя
      comment,
      paymentMethod,
      items,
      deliveryPrice = 0,
      promoCode, // Промокод (опционально)
    } = req.body;
    
    console.log('📦 Order items:', items);
    console.log('👤 User ID:', userId);

    // Валидация
    if (!customerName || !customerPhone || !items || items.length === 0) {
      return res.status(400).json({ 
        error: 'Заполните все обязательные поля и добавьте товары' 
      });
    }

    // Генерируем номер заказа
    const orderNumber = await generateOrderNumber();

    // Вычисляем общую сумму
    let totalAmount = 0;
    const orderItems: any[] = [];

    for (const item of items as OrderItem[]) {
      const itemTotal = item.price * item.quantity;
      totalAmount += itemTotal;

      // Находим товар в базе для определения типа
      let itemType = 'bouquet';
      let itemId = 0;

      const bouquet = await prisma.bouquet.findUnique({
        where: { sku: item.sku },
      });

      if (bouquet) {
        itemId = bouquet.id;
        itemType = 'bouquet';
      } else {
        const flower = await prisma.flower.findUnique({
          where: { sku: item.sku },
        });
        if (flower) {
          itemId = flower.id;
          itemType = 'flower';
        }
      }

      orderItems.push({
        itemType,
        itemId,
        productNameSnapshot: item.name,
        quantity: item.quantity,
        priceSnapshot: item.price,
        options: item.options || null,
      });
    }

    totalAmount += parseFloat(deliveryPrice.toString());

    // Получаем данные пользователя для расчета скидки
    let user = null;
    let statusDiscount = 0;
    let promoId = null;
    let promoDiscount = 0;

    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (user) {
        statusDiscount = getStatusDiscount(user.customerStatus) * totalAmount;
      }
    }

    // Проверка промокода
    if (promoCode) {
      const promo = await prisma.promo.findFirst({
        where: {
          code: promoCode,
          isActive: true,
          OR: [
            { validFrom: null, validTo: null },
            {
              validFrom: { lte: new Date() },
              validTo: { gte: new Date() }
            }
          ]
        }
      });

      if (promo) {
        // Проверка лимитов
        const canUsePromo = 
          (!promo.maxUses || promo.usedCount < promo.maxUses) &&
          (!promo.minOrderAmount || totalAmount >= parseFloat(promo.minOrderAmount.toString()));

        if (canUsePromo) {
          promoId = promo.id;
          
          if (promo.discountType === 'PERCENTAGE') {
            promoDiscount = (parseFloat(promo.discountValue.toString()) / 100) * totalAmount;
            if (promo.maxDiscount) {
              promoDiscount = Math.min(promoDiscount, parseFloat(promo.maxDiscount.toString()));
            }
          } else {
            promoDiscount = parseFloat(promo.discountValue.toString());
          }
        }
      }
    }

    // Итоговая сумма со всеми скидками
    const finalAmount = totalAmount - statusDiscount - promoDiscount;

    // Создаем заказ
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId || null,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        deliveryAddress: deliveryAddress || null,
        deliveryType: deliveryType as any,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        deliveryTime: deliveryTime || null,
        recipientPhone: recipientPhone || null,
        comment: comment || null,
        paymentMethod: paymentMethod || 'cash',
        paymentStatus: 'pending',
        totalAmount: finalAmount,
        deliveryPrice: parseFloat(deliveryPrice.toString()),
        promoId: promoId,
        promoDiscount: promoDiscount,
        statusDiscount: statusDiscount,
        status: 'new',
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    // Обновляем статистику пользователя
    if (userId && user) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalOrders: { increment: 1 },
          totalSpent: { increment: finalAmount },
          lastOrderDate: new Date()
        }
      });

      // Обновляем статус клиента
      await updateCustomerStatus(userId);
    }

    // Обновляем счетчик использования промокода
    if (promoId) {
      await prisma.promo.update({
        where: { id: promoId },
        data: { usedCount: { increment: 1 } }
      });

      // Создаем запись об использовании промокода
      await prisma.promoUsage.create({
        data: {
          promoId,
          orderId: order.id,
          userId: userId || null,
          discount: promoDiscount,
        }
      });
    }

    res.status(201).json({ 
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        discounts: {
          status: statusDiscount,
          promo: promoDiscount,
          total: statusDiscount + promoDiscount
        }
      },
    });
  } catch (error: any) {
    console.error('❌ Ошибка при создании заказа:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    
    res.status(500).json({ 
      error: 'Ошибка при создании заказа',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

