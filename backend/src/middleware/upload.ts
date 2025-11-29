import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';
import logger from '../utils/logger';

// Создаем временную папку для загрузок
const tempDir = path.join(__dirname, '..', '..', 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Конфигурация хранилища - временно на диск
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
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
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

/**
 * Загрузить файл в Cloudinary и удалить временный файл
 */
export const uploadFileToCloud = async (
  file: Express.Multer.File,
  folder: string = 'bouquets'
): Promise<string> => {
  try {
    const result = await uploadToCloudinary(file.path, folder);
    
    // Удаляем временный файл
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    return result.url;
  } catch (error) {
    // Удаляем временный файл при ошибке
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
};

/**
 * Загрузить несколько файлов в Cloudinary
 */
export const uploadFilesToCloud = async (
  files: Express.Multer.File[],
  folder: string = 'bouquets'
): Promise<string[]> => {
  const urls = await Promise.all(
    files.map((file) => uploadFileToCloud(file, folder))
  );
  return urls;
};

/**
 * Удалить файл (для обратной совместимости)
 * Для Cloudinary URL - извлекаем publicId и удаляем
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    if (fileUrl.includes('cloudinary.com')) {
      // Извлекаем publicId из URL
      const matches = fileUrl.match(/\/izabels\/([^/]+\/[^.]+)/);
      if (matches) {
        const publicId = `izabels/${matches[1]}`;
        await deleteFromCloudinary(publicId);
      }
    }
  } catch (error) {
    logger.error('Ошибка при удалении файла:', error);
  }
};
