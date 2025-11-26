import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import path from 'path';

const prisma = new PrismaClient();

// Генерация следующего SKU
async function generateFlowerSKU(): Promise<string> {
  const lastFlower = await prisma.flower.findFirst({
    orderBy: { id: 'desc' },
    select: { sku: true },
  });

  if (!lastFlower) {
    return 'FL-0001';
  }

  const lastNumber = parseInt(lastFlower.sku.split('-')[1]);
  return `FL-${String(lastNumber + 1).padStart(4, '0')}`;
}

// Обработка загруженных изображений
async function processImages(files: Express.Multer.File[]): Promise<string[]> {
  const processedImages: string[] = [];

  for (const file of files) {
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
    const outputPath = path.join(path.dirname(file.path), filename);

    await sharp(file.path)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);

    // Удалить оригинальный файл
    const fs = require('fs');
    fs.unlinkSync(file.path);

    // Вернуть относительный путь
    processedImages.push(`/uploads/flowers/${filename}`);
  }

  return processedImages;
}

export const flowersController = {
  async getAll(req: Request, res: Response) {
    try {
      const { categoryId, search } = req.query;

      const where: any = {};

      if (categoryId) {
        where.categoryId = parseInt(categoryId as string);
      }

      const flowers = await prisma.flower.findMany({
        where,
        include: {
          category: {
            include: {
              translations: {
                where: { lang: 'bg' },
              },
            },
          },
          translations: {
            where: { lang: 'bg' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Фильтрация по поиску если указан
      let result = flowers;
      if (search) {
        const searchLower = (search as string).toLowerCase();
        result = flowers.filter(f =>
          f.translations[0]?.name.toLowerCase().includes(searchLower) ||
          f.sku.toLowerCase().includes(searchLower)
        );
      }

      res.json(result);
    } catch (error) {
      console.error('Get flowers error:', error);
      res.status(500).json({ error: 'Ошибка при получении цветов' });
    }
  },

  async getOne(req: Request, res: Response) {
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

      res.json(flower);
    } catch (error) {
      console.error('Get flower error:', error);
      res.status(500).json({ error: 'Ошибка при получении цветка' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { categoryId, priceCost, markup, nameBg, descriptionBg } = req.body;

      // Валидация
      if (!categoryId || !priceCost || !markup || !nameBg) {
        return res.status(400).json({ error: 'Обязательные поля: categoryId, priceCost, markup, nameBg' });
      }

      // Обработка изображений
      const files = req.files as Express.Multer.File[];
      const images = files ? await processImages(files) : [];

      // Генерация SKU
      const sku = await generateFlowerSKU();

      // Расчет цены продажи
      const price = parseFloat(priceCost) * parseFloat(markup);

      // Создание цветка
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
              name: nameBg,
              description: descriptionBg || null,
            },
          },
        },
        include: {
          translations: true,
        },
      });

      res.status(201).json(flower);
    } catch (error) {
      console.error('Create flower error:', error);
      res.status(500).json({ error: 'Ошибка при создании цветка' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { categoryId, priceCost, markup, nameBg, descriptionBg, existingImages } = req.body;

      // Получить текущий цветок
      const currentFlower = await prisma.flower.findUnique({
        where: { id: parseInt(id) },
      });

      if (!currentFlower) {
        return res.status(404).json({ error: 'Цветок не найден' });
      }

      // Обработка новых изображений
      const files = req.files as Express.Multer.File[];
      const newImages = files ? await processImages(files) : [];

      // Объединить существующие и новые изображения
      const existingImagesList = existingImages ? JSON.parse(existingImages) : [];
      const allImages = [...existingImagesList, ...newImages].slice(0, 4); // максимум 4

      // Расчет цены если изменились cost или markup
      const newPriceCost = priceCost ? parseFloat(priceCost) : currentFlower.priceCost.toNumber();
      const newMarkup = markup ? parseFloat(markup) : currentFlower.markup.toNumber();
      const price = newPriceCost * newMarkup;

      // Обновление цветка
      const flower = await prisma.flower.update({
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
        },
      });

      // Обновление перевода
      if (nameBg || descriptionBg) {
        await prisma.flowerTranslation.updateMany({
          where: { flowerId: parseInt(id), lang: 'bg' },
          data: {
            ...(nameBg && { name: nameBg }),
            ...(descriptionBg && { description: descriptionBg }),
          },
        });
      }

      res.json(flower);
    } catch (error) {
      console.error('Update flower error:', error);
      res.status(500).json({ error: 'Ошибка при обновлении цветка' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.flower.delete({
        where: { id: parseInt(id) },
      });

      res.json({ message: 'Цветок удален' });
    } catch (error) {
      console.error('Delete flower error:', error);
      res.status(500).json({ error: 'Ошибка при удалении цветка' });
    }
  },
};

