import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Получить все цвета упаковки
 * GET /api/admin/packaging-colors
 */
export const getAllColors = async (req: Request, res: Response) => {
  try {
    const colors = await prisma.packagingColor.findMany({
      orderBy: { order: 'asc' },
    });

    res.json({ colors });
  } catch (error) {
    console.error('Ошибка при получении цветов упаковки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

/**
 * Создать новый цвет упаковки
 * POST /api/admin/packaging-colors
 */
export const createColor = async (req: Request, res: Response) => {
  try {
    const { name, hexCode, order } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Название цвета обязательно' });
    }

    // Проверка уникальности
    const existing = await prisma.packagingColor.findUnique({
      where: { name },
    });

    if (existing) {
      return res.status(400).json({ error: 'Цвет с таким названием уже существует' });
    }

    const color = await prisma.packagingColor.create({
      data: {
        name,
        hexCode: hexCode || null,
        order: order !== undefined ? parseInt(order) : 0,
      },
    });

    res.status(201).json({ success: true, color });
  } catch (error) {
    console.error('Ошибка при создании цвета:', error);
    res.status(500).json({ error: 'Ошибка при создании цвета' });
  }
};

/**
 * Обновить цвет упаковки
 * PUT /api/admin/packaging-colors/:id
 */
export const updateColor = async (req: Request, res: Response) => {
  try {
    const colorId = parseInt(req.params.id);
    const { name, hexCode, order } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (hexCode !== undefined) updateData.hexCode = hexCode || null;
    if (order !== undefined) updateData.order = parseInt(order);

    // Проверка уникальности имени при изменении
    if (name) {
      const existing = await prisma.packagingColor.findFirst({
        where: {
          name,
          id: { not: colorId },
        },
      });

      if (existing) {
        return res.status(400).json({ error: 'Цвет с таким названием уже существует' });
      }
    }

    const color = await prisma.packagingColor.update({
      where: { id: colorId },
      data: updateData,
    });

    res.json({ success: true, color });
  } catch (error) {
    console.error('Ошибка при обновлении цвета:', error);
    res.status(500).json({ error: 'Ошибка при обновлении цвета' });
  }
};

/**
 * Удалить цвет упаковки
 * DELETE /api/admin/packaging-colors/:id
 */
export const deleteColor = async (req: Request, res: Response) => {
  try {
    const colorId = parseInt(req.params.id);

    // Проверяем, используется ли цвет
    const usageCount = await prisma.packaging.count({
      where: { colorId },
    });

    if (usageCount > 0) {
      return res.status(400).json({
        error: 'Невозможно удалить цвет, который используется в упаковке',
      });
    }

    await prisma.packagingColor.delete({
      where: { id: colorId },
    });

    res.json({ success: true, message: 'Цвет удален' });
  } catch (error) {
    console.error('Ошибка при удалении цвета:', error);
    res.status(500).json({ error: 'Ошибка при удалении цвета' });
  }
};

