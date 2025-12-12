import sgMail from '@sendgrid/mail';

// Инициализация SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'info@izabelsflower.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  console.warn('⚠️  SENDGRID_API_KEY not set. Emails will only be logged to console.');
}

/**
 * Отправка письма с подтверждением email
 */
export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
  
  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Потвърдете вашия имейл - Izabels Flower',
    text: `Здравейте,\n\nБлагодарим ви за регистрацията в Izabels Flower!\n\nМоля, потвърдете вашия имейл адрес, като кликнете на следния линк:\n${verificationUrl}\n\nИли копирайте и поставете този код във формата за потвърждение:\n${token}\n\nКодът е валиден 24 часа.\n\nАко не сте се регистрирали в нашия сайт, моля игнорирайте това съобщение.\n\nПоздрави,\nЕкипът на Izabels Flower\n+359888110801\ninfo@izabelsflower.com`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7f7f7;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 0; text-align: center;">
              <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                      Izabels Flower 🌸
                    </h1>
                  </td>
                </tr>
                
                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">
                      Потвърдете вашия имейл
                    </h2>
                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      Здравейте,
                    </p>
                    <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      Благодарим ви за регистрацията в <strong>Izabels Flower</strong>! 
                      За да активирате вашия акаунт, моля потвърдете вашия имейл адрес.
                    </p>
                    
                    <!-- Button -->
                    <table role="presentation" style="margin: 0 auto;">
                      <tr>
                        <td style="border-radius: 6px; background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);">
                          <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
                            Потвърди имейл
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Code -->
                    <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 6px; border: 2px dashed #d1d5db;">
                      <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; text-align: center;">
                        Или използвайте този код:
                      </p>
                      <p style="margin: 0; color: #1f2937; font-size: 20px; font-weight: bold; text-align: center; letter-spacing: 2px; font-family: 'Courier New', monospace;">
                        ${token}
                      </p>
                    </div>
                    
                    <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      Ако бутонът не работи, копирайте и поставете този линк във вашия браузър:
                    </p>
                    <p style="margin: 0 0 20px; color: #ec4899; font-size: 14px; word-break: break-all;">
                      ${verificationUrl}
                    </p>
                    
                    <p style="margin: 30px 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                      Кодът е валиден 24 часа. Ако не сте се регистрирали в нашия сайт, моля игнорирайте това съобщение.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                      <strong>Izabels Flower</strong><br>
                      ул. Тодор Радев Пенев 13, Варна<br>
                      +359888110801 | info@izabelsflower.com
                    </p>
                    <p style="margin: 10px 0 0; color: #9ca3af; font-size: 12px;">
                      <a href="https://www.instagram.com/izabelsflower/" style="color: #ec4899; text-decoration: none; margin: 0 5px;">Instagram</a> |
                      <a href="https://www.facebook.com/p/Izabels-Flower-61579199182101/" style="color: #ec4899; text-decoration: none; margin: 0 5px;">Facebook</a> |
                      <a href="https://www.tiktok.com/@izabelsflower" style="color: #ec4899; text-decoration: none; margin: 0 5px;">TikTok</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  if (SENDGRID_API_KEY) {
    try {
      await sgMail.send(msg);
      console.log(`✅ Verification email sent to ${email}`);
    } catch (error: any) {
      console.error('❌ SendGrid error:', error.response?.body || error.message);
      throw error;
    }
  } else {
    // Fallback: логируем в консоль
    console.log('=== EMAIL: Подтверждение регистрации ===');
    console.log(`To: ${email}`);
    console.log(`Subject: Потвърдете вашия имейл`);
    console.log(`Link: ${verificationUrl}`);
    console.log(`Token: ${token}`);
    console.log('========================================');
  }
};

/**
 * Отправка письма для сброса пароля
 */
export const sendResetPasswordEmail = async (email: string, token: string): Promise<void> => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  
  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Възстановяване на парола - Izabels Flower',
    text: `Здравейте,\n\nПолучихме заявка за възстановяване на вашата парола.\n\nКликнете на следния линк за да създадете нова парола:\n${resetUrl}\n\nЛинкът е валиден 1 час.\n\nАко не сте заявявали смяна на парола, моля игнорирайте това съобщение.\n\nПоздрави,\nЕкипът на Izabels Flower`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7f7f7;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 0; text-align: center;">
              <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Izabels Flower 🌸</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">Възстановяване на парола</h2>
                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      Получихме заявка за възстановяване на вашата парола.
                    </p>
                    <table role="presentation" style="margin: 20px auto;">
                      <tr>
                        <td style="border-radius: 6px; background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);">
                          <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px;">
                            Създай нова парола
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 20px 0 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                      Линкът е валиден 1 час. Ако не сте заявявали смяна на парола, моля игнорирайте това съобщение.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      <strong>Izabels Flower</strong><br>
                      +359888110801 | info@izabelsflower.com
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  if (SENDGRID_API_KEY) {
    try {
      await sgMail.send(msg);
      console.log(`✅ Reset password email sent to ${email}`);
    } catch (error: any) {
      console.error('❌ SendGrid error:', error.response?.body || error.message);
      throw error;
    }
  } else {
    console.log('=== EMAIL: Сброс пароля ===');
    console.log(`To: ${email}`);
    console.log(`Link: ${resetUrl}`);
    console.log('===========================');
  }
};

/**
 * Отправка письма с подтверждением заказа
 */
export const sendOrderConfirmationEmail = async (
  email: string,
  orderNumber: string,
  orderDetails: any
): Promise<void> => {
  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: `Поръчка #${orderNumber} - Izabels Flower`,
    text: `Здравейте,\n\nВашата поръчка #${orderNumber} е приета успешно!\n\nБлагодарим ви за поръчката.\n\nПоздрави,\nЕкипът на Izabels Flower`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7f7f7;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 0; text-align: center;">
              <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px;">
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Поръчка потвърдена! ✓</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937;">Поръчка #${orderNumber}</h2>
                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px;">
                      Вашата поръчка е приета успешно! Скоро ще се свържем с вас за потвърждение.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      <strong>Izabels Flower</strong><br>
                      +359888110801 | info@izabelsflower.com
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  if (SENDGRID_API_KEY) {
    try {
      await sgMail.send(msg);
      console.log(`✅ Order confirmation email sent to ${email}`);
    } catch (error: any) {
      console.error('❌ SendGrid error:', error.response?.body || error.message);
      throw error;
    }
  } else {
    console.log('=== EMAIL: Подтверждение заказа ===');
    console.log(`To: ${email}`);
    console.log(`Order: #${orderNumber}`);
    console.log('===================================');
  }
};
