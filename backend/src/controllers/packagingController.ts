import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import path from 'path';

const prisma = new PrismaClient();

async function generatePackagingSKU(): Promise<string> {
  const lastPackaging = await prisma.packaging.findFirst({
    orderBy: { id: 'desc' },
    select: { sku: true },
  });

  if (!lastPackaging) {
    return 'PK-0001';
  }

  const lastNumber = parseInt(lastPackaging.sku.split('-')[1]);
  return `PK-${String(lastNumber + 1).padStart(4, '0')}`;
}

async function processImages(files: Express.Multer.File[]): Promise<string[]> {
  const processedImages: string[] = [];

  for (const file of files) {
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
    const outputPath = path.join(path.dirname(file.path), filename);

    await sharp(file.path)
      .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);

    const fs = require('fs');
    fs.unlinkSync(file.path);

    processedImages.push(`/uploads/packaging/${filename}`);
  }

  return processedImages;
}

export const packagingController = {
  async getAll(req: Request, res: Response) {
    try {
      const { categoryId } = req.query;

      const where: any = {};

      if (categoryId) {
        where.categoryId = parseInt(categoryId as string);
      }

      const packaging = await prisma.packaging.findMany({
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

      res.json(packaging);
    } catch (error) {
      console.error('Get packaging error:', error);
      res.status(500).json({ error: 'Ошибка при получении упаковки' });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const packaging = await prisma.packaging.findUnique({
        where: { id: parseInt(id) },
        include: {
          category: true,
          translations: true,
        },
      });

      if (!packaging) {
        return res.status(404).json({ error: 'Упаковка не найдена' });
      }

      res.json(packaging);
    } catch (error) {
      console.error('Get packaging error:', error);
      res.status(500).json({ error: 'Ошибка при получении упаковки' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { categoryId, nameBg, descriptionBg, color, isTransparent, unit, pricePerUnit } = req.body;

      if (!categoryId || !nameBg || !unit || !pricePerUnit) {
        return res.status(400).json({ error: 'Обязательные поля: categoryId, nameBg, unit, pricePerUnit' });
      }

      const files = req.files as Express.Multer.File[];
      const images = files ? await processImages(files) : [];

      const sku = await generatePackagingSKU();

      const packaging = await prisma.packaging.create({
        data: {
          sku,
          categoryId: parseInt(categoryId),
          color: color || null,
          isTransparent: isTransparent === 'true',
          unit,
          pricePerUnit: parseFloat(pricePerUnit),
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

      res.status(201).json(packaging);
    } catch (error) {
      console.error('Create packaging error:', error);
      res.status(500).json({ error: 'Ошибка при создании упаковки' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { categoryId, nameBg, descriptionBg, color, isTransparent, unit, pricePerUnit, existingImages } = req.body;

      const currentPackaging = await prisma.packaging.findUnique({
        where: { id: parseInt(id) },
      });

      if (!currentPackaging) {
        return res.status(404).json({ error: 'Упаковка не найдена' });
      }

      const files = req.files as Express.Multer.File[];
      const newImages = files ? await processImages(files) : [];

      const existingImagesList = existingImages ? JSON.parse(existingImages) : [];
      const allImages = [...existingImagesList, ...newImages].slice(0, 2);

      const packaging = await prisma.packaging.update({
        where: { id: parseInt(id) },
        data: {
          ...(categoryId && { categoryId: parseInt(categoryId) }),
          ...(color !== undefined && { color }),
          ...(isTransparent !== undefined && { isTransparent: isTransparent === 'true' }),
          ...(unit && { unit }),
          ...(pricePerUnit && { pricePerUnit: parseFloat(pricePerUnit) }),
          images: allImages,
        },
        include: {
          translations: true,
        },
      });

      if (nameBg || descriptionBg) {
        await prisma.packagingTranslation.updateMany({
          where: { packagingId: parseInt(id), lang: 'bg' },
          data: {
            ...(nameBg && { name: nameBg }),
            ...(descriptionBg && { description: descriptionBg }),
          },
        });
      }

      res.json(packaging);
    } catch (error) {
      console.error('Update packaging error:', error);
      res.status(500).json({ error: 'Ошибка при обновлении упаковки' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.packaging.delete({
        where: { id: parseInt(id) },
      });

      res.json({ message: 'Упаковка удалена' });
    } catch (error) {
      console.error('Delete packaging error:', error);
      res.status(500).json({ error: 'Ошибка при удалении упаковки' });
    }
  },
};

