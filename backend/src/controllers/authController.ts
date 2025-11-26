import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const authController = {
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Имя пользователя и пароль обязательны' });
      }

      // Найти админа
      const admin = await prisma.adminUser.findUnique({
        where: { username },
      });

      if (!admin) {
        return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
      }

      // Проверить пароль
      const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
      }

      // Создать JWT токен
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET не установлен');
      }

      const token = jwt.sign(
        { adminId: admin.id, username: admin.username },
        secret,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Ошибка при входе' });
    }
  },

  async logout(req: Request, res: Response) {
    // В JWT logout происходит на клиенте (удаление токена)
    res.json({ message: 'Успешный выход' });
  },
};

