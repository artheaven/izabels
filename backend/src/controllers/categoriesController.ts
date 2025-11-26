import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const categoriesController = {
  async getAll(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        include: {
          translations: true,
          parent: true,
          children: {
            include: {
              translations: true,
            },
          },
        },
        orderBy: { id: 'asc' },
      });

      res.json(categories);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Ошибка при получении категорий' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name, slug, parentId, description, nameBg, descriptionBg, type } = req.body;

      if (!name || !slug || !nameBg) {
        return res.status(400).json({ error: 'Обязательные поля: name, slug, nameBg' });
      }

      const category = await prisma.category.create({
        data: {
          name,
          slug,
          type: type || 'BOUQUETS', // По умолчанию BOUQUETS
          parentId: parentId ? parseInt(parentId) : null,
          description,
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

      res.status(201).json(category);
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({ error: 'Ошибка при создании категории' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, slug, parentId, description, nameBg, descriptionBg } = req.body;

      const category = await prisma.category.update({
        where: { id: parseInt(id) },
        data: {
          ...(name && { name }),
          ...(slug && { slug }),
          ...(parentId !== undefined && { parentId: parentId ? parseInt(parentId) : null }),
          ...(description !== undefined && { description }),
        },
      });

      if (nameBg || descriptionBg) {
        await prisma.categoryTranslation.updateMany({
          where: { categoryId: parseInt(id), lang: 'bg' },
          data: {
            ...(nameBg && { name: nameBg }),
            ...(descriptionBg && { description: descriptionBg }),
          },
        });
      }

      res.json(category);
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({ error: 'Ошибка при обновлении категории' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.category.delete({
        where: { id: parseInt(id) },
      });

      res.json({ message: 'Категория удалена' });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({ error: 'Ошибка при удалении категории' });
    }
  },
};

