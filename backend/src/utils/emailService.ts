/**
 * Email сервис для отправки писем пользователям
 * TODO: Интегрировать с реальным email провайдером (NodeMailer + SMTP)
 */

/**
 * Отправка письма с подтверждением email
 */
export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  console.log('=== EMAIL: Подтверждение регистрации ===');
  console.log(`To: ${email}`);
  console.log(`Subject: Подтвердите ваш email`);
  console.log(`Link: ${verificationUrl}`);
  console.log('======================================');
  
  // TODO: Реализовать отправку email через NodeMailer
  // const transporter = nodemailer.createTransport({...});
  // await transporter.sendMail({...});
};

/**
 * Отправка письма для сброса пароля
 */
export const sendResetPasswordEmail = async (email: string, token: string): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  console.log('=== EMAIL: Сброс пароля ===');
  console.log(`To: ${email}`);
  console.log(`Subject: Сброс пароля`);
  console.log(`Link: ${resetUrl}`);
  console.log('============================');
  
  // TODO: Реализовать отправку email через NodeMailer
};

/**
 * Отправка письма с подтверждением заказа
 */
export const sendOrderConfirmationEmail = async (
  email: string,
  orderNumber: string,
  orderDetails: any
): Promise<void> => {
  console.log('=== EMAIL: Подтверждение заказа ===');
  console.log(`To: ${email}`);
  console.log(`Subject: Заказ #${orderNumber} подтвержден`);
  console.log(`Order: ${JSON.stringify(orderDetails, null, 2)}`);
  console.log('===================================');
  
  // TODO: Реализовать отправку email
};

