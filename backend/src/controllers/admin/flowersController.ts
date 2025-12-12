import { Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth';
import { generateSKU } from '../../utils/skuGenerator';
import { processImages } from '../../middleware/imageProcessor';
import { deleteFile } from '../../middleware/upload';
import { triggerRevalidation } from '../../utils/revalidation';

const prisma = new PrismaClient();

/**
 * Получить все цветы
 * GET /api/admin/flowers
 */
export const getAllFlowers = async (req: AuthRequest, res: Response) => {
  try {
    const { subcategory, search } = req.query;

    const where: Prisma.FlowerWhereInput = {};

    if (subcategory) {
      where.category = {
        slug: subcategory as string,
      };
    }

    if (search) {
      where.translations = {
        some: {
          name: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
      };
    }

    const flowers = await prisma.flower.findMany({
      where,
      include: {
        category: true,
        translations: {
          where: { lang: 'bg' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ flowers });
  } catch (error) {
    console.error('Ошибка при получении цветов:', error);
    res.status(500).json({ error: 'Ошибка при получении цветов' });
  }
};

/**
 * Получить цветок по ID
 * GET /api/admin/flowers/:id
 */
export const getFlowerById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const flower = await prisma.flower.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        translations: true,
      },
    });

    if (!flower) {
      return res.status(404).json({ error: 'Цветок не найден' });
    }

    res.json({ flower });
  } catch (error) {
    console.error('Ошибка при получении цветка:', error);
    res.status(500).json({ error: 'Ошибка при получении цветка' });
  }
};

/**
 * Создать новый цветок
 * POST /api/admin/flowers
 */
export const createFlower = async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId, priceCost, markup, name, description } = req.body;

    if (!categoryId || !priceCost || !markup || !name) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }

    // Генерируем SKU
    const sku = await generateSKU('FL');

    // Вычисляем цену продажи
    const price = parseFloat(priceCost) * parseFloat(markup);

    // Обрабатываем изображения
    let images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      images = await processImages(req.files, 'flowers');
    }

    // Создаем цветок
    const flower = await prisma.flower.create({
      data: {
        sku,
        categoryId: parseInt(categoryId),
        priceCost: parseFloat(priceCost),
        markup: parseFloat(markup),
        price,
        images,
        translations: {
          create: {
            lang: 'bg',
            name,
            description: description || '',
          },
        },
      },
      include: {
        translations: true,
        category: true,
      },
    });

    // Триггерим revalidation (цветы влияют на букеты)
    triggerRevalidation('category').catch(err => 
      console.error('Failed to trigger revalidation:', err)
    );

    res.status(201).json({ flower });
  } catch (error) {
    console.error('Ошибка при создании цветка:', error);
    res.status(500).json({ error: 'Ошибка при создании цветка' });
  }
};

/**
 * Обновить цветок
 * PUT /api/admin/flowers/:id
 */
export const updateFlower = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { categoryId, priceCost, markup, name, description, existingImages } = req.body;

    const flower = await prisma.flower.findUnique({
      where: { id: parseInt(id) },
    });

    if (!flower) {
      return res.status(404).json({ error: 'Цветок не найден' });
    }

    // Вычисляем новую цену если изменились параметры
    let price = flower.price;
    if (priceCost && markup) {
      price = new Prisma.Decimal(parseFloat(priceCost) * parseFloat(markup));
    }

    // Обрабатываем новые изображения
    let newImages: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      newImages = await processImages(req.files, 'flowers');
    }

    // Объединяем существующие и новые изображения
    const existingImagesArray = existingImages ? JSON.parse(existingImages) : flower.images;
    const allImages = [...existingImagesArray, ...newImages];

    // Обновляем цветок
    const updatedFlower = await prisma.flower.update({
      where: { id: parseInt(id) },
      data: {
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(priceCost && { priceCost: parseFloat(priceCost) }),
        ...(markup && { markup: parseFloat(markup) }),
        price,
        images: allImages,
      },
      include: {
        translations: true,
        category: true,
      },
    });

    // Обновляем перевод
    if (name || description) {
      await prisma.flowerTranslation.upsert({
        where: {
          flowerId_lang: {
            flowerId: parseInt(id),
            lang: 'bg',
          },
        },
        update: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
        },
        create: {
          flowerId: parseInt(id),
          lang: 'bg',
          name: name || '',
          description: description || '',
        },
      });
    }

    res.json({ flower: updatedFlower });
  } catch (error) {
    console.error('Ошибка при обновлении цветка:', error);
    res.status(500).json({ error: 'Ошибка при обновлении цветка' });
  }
};

/**
 * Удалить цветок
 * DELETE /api/admin/flowers/:id
 */
export const deleteFlower = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const flower = await prisma.flower.findUnique({
      where: { id: parseInt(id) },
    });

    if (!flower) {
      return res.status(404).json({ error: 'Цветок не найден' });
    }

    // Удаляем изображения
    flower.images.forEach(imagePath => deleteFile(imagePath));

    // Удаляем цветок (каскадно удалятся переводы)
    await prisma.flower.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: 'Цветок удален' });
  } catch (error) {
    console.error('Ошибка при удалении цветка:', error);
    res.status(500).json({ error: 'Ошибка при удалении цветка' });
  }
};

/**
 * Удалить конкретное изображение цветка
 * DELETE /api/admin/flowers/:id/image/:imagePath
 */
export const deleteFlowerImage = async (req: AuthRequest, res: Response) => {
  try {
    const { id, imagePath } = req.params;

    const flower = await prisma.flower.findUnique({
      where: { id: parseInt(id) },
    });

    if (!flower) {
      return res.status(404).json({ error: 'Цветок не найден' });
    }

    // Удаляем файл
    const decodedPath = decodeURIComponent(imagePath);
    deleteFile(decodedPath);

    // Убираем из массива images
    const updatedImages = flower.images.filter(img => img !== decodedPath);

    await prisma.flower.update({
      where: { id: parseInt(id) },
      data: { images: updatedImages },
    });

    res.json({ success: true, images: updatedImages });
  } catch (error) {
    console.error('Ошибка при удалении изображения:', error);
    res.status(500).json({ error: 'Ошибка при удалении изображения' });
  }
};

/**
 * Переключить активность цветка (вкл/выкл)
 * PATCH /api/admin/flowers/:id/toggle
 */
export const toggleFlower = async (req: AuthRequest, res: Response) => {
  try {
    const flowerId = parseInt(req.params.id);

    const flower = await prisma.flower.findUnique({
      where: { id: flowerId },
    });

    if (!flower) {
      return res.status(404).json({ error: 'Цветок не найден' });
    }

    const updated = await prisma.flower.update({
      where: { id: flowerId },
      data: { isActive: !flower.isActive },
    });

    res.json({ success: true, flower: updated });
  } catch (error) {
    console.error('Ошибка при переключении активности цветка:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

