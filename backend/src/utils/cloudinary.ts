import { v2 as cloudinary } from 'cloudinary';
import logger from './logger';

// Конфигурация Cloudinary
// Поддерживает CLOUDINARY_URL или отдельные переменные
if (process.env.CLOUDINARY_URL) {
  // CLOUDINARY_URL формат: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
  // SDK автоматически парсит этот URL
  cloudinary.config({ 
    cloudinary_url: process.env.CLOUDINARY_URL,
    secure: true 
  });
  logger.info('✅ Cloudinary configured via CLOUDINARY_URL');
} else {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    logger.warn('⚠️  Cloudinary credentials not configured. Image uploads will fail.');
    logger.warn('Please set CLOUDINARY_URL or (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)');
  } else {
    cloudinary.config({
      cloud_name,
      api_key,
      api_secret,
      secure: true,
    });
    logger.info(`✅ Cloudinary configured: ${cloud_name}`);
  }
}

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

/**
 * Загрузить файл в Cloudinary
 * @param filePath - путь к локальному файлу или base64 строка
 * @param folder - папка в Cloudinary (bouquets, flowers, packaging)
 */
export const uploadToCloudinary = async (
  filePath: string,
  folder: string = 'bouquets'
): Promise<UploadResult> => {
  try {
    // Проверяем что Cloudinary настроен
    const config = cloudinary.config();
    if (!config.cloud_name || !config.api_key) {
      throw new Error('Cloudinary is not configured. Please set environment variables.');
    }

    logger.info(`Uploading to Cloudinary: ${filePath} -> izabels/${folder}`);

    const result = await cloudinary.uploader.upload(filePath, {
      folder: `izabels/${folder}`,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Ограничиваем размер
        { quality: 'auto:best' }, // Лучшее автоматическое качество
        { fetch_format: 'auto' }, // AVIF > WebP > JPEG автоматически
      ],
      // Дополнительные настройки для оптимизации
      format: 'auto', // Автоматический выбор формата
      flags: ['progressive'], // Progressive JPEG
    });

    logger.info(`✅ Uploaded to Cloudinary: ${result.public_id} (${result.bytes} bytes)`);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error: any) {
    logger.error('❌ Cloudinary upload error:', {
      message: error.message,
      error: error.error?.message,
      http_code: error.http_code,
      filePath,
    });
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
};

/**
 * Загрузить несколько файлов в Cloudinary
 */
export const uploadMultipleToCloudinary = async (
  filePaths: string[],
  folder: string = 'bouquets'
): Promise<UploadResult[]> => {
  const results = await Promise.all(
    filePaths.map((path) => uploadToCloudinary(path, folder))
  );
  return results;
};

/**
 * Удалить файл из Cloudinary
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info(`Deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
  }
};

/**
 * Получить оптимизированный URL для изображения
 */
export const getOptimizedUrl = (
  publicId: string,
  options: { width?: number; height?: number } = {}
): string => {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { width: options.width || 800, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  });
};

export default cloudinary;

