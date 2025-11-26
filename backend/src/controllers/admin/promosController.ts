import { Request, Response } from 'express';
import { PrismaClient, PromoType, DiscountType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Получить все промокоды
 * GET /api/admin/promos
 */
export const getPromos = async (req: Request, res: Response) => {
  try {
    const { isActive, type } = req.query;

    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    const promos = await prisma.promo.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            usages: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ promos });
  } catch (error) {
    console.error('Ошибка при получении промокодов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

/**
 * Получить промокод по ID
 * GET /api/admin/promos/:id
 */
export const getPromoById = async (req: Request, res: Response) => {
  try {
    const promoId = parseInt(req.params.id);

    const promo = await prisma.promo.findUnique({
      where: { id: promoId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
          },
        },
        usages: {
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                customerName: true,
                totalAmount: true,
                createdAt: true,
              },
            },
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            usedAt: 'desc',
          },
        },
      },
    });

    if (!promo) {
      return res.status(404).json({ error: 'Промокод не найден' });
    }

    res.json({ promo });
  } catch (error) {
    console.error('Ошибка при получении промокода:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

/**
 * Создать новый промокод
 * POST /api/admin/promos
 */
export const createPromo = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).userId;
    const {
      code,
      type,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      validFrom,
      validTo,
      maxUses,
      maxUsesPerUser,
      isActive = true,
    } = req.body;

    // Валидация
    if (!code || !type || !discountType || !discountValue) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }

    // Проверка уникальности кода
    const existingPromo = await prisma.promo.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingPromo) {
      return res.status(400).json({ error: 'Промокод с таким кодом уже существует' });
    }

    // Валидация типов
    const validTypes: PromoType[] = ['SINGLE_USE', 'PERMANENT', 'DATE_RANGE'];
    const validDiscountTypes: DiscountType[] = ['PERCENTAGE', 'FIXED'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Неверный тип промокода' });
    }

    if (!validDiscountTypes.includes(discountType)) {
      return res.status(400).json({ error: 'Неверный тип скидки' });
    }

    // Для DATE_RANGE обязательны даты
    if (type === 'DATE_RANGE' && (!validFrom || !validTo)) {
      return res.status(400).json({ error: 'Для типа DATE_RANGE необходимо указать даты' });
    }

    const promo = await prisma.promo.create({
      data: {
        code: code.toUpperCase(),
        type,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validTo: validTo ? new Date(validTo) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        maxUsesPerUser: maxUsesPerUser ? parseInt(maxUsesPerUser) : 1,
        isActive,
        createdBy: adminId,
      },
    });

    res.status(201).json({ success: true, promo });
  } catch (error) {
    console.error('Ошибка при создании промокода:', error);
    res.status(500).json({ error: 'Ошибка при создании промокода' });
  }
};

/**
 * Обновить промокод
 * PUT /api/admin/promos/:id
 */
export const updatePromo = async (req: Request, res: Response) => {
  try {
    const promoId = parseInt(req.params.id);
    const {
      discountValue,
      minOrderAmount,
      maxDiscount,
      validFrom,
      validTo,
      maxUses,
      maxUsesPerUser,
      isActive,
    } = req.body;

    const updateData: any = {};

    if (discountValue !== undefined) updateData.discountValue = parseFloat(discountValue);
    if (minOrderAmount !== undefined)
      updateData.minOrderAmount = minOrderAmount ? parseFloat(minOrderAmount) : null;
    if (maxDiscount !== undefined)
      updateData.maxDiscount = maxDiscount ? parseFloat(maxDiscount) : null;
    if (validFrom !== undefined)
      updateData.validFrom = validFrom ? new Date(validFrom) : null;
    if (validTo !== undefined) updateData.validTo = validTo ? new Date(validTo) : null;
    if (maxUses !== undefined) updateData.maxUses = maxUses ? parseInt(maxUses) : null;
    if (maxUsesPerUser !== undefined) updateData.maxUsesPerUser = parseInt(maxUsesPerUser);
    if (isActive !== undefined) updateData.isActive = isActive;

    const promo = await prisma.promo.update({
      where: { id: promoId },
      data: updateData,
    });

    res.json({ success: true, promo });
  } catch (error) {
    console.error('Ошибка при обновлении промокода:', error);
    res.status(500).json({ error: 'Ошибка при обновлении промокода' });
  }
};

/**
 * Переключить активность промокода
 * PATCH /api/admin/promos/:id/toggle
 */
export const togglePromo = async (req: Request, res: Response) => {
  try {
    const promoId = parseInt(req.params.id);

    const promo = await prisma.promo.findUnique({
      where: { id: promoId },
    });

    if (!promo) {
      return res.status(404).json({ error: 'Промокод не найден' });
    }

    const updated = await prisma.promo.update({
      where: { id: promoId },
      data: { isActive: !promo.isActive },
    });

    res.json({ success: true, promo: updated });
  } catch (error) {
    console.error('Ошибка при переключении промокода:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

/**
 * Удалить промокод
 * DELETE /api/admin/promos/:id
 */
export const deletePromo = async (req: Request, res: Response) => {
  try {
    const promoId = parseInt(req.params.id);

    // Проверяем, использовался ли промокод
    const usagesCount = await prisma.promoUsage.count({
      where: { promoId },
    });

    if (usagesCount > 0) {
      return res.status(400).json({
        error: 'Невозможно удалить промокод, который уже использовался',
      });
    }

    await prisma.promo.delete({
      where: { id: promoId },
    });

    res.json({ success: true, message: 'Промокод удален' });
  } catch (error) {
    console.error('Ошибка при удалении промокода:', error);
    res.status(500).json({ error: 'Ошибка при удалении промокода' });
  }
};

/**
 * Валидировать промокод (для фронтенда корзины)
 * POST /api/promos/validate
 */
export const validatePromo = async (req: Request, res: Response) => {
  try {
    const { code, orderAmount } = req.body;
    const userId = (req as any).userId; // Может быть undefined для гостей

    if (!code) {
      return res.status(400).json({ error: 'Код промокода обязателен' });
    }

    const promo = await prisma.promo.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) {
      return res.status(404).json({ error: 'Промокод не найден' });
    }

    // Проверки
    const errors: string[] = [];

    if (!promo.isActive) {
      errors.push('Промокод не активен');
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      errors.push('Промокод исчерпан');
    }

    if (promo.minOrderAmount && orderAmount < parseFloat(promo.minOrderAmount.toString())) {
      errors.push(
        `Минимальная сумма заказа для этого промокода: ${promo.minOrderAmount} лв.`
      );
    }

    const now = new Date();
    if (promo.validFrom && now < promo.validFrom) {
      errors.push('Промокод еще не действителен');
    }

    if (promo.validTo && now > promo.validTo) {
      errors.push('Промокод истек');
    }

    // Проверка лимита использований на пользователя
    if (userId) {
      const userUsages = await prisma.promoUsage.count({
        where: {
          promoId: promo.id,
          userId,
        },
      });

      if (userUsages >= promo.maxUsesPerUser) {
        errors.push('Вы уже использовали этот промокод максимальное количество раз');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ valid: false, errors });
    }

    // Рассчитываем скидку
    let discount = 0;
    if (promo.discountType === 'PERCENTAGE') {
      discount = (parseFloat(promo.discountValue.toString()) / 100) * orderAmount;
      if (promo.maxDiscount) {
        discount = Math.min(discount, parseFloat(promo.maxDiscount.toString()));
      }
    } else {
      discount = parseFloat(promo.discountValue.toString());
    }

    res.json({
      valid: true,
      promo: {
        code: promo.code,
        type: promo.type,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discount,
      },
    });
  } catch (error) {
    console.error('Ошибка при валидации промокода:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

