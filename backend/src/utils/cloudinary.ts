import { v2 as cloudinary } from 'cloudinary';
import logger from './logger';

// Конфигурация Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `izabels/${folder}`,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Ограничиваем размер
        { quality: 'auto:good' }, // Автоматическое качество
        { fetch_format: 'auto' }, // WebP где поддерживается
      ],
    });

    logger.info(`Uploaded to Cloudinary: ${result.public_id}`);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    logger.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
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

