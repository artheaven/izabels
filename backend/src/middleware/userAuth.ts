import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
  userId: number;
  email: string;
}

/**
 * Middleware для проверки JWT токена пользователя
 */
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      (req as any).userId = decoded.userId;
      (req as any).userEmail = decoded.email;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Неверный токен' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
};

/**
 * Middleware для опциональной аутентификации
 * Если токен есть - добавляет userId, если нет - продолжает без ошибки
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        (req as any).userId = decoded.userId;
        (req as any).userEmail = decoded.email;
      } catch (err) {
        // Игнорируем ошибку, продолжаем как гость
      }
    }

    next();
  } catch (error) {
    next();
  }
};

