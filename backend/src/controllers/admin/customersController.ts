import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../middleware/auth';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Получить всех клиентов
 */
export const getAllCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const customers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        customerStatus: true,
        totalOrders: true,
        totalSpent: true,
        lastOrderDate: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ customers });
  } catch (error) {
    console.error('Ошибка при получении клиентов:', error);
    res.status(500).json({ error: 'Ошибка при получении клиентов' });
  }
};

/**
 * Получить клиента по ID
 */
export const getCustomerById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        addresses: true,
      },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }

    // Убираем passwordHash из ответа
    const { passwordHash, ...customerData } = customer;

    res.json({ customer: customerData });
  } catch (error) {
    console.error('Ошибка при получении клиента:', error);
    res.status(500).json({ error: 'Ошибка при получении клиента' });
  }
};

/**
 * Создать клиента вручную
 */
export const createCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      customerStatus = 'NEW',
    } = req.body;

    // Валидация
    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    // Проверяем, не существует ли уже клиент с таким email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Клиент с таким email уже существует' });
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 10);

    // Создаем клиента
    const customer = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        customerStatus,
        emailVerified: true, // Клиент создан админом, сразу верифицирован
      },
    });

    // Убираем passwordHash из ответа
    const { passwordHash: _, ...customerData } = customer;

    res.json({
      success: true,
      customer: customerData,
    });
  } catch (error) {
    console.error('Ошибка при создании клиента:', error);
    res.status(500).json({ error: 'Ошибка при создании клиента' });
  }
};

/**
 * Обновить клиента
 */
export const updateCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      phone,
      customerStatus,
      password,
    } = req.body;

    const updateData: any = {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(customerStatus !== undefined && { customerStatus }),
    };

    // Если передан новый пароль, хешируем его
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const customer = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // Убираем passwordHash из ответа
    const { passwordHash, ...customerData } = customer;

    res.json({
      success: true,
      customer: customerData,
    });
  } catch (error) {
    console.error('Ошибка при обновлении клиента:', error);
    res.status(500).json({ error: 'Ошибка при обновлении клиента' });
  }
};

/**
 * Удалить клиента
 */
export const deleteCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка при удалении клиента:', error);
    res.status(500).json({ error: 'Ошибка при удалении клиента' });
  }
};

/**
 * Получить статистику по клиентам
 */
export const getCustomersStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalCustomers = await prisma.user.count();
    const newCustomers = await prisma.user.count({
      where: { customerStatus: 'NEW' },
    });
    const regularCustomers = await prisma.user.count({
      where: { customerStatus: 'REGULAR' },
    });
    const loyalCustomers = await prisma.user.count({
      where: { customerStatus: 'LOYAL' },
    });
    const vipCustomers = await prisma.user.count({
      where: { customerStatus: 'VIP' },
    });

    res.json({
      totalCustomers,
      newCustomers,
      regularCustomers,
      loyalCustomers,
      vipCustomers,
    });
  } catch (error) {
    console.error('Ошибка при получении статистики клиентов:', error);
    res.status(500).json({ error: 'Ошибка при получении статистики' });
  }
};

/**
 * Обновить только статус клиента
 */
export const updateCustomerStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { customerStatus } = req.body;

    if (!customerStatus) {
      return res.status(400).json({ error: 'Статус обязателен' });
    }

    const customer = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { customerStatus },
    });

    const { passwordHash, ...customerData } = customer;

    res.json({
      success: true,
      customer: customerData,
    });
  } catch (error) {
    console.error('Ошибка при обновлении статуса клиента:', error);
    res.status(500).json({ error: 'Ошибка при обновлении статуса' });
  }
};

// Alias для совместимости
export const getCustomers = getAllCustomers;
