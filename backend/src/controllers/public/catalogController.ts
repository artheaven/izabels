import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Получить категории для каталога
 * GET /api/categories
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const { lang = 'bg' } = req.query;

    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
      },
      include: {
        translations: {
          where: { lang: lang as string },
        },
        children: {
          include: {
            translations: {
              where: { lang: lang as string },
            },
          },
        },
      },
      orderBy: { id: 'asc' },
    });

    res.json({ categories });
  } catch (error) {
    console.error('Ошибка при получении категорий:', error);
    res.status(500).json({ error: 'Ошибка при получении категорий' });
  }
};

/**
 * Получить размеры букетов
 * GET /api/bouquet-sizes
 */
export const getBouquetSizes = async (req: Request, res: Response) => {
  try {
    const { lang = 'bg' } = req.query;

    const sizes = await prisma.bouquetSize.findMany({
      where: {
        isActive: true,
      },
      include: {
        translations: {
          where: { lang: lang as string },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    res.json({ sizes });
  } catch (error) {
    console.error('Ошибка при получении размеров букетов:', error);
    res.status(500).json({ error: 'Ошибка при получении размеров букетов' });
  }
};

/**
 * Получить товары для каталога с фильтрацией
 * GET /api/products
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      category,
      priceMin,
      priceMax,
      size,
      sort = 'newest',
      lang = 'bg',
    } = req.query;

    // Получаем букеты (основной товар для витрины)
    const where: Prisma.BouquetWhereInput = {
      isActive: true,
    };

    // Фильтр по категории
    if (category) {
      where.category = {
        slug: category as string,
      };
    }

    // Фильтр по цене
    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) {
        where.price.gte = parseFloat(priceMin as string);
      }
      if (priceMax) {
        where.price.lte = parseFloat(priceMax as string);
      }
    }

    // Фильтр по размеру
    if (size) {
      where.size = size as string;
    }

    // Сортировка
    let orderBy: Prisma.BouquetOrderByWithRelationInput = { createdAt: 'desc' };
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'name':
        orderBy = { id: 'asc' }; // По имени через translation сложнее, упрощаем
        break;
      case 'discount':
        orderBy = { discountPercent: 'desc' };
        break;
    }

    const bouquets = await prisma.bouquet.findMany({
      where,
      include: {
        category: true,
        translations: {
          where: { lang: lang as string },
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
      orderBy,
    });

    // Для каждого букета находим минимальную цену
    const productsWithPrices = bouquets.map(bouquet => {
      const prices = bouquet.sizeVariants.map((v: any) => parseFloat(v.price.toString()));
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      return {
        ...bouquet,
        price: minPrice, // Минимальная цена для отображения в каталоге
      };
    });

    res.json({ products: productsWithPrices });
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    res.status(500).json({ error: 'Ошибка при получении товаров' });
  }
};

/**
 * Получить популярные товары
 * GET /api/products/featured
 */
export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const { lang = 'bg' } = req.query;

    const featuredProducts = await prisma.bouquet.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      include: {
        category: true,
        translations: {
          where: { lang: lang as string },
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
      orderBy: {
        featuredOrder: 'asc',
      },
    });

    // Для каждого букета находим минимальную цену
    const productsWithPrices = featuredProducts.map(bouquet => {
      const prices = bouquet.sizeVariants.map((v: any) => parseFloat(v.price.toString()));
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      return {
        ...bouquet,
        price: minPrice,
      };
    });

    res.json({ products: productsWithPrices });
  } catch (error) {
    console.error('Ошибка при получении популярных товаров:', error);
    res.status(500).json({ error: 'Ошибка при получении популярных товаров' });
  }
};

