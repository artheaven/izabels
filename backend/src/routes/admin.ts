import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { upload } from '../middleware/upload';

// Импорты контроллеров
import * as authController from '../controllers/admin/authController';
import * as flowersController from '../controllers/admin/flowersController';
import * as packagingController from '../controllers/admin/packagingController';
import * as packagingColorsController from '../controllers/admin/packagingColorsController';
import * as bouquetsController from '../controllers/admin/bouquetsController';
import * as bouquetSizesController from '../controllers/admin/bouquetSizesController';
import * as ordersController from '../controllers/admin/ordersController';
import * as categoriesController from '../controllers/admin/categoriesController';
import * as customersController from '../controllers/admin/customersController';
import * as promosController from '../controllers/admin/promosController';

const router = Router();

// === Аутентификация (без защиты) ===
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// === Размеры букетов (публичный доступ для чтения) ===
router.get('/bouquet-sizes', bouquetSizesController.getBouquetSizes);

// === Защищенные роуты (требуют JWT) ===
router.use(authenticateToken);

// === Цветы (Flowers) ===
router.get('/flowers', flowersController.getAllFlowers);
router.get('/flowers/:id', flowersController.getFlowerById);
router.post('/flowers', upload.array('images', 4), flowersController.createFlower);
router.put('/flowers/:id', upload.array('images', 4), flowersController.updateFlower);
router.patch('/flowers/:id/toggle', flowersController.toggleFlower);
router.delete('/flowers/:id', flowersController.deleteFlower);
router.delete('/flowers/:id/image/:imagePath', flowersController.deleteFlowerImage);

// === Упаковка (Packaging) ===
router.get('/packaging', packagingController.getAllPackaging);
router.get('/packaging/:id', packagingController.getPackagingById);
router.post('/packaging', upload.array('images', 2), packagingController.createPackaging);
router.put('/packaging/:id', upload.array('images', 2), packagingController.updatePackaging);
router.patch('/packaging/:id/toggle', packagingController.togglePackaging);
router.delete('/packaging/:id', packagingController.deletePackaging);

// === Цвета упаковки (Packaging Colors) ===
router.get('/packaging-colors', packagingColorsController.getAllColors);
router.post('/packaging-colors', packagingColorsController.createColor);
router.put('/packaging-colors/:id', packagingColorsController.updateColor);
router.delete('/packaging-colors/:id', packagingColorsController.deleteColor);

// === Букеты (Bouquets) ===
router.get('/bouquets', bouquetsController.getAllBouquets);
router.get('/bouquets/:id', bouquetsController.getBouquetById);
router.post('/bouquets', upload.array('images', 10), bouquetsController.createBouquet);
router.put('/bouquets/:id', upload.array('images', 10), bouquetsController.updateBouquet);
router.patch('/bouquets/:id/toggle', bouquetsController.toggleBouquet);
router.patch('/bouquets/:id/featured', bouquetsController.toggleFeatured);
router.delete('/bouquets/:id', bouquetsController.deleteBouquet);
router.delete('/bouquets/:id/image/:imagePath', bouquetsController.deleteBouquetImage);

// === Размеры букетов (Bouquet Sizes) - управление ===
router.get('/bouquet-sizes/:id', bouquetSizesController.getBouquetSize);
router.post('/bouquet-sizes', bouquetSizesController.createBouquetSize);
router.put('/bouquet-sizes/:id', bouquetSizesController.updateBouquetSize);
router.delete('/bouquet-sizes/:id', bouquetSizesController.deleteBouquetSize);

// === Заказы (Orders) ===
router.get('/orders', ordersController.getAllOrders);
router.get('/orders/:id', ordersController.getOrderById);
router.post('/orders', ordersController.createOrder);
router.put('/orders/:id', ordersController.updateOrder);
router.patch('/orders/:id/status', ordersController.updateOrderStatus);

// === Категории (Categories) ===
router.get('/categories', categoriesController.getAllCategories);
router.get('/categories/:id', categoriesController.getCategoryById);
router.post('/categories', categoriesController.createCategory);
router.put('/categories/:id', categoriesController.updateCategory);
router.delete('/categories/:id', categoriesController.deleteCategory);

// === Клиенты (Customers) ===
router.get('/customers/stats', customersController.getCustomersStats);
router.get('/customers', customersController.getAllCustomers);
router.get('/customers/:id', customersController.getCustomerById);
router.post('/customers', customersController.createCustomer);
router.put('/customers/:id', customersController.updateCustomer);
router.put('/customers/:id/status', customersController.updateCustomerStatus);
router.delete('/customers/:id', customersController.deleteCustomer);

// === Промокоды (Promos) ===
router.get('/promos', promosController.getPromos);
router.get('/promos/:id', promosController.getPromoById);
router.post('/promos', promosController.createPromo);
router.put('/promos/:id', promosController.updatePromo);
router.patch('/promos/:id/toggle', promosController.togglePromo);
router.delete('/promos/:id', promosController.deletePromo);

export default router;
