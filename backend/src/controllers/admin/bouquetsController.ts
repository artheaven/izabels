import { Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth';
import { generateSKU } from '../../utils/skuGenerator';
import { processImages } from '../../middleware/imageProcessor';
import { deleteFile } from '../../middleware/upload';

const prisma = new PrismaClient();

/**
 * Вычисляет базовую цену букета на основе состава
 */
const calculateBouquetPrice = async (
  flowers: Array<{ flowerId: number; quantity: number }>,
  materials: Array<{ packagingId: number; quantity: number }>
): Promise<number> => {
  let total = 0;

  // Считаем стоимость цветов
  for (const item of flowers) {
    const flower = await prisma.flower.findUnique({
      where: { id: item.flowerId },
    });
    if (flower) {
      total += parseFloat(flower.price.toString()) * item.quantity;
    }
  }

  // Считаем стоимость упаковки
  for (const item of materials) {
    const packaging = await prisma.packaging.findUnique({
      where: { id: item.packagingId },
    });
    if (packaging) {
      total += parseFloat(packaging.pricePerUnit.toString()) * item.quantity;
    }
  }

  return total;
};

/**
 * Получить все букеты
 * GET /api/admin/bouquets
 */
export const getAllBouquets = async (req: AuthRequest, res: Response) => {
  try {
    const bouquets = await prisma.bouquet.findMany({
      include: {
        category: true,
        translations: {
          where: { lang: 'bg' },
        },
        sizeVariants: {
          include: {
            size: {
              include: {
                translations: {
                  where: { lang: 'bg' },
                },
              },
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
          orderBy: {
            size: {
              order: 'asc',
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Для каждого букета находим минимальную цену среди всех размеров
    const bouquetsWithPrices = bouquets.map(bouquet => {
      const prices = bouquet.sizeVariants.map(v => parseFloat(v.price.toString()));
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      return {
        ...bouquet,
        price: minPrice, // Для отображения в списке
      };
    });

    res.json({ bouquets: bouquetsWithPrices });
  } catch (error) {
    console.error('Ошибка при получении букетов:', error);
    res.status(500).json({ error: 'Ошибка при получении букетов' });
  }
};

/**
 * Получить букет по ID
 * GET /api/admin/bouquets/:id
 */
export const getBouquetById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const bouquet = await prisma.bouquet.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        translations: true,
        sizeVariants: {
          include: {
            size: {
              include: {
                translations: true,
              },
            },
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
          orderBy: {
            size: {
              order: 'asc',
            },
          },
        },
      },
    });

    if (!bouquet) {
      return res.status(404).json({ error: 'Букет не найден' });
    }

    res.json({ bouquet });
  } catch (error) {
    console.error('Ошибка при получении букета:', error);
    res.status(500).json({ error: 'Ошибка при получении букета' });
  }
};

/**
 * Создать новый букет
 * POST /api/admin/bouquets
 */
export const createBouquet = async (req: AuthRequest, res: Response) => {
  try {
    const {
      categoryId,
      name,
      description,
      flowers,
      materials,
      sizeVariants,
    } = req.body;

    if (!categoryId || !name) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }

    // Парсим состав
    const sizeVariantsData = sizeVariants ? JSON.parse(sizeVariants) : [];

    if (sizeVariantsData.length === 0) {
      return res.status(400).json({ error: 'Выберите хотя бы один размер' });
    }

    // Генерируем SKU
    const sku = await generateSKU('BQ');

    // Обрабатываем изображения
    let images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      images = await processImages(req.files);
    }

    // Создаем букет с sizeVariants
    const bouquet = await prisma.bouquet.create({
      data: {
        sku,
        categoryId: parseInt(categoryId),
        images,
        translations: {
          create: {
            lang: 'bg',
            name,
            description: description || '',
          },
        },
      },
    });

    // Создаем варианты размеров с их составом
    for (const variant of sizeVariantsData) {
      const variantFlowers = variant.flowers || [];
      const variantMaterials = variant.materials || [];
      const priceBase = await calculateBouquetPrice(variantFlowers, variantMaterials);
      
      const extraCharge = parseFloat(variant.extraCharge) || 0;
      const discountPercent = parseInt(variant.discountPercent) || 0;
      const priceBeforeDiscount = priceBase + extraCharge;
      const price = priceBeforeDiscount * (1 - discountPercent / 100);
      const priceOld = discountPercent > 0 ? priceBeforeDiscount : null;

      const sizeVariant = await prisma.bouquetSizeVariant.create({
        data: {
          bouquetId: bouquet.id,
          sizeId: parseInt(variant.sizeId),
          flowerCount: parseInt(variant.flowerCount) || 0,
          priceBase,
          extraCharge,
          discountPercent,
          price,
          priceOld,
        },
      });

      // Создаем flowers для этого варианта
      if (variantFlowers.length > 0) {
        await prisma.bouquetFlower.createMany({
          data: variantFlowers.map((item: any) => ({
            bouquetId: bouquet.id,
            sizeVariantId: sizeVariant.id,
            flowerId: parseInt(item.flowerId),
            quantity: parseInt(item.quantity),
          })),
        });
      }

      // Создаем materials для этого варианта
      if (variantMaterials.length > 0) {
        await prisma.bouquetMaterial.createMany({
          data: variantMaterials.map((item: any) => ({
            bouquetId: bouquet.id,
            sizeVariantId: sizeVariant.id,
            packagingId: parseInt(item.packagingId),
            quantity: parseInt(item.quantity),
          })),
        });
      }
    }

    // Получаем полный букет с включениями
    const createdBouquet = await prisma.bouquet.findUnique({
      where: { id: bouquet.id },
      include: {
        translations: true,
        category: true,
        sizeVariants: {
          include: {
            size: {
              include: {
                translations: { where: { lang: 'bg' } },
              },
            },
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
        },
      },
    });

    res.status(201).json({ bouquet: createdBouquet });
  } catch (error) {
    console.error('Ошибка при создании букета:', error);
    res.status(500).json({ error: 'Ошибка при создании букета' });
  }
};

/**
 * Обновить букет
 * PUT /api/admin/bouquets/:id
 */
export const updateBouquet = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      categoryId,
      name,
      description,
      sizeVariants,
      existingImages,
    } = req.body;

    const bouquet = await prisma.bouquet.findUnique({
      where: { id: parseInt(id) },
      include: {
        sizeVariants: true,
      },
    });

    if (!bouquet) {
      return res.status(404).json({ error: 'Букет не найден' });
    }

    // Обрабатываем новые изображения
    let newImages: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      newImages = await processImages(req.files);
    }

    const existingImagesArray = existingImages ? JSON.parse(existingImages) : bouquet.images;
    const allImages = [...existingImagesArray, ...newImages];

    // Парсим варианты размеров
    const sizeVariantsData = sizeVariants ? JSON.parse(sizeVariants) : [];

    // Удаляем старые варианты размеров (каскадно удалятся flowers и materials)
    await prisma.bouquetSizeVariant.deleteMany({
      where: { bouquetId: parseInt(id) },
    });

    // Обновляем букет
    await prisma.bouquet.update({
      where: { id: parseInt(id) },
      data: {
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        images: allImages,
      },
    });

    // Создаем новые варианты размеров с их составом
    for (const variant of sizeVariantsData) {
      const variantFlowers = variant.flowers || [];
      const variantMaterials = variant.materials || [];
      const priceBase = await calculateBouquetPrice(variantFlowers, variantMaterials);
      
      const extraCharge = parseFloat(variant.extraCharge) || 0;
      const discountPercent = parseInt(variant.discountPercent) || 0;
      const priceBeforeDiscount = priceBase + extraCharge;
      const price = priceBeforeDiscount * (1 - discountPercent / 100);
      const priceOld = discountPercent > 0 ? priceBeforeDiscount : null;

      const sizeVariant = await prisma.bouquetSizeVariant.create({
        data: {
          bouquetId: parseInt(id),
          sizeId: parseInt(variant.sizeId),
          flowerCount: parseInt(variant.flowerCount) || 0,
          priceBase,
          extraCharge,
          discountPercent,
          price,
          priceOld,
        },
      });

      // Создаем flowers для этого варианта
      if (variantFlowers.length > 0) {
        await prisma.bouquetFlower.createMany({
          data: variantFlowers.map((item: any) => ({
            bouquetId: parseInt(id),
            sizeVariantId: sizeVariant.id,
            flowerId: parseInt(item.flowerId),
            quantity: parseInt(item.quantity),
          })),
        });
      }

      // Создаем materials для этого варианта
      if (variantMaterials.length > 0) {
        await prisma.bouquetMaterial.createMany({
          data: variantMaterials.map((item: any) => ({
            bouquetId: parseInt(id),
            sizeVariantId: sizeVariant.id,
            packagingId: parseInt(item.packagingId),
            quantity: parseInt(item.quantity),
          })),
        });
      }
    }

    // Получаем обновленный букет
    const updatedBouquet = await prisma.bouquet.findUnique({
      where: { id: parseInt(id) },
      include: {
        translations: true,
        category: true,
        sizeVariants: {
          include: {
            size: {
              include: {
                translations: { where: { lang: 'bg' } },
              },
            },
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
        },
      },
    });

    // Обновляем перевод
    if (name || description !== undefined) {
      await prisma.bouquetTranslation.upsert({
        where: {
          bouquetId_lang: {
            bouquetId: parseInt(id),
            lang: 'bg',
          },
        },
        update: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
        },
        create: {
          bouquetId: parseInt(id),
          lang: 'bg',
          name: name || '',
          description: description || '',
        },
      });
    }

    res.json({ bouquet: updatedBouquet });
  } catch (error) {
    console.error('Ошибка при обновлении букета:', error);
    res.status(500).json({ error: 'Ошибка при обновлении букета' });
  }
};

/**
 * Удалить букет
 * DELETE /api/admin/bouquets/:id
 */
export const deleteBouquet = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const bouquet = await prisma.bouquet.findUnique({
      where: { id: parseInt(id) },
    });

    if (!bouquet) {
      return res.status(404).json({ error: 'Букет не найден' });
    }

    // Удаляем изображения
    bouquet.images.forEach(imagePath => deleteFile(imagePath));

    // Удаляем букет (каскадно удалятся связи и переводы)
    await prisma.bouquet.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: 'Букет удален' });
  } catch (error) {
    console.error('Ошибка при удалении букета:', error);
    res.status(500).json({ error: 'Ошибка при удалении букета' });
  }
};

/**
 * Удалить конкретное изображение букета
 * DELETE /api/admin/bouquets/:id/image/:imagePath
 */
export const deleteBouquetImage = async (req: AuthRequest, res: Response) => {
  try {
    const { id, imagePath } = req.params;

    const bouquet = await prisma.bouquet.findUnique({
      where: { id: parseInt(id) },
    });

    if (!bouquet) {
      return res.status(404).json({ error: 'Букет не найден' });
    }

    // Удаляем файл
    const decodedPath = decodeURIComponent(imagePath);
    deleteFile(decodedPath);

    // Убираем из массива images
    const updatedImages = bouquet.images.filter(img => img !== decodedPath);

    await prisma.bouquet.update({
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
 * Переключить активность букета (вкл/выкл)
 * PATCH /api/admin/bouquets/:id/toggle
 */
export const toggleBouquet = async (req: AuthRequest, res: Response) => {
  try {
    const bouquetId = parseInt(req.params.id);

    const bouquet = await prisma.bouquet.findUnique({
      where: { id: bouquetId },
    });

    if (!bouquet) {
      return res.status(404).json({ error: 'Букет не найден' });
    }

    const updated = await prisma.bouquet.update({
      where: { id: bouquetId },
      data: { isActive: !bouquet.isActive },
    });

    res.json({ success: true, bouquet: updated });
  } catch (error) {
    console.error('Ошибка при переключении активности букета:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

/**
 * Переключить статус "популярный" для букета
 * PATCH /api/admin/bouquets/:id/featured
 */
export const toggleFeatured = async (req: AuthRequest, res: Response) => {
  try {
    const bouquetId = parseInt(req.params.id);
    const { featuredOrder } = req.body;

    const bouquet = await prisma.bouquet.findUnique({
      where: { id: bouquetId },
    });

    if (!bouquet) {
      return res.status(404).json({ error: 'Букет не найден' });
    }

    const updated = await prisma.bouquet.update({
      where: { id: bouquetId },
      data: {
        isFeatured: !bouquet.isFeatured,
        featuredOrder: featuredOrder !== undefined ? parseInt(featuredOrder) : bouquet.featuredOrder,
      },
    });

    res.json({ success: true, bouquet: updated });
  } catch (error) {
    console.error('Ошибка при переключении популярности букета:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

