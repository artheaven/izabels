import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as ordersController from '../controllers/user/ordersController';

const router = Router();

// Все роуты требуют аутентификации
router.use(authenticateToken);

// === Заказы пользователя ===
router.get('/orders', ordersController.getMyOrders);
router.get('/orders/:id', ordersController.getMyOrderById);

export default router;

