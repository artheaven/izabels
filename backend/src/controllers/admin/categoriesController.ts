import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth';
import { triggerRevalidation } from '../../utils/revalidation';

const prisma = new PrismaClient();

/**
 * Получить все категории (древовидная структура)
 * GET /api/admin/categories
 */
export const getAllCategories = async (req: AuthRequest, res: Response) => {
  try {
    // Возвращаем ВСЕ категории, включая подкатегории
    const categories = await prisma.category.findMany({
      include: {
        translations: true,
        children: {
          include: {
            translations: true,
          },
        },
        parent: {
          include: {
            translations: true,
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
 * Получить категорию по ID
 * GET /api/admin/categories/:id
 */
export const getCategoryById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        translations: true,
        children: {
          include: {
            translations: true,
          },
        },
        parent: true,
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Ошибка при получении категории:', error);
    res.status(500).json({ error: 'Ошибка при получении категории' });
  }
};

/**
 * Создать новую категорию
 * POST /api/admin/categories
 */
export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, type, parentId, description, isEditable = true, translations } = req.body;

    // Поддержка обоих форматов: старого (name) и нового (translations array)
    if (!slug || !type) {
      return res.status(400).json({ error: 'Заполните все обязательные поля (slug, type)' });
    }

    // Если переданы translations, используем их; иначе используем name
    const translationsData = translations && Array.isArray(translations) && translations.length > 0
      ? translations.map((t: any) => ({
          lang: t.language || t.lang,
          name: t.name,
          description: t.description || '',
        }))
      : name
      ? [{ lang: 'bg', name, description: description || '' }]
      : [];

    if (translationsData.length === 0) {
      return res.status(400).json({ error: 'Укажите name или translations' });
    }

    const category = await prisma.category.create({
      data: {
        name: translationsData[0].name, // Используем первый перевод как основное имя
        slug,
        type,
        parentId: parentId ? parseInt(parentId) : null,
        description: description || null,
        isEditable,
        translations: {
          create: translationsData,
        },
      },
      include: {
        translations: true,
      },
    });

    // Триггерим revalidation (новая категория = обновление каталога и sitemap)
    triggerRevalidation('category').catch(err => 
      console.error('Failed to trigger revalidation:', err)
    );

    res.status(201).json({ category });
  } catch (error) {
    console.error('Ошибка при создании категории:', error);
    res.status(500).json({ error: 'Ошибка при создании категории' });
  }
};

/**
 * Обновить категорию
 * PUT /api/admin/categories/:id
 */
export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, parentId, description, translations } = req.body;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(parentId !== undefined && { parentId: parentId ? parseInt(parentId) : null }),
        ...(description !== undefined && { description }),
      },
      include: {
        translations: true,
      },
    });

    // Обновляем переводы
    if (translations && Array.isArray(translations)) {
      // Обновляем каждый перевод
      for (const translation of translations) {
        await prisma.categoryTranslation.upsert({
          where: {
            categoryId_lang: {
              categoryId: parseInt(id),
              lang: translation.language || translation.lang,
            },
          },
          update: {
            name: translation.name,
            description: translation.description || '',
          },
          create: {
            categoryId: parseInt(id),
            lang: translation.language || translation.lang,
            name: translation.name,
            description: translation.description || '',
          },
        });
      }
    } else if (name || description !== undefined) {
      // Старый формат для обратной совместимости
      await prisma.categoryTranslation.upsert({
        where: {
          categoryId_lang: {
            categoryId: parseInt(id),
            lang: 'bg',
          },
        },
        update: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
        },
        create: {
          categoryId: parseInt(id),
          lang: 'bg',
          name: name || '',
          description: description || '',
        },
      });
    }

    // Триггерим revalidation (обновление категории = обновление каталога)
    triggerRevalidation('category').catch(err => 
      console.error('Failed to trigger revalidation:', err)
    );

    res.json({ category });
  } catch (error) {
    console.error('Ошибка при обновлении категории:', error);
    res.status(500).json({ error: 'Ошибка при обновлении категории' });
  }
};

/**
 * Удалить категорию
 * DELETE /api/admin/categories/:id
 */
export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Проверяем, есть ли у категории дочерние элементы
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        children: true,
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    if (category.children.length > 0) {
      return res.status(400).json({ 
        error: 'Невозможно удалить категорию с подкатегориями' 
      });
    }

    await prisma.category.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true, message: 'Категория удалена' });
  } catch (error) {
    console.error('Ошибка при удалении категории:', error);
    res.status(500).json({ error: 'Ошибка при удалении категории' });
  }
};

