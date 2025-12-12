import { Router } from 'express';
import * as authController from '../controllers/auth/authController';
import { authenticateUser } from '../middleware/userAuth';

const router = Router();

// Публичные роуты
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Защищенные роуты (требуют аутентификации)
router.get('/me', authenticateUser, authController.getMe);
router.put('/profile', authenticateUser, authController.updateProfile);

export default router;

