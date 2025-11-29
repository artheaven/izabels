import fs from 'fs';
import { uploadToCloudinary } from '../utils/cloudinary';
import logger from '../utils/logger';

/**
 * Обработка и загрузка изображения в Cloudinary
 * Cloudinary автоматически оптимизирует изображения
 */
export const processImage = async (
  file: Express.Multer.File,
  folder: string = 'bouquets'
): Promise<string> => {
  try {
    // Загружаем в Cloudinary (он сам оптимизирует)
    const result = await uploadToCloudinary(file.path, folder);
    
    // Удаляем временный файл
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    // Возвращаем полный URL от Cloudinary
    return result.url;
  } catch (error) {
    // Удаляем временный файл при ошибке
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    logger.error('Ошибка при обработке изображения:', error);
    throw error;
  }
};

/**
 * Обработка массива файлов
 * @param files - массив файлов
 * @param folder - папка в Cloudinary (bouquets, flowers, packaging)
 */
export const processImages = async (
  files: Express.Multer.File[],
  folder: string = 'bouquets'
): Promise<string[]> => {
  const processed: string[] = [];

  for (const file of files) {
    const url = await processImage(file, folder);
    processed.push(url);
  }

  return processed;
};

