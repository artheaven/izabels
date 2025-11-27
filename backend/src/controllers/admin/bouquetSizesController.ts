import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Получить все размеры
export const getBouquetSizes = async (req: Request, res: Response) => {
  try {
    const sizes = await prisma.bouquetSize.findMany({
      include: {
        translations: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    res.json({ sizes });
  } catch (error) {
    console.error('Error fetching bouquet sizes:', error);
    res.status(500).json({ error: 'Failed to fetch bouquet sizes' });
  }
};

// Получить один размер
export const getBouquetSize = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const size = await prisma.bouquetSize.findUnique({
      where: { id: parseInt(id) },
      include: {
        translations: true,
      },
    });

    if (!size) {
      return res.status(404).json({ error: 'Bouquet size not found' });
    }

    res.json({ size });
  } catch (error) {
    console.error('Error fetching bouquet size:', error);
    res.status(500).json({ error: 'Failed to fetch bouquet size' });
  }
};

// Создать новый размер
export const createBouquetSize = async (req: Request, res: Response) => {
  try {
    const { name, order, translations } = req.body;

    const size = await prisma.bouquetSize.create({
      data: {
        name,
        order: order || 0,
        translations: {
          create: translations,
        },
      },
      include: {
        translations: true,
      },
    });

    res.status(201).json({ size });
  } catch (error: any) {
    console.error('Error creating bouquet size:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Size with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create bouquet size' });
  }
};

// Обновить размер
export const updateBouquetSize = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, order, isActive, translations } = req.body;

    // Обновляем размер
    const size = await prisma.bouquetSize.update({
      where: { id: parseInt(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    // Обновляем переводы если переданы
    if (translations) {
      for (const trans of translations) {
        await prisma.bouquetSizeTranslation.upsert({
          where: {
            sizeId_lang: {
              sizeId: parseInt(id),
              lang: trans.lang,
            },
          },
          update: {
            name: trans.name,
            description: trans.description,
          },
          create: {
            sizeId: parseInt(id),
            lang: trans.lang,
            name: trans.name,
            description: trans.description,
          },
        });
      }
    }

    const updatedSize = await prisma.bouquetSize.findUnique({
      where: { id: parseInt(id) },
      include: {
        translations: true,
      },
    });

    res.json({ size: updatedSize });
  } catch (error) {
    console.error('Error updating bouquet size:', error);
    res.status(500).json({ error: 'Failed to update bouquet size' });
  }
};

// Удалить размер
export const deleteBouquetSize = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Проверяем, используется ли размер в букетах
    const variantsCount = await prisma.bouquetSizeVariant.count({
      where: { sizeId: parseInt(id) },
    });

    if (variantsCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete size that is used in bouquets',
        variantsCount 
      });
    }

    await prisma.bouquetSize.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Bouquet size deleted successfully' });
  } catch (error) {
    console.error('Error deleting bouquet size:', error);
    res.status(500).json({ error: 'Failed to delete bouquet size' });
  }
};

