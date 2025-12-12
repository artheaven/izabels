import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import * as ordersController from '../controllers/user/ordersController';

const router = Router();

// Все роуты требуют аутентификации
router.use(authenticateUser);

// === Заказы пользователя ===
router.get('/orders', ordersController.getMyOrders);
router.get('/orders/:id', ordersController.getMyOrderById);

export default router;

