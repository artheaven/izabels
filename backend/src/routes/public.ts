import { Router } from 'express';
import { optionalAuth } from '../middleware/userAuth';

// Импорты контроллеров
import * as catalogController from '../controllers/public/catalogController';
import * as productController from '../controllers/public/productController';
import * as orderController from '../controllers/public/orderController';
import * as promosController from '../controllers/admin/promosController';

const router = Router();

// === Категории ===
router.get('/categories', catalogController.getCategories);

// === Размеры букетов ===
router.get('/bouquet-sizes', catalogController.getBouquetSizes);

// === Каталог товаров ===
router.get('/products/featured', catalogController.getFeaturedProducts);
router.get('/products', catalogController.getProducts);
router.get('/products/:sku', productController.getProductBySku);

// === Заказы ===
// Используем optionalAuth - заказ могут создать как гости, так и авторизованные пользователи
router.post('/orders', optionalAuth, orderController.createOrder);

// === Промокоды ===
// Валидация промокода (доступна всем, но учитывает авторизацию)
router.post('/promos/validate', optionalAuth, promosController.validatePromo);

// === Переводы (опционально) ===
// router.get('/translations/:lang', translationsController.getTranslations);

export default router;
