import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Загружаем переменные окружения
dotenv.config();

// Импорты роутов
import adminRoutes from './routes/admin';
import publicRoutes from './routes/public';
import authRoutes from './routes/auth';
import addressRoutes from './routes/addresses';

const app: Application = express();
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Создаем папку для загрузок если не существует
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Статические файлы (загруженные изображения)
app.use('/uploads', express.static(uploadsDir));

// Логирование запросов
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Роуты
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api', publicRoutes);

// Базовый роут
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Izabels Flower Shop API',
    version: '1.0.0',
    endpoints: {
      admin: '/api/admin/*',
      auth: '/api/auth/*',
      addresses: '/api/addresses/*',
      public: '/api/*',
    },
  });
});

// Обработка 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Глобальная обработка ошибок
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Запуск сервера
app.listen(Number(PORT), HOST, () => {
  console.log(`🚀 Сервер запущен на ${HOST}:${PORT}`);
  console.log(`📝 Окружение: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API доступен по адресу: http://localhost:${PORT}`);
  console.log(`🔗 CORS разрешен для: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

export default app;
