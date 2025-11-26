import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../../middleware/auth';

const prisma = new PrismaClient();

/**
 * Вход в систему
 * POST /api/admin/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Требуются username и password' });
    }

    // Находим пользователя
    const user = await prisma.adminUser.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // Проверяем пароль
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // Генерируем JWT токен
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/**
 * Выход из системы (опционально, токен удаляется на клиенте)
 * POST /api/admin/logout
 */
export const logout = async (req: Request, res: Response) => {
  res.json({ success: true, message: 'Успешный выход' });
};

