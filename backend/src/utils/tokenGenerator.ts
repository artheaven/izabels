import crypto from 'crypto';

/**
 * Генерация токена для подтверждения email
 */
export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Генерация токена для сброса пароля
 */
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

