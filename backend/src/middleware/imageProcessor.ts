import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

/**
 * Обработка и оптимизация загруженного изображения
 */
export const processImage = async (
  file: Express.Multer.File,
  maxWidth: number = 1200,
  quality: number = 85
): Promise<string> => {
  try {
    const outputPath = file.path;
    const tempPath = `${outputPath}.temp`;

    // Обрабатываем изображение
    await sharp(file.path)
      .resize(maxWidth, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality, progressive: true })
      .toFile(tempPath);

    // Заменяем оригинал обработанным
    fs.unlinkSync(outputPath);
    fs.renameSync(tempPath, outputPath);

    return path.basename(outputPath);
  } catch (error) {
    console.error('Ошибка при обработке изображения:', error);
    throw error;
  }
};

/**
 * Обработка массива файлов
 */
export const processImages = async (
  files: Express.Multer.File[]
): Promise<string[]> => {
  const processed: string[] = [];

  for (const file of files) {
    const filename = await processImage(file);
    // Возвращаем относительный путь
    const folder = path.basename(path.dirname(file.path));
    processed.push(`${folder}/${filename}`);
  }

  return processed;
};

