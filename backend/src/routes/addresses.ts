import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from '../middleware/userAuth';

const router = Router();
const prisma = new PrismaClient();

/**
 * Получить все адреса текущего пользователя
 * GET /api/addresses
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = (req as any).userId;

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ addresses });
  } catch (error) {
    console.error('Ошибка при получении адресов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * Создать новый адрес
 * POST /api/addresses
 */
router.post('/', authenticateUser, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { name, address, city, postalCode, isDefault } = req.body;

    // Если новый адрес должен быть по умолчанию, сбросить флаг у остальных
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        name,
        address,
        city: city || 'София',
        postalCode,
        isDefault: isDefault || false,
      },
    });

    res.status(201).json({ success: true, address: newAddress });
  } catch (error) {
    console.error('Ошибка при создании адреса:', error);
    res.status(500).json({ error: 'Ошибка при создании адреса' });
  }
});

/**
 * Обновить адрес
 * PUT /api/addresses/:id
 */
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const addressId = parseInt(req.params.id);
    const { name, address, city, postalCode, isDefault } = req.body;

    // Проверить, что адрес принадлежит пользователю
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      return res.status(404).json({ error: 'Адрес не найден' });
    }

    // Если адрес становится по умолчанию, сбросить флаг у остальных
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        name,
        address,
        city,
        postalCode,
        isDefault,
      },
    });

    res.json({ success: true, address: updatedAddress });
  } catch (error) {
    console.error('Ошибка при обновлении адреса:', error);
    res.status(500).json({ error: 'Ошибка при обновлении адреса' });
  }
});

/**
 * Удалить адрес
 * DELETE /api/addresses/:id
 */
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const addressId = parseInt(req.params.id);

    // Проверить, что адрес принадлежит пользователю
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      return res.status(404).json({ error: 'Адрес не найден' });
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    res.json({ success: true, message: 'Адрес удален' });
  } catch (error) {
    console.error('Ошибка при удалении адреса:', error);
    res.status(500).json({ error: 'Ошибка при удалении адреса' });
  }
});

export default router;

