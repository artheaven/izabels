import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Создаем папки для загрузок
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
const flowersDir = path.join(uploadDir, 'flowers');
const packagingDir = path.join(uploadDir, 'packaging');
const bouquetsDir = path.join(uploadDir, 'bouquets');

[uploadDir, flowersDir, packagingDir, bouquetsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Конфигурация хранилища
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'flowers';
    
    if (req.path.includes('/bouquets')) {
      folder = 'bouquets';
    } else if (req.path.includes('/packaging')) {
      folder = 'packaging';
    }
    
    cb(null, path.join(uploadDir, folder));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// Фильтр файлов (только изображения)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Недопустимый тип файла. Разрешены только JPEG, PNG, WEBP'));
  }
};

// Настройка multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// Утилита для удаления файла
export const deleteFile = (filePath: string): void => {
  try {
    const fullPath = path.join(uploadDir, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error('Ошибка при удалении файла:', error);
  }
};
