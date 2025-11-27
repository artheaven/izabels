import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import sharp from 'sharp';
import path from 'path';

const prisma = new PrismaClient();

async function generateBouquetSKU(): Promise<string> {
  const lastBouquet = await prisma.bouquet.findFirst({
    orderBy: { id: 'desc' },
    select: { sku: true },
  });

  if (!lastBouquet) {
    return 'BQ-0001';
  }

  const lastNumber = parseInt(lastBouquet.sku.split('-')[1]);
  return `BQ-${String(lastNumber + 1).padStart(4, '0')}`;
}

async function processImages(files: Express.Multer.File[]): Promise<string[]> {
  const processedImages: string[] = [];

  for (const file of files) {
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
    const outputPath = path.join(path.dirname(file.path), filename);

    await sharp(file.path)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 90 })
      .toFile(outputPath);

    const fs = require('fs');
    fs.unlinkSync(file.path);

    processedImages.push(`/uploads/bouquets/${filename}`);
  }

  return processedImages;
}

// Расчет базовой цены букета на основе состава
async function calculateBasePrice(
  flowers: { flowerId: number; quantity: number }[],
  materials: { packagingId: number; quantity: number }[]
): Promise<number> {
  let total = 0;

  // Стоимость цветов
  for (const item of flowers) {
    const flower = await prisma.flower.findUnique({
      where: { id: item.flowerId },
      select: { price: true },
    });
    if (flower) {
      total += flower.price.toNumber() * item.quantity;
    }
  }

  // Стоимость упаковки
  for (const item of materials) {
    const packaging = await prisma.packaging.findUnique({
      where: { id: item.packagingId },
      select: { pricePerUnit: true },
    });
    if (packaging) {
      total += packaging.pricePerUnit.toNumber() * item.quantity;
    }
  }

  return total;
}

export const bouquetsController = {
  async getAll(req: Request, res: Response) {
    try {
      const { categoryId, search } = req.query;

      const where: any = {};

      if (categoryId) {
        where.categoryId = parseInt(categoryId as string);
      }

      const bouquets = await prisma.bouquet.findMany({
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
          flowers: {
            include: {
              flower: {
                include: {
                  translations: {
                    where: { lang: 'bg' },
                  },
                },
              },
            },
          },
          materials: {
            include: {
              packaging: {
                include: {
                  translations: {
                    where: { lang: 'bg' },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Фильтрация по поиску
      let result = bouquets;
      if (search) {
        const searchLower = (search as string).toLowerCase();
        result = bouquets.filter(b =>
          b.translations[0]?.name.toLowerCase().includes(searchLower) ||
          b.sku.toLowerCase().includes(searchLower)
        );
      }

      res.json(result);
    } catch (error) {
      console.error('Get bouquets error:', error);
      res.status(500).json({ error: 'Ошибка при получении букетов' });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const bouquet = await prisma.bouquet.findUnique({
        where: { id: parseInt(id) },
        include: {
          category: true,
          translations: true,
          flowers: {
            include: {
              flower: {
                include: {
                  translations: true,
                },
              },
            },
          },
          materials: {
            include: {
              packaging: {
                include: {
                  translations: true,
                },
              },
            },
          },
        },
      });

      if (!bouquet) {
        return res.status(404).json({ error: 'Букет не найден' });
      }

      res.json(bouquet);
    } catch (error) {
      console.error('Get bouquet error:', error);
      res.status(500).json({ error: 'Ошибка при получении букета' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const {
        categoryId,
        nameBg,
        descriptionBg,
        size,
        flowers,
        materials,
        extraCharge,
        discountPercent,
      } = req.body;

      if (!categoryId || !nameBg || !flowers) {
        return res.status(400).json({ error: 'Обязательные поля: categoryId, nameBg, flowers' });
      }

      // Парсинг JSON данных
      const flowersList = JSON.parse(flowers);
      const materialsList = materials ? JSON.parse(materials) : [];

      // Расчет базовой цены
      const priceBase = await calculateBasePrice(flowersList, materialsList);

      // Расчет финальной цены
      const extraChargeValue = extraCharge ? parseFloat(extraCharge) : 0;
      const discountPercentValue = discountPercent ? parseInt(discountPercent) : 0;

      const priceBeforeDiscount = priceBase + extraChargeValue;
      const price = priceBeforeDiscount * (1 - discountPercentValue / 100);
      const priceOld = discountPercentValue > 0 ? priceBeforeDiscount : null;

      // Обработка изображений
      const filesList = req.files as Express.Multer.File[];
      const images = filesList ? await processImages(filesList) : [];

      // Генерация SKU
      const sku = await generateBouquetSKU();

      // Создание букета
      const bouquet = await prisma.bouquet.create({
        data: {
          sku,
          categoryId: parseInt(categoryId),
          priceBase,
          extraCharge: extraChargeValue,
          discountPercent: discountPercentValue,
          price,
          priceOld,
          size: size || null,
          images,
          translations: {
            create: {
              lang: 'bg',
              name: nameBg,
              description: descriptionBg || null,
            },
          },
          flowers: {
            create: flowersList.map((f: any) => ({
              flowerId: f.flowerId,
              quantity: f.quantity,
            })),
          },
          materials: {
            create: materialsList.map((m: any) => ({
              packagingId: m.packagingId,
              quantity: m.quantity,
            })),
          },
        },
        include: {
          translations: true,
          flowers: {
            include: {
              flower: {
                include: {
                  translations: { where: { lang: 'bg' } },
                },
              },
            },
          },
          materials: {
            include: {
              packaging: {
                include: {
                  translations: { where: { lang: 'bg' } },
                },
              },
            },
          },
        },
      });

      res.status(201).json(bouquet);
    } catch (error) {
      console.error('Create bouquet error:', error);
      res.status(500).json({ error: 'Ошибка при создании букета' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        categoryId,
        nameBg,
        descriptionBg,
        size,
        flowers,
        materials,
        extraCharge,
        discountPercent,
        existingImages,
      } = req.body;

      const currentBouquet = await prisma.bouquet.findUnique({
        where: { id: parseInt(id) },
      });

      if (!currentBouquet) {
        return res.status(404).json({ error: 'Букет не найден' });
      }

      // Обработка изображений
      const filesList = req.files as Express.Multer.File[];
      const newImages = filesList ? await processImages(filesList) : [];
      const existingImagesList = existingImages ? JSON.parse(existingImages) : [];
      const allImages = [...existingImagesList, ...newImages].slice(0, 10);

      // Если изменился состав, пересчитаем цену
      let priceBase = currentBouquet.priceBase ? currentBouquet.priceBase.toNumber() : 0;
      if (flowers || materials) {
        const flowersList = flowers ? JSON.parse(flowers) : [];
        const materialsList = materials ? JSON.parse(materials) : [];
        priceBase = await calculateBasePrice(flowersList, materialsList);
      }

      const extraChargeValue = extraCharge ? parseFloat(extraCharge) : (currentBouquet.extraCharge ? currentBouquet.extraCharge.toNumber() : 0);
      const discountPercentValue = discountPercent !== undefined ? parseInt(discountPercent) : (currentBouquet.discountPercent || 0);

      const priceBeforeDiscount = priceBase + extraChargeValue;
      const price = priceBeforeDiscount * (1 - discountPercentValue / 100);
      const priceOld = discountPercentValue > 0 ? priceBeforeDiscount : null;

      // Обновление букета
      const bouquet = await prisma.bouquet.update({
        where: { id: parseInt(id) },
        data: {
          ...(categoryId && { categoryId: parseInt(categoryId) }),
          priceBase,
          extraCharge: extraChargeValue,
          discountPercent: discountPercentValue,
          price,
          priceOld,
          ...(size !== undefined && { size }),
          images: allImages,
        },
      });

      // Обновление состава если передан
      if (flowers) {
        // Удалить старые связи
        await prisma.bouquetFlower.deleteMany({
          where: { bouquetId: parseInt(id) },
        });

        // Создать новые
        const flowersList = JSON.parse(flowers);
        await prisma.bouquetFlower.createMany({
          data: flowersList.map((f: any) => ({
            bouquetId: parseInt(id),
            flowerId: f.flowerId,
            quantity: f.quantity,
          })),
        });
      }

      if (materials) {
        await prisma.bouquetMaterial.deleteMany({
          where: { bouquetId: parseInt(id) },
        });

        const materialsList = JSON.parse(materials);
        await prisma.bouquetMaterial.createMany({
          data: materialsList.map((m: any) => ({
            bouquetId: parseInt(id),
            packagingId: m.packagingId,
            quantity: m.quantity,
          })),
        });
      }

      // Обновление перевода
      if (nameBg || descriptionBg) {
        await prisma.bouquetTranslation.updateMany({
          where: { bouquetId: parseInt(id), lang: 'bg' },
          data: {
            ...(nameBg && { name: nameBg }),
            ...(descriptionBg && { description: descriptionBg }),
          },
        });
      }

      // Получить обновленный букет со всеми связями
      const updatedBouquet = await prisma.bouquet.findUnique({
        where: { id: parseInt(id) },
        include: {
          translations: true,
          flowers: {
            include: {
              flower: {
                include: {
                  translations: { where: { lang: 'bg' } },
                },
              },
            },
          },
          materials: {
            include: {
              packaging: {
                include: {
                  translations: { where: { lang: 'bg' } },
                },
              },
            },
          },
        },
      });

      res.json(updatedBouquet);
    } catch (error) {
      console.error('Update bouquet error:', error);
      res.status(500).json({ error: 'Ошибка при обновлении букета' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.bouquet.delete({
        where: { id: parseInt(id) },
      });

      res.json({ message: 'Букет удален' });
    } catch (error) {
      console.error('Delete bouquet error:', error);
      res.status(500).json({ error: 'Ошибка при удалении букета' });
    }
  },
};

