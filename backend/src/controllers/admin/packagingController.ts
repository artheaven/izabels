import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth';
import { generateSKU } from '../../utils/skuGenerator';
import { processImages } from '../../middleware/imageProcessor';
import { deleteFile } from '../../middleware/upload';

const prisma = new PrismaClient();

/**
 * Получить все упаковочные материалы
 * GET /api/admin/packaging
 */
export const getAllPackaging = async (req: AuthRequest, res: Response) => {
  try {
    const packaging = await prisma.packaging.findMany({
      include: {
        category: true,
        color: true,
        translations: {
          where: { lang: 'bg' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ packaging });
  } catch (error) {
    console.error('Ошибка при получении упаковки:', error);
    res.status(500).json({ error: 'Ошибка при получении упаковки' });
  }
};

/**
 * Получить упаковку по ID
 * GET /api/admin/packaging/:id
 */
export const getPackagingById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const packaging = await prisma.packaging.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        color: true,
        translations: true,
      },
    });

    if (!packaging) {
      return res.status(404).json({ error: 'Упаковка не найдена' });
    }

    res.json({ packaging });
  } catch (error) {
    console.error('Ошибка при получении упаковки:', error);
    res.status(500).json({ error: 'Ошибка при получении упаковки' });
  }
};

/**
 * Создать новую упаковку
 * POST /api/admin/packaging
 */
export const createPackaging = async (req: AuthRequest, res: Response) => {
  try {
    const {
      categoryId,
      colorId,
      isTransparent,
      hasInscriptions,
      unit,
      pricePerUnit,
      name,
      description,
    } = req.body;

    if (!categoryId || !unit || !pricePerUnit || !name) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }

    // Генерируем SKU
    const sku = await generateSKU('PK');

    // Обрабатываем изображения
    let images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      images = await processImages(req.files, 'packaging');
    }

    // Создаем упаковку
    const packaging = await prisma.packaging.create({
      data: {
        sku,
        categoryId: parseInt(categoryId),
        colorId: colorId ? parseInt(colorId) : null,
        isTransparent: isTransparent === 'true',
        hasInscriptions: hasInscriptions === 'true',
        unit,
        pricePerUnit: parseFloat(pricePerUnit),
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

    res.status(201).json({ packaging });
  } catch (error) {
    console.error('Ошибка при создании упаковки:', error);
    res.status(500).json({ error: 'Ошибка при создании упаковки' });
  }
};

/**
 * Обновить упаковку
 * PUT /api/admin/packaging/:id
 */
export const updatePackaging = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      categoryId,
      colorId,
      isTransparent,
      hasInscriptions,
      unit,
      pricePerUnit,
      name,
      description,
      existingImages,
    } = req.body;

    const packaging = await prisma.packaging.findUnique({
      where: { id: parseInt(id) },
    });

    if (!packaging) {
      return res.status(404).json({ error: 'Упаковка не найдена' });
    }

    // Обрабатываем новые изображения
    let newImages: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      newImages = await processImages(req.files, 'packaging');
    }

    const existingImagesArray = existingImages ? JSON.parse(existingImages) : packaging.images;
    const allImages = [...existingImagesArray, ...newImages];

    // Обновляем упаковку
    const updatedPackaging = await prisma.packaging.update({
      where: { id: parseInt(id) },
      data: {
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(colorId !== undefined && { colorId: colorId ? parseInt(colorId) : null }),
        ...(isTransparent !== undefined && { isTransparent: isTransparent === 'true' }),
        ...(hasInscriptions !== undefined && { hasInscriptions: hasInscriptions === 'true' }),
        ...(unit && { unit }),
        ...(pricePerUnit && { pricePerUnit: parseFloat(pricePerUnit) }),
        images: allImages,
      },
      include: {
        translations: true,
        category: true,
      },
    });

    // Обновляем перевод
    if (name || description !== undefined) {
      await prisma.packagingTranslation.upsert({
        where: {
          packagingId_lang: {
            packagingId: parseInt(id),
            lang: 'bg',
          },
        },
        update: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
        },
        create: {
          packagingId: parseInt(id),
          lang: 'bg',
          name: name || '',
          description: description || '',
        },
      });
    }

    res.json({ packaging: updatedPackaging });
  } catch (error) {
    console.error('Ошибка при обновлении упаковки:', error);
    res.status(500).json({ error: 'Ошибка при обновлении упаковки' });
  }
};

/**
 * Удалить упаковку
 * DELETE /api/admin/packaging/:id
 */
export const deletePackaging = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const packaging = await prisma.packaging.findUnique({
      where: { id: parseInt(id) },
    });

    if (!packaging) {
      return res.status(404).json({ error: 'Упаковка не найдена' });
    }

    // Удаляем изображения
    packaging.images.forEach(imagePath => deleteFile(imagePath));

    // Удаляем упаковку
    await prisma.packaging.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: 'Упаковка удалена' });
  } catch (error) {
    console.error('Ошибка при удалении упаковки:', error);
    res.status(500).json({ error: 'Ошибка при удалении упаковки' });
  }
};

/**
 * Переключить активность упаковки (вкл/выкл)
 * PATCH /api/admin/packaging/:id/toggle
 */
export const togglePackaging = async (req: AuthRequest, res: Response) => {
  try {
    const packagingId = parseInt(req.params.id);

    const packaging = await prisma.packaging.findUnique({
      where: { id: packagingId },
    });

    if (!packaging) {
      return res.status(404).json({ error: 'Упаковка не найдена' });
    }

    const updated = await prisma.packaging.update({
      where: { id: packagingId },
      data: { isActive: !packaging.isActive },
    });

    res.json({ success: true, packaging: updated });
  } catch (error) {
    console.error('Ошибка при переключении активности упаковки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

