import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { generateVerificationToken, generateResetToken } from '../../utils/tokenGenerator';
import { sendVerificationEmail, sendResetPasswordEmail } from '../../utils/emailService';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Регистрация нового пользователя
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Проверка существования пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Валидация пароля
    if (password.length < 8) {
      return res.status(400).json({ error: 'Пароль должен быть минимум 8 символов' });
    }

    // Хеширование пароля
    const passwordHash = await bcrypt.hash(password, 10);

    // Генерация токена подтверждения email
    const verificationToken = generateVerificationToken();

    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        verificationToken,
      },
    });

    // Отправка письма подтверждения (асинхронно)
    sendVerificationEmail(user.email, verificationToken).catch(err =>
      console.error('Error sending verification email:', err)
    );

    // НЕ даем JWT токен до подтверждения email
    // Пользователь должен подтвердить email сначала
    res.json({
      success: true,
      message: 'Регистрация успешна. Проверьте ваш email для подтверждения',
      requiresVerification: true,
      email: user.email,
    });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
};

/**
 * Вход пользователя
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Генерация JWT токена
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        customerStatus: user.customerStatus,
        emailVerified: user.emailVerified,
        totalOrders: user.totalOrders,
        totalSpent: user.totalSpent,
      },
    });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ error: 'Ошибка при входе' });
  }
};

/**
 * Получение данных текущего пользователя
 * GET /api/auth/me
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        birthday: true,
        customerStatus: true,
        totalOrders: true,
        totalSpent: true,
        lastOrderDate: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

/**
 * Обновление профиля
 * PUT /api/auth/profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { firstName, lastName, phone, birthday } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phone,
        birthday: birthday ? new Date(birthday) : null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        birthday: true,
        customerStatus: true,
      },
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error);
    res.status(500).json({ error: 'Ошибка при обновлении профиля' });
  }
};

/**
 * Подтверждение email
 * POST /api/auth/verify-email/:token
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return res.status(400).json({ error: 'Неверный или истекший токен' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });

    // После подтверждения выдаем JWT токен
    const jwtToken = jwt.sign(
      { userId: updatedUser.id, email: updatedUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      success: true, 
      message: 'Email подтвержден',
      token: jwtToken,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        customerStatus: updatedUser.customerStatus,
        emailVerified: true,
      },
    });
  } catch (error) {
    console.error('Ошибка при подтверждении email:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

/**
 * Повторная отправка кода верификации
 * POST /api/auth/resend-verification
 */
export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email уже подтвержден' });
    }

    // Генерируем новый токен
    const verificationToken = generateVerificationToken();

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    // Отправляем email
    sendVerificationEmail(user.email, verificationToken).catch(err =>
      console.error('Error sending verification email:', err)
    );

    res.json({ 
      success: true, 
      message: 'Код подтверждения отправлен на ваш email' 
    });
  } catch (error) {
    console.error('Ошибка при повторной отправке кода:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

/**
 * Запрос сброса пароля
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Не раскрываем, существует ли пользователь
      return res.json({ success: true, message: 'Если email существует, письмо будет отправлено' });
    }

    const resetToken = generateResetToken();
    const resetExpires = new Date(Date.now() + 3600000); // 1 час

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    // Отправка письма
    sendResetPasswordEmail(user.email, resetToken).catch(err =>
      console.error('Error sending reset email:', err)
    );

    res.json({ success: true, message: 'Если email существует, письмо будет отправлено' });
  } catch (error) {
    console.error('Ошибка при запросе сброса пароля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

/**
 * Сброс пароля
 * POST /api/auth/reset-password/:token
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (password.length < 8) {
      return res.status(400).json({ error: 'Пароль должен быть минимум 8 символов' });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Неверный или истекший токен' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    res.json({ success: true, message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error('Ошибка при сбросе пароля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

