import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Получить товар по SKU
 * GET /api/products/:sku
 */
export const getProductBySku = async (req: Request, res: Response) => {
  try {
    const { sku } = req.params;
    const { lang = 'bg' } = req.query;

    // Пытаемся найти букет
    const bouquet = await prisma.bouquet.findUnique({
      where: { sku, isActive: true },
      include: {
        category: true,
        translations: {
          where: { lang: lang as string },
        },
        flowers: {
          include: {
            flower: {
              include: {
                translations: {
                  where: { lang: lang as string },
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
                  where: { lang: lang as string },
                },
              },
            },
          },
        },
        sizeVariants: {
          include: {
            size: {
              include: {
                translations: {
                  where: { lang: lang as string },
                },
              },
            },
          },
          orderBy: {
            size: {
              order: 'asc',
            },
          },
        },
      },
    });

    if (bouquet) {
      return res.json({ product: bouquet, type: 'bouquet' });
    }

    // Если не букет, пытаемся найти цветок
    const flower = await prisma.flower.findUnique({
      where: { sku, isActive: true },
      include: {
        category: true,
        translations: {
          where: { lang: lang as string },
        },
      },
    });

    if (flower) {
      return res.json({ product: flower, type: 'flower' });
    }

    // Товар не найден
    res.status(404).json({ error: 'Товар не найден' });
  } catch (error) {
    console.error('Ошибка при получении товара:', error);
    res.status(500).json({ error: 'Ошибка при получении товара' });
  }
};

