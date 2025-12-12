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

    // Фильтр по размеру через sizeVariants
    if (size) {
      where.sizeVariants = {
        some: {
          size: {
            name: size as string,
          },
        },
      };
    }

    // Фильтр по цене через sizeVariants (минимальная цена)
    if (priceMin || priceMax) {
      where.sizeVariants = {
        ...where.sizeVariants,
        some: {
          ...(where.sizeVariants as any)?.some,
          ...(priceMin && { price: { gte: parseFloat(priceMin as string) } }),
          ...(priceMax && { price: { lte: parseFloat(priceMax as string) } }),
        },
      };
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
      orderBy: { createdAt: 'desc' },
    });

    // Для каждого букета находим минимальную цену
    let productsWithPrices = bouquets.map(bouquet => {
      const prices = bouquet.sizeVariants.map((v: any) => parseFloat(v.price.toString()));
      const discounts = bouquet.sizeVariants.map((v: any) => v.discountPercent || 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxDiscount = discounts.length > 0 ? Math.max(...discounts) : 0;
      return {
        ...bouquet,
        price: minPrice,
        discountPercent: maxDiscount,
      };
    });

    // Сортировка в памяти (после фильтрации)
    switch (sort) {
      case 'price_asc':
        productsWithPrices.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        productsWithPrices.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        productsWithPrices.sort((a, b) => b.discountPercent - a.discountPercent);
        break;
      // 'newest' - уже отсортировано по createdAt desc
    }

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

    // Сначала пробуем получить отмеченные как Featured
    let featuredProducts = await prisma.bouquet.findMany({
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
      take: 8,
    });

    // Если нет featured товаров, показываем последние добавленные
    if (featuredProducts.length === 0) {
      featuredProducts = await prisma.bouquet.findMany({
        where: {
          isActive: true,
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
          createdAt: 'desc',
        },
        take: 8,
      });
    }

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

